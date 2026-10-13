# Homepage ADMIN/MANAGER — #1056

Approved scope: mobile-first soft light appearance for HomePage in ADMIN and MANAGER. Existing business rules, configured menus, route parameters, permission filters, stores and translations are preserved. Colors remain derived from the existing theme. Native avatar download credentials now come from the auth store.

## Composition and evidence

- ui-common 1.2.94 and ui-layout 1.0.18 are published npm versions incorporating the opt-in home changes. Their source task branches were merged into dev via the repository-required PRs.
- ui-manager homepage source is published in its task-1056 branch and merged into dev. Its corrected release candidate package version 1.0.19 is NOT published: GitHub trusted publishing still fails ENEEDAUTH after repository.url correction. The app retains its currently published 1.0.17 dependency until the new version is actually available.
- ui-shop 1.0.18 official master contains the three previously integrated Android fixes but its npm publish fails ENEEDAUTH. A metadata-only 1.0.19 recovery branch exists. Its dev also contains QR/checkout changes not included in this homepage scope; the conflicting merge was aborted. The app retains published 1.0.16 pending a safe recovered package.
- Published-source baseline differences and existing dev changes were reviewed and preserved, including the current company-identity handling and POS operation tooltip.
- 40 focused homepage tests passed against the integrated module sources after this composition changed; the earlier 34 runtime footer/zoom tests remain evidence for unchanged behavior. The 505-file protected inventory previously passed (ui-default/ui-orders/local config). Local configuration must never be committed.

## Current gate

The app task branch is preparatory source, not a deployable approved composition. Do not merge it into dev or promote an RC/staging until ui-manager and the required ui-shop composition have stable published npm versions. Then update only the consumer pins, verify the packaged source against the reviewed source, validate required integration changes, perform Security review and freeze/promote an RC for human review. Production remains unauthorized.

Tracking: https://github.com/ControleOnline/app-community/issues/1056
