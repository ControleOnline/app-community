# Manager and product-form hotfix reconciliation (#1145)

Base: current APP master 0a9cc0320bf08c1d0a4437d061a04a9ee452a0af (1.10.76, #1142).
Approved experience: APP RC9 d866176be63b77ac64ebc0362ea27cdcd4543204 (#1117, #1123, #1124).

The hotfix RC preserved older content while merging RC9 history. Consequently the previous Manager branch is already an ancestor of master; merging it alone cannot restore the experience. This task starts on current master and reapplies the reviewed experience delta, retaining the hotfix through a combined published package.

ui-products 1.0.40 combines approved source c6e56eda27fbde8e9da0bd1ec691708319192b39 with the fixes in 1.0.39: category helper imports in ProductFormFields, useMemo import in ProductFeedStock, and syncProductCategories injection from ProductForm into productFormSave. The four affected production files and existing regression file match the hotfix exactly. No pricing, quantity, settlement, API, or authorization rule was redesigned.

APP consumes the exact published version. The three version guards for ui-products are updated without relaxing payload hashes. Existing Manager sources and payloads are byte-identical to RC9; only app/package versions, those guard versions, and release inventory differ. ui-common 1.2.102, ui-orders 1.3.48, ui-people 1.0.101, remaining advanced pins, ADMIN entry, selector and explicit legacy contingency are retained.

No new local test suites by prior human instruction. Verification includes syntax, source comparison, preparation on published package files, remote build/deploy and manual web inspection. Broad CI failures must remain disclosed. This does not certify every native/AVD/role/offline transaction flow. Production deployment is excluded.
