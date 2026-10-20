# Native Manager: API 25 navigation crash (local, 2026-10-18)

Scope: the user's reproduced PDV → Order history failure. No task publication, commit, push, device configuration or business mutations. The original installed Manager remains separate from `com.controleonline.manager.localpreview`.

## Diagnosis

The emulator log records `navigation.requested: OrderHistoryPage`, then `CalledFromWrongThreadException` in `Screen.startTransitionRecursive`, reached from Fabric's `NativeProxy.notifyScreenRemoved`. The installed react-native-screens 4.16.0 calls the removal transition directly from the mounting coordinator, which can be a background thread. The transition inserts a child into a refresh layout, violating Android's view thread rule.

Backport only the UI dispatch block from the upstream [4.18.0 NativeProxy](https://github.com/software-mansion/react-native-screens/blob/4.18.0/android/src/fabric/java/com/swmansion/rnscreens/NativeProxy.kt). No dependency upgrade or architecture toggle. `scripts/apply-native-screens-patch.cjs` checks the package version and original/payload hashes, accepts an already-applied patch and refuses unrelated changes. The `.kt` payload and manifest live in `patches/`.

A second error in the same log was `Changing numColumns on the fly is not supported`. Shared `DefaultTableCards` preferred a caller's fixed key over the column count. Its list identity now includes both. A column change remounts the list; ordinary row updates retain it. Both the key and the actual FlatList numColumns prop use the effective column count, so implicit one-column and explicit numColumns=1 configurations are interchangeable. The first AVD retry exposed this latter case; a second failing regression test led to normalizing the prop too. This correction belongs to the existing shared table overlay, not a PDV-only copy.

## Repeatable checks

From app-community, using Node 20:

```sh
node scripts/apply-native-screens-patch.cjs
node scripts/apply-manager-pdv-patch.cjs
python3 scripts/tests/native-screen-transition.py
node node_modules/jest/bin/jest.js --config jest.homepage.config.cjs --runInBand
npm run test:cards-layout
```

The Kotlin boundary test compiles the actual installed NativeProxy against minimal Android/JNI doubles using the cached Kotlin 2.1.20 compiler and Java 17. It bypasses the unrelated JNI constructor, calls the actual callback from a worker, rejects view mutation there, drains the UI queue and checks unknown/removed tags are ignored. It does not replace real Android verification.

Before correction: the Kotlin test failed with `View changed off the UI thread`; two column identity cases failed with fixed caller `key`/`listKey`. After correction: Kotlin test passed; 218 tests / 57 Manager suites and three shared card sizing tests passed. React test renderer emits its existing deprecation warning.

Native Kotlin changes require rebuilding/reinstalling the APK; Metro refresh alone cannot apply them. Apply both overlays before the existing resource-limited API 25 build documented in `.codex/qa-native-manager-api25/README.md` at the workspace root. Reinstall only the localpreview package with `adb install -r`, preserving its session.

## Runtime check

Repeat PDV → catalog options → cards/table → open/close filters → debug/copy/close → cards → Order history; then back and repeat. Inspect fresh process logs for wrong-thread, column invariant and fatal errors. Record the actual result after the rebuilt APK is installed. No order creation, production dispatch or payment is needed for this case.


APK build succeeded in 4m 3s (651 tasks: 35 executed, 616 reused), SHA256 `e5c15e40da305a87eb78ddc0c7e3525b09b0489665551921638823d218824022`. Confirmed package localpreview 1.10.62, minSdk 24, target 36; `adb install -r` returned Success. The subsequent single-column normalization is JavaScript, served by Metro and verified in the Android bundle, and does not require another APK build.

The complete UI sequence reached OrderHistoryPage and its finished empty result for the default Today filter, then Android Back restored PDV cards. This proves navigation/empty-result rendering, not a populated order history, sale or payment. Copy-all was attempted and its existing handled failure toast remained; no claim that clipboard support was fixed. The debug copy failure and other layout/translation follow-ups stay outside this crash correction.

An ANR dialog initially belonged to the original `com.controleonline.manager` at 16:31, before the rebuilt localpreview process started at 16:33. It was not attributed to the new process. Firebase push registration warnings remain for the local preview application ID. No production credentials were added.

Final repeated smoke: two OrderHistoryPage requests and two returns to PDV in process 6603; no matching ReactNativeJS/AndroidRuntime errors, wrong-thread exception, column invariant or fatal signal in that process. PDV remains foreground for the user's test. Evidence: workspace `.codex/qa-native-manager-api25/crash-fix-20261018/runtime-summary.json`, navigation log and screenshots 01–13. `git diff --check` passed. All changes remain local.
