# Homepage ADMIN/MANAGER — #1056

Approved scope: mobile-first soft light appearance for HomePage in ADMIN and MANAGER. Existing business rules, configured menus, route parameters, permission filters, stores and translations are preserved. The corrected home reads canonical colors directly from the existing theme store, following docs/themes/themes-map.md. Native avatar download credentials now come from the auth store.

## Composition and evidence

- ui-common 1.2.94 and ui-layout 1.0.18 are published npm versions incorporating the opt-in home changes. Their source task branches were merged into dev via the repository-required PRs.
- ui-manager 1.0.19 is published and matches dev commit 1b09bbe910158681cbf69439c6c9fd8f436afc86 (37 packaged files verified byte-for-byte). npm publication used the authorized maintainer's interactive 2FA flow after the GitHub OIDC attempt failed.
- ui-shop 1.0.19 is published and matches task commit 4b315f1d7a84e03da79681ff39ca95cacd83d4e2 (128 packaged files verified byte-for-byte). This is official master 379189640577e805574789ea7fa56aed12b84a45 plus package version/repository metadata only. It preserves the three official Android fixes; unrelated QR/checkout work in dev is not included. There is no new shop product implementation in this task.
- Published-source baseline differences and existing dev changes were reviewed and preserved, including the current company-identity handling and POS operation tooltip.
- 40 focused homepage tests passed against the integrated module sources after this composition changed; the earlier 34 runtime footer/zoom tests remain evidence for unchanged behavior. The 505-file protected inventory previously passed (ui-default/ui-orders/local config). Local configuration must never be committed.

## Current gate

All four consumer pins now resolve to stable published numeric npm versions. Previously executed behavioral tests are reused by explicit human instruction; publication verification confirms the packaged sources match those reviewed. Integration into dev, Security review, frozen RC promotion and staging deployment readback are still required before In Review. Production remains unauthorized.

Tracking: https://github.com/ControleOnline/app-community/issues/1056

## Theme contract correction before production

The prior soft palette calculated replacements for configured theme tokens and introduced home-specific names. The correction removes those replacements, uses canonical card/header/navigation/footer/divider/interaction tokens directly and excludes company-entity theme overlays from the opt-in home path. Existing legacy consumers are unchanged. Layout geometry was compared at 320/393/768/1280 pixels and remains identical; all 43 focused tests passed, including three new contract regressions. The 505 protected files passed readback. No theme database writes or client configuration changes are part of this correction.

Corrected packages ui-manager 1.0.20 and ui-layout 1.0.19 are published; all 37/54 packaged files were verified against their merged dev commits before updating the consumer pins. Previous RC 1.10.60-rc.1 remains immutable and must not be promoted to production. A new RC and human staging review are required.

## Web login bootstrap correction

Dev runtime reproduced React maximum update depth after logout/login without reload. The translation readiness gate unmounted navigation, causing route reset and repeated bottom navigation registration. ui-common 1.2.96 preserves navigation while keeping the shell invisible, non-interactive and hidden from accessibility until existing translations are ready. Business rules, routing, authorization, theme token mappings, native behavior and 70% zoom remain unchanged.

Regression bootstrapNavigation.test.js uses the real provider render/registration code: RED reproduced maximum update depth, GREEN passes with one mount across bootstrap. 44 homepage tests in 9 suites passed. The isolated v1.2.96 source excludes independent Sem Parar work from ui-common dev. Verify exact npm contents and login runtime after consuming the package before staging.
