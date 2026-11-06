# Company selector presentation implementation plan

**Goal:** Restore the approved bordered horizontal company selector on the current implementation.

**Architecture:** Preserve company selection, permissions, modal and selected-company-only media. Add a dense header presentation using existing select tokens. Reuse the current adaptive company-name component and preserve its full accessible label. On narrow screens the selector stays on the same header row as the back and app controls, per the subsequent user correction.

**Tech stack:** Existing React Native components, Expo and Jest.

- [x] Add regression cases for the dense header, long names and no foreign-company image fallback; observe the failures.
- [x] Adapt ManagerCompanySelector, ManagerBrand and the header slot without changing business actions.
- [x] Run focused tests and theme regressions. Check the real desktop/mobile view and light/dark tokens.

User constraints: current checkout, local only; no task, commit, publication or database changes. The comparison with the backup and the user's instruction to proceed approve this presentation; do not restore old files or media fallback rules.

## Validation

- 7 selector/presentation tests and 13 theme regressions passed; 35 theme-system tests passed (55 total directed tests).
- Local web export passed; git diff --check passed.
- Revised GYROS header: 168 × 34 px on desktop; compact selected-company icon, centered single-line label and chevron. Exact CSS references: selectBorder, selectBackground, selectText and selectIcon.
- Real light/dark values verified; original dark preference restored. No company switch or database write was performed.
- Revised viewports 390 and 320 px: selector stays on the same row, at 32 px high. At 320 px, company x=90..202 and app x=208..312, with aligned centers and no overlap. Temporary viewport override reset.
- Company list behavior is preserved. Single-line long-name font adaptation (12/11 px down to a 9 px minimum), complete accessible label and selected-company-only image behavior verified in focused tests. Text stays centered; overflow beyond the readable minimum uses single-line truncation instead of increasing header height.

Latest validation: 20 selector/theme homepage tests and 35 theme-system tests passed; local web export and git diff --check passed. No changes to selection actions, company media sources, color tokens or database records.

## Superseding presentation approved on 2026-11-05

The user rejected the bordered horizontal trigger and approved a legible logo above the company name, with the chevron below the name aligned right, on desktop and mobile. Header mode now reuses the logo presentation without a colored box. Names remain one line at a stable 10 px size. Logo height is 40 px on desktop and 32 px on mobile; missing selected-company media still has no foreign-company fallback. Header text and icon retain their existing color tokens. Selection permissions and actions are unchanged.

Validation: 8 focused selector/presentation tests passed. Real authenticated GYROS session checked at 393 px; list opened and dismissed without switching company. At 320 px the company area occupies x=62..202 and the MANAGER control x=208..312, with no overlap. Original viewport restored. Screenshot: /tmp/company-stack-mobile.jpg. These dimensions supersede the earlier bordered presentation above.
Local web export completed successfully at /tmp/controle-company-stack-web; git diff --check passed.

## Final user correction — logo outside the name outline

Approved layout: logo on the left; company name to the right inside a rounded 1 px outline with transparent interior; chevron centered below the outline. The entire existing trigger remains clickable. Uses selectBorder, selectText and selectIcon tokens. Header keeps its existing single row. This supersedes the stacked-logo presentation above.

Verified in the real authenticated GYROS session at desktop, 393 px and 320 px. At 320 px the name outline is x=104..198, y=13..41 (94×28), background rgba(0,0,0,0); arrow center x=151 matches the name outline center, y=41..51; MANAGER starts at x=208, so no overlap. Opened and dismissed the company list without switching company. Original viewport restored. Eight focused tests and git diff --check passed. Screenshot: /tmp/company-outline-mobile.jpg. Local only; no database writes, commit or publication.

## Final borderless layout approved by user

Supersedes prior variants: logo left, company name immediately right (4 px gap), chevron centered under the name rather than under the whole selector. No border or filled background. The pair is centered horizontally and vertically in the header slot. Reuses CompanyName with up to two lines and automatic font reduction from 11/12 px to a 9 px minimum when wrapping/overflowing. Complete accessible label retained. Existing single-line consumers retain their behavior.

Nine focused tests passed, including two-line font reduction and unchanged selection/dismissal rules. Real authenticated GYROS checked at desktop, 393 and 320 px; opened and dismissed the list without switching company. At 320 px both company and MANAGER triggers are 44 px high at y=10, separated by 6 px (company x=62..202, MANAGER x=208..312). Original viewport restored. Screenshot /tmp/company-borderless-final.jpg. git diff --check passed. Local only; no task, commit, database write or publication.

## Latest correction — original logo size and inline chevron

User requested restoring the original 40×40 logo on mobile and desktop and moving the arrow to the right of the company name. Logo, name and arrow now share one centered horizontal row, with the previous borderless presentation retained. Two-line adaptive name behavior remains.

Nine focused tests and git diff --check passed. Real GYROS at 320 px: logo40×40 at y12, text13 px high at y25.5 and arrow12 px high at y26 (all share center y32). Company trigger x62..202; MANAGER x208..312; no overlap. Screenshot at393px /tmp/company-row-original-logo.jpg. Original viewport restored. Local only.

## Complete company name correction

The previous header combined a168px container, a two-line clamp and font fitting down to9px; the API label survived but the visible name could still end in an ellipsis. Header CompanyName now uses explicit complete wrapping without numberOfLines, retaining the full accessible label and a10px fitting floor. Non-header presentation remains unchanged. The desktop header reserves up to240px; mobile uses available flex width, aspect-preserving logo width and equal compact gaps below360px. No selector navigation, permissions, themes or environment files were changed.

Real authenticated validation used MT - RONDONÓPOLIS - VL. AURORA (1): desktop displayed the entire label in two lines;393px displayed it in three lines with64px topbar;320px displayed it in four lines with68px topbar, no horizontal/text overflow and identical logo/name/arrow vertical centers. Browser resize transient frames were discarded; measurements were taken after the responsive render settled. Evidence: /tmp/company-name-complete-desktop.png, /tmp/company-name-complete-mobile.png, /tmp/company-name-complete-mobile-320.png. Test coverage checks unclamped full names and existing selector/navigation behavior. No environment files or database records were edited.
