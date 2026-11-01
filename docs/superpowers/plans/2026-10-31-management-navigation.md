# Management navigation implementation plan

> Execute inline using superpowers:executing-plans. Local only; no commits, branches, remote tasks or publication.

**Goal:** One compact back control and no legacy top strip in modern MANAGER/ADMIN, preserving page actions and specialized return paths.
**Spec:** Approved in chat: use the Dispositivos ← Voltar style, update ADMIN-selected layout after standardizing navigation, preserve existing menus/actions.
**Architecture:** Enable the existing modern presentation for ADMIN. A route boundary captures page navigation.setOptions (including hooks), suppresses the native strip and hands dynamic header actions to an inline navigation row in ManagerShell. Retain fallback routes and locked-navigation exceptions. Remove the three duplicated local back controls.
**Tech stack:** Existing React Native/Expo/React Navigation/Jest; no dependency edits.

## Constraints and review focus
Public routes and Paylist remain outside the shell; POS/PPC/SHOP/DELIVERY/CRM/SERVICE and explicit legacy retain their current navigation. Handle dynamic header overrides, header action titles, deep-link fallback/reset, compact mobile layouts, ADMIN switching and special no-back displays.

## Steps
- [x] Test ADMIN gate, private/public route options, dynamic header capture and back/fallback/action behavior.
- [x] Implement route boundary and shared inline navigation; preserve callbacks and specialized navigation.
- [x] Enable modern ADMIN, preserve runtime menus and app switcher, remove duplicate backs.
- [x] Run focused navigation and presentation checks, review diff, validate local rendering if accessible.

No changes to environments or installed packages.

## Validation and decisions
- 13 focused suites / 81 tests passed, covering ADMIN home, ADMIN/MANAGER gate, dynamic header callbacks, isolated page renders, titles, fallback/reset paths, display locks, selectors and existing presentation wrappers.
- Broad comparison with unchanged HEAD and identical Jest mapping/dependencies: baseline 90 passing / 10 failing suites, current 93 passing / 10 failing suites. No new failing suite or assertion. Existing bootstrap/patch/catalog/mock failures remain outside this change.
- Fixed Jest colors alias to match Metro resolution so presentation checks can execute.
- Read-only review found and verified fixes for header-induced render loops, string titles and TV display navigation.
- ADMIN home uses real registered runtime menu destinations rather than sales metrics.
- Local browser loaded current v1.10.101 in ADMIN but remained at session initialization without the user's session; authenticated visual confirmation is pending.
- No environments, installed packages, API source, commits or remote systems changed.
