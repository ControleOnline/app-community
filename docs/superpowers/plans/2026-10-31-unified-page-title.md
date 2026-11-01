# Unified management page title

Approved in chat. Execute locally using writing-plans/executing-plans guidance; no tasks, commits or publication.

Goal: one centered page title under the centered home logo; bordered compact back control; preserve data, filters, actions, callbacks and navigation.

Approach: resolve canonical list titles separately from filter-context titles. A shared presentation context declares title ownership only inside the modern management shell. Local table/page adapters omit their duplicate page headings under that context and retain standalone/legacy presentation. Complex operational headers and section titles remain available. No installed package edits.

Checks: Employees All becomes Colaboradores while request context remains all; shared list callbacks and paging unchanged; detail and Finance titles remain dynamic; custom header actions and route fallback still work; Home/public/TV exceptions preserved; long titles wrap without moving the center; product/PDV controls stay accessible.

- [x] Add regression checks for title resolution, ownership and preserved callbacks.
- [x] Update common navigation row and local visual adapters.
- [x] Run focused checks, review changes and attempt authenticated visual validation.

## Validation
12 focused suites / 96 tests passed. Checks cover canonical names independent of all filter context, preserved finance/detail/product titles, navigation fallback and locks, preserved count badges, duplicate heading removal and original table callbacks/request parameters, product/PDV actions, ADMIN/MANAGER gate and presentation.

Back/title row has equal left/right slots; long titles wrap. Special actions and composite operational headers occupy a separate wrapping row so they cannot shift the central heading. Installed packages and domain behavior are untouched. Configurator/report presentation styles hide only the page-title text, retaining descriptions and section/modal titles.

Read-only review caught multi-part header flattening; fixed and regression checked. No remaining actionable findings. Authenticated visual confirmation still depends on the user's local session, which is not available in the assistant browser. No tasks, commits or publication.
