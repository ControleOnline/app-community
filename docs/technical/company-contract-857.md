# Company contract recovery — app-community #857

`mainCompany` is the company associated with the domain. `currentCompany` is the selected accessible company, persisted in `session.mycompany`.

The app previously pinned ui-people before the #823 migration while its consumers called `mainCompany()`. This change pins the corrected module and updates obsolete reads in DefaultFile, DefaultFileColumn and SalesmanTab. It also completes the internal mutation/helper naming. Existing company resolution priorities and same-ID theme enrichment are preserved.

`GET /people/company/default` remains unchanged, including its API permissions. The `ui-default` library, Default components and generic default/theme concepts are unaffected. General fallback-policy changes requested by #823 are outside this recovery task.

## Validation

- `node scripts/validate-company-contract.cjs` checks the actual module sources before web build/FTP; rejects missing mainCompany exports and obsolete company identifiers, allows the legacy HTTP path and unrelated Default names.
- Focused Jest suites: 19 tests pass across store load/error handling, A/B/C selection and session restore, same-ID theme enrichment, both file components, salesman context and the pre-build gate.
- `EXPO_NO_TELEMETRY=1 npx expo export --platform web --output-dir /tmp/task-857-web`: passed (Node 22.22.1 in this workstation; deployment workflow uses Node 20).
- `node scripts/tests/company-bootstrap-smoke.cjs /tmp/task-857-web`: passed; compiled login rendered two inputs, made a domain-company request through the preserved route and emitted no page errors. Backend responses are mocked; this is not an authenticated production journey. The QR worker dependency is fetched and supplied by the smoke runner.
- ESLint passes for changed store/helper/tests. Three existing JSX components have 21 pre-existing lint errors; comparison against origin/master found identical diagnostics and no new errors. No blanket suppression was added.

## Delivery and integration

All changes are in task-857, based on each repository's updated origin/master. Original workspaces were preserved. The task branch pins the tested module commits for review; the Manager must integrate module tasks before finalizing integration gitlinks in the parent, then revalidate the resulting composition. A published task branch is not a staging/production release.

Wiki changes are published on `task-857` in `ControleOnline/ui-people.wiki` (Store.md and Contratos.md), pending integration into the wiki's published branch.

Acceptance after integration: login/bootstrap has no JavaScript error; domain A remains mainCompany when B/C is selected; file-domain resolution and salesman-company priority remain covered; the gate passes against the exact module SHAs being built.
