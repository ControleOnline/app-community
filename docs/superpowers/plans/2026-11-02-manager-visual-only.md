# Task 1292 — Visual delivery independent of BI

Goal: deliver approved Manager and Lave-Go themes, media and selectors on the current team master.
Architecture: preserve master request/calculation logic; components consume canonical themes-map tokens. Domain profiles configure palettes only.
Stack: Expo/React Native, JSON palettes, Jest.
Spec: user instruction 2026-11-02: defer BI, incorporate master, prioritize visual delivery.

Constraints: no API, database, migrations or workflow changes; preserve CRM 1.0.45 from master. Keep BI preserved in previous RC/task commits. Follow official release flow; do not wait for deploy completion.

- [x] Merge current master, resolve version metadata without downgrading dependencies.
- [x] Restore master metrics contract and test its requests across all periods; remove BI helpers and metric configuration.
- [ ] Preserve visual tokens, run focused tests and build, inspect browser.
- [ ] Review the final diff, commit and record scope/evidence on task 1292.

Review focus: no BI request dependencies or domain-specific business rules; palettes remain isolated; team master changes retained.

## Evidence / execution ledger
- Base incorporated: master a8e09a73 (task 1284, CRM 1.0.45); no dependency downgrades.
- Regression test RED: production summaries contract failed on movement requests; original master series tests also failed (3 failures / 5 passes).
- GREEN: eight focused suites, 34 tests passed, including after installing CRM 1.0.45.
- Web export completed: /tmp/task1292-visual-only-web (5607 modules).
- Independent final review: no critical/important findings; API/deployment state outside visual review.
- No API, migrations, database or workflow changes in this separation. Previous BI commits remain preserved.
