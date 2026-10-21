# Experience Ecosystem Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. Preserve local work. No commits, pushes, external tasks or package publication.

**Goal:** Deliver a measured local journey, scoped read reuse/prefetch and a WebGPU Shenlong consuming the shared context.
**Architecture:** Framework-neutral bounded event journal and read coordinator, opt-in ERP adapter over the existing API client, React presentation adapters, dependency-free procedural WebGPU renderer. Domain rules remain in their modules.
**Tech Stack:** JavaScript, React, existing React Native web, WGSL/WebGPU, Jest.
**Spec:** docs/superpowers/specs/2026-10-15-experience-ecosystem.md

## Global Constraints
- Local MANAGER preview only for runtime installation; native/production unaffected.
- No business writes or new server endpoints. No persistence of customer records in this experiment.
- Events retain whitelisted metadata, monotonic duration and correlation only; bounded by size/time.
- Context separation covers company, principal, application and session. Old work cannot enter a new context.
- Predictions are read-only and bounded. UI cache and journey records are separate.

## Review Focus
- Late responses after company/session switch must be rejected and cannot warm a new cache.
- Concurrent refresh/write/read must not resurrect stale responses or mutate shared response objects.
- Speculative results must match the actual request; unknown routes never imply access.
- WebGPU unavailable/device lost/unmount must clean up and retain a working static alternative.
- Measured network completion is not a claim that all screen data has rendered.

## Work blocks
1. [x] Contracts and journal: `src/experience/journey.js`, tests in `src/tests/homepage/experience.test.js`. RED: correlation, bounded retention, interruption, context clearing. GREEN: journal API `createJourney`, `begin`, `record`, `present`, `reset`, `subscribe`, `snapshot`.
2. [x] Read coordinator: `src/experience/reads.js`, same suite. RED: hit/miss, TTL, deduplication, cloned values, mutation invalidation, scope change, prediction waste. GREEN: `createReadCoordinator({fetch,getScope,journal,policy})`, `read`, `prefetch`, `invalidate`, `dispose`.
3. [x] ERP adapter and MANAGER instrumentation: `src/experience/erpAdapter.js`, `ManagerPreviewProvider`, `ManagerShell`, `ManagerOverview`, new journey view. Preserve existing API requests, make dashboard reads non-mutating, observe route entry and response commit, scoped cache for explicit people reads; expose timeline through guide. Test actual adapter behavior and portable application identity in synthetic SHOP context.
4. [x] Shenlong WebGPU: `src/experience/shenlong/{geometry,renderer}.js`, web canvas adapter and guide view. Procedural owned mesh, lighting, depth buffer, capped resolution/frame rate, visibility/reduced-motion, device loss and SVG fallback. Test geometry and lifecycle failures; compile web bundle; inspect renderer via local isolated harness.
5. [x] Verify milestone, record timings and evidence boundaries; update contract extraction/versioning map. No authenticated runtime claim without an authenticated session. Do not publish.

## Ledger
- Ruling: user explicitly requires local/no-task/no-commit; canonical remote delivery steps are outside this experiment.
- Ruling: use bounded memory first rather than enabling generic offline persistence; existing generic saveOffline is a no-op and people data requires scope-aware retention.
- Ruling: stage 7 proves contract portability via a SHOP adapter fixture first; actual SHOP deployment is not implied.
- Ruling: latency improvement must be reported as synthetic until the user-authenticated local journey can be measured.

## Evidence at local milestone (2026-10-15)
- Checkboxes mean implementation and the stated local checks, not production acceptance or full ecosystem rollout.
- Jest: 84 tests / 19 suites passed, exit 0. Includes scoped response rejection, cloned reads, deduplication correlation, permissions, renderer cleanup and fallback, and non-mutating dashboard projections.
- Review found mutable client options poisoning learned recipes and shared-read completion losing a new journey. Both reproduced and covered by regression tests before correction.
- Isolated browser fixture: transport 635.0 ms, revisit result 0.6 ms, predicted result 0.3 ms; one prediction consumed. Synthetic values, not ERP latency results.
- Synthetic company/application switch cleared prior events and scoped data. Actual SHOP integration remains future work.
- Browser offered no WebGPU; static alternative verified. Geometry and mocked lifecycle tested; actual shader/GPU appearance and GPU cost remain unverified.
- Local app is reachable with preview flag enabled, but the available browser session redirects to SignInPage. Authenticated navigation, real latency and profile stability remain pending.
- No external tasks, commits, pushes, package versions or publications.
- Final web export: exit 0; 5,527 modules, incremental bundling 13,996 ms, output /tmp/on-manager-experience-build. No package added.
- Final git diff --check: exit 0. User clarified 8081 is preview and 8082 is current baseline. Both respond; tool-visible sessions are at SignInPage.
- Follow-up: user authenticated both tool-visible sessions (LEANDRO/GYROS). Dashboard reads on 8081 and Clients on baseline 8082 failed with Failed to fetch. Local API OPTIONS returns 200 with CORS origin 8081 allowed, but direct API-root navigation in tool browser timed out. No real latency comparison accepted; root cause remains unisolated, no speculative fix applied.
- API-root navigation eventually completed after the initial tool timeout; Symfony toolbar reported 42,834 ms. An unauthenticated GET people returned 401 with allowed CORS origin. API unreachable is not established; failure of authenticated cross-origin reads remains unisolated. Login uses username/password; Email is a placeholder only.

## Entry/account follow-up verified locally
- User authorized the account options and configurable small default Sheng-Long on sign-in; no further approval request.
- Preview SignIn reuses ui-login with optional copy/icon props (Eu sou, Usuário, Nova conta). Additive local patch is retained in patches and reapplied by the preview startup command; published-package defaults remain unchanged.
- Both account buttons open a shared menu with profile/help/theme/logout; unit tests exercise selection and dismissal. Authenticated visual verification remains pending the pre-existing Failed to fetch/session problem.
- Default avatar size 40px; session controls for size, side, suggestion delay, earlier/later and manual-only. User retains the decision to open the panel. No automatic learning, NFC or voice implementation claimed.
- Browser verified the sign-in copy, closed small avatar, preferences, delay 30 -> 60 -> 30 seconds and a later nonmodal invitation.
- Final checks: 90/90 tests, 21/21 suites, no skips; web export exit 0 (5,531 modules, 7,654 ms incremental bundling); git diff --check exit 0.
