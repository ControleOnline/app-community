# Clicks Nao Assincronos

Atualizado em 2026-07-23.

Critério original da busca: arquivos com `onClick` ou `onPress` cujo handler é inline e não `async`, ou aponta para função local do mesmo arquivo que também não é `async`.

Critério do agrupamento abaixo: classificação heurística, sem alterar código, em 3 blocos:

- `Provavelmente síncronos`: cliques de UI local, navegação simples, toggle, abertura e fechamento de modal, seleção local.
- `Provavelmente assíncronos`: cliques que aparentam disparar persistência, carga, sincronização ou fluxo operacional remoto.
- `Revisão manual`: arquivos mistos ou ambíguos, com combinação de cliques de UI local e ações potencialmente assíncronas.

Total considerado: `188` arquivos.

## Bloco 1: Provavelmente Sincronos (31)

- `modules/controleonline/ui-common/src/react/components/ContextHelpButton.js`
- `modules/controleonline/ui-common/src/react/components/EntityLogContent.js`
- `modules/controleonline/ui-contracts/src/react/components/contracts.js`
- `modules/controleonline/ui-crm/src/react/pages/crm/conversation.js`
- `modules/controleonline/ui-crm/src/react/pages/home/index.js`
- `modules/controleonline/ui-crm/src/react/pages/settings/GeneralSettings.js`
- `modules/controleonline/ui-crm/src/react/pages/settings/sections/MenuCatalogSection.js`
- `modules/controleonline/ui-login/src/react/pages/confirm-account/index.js`
- `modules/controleonline/ui-login/src/react/pages/create-account/index.js`
- `modules/controleonline/ui-login/src/react/pages/sign-in/index.js`
- `modules/controleonline/ui-logistic/src/react/pages/companies/index.js`
- `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryRateTableCompaniesPage.js`
- `modules/controleonline/ui-logistic/src/react/pages/presence/DeliveryCourierSchedulesPage.js`
- `modules/controleonline/ui-manager/src/react/components/integrations/IntegrationTabs/index.js`
- `modules/controleonline/ui-manager/src/react/pages/Connections.js`
- `modules/controleonline/ui-manager/src/react/pages/Devices.js`
- `modules/controleonline/ui-manager/src/react/pages/Devices/deviceTypes/shared.js`
- `modules/controleonline/ui-manager/src/react/pages/FinancialHubPage.js`
- `modules/controleonline/ui-manager/src/react/pages/PdvPage.js`
- `modules/controleonline/ui-manager/src/react/pages/ThemePreviewPage.js`
- `modules/controleonline/ui-orders/src/react/components/OrderSectionTabs.js`
- `modules/controleonline/ui-orders/src/react/pages/CashRegister/Withdrawal.js`
- `modules/controleonline/ui-orders/src/react/pages/CashRegister/index.js`
- `modules/controleonline/ui-products/src/react/components/InventoryForm.js`
- `modules/controleonline/ui-products/src/react/components/ProductReferenceLink.js`
- `modules/controleonline/ui-products/src/react/components/products/ProductItem.js`
- `modules/controleonline/ui-products/src/react/pages/ProductDetails.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopBottomCart.js`
- `modules/controleonline/ui-shop/src/react/pages/OrderDetailsPage.js`
- `modules/controleonline/ui-shop/src/react/pages/ShopCatalogPage.js`
- `modules/controleonline/ui-shop/src/react/pages/ShopLoyaltyPage.js`

## Bloco 2: Provavelmente Assincronos (4)

- `modules/controleonline/ui-manager/src/react/pages/MyCompaniesPage.js`
- `modules/controleonline/ui-orders/src/react/pages/CashRegister/CloseCashRegister.js`
- `modules/controleonline/ui-ppc/src/react/pages/displays/products/index.js`
- `modules/controleonline/ui-ppc/src/react/pages/queues/QueueAddProducts.js`

## Bloco 3: Revisao Manual (153)

### Resumo por modulo

- `ui-common`: 10
- `ui-contracts`: 3
- `ui-crm`: 10
- `ui-customers`: 8
- `ui-default`: 10
- `ui-employee`: 3
- `ui-financial`: 5
- `ui-layout`: 1
- `ui-login`: 1
- `ui-logistic`: 7
- `ui-manager`: 31
- `ui-orders`: 17
- `ui-people`: 3
- `ui-ppc`: 7
- `ui-products`: 21
- `ui-shop`: 15
- `ui-tests`: 1

