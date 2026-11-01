import {createContext, useContext} from 'react';

// Only visual adapters consume this: data and package behavior remain unchanged.
export const ManagementPageTitleContext = createContext(false);
export const useManagementPageTitle = () => useContext(ManagementPageTitleContext);
