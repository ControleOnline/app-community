# Mobile menu gestures — local implementation

Approved: keep the current code as the base. Mobile hamburger in the header with a light token-based border, next to the existing back control. Short press opens the existing full menu; holding for 500 ms toggles an optional icon rail. Release after holding must not open the full menu. No extra controls, business-rule changes, task, commit, publication or database writes.

Implemented in ManagerShell and ManagerPreviewProvider. Reuses the existing filtered menu items, navigation parameters, active colors and back logic. Rail begins below the header, with scrolling icons; absent by default, so no empty column remains. Full drawer also begins below the measured header to preserve hamburger/back access. A first-use hint is dismissed by either gesture. Preference remains across routes in the shared provider, resets on login/principal changes, and has no database or persistent storage side effects. Desktop sidebar behavior retained.

Validation:
- Observed two new gesture tests fail before implementation; both passed afterward.
- 25 focused tests passed (7 suites), including provider scope/reset, long-release suppression, rail icons, drawer, company selector and theme regressions.
- Full legacy managerShell suite: same 7 pre-existing outdated expectations failed; 11 passed with the two new cases before moving them to their dedicated file. No claim that the full legacy suite passes.
- Local Expo web export passed: /tmp/controle-mobile-menu-web. git diff --check passed.
- Real authenticated session: 393 px, long press showed rail without drawer, rail Clientes opened /clients-index and preserved rail; short press opened full drawer below header; holding the same header button while drawer open closed it and toggled rail; repeating long press hid the rail. Existing back returned to Home and preserved preference.
- At 320 px on Clientes, menu x8..44, back x48..76, company x82..202, MANAGER x208..312; no overlap. Original viewport and Home restored, rail hidden after QA.
- Evidence: /tmp/mobile-menu-full.jpg (drawer + accessible header), /tmp/mobile-menu-final.jpg (Home + icons), /tmp/mobile-menu-final-icons.jpg (Clientes + back + icons).
