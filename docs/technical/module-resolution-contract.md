# API/UI module resolution contract

`config/module-resolution.json` is the source of truth for how the app consumes
ControleOnline modules.

- Development (`MODULE_RESOLUTION_MODE=development`, the default) resolves
  `@controleonline/*` from `modules/controleonline`.
- Production (`MODULE_RESOLUTION_MODE=production`) resolves the same imports
  from `node_modules/@controleonline/*` only. Babel does not fall back to the
  source tree, and Metro disables hierarchical lookup.
- Production versions must be exact `x.y.z` values in `publishedPackages`.
  Branch names, ranges, git URLs, and floating tags are rejected by the local
  validator.

Run the deterministic checks with:

```sh
npm run test:module-contract
npm run validate:module-contract
MODULE_RESOLUTION_MODE=production npm run validate:module-contract
```

The production check is intentionally fail-closed. A missing npm artifact is a
release blocker; it must be published from its own `ControleOnline/*` module
repository and added to `publishedPackages` at the exact package version before
the app can claim reproducible production installation. No credentials or
registry tokens belong in this repository.
