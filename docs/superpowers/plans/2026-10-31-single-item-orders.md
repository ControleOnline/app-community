# Single Item orders-first implementation plan

Goal: POS Single Item opens orders first, supports existing company orders and new sales, and returns to orders after payment. Local only; no issue, commit, publish, database/config writes or financial changes.

Architecture: keep ui-orders responsible for data, filters, authorization and sale actions. Inject local operational header/card presentation through optional props scoped to Single Item. Preserve explicit device/company visibility; use company when unspecified in this Single Item presentation. Other modes retain their current defaults. Keep changes to installed packages reproducible with a separate checksum-validated flow patch; do not apply the older unrelated payment patches.

- [x] Add failing tests for initial home versus explicit catalog, history after checkout, visibility default/overrides, and compact search/create header permissions.
- [x] Add local orders presentation and route adapter; hide the duplicate shell header. Keep existing catalogue, customization and payment behavior.
- [x] Add minimal optional presentation props to ui-orders OrderHistoryPage and change only the Single Item post-payment destination. Save exact payloads and hashes in a dedicated patch manifest, invoked by prepare.
- [x] Run targeted local and package regression tests; verify patch idempotency and web compilation. Review final diff and report limits (no real payment).

Ruling: do not change the stored device configuration. Company is the Single Item fallback only when visibility is absent; an explicit device restriction remains authoritative.

Validation: 59 Single Item tests and 26 shared history tests passed; flow patch tests and installed source checks passed; web export completed at /tmp/single-item-web-check. No real payment, authenticated browser walkthrough, database writes or publication performed. Existing financial modifications in the checkout dependencies were preserved; this change adds navigation and presentation only.

## Catalog integration follow-up

Single Item products use the existing product-showcases/catalog API and its device > company default > general catalog resolution. Origin is displayed above search from server metadata; the information dialog separately identifies the configured device showcase. Empty showcases and failed reads never trigger a client-side general catalog fallback. Catalog actions use a separate cache namespace keyed by company/configuration and resolved showcase, with catalog-aware direct actions when native/storage fallback bypasses caching. Other app modes and supplies retain existing actions. No API/business-rule/configuration writes.

Verification: 70 Single Item tests and 21 product-filter/history regressions passed. Existing API showcase tests fail due to a missing ProductPublicCatalogAccessService import in the installed test file. A temporary copy with only that import corrected passed all five tests/105 assertions (one deprecation); installed API files were not changed. Browser verification unavailable because local browser control is disabled in Work settings. No real sale or payment executed.

## Manager PDV operational context — 2026-11-01

Implemented the authorized local Manager flow. ManagerPdvOperationProvider reads the current company/device PDV record directly, validates its tenant/type/device and selects the latest matching record. A successful empty lookup uses counter; failed/malformed reads show retry rather than silently starting a sale. The configuration is exposed only to the operational route subtree through OperationalStoreContext and the local useStore facade. The Manager shell, bootstrap, device editor, application identity and API authorization headers are unchanged.

Configured Single Item uses internal Orders/Catalog tabs, shared operational history/header/cards, catalog/showcase resolution and checkout. Scoped navigation carries the operational context to order/customization/payment screens and resets completion back to Manager PdvPage orders. Tab changes preserve the current order; explicit new sale clears old identity. Profiles without history permission retain a completion screen instead of receiving history access or an automatic next cart. The operational information dialog remains available beside the tabs. Ordinary Manager history and other apps retain their original context.

Catalog reads and item mutations explicitly identify the PDV configuration for showcase resolution; the application remains MANAGER for financial authorization. No financial algorithms, saved configs, database records, server files, tasks, commits, pushes or publication changed.

Validation: 106 targeted Single Item/Manager tests and 30 shared history/product-filter tests passed. Flow patch integrity/idempotency passed. Web export completed. Broad homepage run: 105 suites passed, 9 suites failed (17 assertions/tests; 499 passed). Remaining failing groups: managerInlineCatalog, bootstrapNavigation, adminBootstrapShell, checkoutPaymentLoading, managerOrdersTrend, pdvDraftNavigation, adminBootstrapPatch, horizontalCategoryTabs, disabledAvatar. These include pre-existing bootstrap/patch/catalog/mock areas already recorded in the earlier broad baseline; this report does not claim the general suite is green. No real payment or browser walkthrough: local browser control is disabled in Work settings.
