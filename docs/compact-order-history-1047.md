# Operação Compacta — #1047

The app consumes published packages ui-default 1.0.278, ui-orders 1.3.43,
ui-layout 1.0.16 and ui-common 1.2.91. Order History opts into the shared compact
table, numbered pagination and API-backed totals. Other consumers retain the
legacy default. Domain Themes governs the palette independently of franchise
selection; registered status colors remain the alternative to theme overrides.
No shared database, DEFAULT theme or staging theme binding is changed here.

The module source and published-package composition were validated before this
integration: 135 tests in 22 suites, source syntax and Expo web export. The
existing evidence is retained; this manifest-only integration does not repeat
those local suites. To run the published test suite later, use `npm run test:compact`.
The runner uses installed packages without sibling-source aliases.

Payment/cancellation eligibility, authorization and company isolation remain
owned by the existing services. Header logo authentication is restricted to the
exact API origin. A remote release is complete only after its frozen RC is
promoted and its served bundle is confirmed. Master/production is outside this
delivery's authorization.
