# Store-First Audit

Lista viva dos arquivos do front que ainda precisam ser alinhados com a regra store-first.

- `HTTP` = usa `api.fetch` ou `fetch` direto fora da store.
- `PAGE` = uso explicito de paginacao fora da store; sem pendencias atuais.
- `src/store/**` e testes ficam fora desta lista porque a store eh a camada permitida para concentrar a chamada HTTP.
- `ui-legacy/**` e arquivos Vue ficam fora desta auditoria porque esse modulo sera removido.

## ui-shop
- [ ] `modules/controleonline/ui-shop/src/react/pages/CheckoutPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-shop/src/react/hooks/useShopCatalogState.js` `(HTTP)`
- [ ] `modules/controleonline/ui-shop/src/react/pages/ShopFranchiseLocatorPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-shop/src/react/components/storefront/ShopNativeMap.native.js` `(HTTP)`
- [ ] `modules/controleonline/ui-shop/src/react/utils/shopCatalog.js` `(HTTP)`

## ui-products
- [ ] `modules/controleonline/ui-products/src/react/components/ProductSalesTab.js` `(HTTP)`
- [ ] `modules/controleonline/ui-products/src/react/domain/productCosting.js` `(HTTP)`
- [ ] `modules/controleonline/ui-products/src/react/hooks/useMarketplaceCatalogSync.js` `(HTTP)`
- [ ] `modules/controleonline/ui-products/src/react/pages/PurchaseSuggestions.js` `(HTTP)`
- [ ] `modules/controleonline/ui-products/src/react/services/fileUpload.js` `(HTTP)`

## ui-manager
- [ ] `modules/controleonline/ui-manager/src/react/pages/Food99IntegrationPage/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/ModelTemplatesPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/PrinterDeviceDetailPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/ThemeManagerPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/TranslationsReviewPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/home/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/Devices/deviceTypes/shared.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/IFoodIntegrationPage/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/IntegrationConfigPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/Integrations.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/MenuAccessConfigPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/ThemePreviewPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-manager/src/react/pages/delivery-rates/DeliveryRateCompanyPage.js` `(HTTP)`

## ui-orders
- [ ] `modules/controleonline/ui-orders/src/react/hooks/usePosCartSession.js` `(HTTP)`
- [ ] `modules/controleonline/ui-orders/src/react/pages/CashRegister/Withdrawal.js` `(HTTP)`
- [ ] `modules/controleonline/ui-orders/src/react/pages/Prints/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-orders/src/react/pages/checkout/Checkout.js` `(HTTP)`
- [ ] `modules/controleonline/ui-orders/src/react/pages/checkout/LinkedOrderSettlementPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-orders/src/react/services/Cielo/Cielo.js` `(HTTP)`
- [ ] `modules/controleonline/ui-orders/src/react/pages/orders/sales/useOrderMarketplaceSummary.js` `(HTTP)`

## ui-common
- [ ] `modules/controleonline/ui-common/src/react/components/DefaultProvider.native.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/components/DefaultProvider.web.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/components/RemoteCheckoutService.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/utils/commercialDocumentOrders.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/utils/shopFranchises.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/components/AddImportModal.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/components/DeviceAlertSoundService.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/components/PrintService.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/components/radio/Spotify.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/pages/Imports.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/utils/frontendDebugLog.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/utils/menuCatalogDownload.js` `(HTTP)`
- [ ] `modules/controleonline/ui-common/src/react/utils/normalizedCatalogDownload.js` `(HTTP)`

## ui-crm
- [ ] `modules/controleonline/ui-crm/src/react/pages/home/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-crm/src/react/pages/settings/sections/IntegrationsSection.js` `(HTTP)`

## ui-logistic
- [ ] `modules/controleonline/ui-logistic/src/react/pages/orders/OrderLogisticsPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-logistic/src/react/pages/presence/DeliveryCourierPresencePage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryVehicleSetupPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryRateTableCompaniesPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryRateTableFormPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/hooks.js` `(HTTP)`
- [ ] `modules/controleonline/ui-logistic/src/react/pages/presence/DeliveryCourierScheduleFormPage.js` `(HTTP)`

## ui-ppc
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/displayPage.js` `(HTTP)`
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/orders/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/products/hooks/useDisplayQueueStatus.js` `(HTTP)`
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/tv/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/DisplayDetails.js` `(HTTP)`
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/OrderProductComponents.js` `(HTTP)`
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/orders/DisplayOrderConference.js` `(HTTP)`
- [ ] `modules/controleonline/ui-ppc/src/react/pages/displays/orders/OperationalInsightsSlide.js` `(HTTP)`

## ui-people
- [ ] `modules/controleonline/ui-people/src/react/pages/Profile.js` `(HTTP)`

## ui-customers
- [ ] `modules/controleonline/ui-customers/src/react/pages/details.js` `(HTTP)`
- [ ] `modules/controleonline/ui-customers/src/react/components/tabs/EmployeesTab.js` `(HTTP)`

## ui-login
- [ ] `modules/controleonline/ui-login/src/react/pages/create-account/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-login/src/react/pages/reset-password/index.js` `(HTTP)`
- [ ] `modules/controleonline/ui-login/src/react/pages/sign-in/index.js` `(HTTP)`

## ui-contracts

## ui-financial