### Lista completa

- `modules/controleonline/ui-common/src/react/components/AddImportModal.js`
- `modules/controleonline/ui-common/src/react/components/AppTypeSwitcher.js`
- `modules/controleonline/ui-common/src/react/components/BottomNavigationBar.js`
- `modules/controleonline/ui-common/src/react/components/CategoryForm.js`
- `modules/controleonline/ui-common/src/react/components/LinkedOrderProductsTab.js`
- `modules/controleonline/ui-common/src/react/components/MessageService.js`
- `modules/controleonline/ui-common/src/react/pages/GenericLogPage.js`
- `modules/controleonline/ui-common/src/react/pages/Imports.js`
- `modules/controleonline/ui-common/src/react/pages/SettingsPage/PaymentTypesByWalletTab.js`
- `modules/controleonline/ui-common/src/react/pages/SettingsPage/index.js`
- `modules/controleonline/ui-contracts/src/react/components/CreateContractModal.js`
- `modules/controleonline/ui-contracts/src/react/pages/ContractDetails.js`
- `modules/controleonline/ui-contracts/src/react/pages/ContractsPage.js`
- `modules/controleonline/ui-crm/src/react/components/CreateContractModal.js`
- `modules/controleonline/ui-crm/src/react/pages/comissions/index.js`
- `modules/controleonline/ui-crm/src/react/pages/crm/index.js`
- `modules/controleonline/ui-crm/src/react/pages/proposals/CreateProposalsModal.js`
- `modules/controleonline/ui-crm/src/react/pages/proposals/ProposalDetails.js`
- `modules/controleonline/ui-crm/src/react/pages/proposals/index.js`
- `modules/controleonline/ui-crm/src/react/pages/settings/sections/CrmSection.js`
- `modules/controleonline/ui-crm/src/react/pages/settings/sections/OrderPaymentSection.js`
- `modules/controleonline/ui-crm/src/react/pages/settings/sections/OrderPrintSection.js`
- `modules/controleonline/ui-crm/src/react/pages/settings/sections/ShopSection.js`
- `modules/controleonline/ui-customers/src/react/components/tabs/AddressesTab.js`
- `modules/controleonline/ui-customers/src/react/components/tabs/ContactTab.js`
- `modules/controleonline/ui-customers/src/react/components/tabs/DocumentsTab.js`
- `modules/controleonline/ui-customers/src/react/components/tabs/EmployeesTab.js`
- `modules/controleonline/ui-customers/src/react/components/tabs/ProductsTab.js`
- `modules/controleonline/ui-customers/src/react/components/tabs/SalesmanTab.js`
- `modules/controleonline/ui-customers/src/react/components/tabs/UsersTab.js`
- `modules/controleonline/ui-customers/src/react/pages/details.js`
- `modules/controleonline/ui-default/src/react/components/filters/CompactFilterSelector.js`
- `modules/controleonline/ui-default/src/react/components/filters/DateShortcutFilter.js`
- `modules/controleonline/ui-default/src/react/components/filters/DefaultExternalFilters.js`
- `modules/controleonline/ui-default/src/react/components/filters/DefaultSearch.js`
- `modules/controleonline/ui-default/src/react/components/inputs/DefaultDateInput.js`
- `modules/controleonline/ui-default/src/react/components/inputs/DefaultInput.js`
- `modules/controleonline/ui-default/src/react/components/inputs/DefaultSelect.js`
- `modules/controleonline/ui-default/src/react/components/map/DefaultGoogleMap.web.js`
- `modules/controleonline/ui-default/src/react/components/map/DefaultNativeMap.native.js`
- `modules/controleonline/ui-default/src/react/components/table/DefaultTable.js`
- `modules/controleonline/ui-employee/src/react/components/EmployeeAttendanceSection.js`
- `modules/controleonline/ui-employee/src/react/pages/EmployeeDetailsPage.js`
- `modules/controleonline/ui-employee/src/react/pages/RhHomePage.js`
- `modules/controleonline/ui-financial/src/react/pages/InvoiceCategoriesPage.js`
- `modules/controleonline/ui-financial/src/react/pages/InvoiceDetailsPage.js`
- `modules/controleonline/ui-financial/src/react/pages/WalletsPage.js`
- `modules/controleonline/ui-financial/src/react/pages/reports/IncomeStatement (ui-manager).js`
- `modules/controleonline/ui-financial/src/react/pages/reports/IncomeStatement.js`
- `modules/controleonline/ui-layout/src/react/components/AppMenuGrid.js`
- `modules/controleonline/ui-login/src/react/pages/reset-password/index.js`
- `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryRateTableEditor.js`
- `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryRateTablesPage.js`
- `modules/controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryVehicleSetupPage.js`
- `modules/controleonline/ui-logistic/src/react/pages/orders/OrderLogisticsPage.js`
- `modules/controleonline/ui-logistic/src/react/pages/orders/index.js`
- `modules/controleonline/ui-logistic/src/react/pages/presence/DeliveryCourierPresencePage.js`
- `modules/controleonline/ui-logistic/src/react/pages/presence/DeliveryCourierScheduleFormPage.js`
- `modules/controleonline/ui-manager/src/react/components/CompanyFilter.js`
- `modules/controleonline/ui-manager/src/react/pages/ConfiguratorPage.js`
- `modules/controleonline/ui-manager/src/react/pages/CronJobsPage.js`
- `modules/controleonline/ui-manager/src/react/pages/DeviceDetailPage.js`
- `modules/controleonline/ui-manager/src/react/pages/Food99IntegrationPage/components/Food99SettingsTab.js`
- `modules/controleonline/ui-manager/src/react/pages/IFoodIntegrationPage/components/IFoodOperationsTab.js`
- `modules/controleonline/ui-manager/src/react/pages/IFoodIntegrationPage/components/IFoodStoreTab.js`
- `modules/controleonline/ui-manager/src/react/pages/IncomeStatment.js`
- `modules/controleonline/ui-manager/src/react/pages/Integrations.js`
- `modules/controleonline/ui-manager/src/react/pages/LabelsPage.js`
- `modules/controleonline/ui-manager/src/react/pages/ManagerCategoriesPage.js`
- `modules/controleonline/ui-manager/src/react/pages/MarketplaceIntegrationPage/components/MarketplaceProductCard.js`
- `modules/controleonline/ui-manager/src/react/pages/MarketplaceIntegrationPage/components/RemoteMarketplaceMenuTab.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuAccessConfigPage.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuCostsIngredientsPage/index.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuCostsPackagingPage/index.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuCostsPage/index.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuCostsParametersPage/index.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuCostsPurchasesPage/index.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuCostsResalePage/index.js`
- `modules/controleonline/ui-manager/src/react/pages/MenuCostsSuppliersPage/index.js`
- `modules/controleonline/ui-manager/src/react/pages/ModelTemplatesPage.js`
- `modules/controleonline/ui-manager/src/react/pages/PeopleDomainDetailPage.js`
- `modules/controleonline/ui-manager/src/react/pages/PrinterDeviceDetailPage.js`
- `modules/controleonline/ui-manager/src/react/pages/ThemeManagerPage.js`
- `modules/controleonline/ui-manager/src/react/pages/TranslationsReviewPage.js`
- `modules/controleonline/ui-manager/src/react/pages/WhatsAppConnectionPage.js`
- `modules/controleonline/ui-manager/src/react/pages/delivery-rates/DeliveryRateCompanyPage.js`
- `modules/controleonline/ui-manager/src/react/pages/delivery-rates/DeliveryRateHistoryPage.js`
- `modules/controleonline/ui-manager/src/react/pages/delivery-rates/DeliveryRateVersionPage.js`
- `modules/controleonline/ui-manager/src/react/pages/home/index.js`
- `modules/controleonline/ui-orders/src/react/components/LinkedOrderCameraScanner.js`
- `modules/controleonline/ui-orders/src/react/components/LinkedOrderEntrySheet.js`
- `modules/controleonline/ui-orders/src/react/components/LinkedOrderNfcScanner.native.js`
- `modules/controleonline/ui-orders/src/react/components/PaymentCheckoutPanel.js`
- `modules/controleonline/ui-orders/src/react/components/PrintButton.js`
- `modules/controleonline/ui-orders/src/react/components/cart/Calculate.js`
- `modules/controleonline/ui-orders/src/react/pages/checkout/BarcodeCheckReader.js`
- `modules/controleonline/ui-orders/src/react/pages/checkout/BarcodeInput.js`
- `modules/controleonline/ui-orders/src/react/pages/checkout/Checkout.js`
- `modules/controleonline/ui-orders/src/react/pages/checkout/LinkedOrderSettlementPage.js`
- `modules/controleonline/ui-orders/src/react/pages/orders/OrderHistoryPage.js`
- `modules/controleonline/ui-orders/src/react/pages/orders/purchasing/MenuCostsPurchasesPage.js`
- `modules/controleonline/ui-orders/src/react/pages/orders/sales/OrderItemsTab.js`
- `modules/controleonline/ui-orders/src/react/pages/orders/sales/components/OrderAttachmentManager.js`
- `modules/controleonline/ui-orders/src/react/pages/orders/sales/components/OrderMarketplaceOverlayHost.js`
- `modules/controleonline/ui-orders/src/react/pages/orders/sales/orderDetails.js`
- `modules/controleonline/ui-orders/src/react/router/routes.js`
- `modules/controleonline/ui-people/src/react/components/AddCompanyModal.js`
- `modules/controleonline/ui-people/src/react/pages/People.js`
- `modules/controleonline/ui-people/src/react/pages/Profile.js`
- `modules/controleonline/ui-ppc/src/react/components/DisplayCard.js`
- `modules/controleonline/ui-ppc/src/react/components/QueueBlock.js`
- `modules/controleonline/ui-ppc/src/react/pages/displays/DisplayForm.js`
- `modules/controleonline/ui-ppc/src/react/pages/displays/displayPage.js`
- `modules/controleonline/ui-ppc/src/react/pages/displays/orders/index.js`
- `modules/controleonline/ui-ppc/src/react/pages/displays/products/Status/InOut.js`
- `modules/controleonline/ui-ppc/src/react/pages/displays/products/Status/Working.js`
- `modules/controleonline/ui-products/src/react/components/AttachmentManager.js`
- `modules/controleonline/ui-products/src/react/components/MarketplaceSyncIndicators.js`
- `modules/controleonline/ui-products/src/react/components/ProductFeedStock.js`
- `modules/controleonline/ui-products/src/react/components/ProductForm.js`
- `modules/controleonline/ui-products/src/react/components/ProductGroupProducts.js`
- `modules/controleonline/ui-products/src/react/components/ProductGroups.js`
- `modules/controleonline/ui-products/src/react/components/ProductPricingModal.js`
- `modules/controleonline/ui-products/src/react/components/ProductSalesTab.js`
- `modules/controleonline/ui-products/src/react/components/ProductStockForm.js`
- `modules/controleonline/ui-products/src/react/components/ProductSupplierRelationModal.js`
- `modules/controleonline/ui-products/src/react/components/ProductSuppliersTab.js`
- `modules/controleonline/ui-products/src/react/pages/Categories.js`
- `modules/controleonline/ui-products/src/react/pages/CustomIngredients.js`
- `modules/controleonline/ui-products/src/react/pages/CustomizeScreen.js`
- `modules/controleonline/ui-products/src/react/pages/Inventories.js`
- `modules/controleonline/ui-products/src/react/pages/InventoryDetail.js`
- `modules/controleonline/ui-products/src/react/pages/InventoryMovements.js`
- `modules/controleonline/ui-products/src/react/pages/MenuCostsIngredientsPage/index.js`
- `modules/controleonline/ui-products/src/react/pages/Products.js`
- `modules/controleonline/ui-products/src/react/pages/PurchaseForm.js`
- `modules/controleonline/ui-products/src/react/pages/PurchaseSuggestions.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopCategorySidebar.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopHomeEntryControls.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopMobileCatalog.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopMobileCategorySelector.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopMobileProductCard.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopProductCard.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopSalesCompanySelector.js`
- `modules/controleonline/ui-shop/src/react/components/storefront/ShopShell.js`
- `modules/controleonline/ui-shop/src/react/pages/CardsPage.js`
- `modules/controleonline/ui-shop/src/react/pages/CartPage.js`
- `modules/controleonline/ui-shop/src/react/pages/CheckoutPage.js`
- `modules/controleonline/ui-shop/src/react/pages/OrdersPage.js`
- `modules/controleonline/ui-shop/src/react/pages/ProductPage.js`
- `modules/controleonline/ui-shop/src/react/pages/ShopDownloadPage.js`
- `modules/controleonline/ui-tests/src/react/pages/home/SmokeDashboard.js`
