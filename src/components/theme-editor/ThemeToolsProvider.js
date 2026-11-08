import React,{createContext,useContext,useEffect,useState} from 'react';
import {Platform} from 'react-native';
import {useStore} from '@store';
import {app_type,is_admin_build} from '@appType';
import {canAdministerCompany} from '@controleonline/ui-common/src/react/utils/companyAuthority';
import FloatingThemePanel from './FloatingThemePanel';
import {clearThemePreview} from '../../styles/themeRuntime';
const Context=createContext({available:false,openEditor:()=>{}});
export const useThemeTools=()=>useContext(Context);
export default function ThemeToolsProvider({children}) {
  const auth=useStore('auth');
  const {currentCompany,mainCompany}=useStore('people').getters;
  const available=Platform.OS==='web' && (is_admin_build || app_type==='MANAGER') && !!auth.getters.isLogged
    && canAdministerCompany({company:currentCompany,mainCompany,user:auth.getters.user});
  const [open,setOpen]=useState(false);
  useEffect(()=>{if(!available){setOpen(false);clearThemePreview();}},[available]);
  return <Context.Provider value={{available,openEditor:()=>{if(available)setOpen(true);}}}>
    {children}
    {available && open && <FloatingThemePanel onClose={()=>setOpen(false)} />}
  </Context.Provider>;
}
