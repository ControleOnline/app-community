# Company logo appearance — local execution

Approved scope: equal breathing room, faithful sizing for circular/square/rectangular artwork and separate artwork for light/dark backgrounds. Reuse the current project structure, permissions and company links. No masks, recoloring, background removal, database migration or publication.

Architecture: theme determines mode and header colors; artwork belongs to the selected company. The existing public company config `company_branding` holds optional logoLight/logoDark image references. New ADMIN controls appear within the existing Theme Manager overview, preserving all component groups. No image addresses in theme.colors or canonical color-token names. No logo substitution from a different company or opposite mode. Existing logo remains when no variant is configured.

Presentation: 12 px gaps, 40 px maximum image height, responsive width cap up to 80 px while reserving room for name/arrow. Loaded intrinsic dimensions drive both axes; native onLoad and web DOM load/cache observation are covered. Original contain loading/auth-domain metadata retained. Real CONTROLE ONLINE artwork (256×93) rendered at 64×23 in the final393px header; circular GYROS remains40×40. Transparent margins/opaque backgrounds embedded in artwork remain unchanged.

Editor: existing image addresses only; no file-upload workflow added. Preview is local and cancellable. Save is explicit, uses the existing Config endpoint and server permissions, verifies current session/editor lifetime, checks concurrent changes and rejects error-body responses. No real configuration save was performed in QA.

Validation: 39 homepage/media/navigation tests and 43 theme-system tests passed (82 total). Final local web export passed at /tmp/controle-company-branding-final-verified. git diff --check passed. Earlier 7 outdated legacy-shell failures were not part of these passing suites.

Real session: original MANAGER-only execution correctly hid ADMIN controls. User changed APP_TYPE back to ADMIN. Confirmed controls in ADMIN→MANAGER, correct selected company, real config GET, both preview backgrounds. Two temporary transparent local SVG fixtures confirmed distinct light/dark previews and header image update. Cancel restored the original artwork and empty fields, Save disabled again. Fixtures removed. Selected GYROS and original viewport restored; user's ADMIN configuration preserved. No DB writes/commit/task/publication.
