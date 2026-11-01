import {useContext} from 'react';
import {useStore as useBaseStore} from '@controleonline/ui-common/src/react/stores';
import OperationalStoreContext from './OperationalStoreContext';

export const useStore = name => {
  const store=useBaseStore(name);
  const operational=useContext(OperationalStoreContext);
  return operational?.stores?.[name] || store;
};
export {
  useStores,
  getAllStores,
} from '@controleonline/ui-common/src/react/stores';
