# Home identity, responsive sizing and loading presentation

User approved the three corrections after a read-only module audit; preserve the current code, business contracts, menus/permissions, groups and components. Local only, no task/commit/publication/database writes.

## Implemented

- Four stable semantic metric identities: closed-sales, period-orders, open-orders, clients. Translated labels are presentation only; shared OrderHistoryPage destinations retain their original route params and queries.
- Panels retain flex sharing in desktop rows; at widths <=1060 the existing stacked presentation sets flexGrow0/flexShrink0/flexBasis auto so content defines each panel height. No item count caps, clipping or fixed heights.
- ManagerStartup reused for appearance loading/error/retry and missing-company recovery. Shell remains mounted but display:none while this presentation is active, so module forms and local state survive refreshes. Shared configuration/session data effects remain outside/above presentation gates. No change to their ownership.
- Home keeps metric hooks active and warms the existing translation resolver before displaying essential labels; resolver failure presents retry instead of fabricated text or indefinite busy indication. Empty company/menu context remains handled by the shell's existing recovery.
- Tests for the established metric business contracts now explicitly provide a translation fixture instead of relying on nonexistent global translations. No endpoints, date windows, summaries, permission filters or data actions changed.

## Evidence

Before correction: real Home DOM contained5 metric nodes although source defines4; duplicate-key warnings were present. Isolated React update with translated keys reproduced4→5, while semantic keys stayed4. At393px the quick panel had395px height and its last button extended58px beyond the bottom. Same problematic source rules existed in master and backup.

New presentation suite was observed failing6/6 before implementation and passing after. Added retry/lifecycle cases cover missing texts, stable identities,393/900/1060px stacked panels,1440px row panels, no duplicate data reads after labels resolve, shell failure/retry and module mount preservation.

Validation:42 focused tests across9 suites passed;43 theme tests across14 suites passed. Local web export passed at /tmp/controle-home-presentation-final. git diff --check passed. No claim that unrelated legacy suites are clean.

## Final real-session validation

Browser access became available again. Verified the existing authenticated ADMIN→MANAGER session at localhost:8081, selected GYROS, dark theme. Four metric cards remained after full reloads, with no duplicate-key warnings. At393/900/1060px stacked panels contained the final shortcut; at1440px both panels shared a row and contained all shortcuts. At393px the last shortcut ended21px inside its panel and Explore Modules began26px after the panel. No menu items were removed. Temporary viewport overrides were reset.

Reload inspection exposed an additional blank interval: DefaultProvider.web.js sets aria-hidden, visibility:hidden and opacity0 on the mounted navigation while its existing translation bootstrap is pending. Added a guarded, hash-checked package integration that renders the existing ManagerStartup outside that hidden view, passing the shared provider palette. Translation readiness, requests, permissions and mounted navigation remain unchanged. The real browser displayed “Carregando os textos do sistema…” during this stage, then appearance loading and the four-card Home. No session or database writes were performed.

Final verification:42 Home/navigation tests and45 theme/bootstrap tests passed (87 total); web export succeeded at /tmp/controle-home-presentation-complete; git diff --check passed. Screenshots: /tmp/home-fixed-desktop.png, /tmp/home-fixed-mobile-cards.png, /tmp/home-fixed-mobile-quick-access.png, /tmp/home-fixed-translation-loading.png. Changes remain local without task, commit or publication.
