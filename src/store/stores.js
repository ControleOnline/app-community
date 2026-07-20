import acl from '@controleonline/ui-common/src/store/acl';
import address from '@controleonline/ui-people/src/store/address';
import asaas from '@controleonline/ui-financial/src/store/asaas';
import auth from '@controleonline/ui-login/src/store/modules/auth';
import card from '@controleonline/ui-financial/src/store/card';
import cart from '@controleonline/ui-orders/src/store/cart';
import categories from '@controleonline/ui-common/src/store/categories';
import category_file from '@controleonline/ui-common/src/store/categories/category_file';
import city from '@controleonline/ui-common/src/store/address/city';
import configs from '@controleonline/ui-common/src/store/configs';
import imports from '@controleonline/ui-common/src/store/imports';
import contract from '@controleonline/ui-contracts/src/store/contract';
import contract_peoples from '@controleonline/ui-contracts/src/store/contract/contract_people';
import device from '@controleonline/ui-common/src/store/device';
import device_config from '@controleonline/ui-common/src/store/device_config';
import entity_log from '@controleonline/ui-common/src/store/entity_log';
import display_queues from '@controleonline/ui-ppc/src/store/modules/display_queues';
import displays from '@controleonline/ui-ppc/src/store/modules/displays';
import documents from '@controleonline/ui-people/src/store/documents';
import documentsTypes from '@controleonline/ui-people/src/store/documents/documentsTypes';
import emails from '@controleonline/ui-people/src/store/emails';
import expanded_order_products from '@controleonline/ui-orders/src/store/expanded_order_products';
import file from '@controleonline/ui-common/src/store/file';
import inventories from '@controleonline/ui-products/src/store/inventories';
import invoice from '@controleonline/ui-financial/src/store/invoice';
import models from '@controleonline/ui-crm/src/store/model';
import order_invoices from '@controleonline/ui-orders/src/store/order_invoices';
import order_file from '@controleonline/ui-orders/src/store/order_file';
import order_products from '@controleonline/ui-orders/src/store/order_products';
import order_products_queue from '@controleonline/ui-ppc/src/store/modules/order_products_queue';
import orders from '@controleonline/ui-orders/src/store/orders';
import delivery_orders from '@controleonline/ui-logistic/src/store/delivery_orders';
import order_logistics from '@controleonline/ui-logistic/src/store/order_logistics';
import delivery_courier_schedules from '@controleonline/ui-logistic/src/store/delivery_courier_schedules';
import delivery_courier_company_presences from '@controleonline/ui-logistic/src/store/delivery_courier_company_presences';
import delivery_tax_groups from '@controleonline/ui-logistic/src/store/delivery_tax_groups';
import paymentType from '@controleonline/ui-financial/src/store/paymentType';
import employee_profiles from '@controleonline/ui-employee/src/store/employee_profiles';
import attendance_reports from '@controleonline/ui-employee/src/store/attendance_reports';
import people_access_events from '@controleonline/ui-employee/src/store/people_access_events';
import people_export_jobs from '@controleonline/ui-employee/src/store/people_export_jobs';
import people_absences from '@controleonline/ui-employee/src/store/people_absences';
import people_schedules from '@controleonline/ui-employee/src/store/people_schedules';
import people from '@controleonline/ui-people/src/store/people';
import people_link from '@controleonline/ui-people/src/store/people_link';
import phones from '@controleonline/ui-people/src/store/phones';
import print from '@controleonline/ui-common/src/store/print';
import printer from '@controleonline/ui-common/src/store/printer';
import runtime_debug from '@controleonline/ui-common/src/store/runtime_debug';
import product_category from '@controleonline/ui-products/src/store/products/product_category';
import product_file from '@controleonline/ui-products/src/store/products/product_file';
import product_group from '@controleonline/ui-products/src/store/products/product_group';
import product_group_feedstock from '@controleonline/ui-products/src/store/products/product_group_feedstock';
import product_group_parent from '@controleonline/ui-products/src/store/products/product_group_parent';
import product_group_product from '@controleonline/ui-products/src/store/products/product_group_product';
import product_people from '@controleonline/ui-products/src/store/products/product_people';
import product_inventories from '@controleonline/ui-products/src/store/product_inventories';
import product_showcase_items from '@controleonline/ui-products/src/store/product_showcase_items';
import product_showcases from '@controleonline/ui-products/src/store/product_showcases';
import product_unit from '@controleonline/ui-products/src/store/products/product_unit';
import products from '@controleonline/ui-products/src/store/products';
import queues from '@controleonline/ui-ppc/src/store/modules/queues';
import report from '@controleonline/ui-report/src/store/report';
import status from '@controleonline/ui-common/src/store/status';
import tasks from '@controleonline/ui-tasks/src/store/tasks';
import tasksInterations from '@controleonline/ui-tasks/src/store/task_interations';
import tests from '@controleonline/ui-tests/src/store/tests';
import theme from '@controleonline/ui-layout/src/store/theme';
import timezones from '@controleonline/ui-common/src/store/timezones';
import translate from '@controleonline/ui-translate/src/store/translate';
import users from '@controleonline/ui-users/src/store/users';
import wallet from '@controleonline/ui-financial/src/store/wallet';
import walletPaymentType from '@controleonline/ui-financial/src/store/walletPaymentType';
import websocket from '@controleonline/ui-common/src/store/websocket';
import connections from '@controleonline/ui-common/src/store/connections';
import cron_job_commands from '@controleonline/ui-manager/src/store/cron_job_commands';
import cron_jobs from '@controleonline/ui-manager/src/store/cron_jobs';
import people_domains from '@controleonline/ui-manager/src/store/people_domains';
import people_domains_api from '@controleonline/ui-manager/src/store/people_domains_api';
import themes from '@controleonline/ui-common/src/store/themes';

export default {
  acl,
  address,
  asaas,
  auth,
  card,
  cart,
  categories,
  category_file,
  city,
  connections,
  cron_job_commands,
  cron_jobs,
  people_domains,
  people_domains_api,
  configs,
  contract,
  people_link,
  contract_peoples,
  device,
  device_config,
  entity_log,
  display_queues,
  displays,
  documents,
  documentsTypes,
  emails,
  expanded_order_products,
  file,
  inventories,
  invoice,
  imports,
  models,
  order_invoices,
  order_file,
  order_products,
  order_products_queue,
  orders,
  delivery_orders,
  order_logistics,
  delivery_courier_schedules,
  delivery_courier_company_presences,
  delivery_tax_groups,
  employee_profiles,
  attendance_reports,
  paymentType,
  people,
  people_access_events,
  people_absences,
  people_export_jobs,
  phones,
  print,
  printer,
  runtime_debug,
  product_category,
  product_file,
  product_group,
  product_group_feedstock,
  product_group_parent,
  product_group_product,
  product_people,
  product_inventories,
  product_showcase_items,
  product_showcases,
  product_unit,
  products,
  queues,
  people_schedules,
  report,
  status,
  tasks,
  tasksInterations,
  tests,
  theme,
  themes,
  timezones,
  translate,
  users,
  wallet,
  walletPaymentType,
  websocket,
};
