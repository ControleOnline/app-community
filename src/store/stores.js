import acl from '@controleonline/ui-common/src/store/acl';
import address from '@controleonline/ui-people/src/store/address';
import auth from '@controleonline/ui-login/src/store/modules/auth';
import cart from '@controleonline/ui-orders/src/store/cart';
import categories from '@controleonline/ui-common/src/store/categories';
import city from '@controleonline/ui-common/src/store/address/city';
import configs from '@controleonline/ui-common/src/store/configs';
import contract from '@controleonline/ui-contracts/src/store/contract';
import contract_peoples from '@controleonline/ui-contracts/src/store/contract/contract_people';
import device from '@controleonline/ui-common/src/store/device';
import device_config from '@controleonline/ui-common/src/store/device_config';
import displays from '@controleonline/ui-ppc/src/store/modules/displays';
import display_queues from '@controleonline/ui-ppc/src/store/modules/display_queues';
import documents from '@controleonline/ui-people/src/store/documents';
import documentsTypes from '@controleonline/ui-people/src/store/documents/documentsTypes';
import emails from '@controleonline/ui-people/src/store/emails';
import expanded_order_products from '@controleonline/ui-orders/src/store/expanded_order_products';
import file from '@controleonline/ui-common/src/store/file';
import invoice from '@controleonline/ui-financial/src/store/invoice';
import models from '@controleonline/ui-crm/src/store/model';
import orders from '@controleonline/ui-orders/src/store/orders';
import order_products from '@controleonline/ui-orders/src/store/order_products';
import order_products_queue from '@controleonline/ui-ppc/src/store/modules/order_products_queue';
import paymentType from '@controleonline/ui-financial/src/store/paymentType';
import people from '@controleonline/ui-people/src/store/people';
import phones from '@controleonline/ui-people/src/store/phones';
import print from '@controleonline/ui-common/src/store/print';
import printer from '@controleonline/ui-common/src/store/printer';
import products from '@controleonline/ui-products/src/store/products';
import product_unit from '@controleonline/ui-products/src/store/products/product_unit';
import product_category from '@controleonline/ui-products/src/store/products/product_category';
import product_group from '@controleonline/ui-products/src/store/products/product_group';
import product_group_product from '@controleonline/ui-products/src/store/products/product_group_product';
import product_group_feedstock from '@controleonline/ui-products/src/store/products/product_group_feedstock';
import queues from '@controleonline/ui-ppc/src/store/modules/queues';
import status from '@controleonline/ui-common/src/store/status';
import tasks from '@controleonline/ui-tasks/src/store/tasks';
import tasksInterations from '@controleonline/ui-tasks/src/store/task_interations';
import theme from '@controleonline/ui-layout/src/store/theme';
import translate from '@controleonline/ui-translate/src/store/translate';
import users from '@controleonline/ui-users/src/store/users';
import wallet from '@controleonline/ui-financial/src/store/wallet';
import walletPaymentType from '@controleonline/ui-financial/src/store/walletPaymentType';

export default {
  acl,
  auth,
  address,
  cart,
  categories,
  city,
  configs,
  contract,
  contract_peoples,
  device,
  device_config,
  displays,
  display_queues,
  documents,
  documentsTypes,
  emails,
  expanded_order_products,
  file,
  invoice,
  models,
  order_products,
  order_products_queue,
  orders,
  paymentType,
  people,
  phones,
  print,
  printer,
  products,
  product_category,
  product_group,
  product_group_feedstock,
  product_group_product,
  product_unit,
  queues,
  status,
  tasks,
  tasksInterations,
  theme,
  translate,
  users,
  wallet,
  walletPaymentType,
};