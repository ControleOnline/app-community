# API/UI module resolution contract

`package.json` is the source of truth for the exact versions of the app's
ControleOnline UI module dependencies. `package-lock.json` records the resolved
dependency tree for reproducible installs.

- Development (`MODULE_RESOLUTION_MODE=development`, the default) resolves
  `@controleonline/*` from `modules/controleonline`.
- Production (`MODULE_RESOLUTION_MODE=production`) resolves the same imports
  from `node_modules/@controleonline/*` only. Babel does not fall back to the
  source tree, and Metro disables hierarchical lookup.
- Every `@controleonline/ui-*` dependency must use an exact `x.y.z` version in
  `dependencies`. Branch names, ranges, git URLs, and floating tags are rejected
  by the local validator.

Run the deterministic checks with:

```sh
npm run test:module-contract
npm run validate:module-contract
MODULE_RESOLUTION_MODE=production npm run validate:module-contract
```

The production check is intentionally fail-closed. A missing npm artifact is a
release blocker; it must be published from its own `ControleOnline/*` module
repository and pinned in `package.json` at the exact package version before the
app can claim reproducible production installation. No credentials or registry
tokens belong in this repository.
