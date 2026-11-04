import {useManagementPageTitle} from './ManagementPageTitleContext';
import ManagerProductsTable from './ManagerProductsTable';
import ManagerPdvCatalog from './ManagerPdvCatalog';
import React,{useEffect,useMemo,useRef} from 'react';
import {Text,View,useWindowDimensions} from 'react-native';
import {useStore} from '@store';
import {DefaultTableThemeContext} from '../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';
import {resolveDefaultTablePreferenceScope,resolveStoredVisibleColumnsPreference,persistVisibleColumnsPreference,sanitizeVisibleColumnsPreference} from '../../../node_modules/@controleonline/ui-default/src/react/utils/tableVisibleColumnsPreferences';
import {useRoute} from '@react-navigation/native';
// Relative import intentionally bypasses the preview resolver; the domain table remains authoritative.
import DefaultTable from '../../../node_modules/@controleonline/ui-default/src/react/components/table/DefaultTable';
import {managerPreviewEnabled} from './model';
import CollectionReadStatus from './CollectionReadStatus';
import {employeeListFields} from '../../experience/readProfiles';
import {useManagerPreview} from './ManagerPreviewProvider';
import {managerTableTheme} from './managerTableTheme';
// The employee source returns company-link rows, not bare people. Its module
// intentionally declares no columns because its original presentation uses cards.
const employeeLinkColumns = [
  {name:'id',label:'ID',editable:false,sortable:false,isIdentity:true},
  {name:'people',label:'Colaborador',editable:false,sortable:false,format:person=>person?.name || person?.alias || '—'},
];
import {managerRouteTitle} from './model';

const routeListKeys = {
  ProductsPage: 'products',
  ClientsIndex: 'clients',
  ProvidersIndex: 'providers',
  FranchiseesIndex: 'franchisees',
  EmployeesIndex: 'employees',
  MyCompaniesPage: 'my_companies',
};
const routeAddKeys = {
  ProductsPage: 'new_product',
  ClientsIndex: 'new_client',
  ProvidersIndex: 'new_provider',
  FranchiseesIndex: 'new_franchisee',
  EmployeesIndex: 'new_employee',
  MyCompaniesPage: 'new_company',
};
const resolveRouteProfile = name => {
  if (!routeListKeys[name]) return null;
  const tr = global.t?.t;
  const list =
    managerRouteTitle(name, {}, tr) ||
    tr?.('menu', 'menu', routeListKeys[name]) ||
    tr?.('configs', 'title', routeListKeys[name]);
  const add =
    tr?.('configs', 'button_title', routeAddKeys[name]) ||
    tr?.('menu', 'menu', routeAddKeys[name]);
  return [list, add];
};

export default function ManagerDefaultTable(props) {
  const ownsTitle=useManagementPageTitle();
  const route=useRoute(), {width}=useWindowDimensions();
  const preview=useManagerPreview();
  const profile=resolveRouteProfile(route.name);
  const tableStore=useStore(props.storeName || 'people'), peopleStore=useStore('people');
  const enabled=!!(route.name!=='ProductsPage' && managerPreviewEnabled && preview && profile && ['people','people_link','products'].includes(props.storeName));
  const columns=tableStore?.getters?.columns?.length ? tableStore.getters.columns : (props.columns?.length ? props.columns : (enabled && route.name === 'EmployeesIndex' && props.storeName === 'people_link' ? employeeLinkColumns : []));
  const companyId=peopleStore?.getters?.currentCompany?.id;
  const signature=JSON.stringify(columns.map(column=>({name:column.key || column.name,required:column.required,hideable:column.hideable,visible:column.visible})));
  const seeded=useRef(new Set());
  useEffect(()=>{
    if(!enabled || !companyId || !columns.length) return;
    const scope=resolveDefaultTablePreferenceScope({companyId,storeName:props.storeName,preferenceKey:`on-manager:${route.name}`,route});
    const seedKey=JSON.stringify(scope);
    if(seeded.current.has(seedKey) || resolveStoredVisibleColumnsPreference(scope)) return;
    const compactKey=key=>String(key).split('.').at(-1).replace(/[_-]/g,'').toLowerCase();
    const primary=props.storeName==='products'
      ? ['id','name','product','description','sku','price','saleprice','enabled']
      : ['id','name','alias','email','phone','people','linktype'];
    const useful=columns.filter(column=>primary.includes(compactKey(column.key || column.name)));
    // Unknown metadata stays visible rather than guessing which business fields can be hidden.
    if(useful.length<2) return;
    const visibleColumns=Object.fromEntries(columns.map(column=>{const key=column.key || column.name;return [key,primary.includes(compactKey(key))];}));
    const next=sanitizeVisibleColumnsPreference({columns,visibleColumns});
    persistVisibleColumnsPreference(scope,next);seeded.current.add(seedKey);
    tableStore?.actions?.setVisibleColumns?.(next);
  },[enabled,companyId,props.storeName,route.name,signature]);
  const c=preview?.colors || {}, mobile=width<=760;
  const tableColors=useMemo(()=>managerTableTheme(c),[c]);
  if(managerPreviewEnabled && preview && route.name==='PdvPage' && props.storeName==='categories') return <ManagerPdvCatalog {...props}/>;
  if(managerPreviewEnabled && preview && route.name==='PdvPage' && props.storeName==='products') return <ManagerProductsTable {...props} inlineCatalog interactionModeOverride="pdv"/>;
  if(managerPreviewEnabled && preview && route.name==='ProductsPage' && props.storeName==='products') return <ManagerProductsTable {...props}/>;
  if(!enabled) return <DefaultTable {...props}/>;
  const addAction = props.onAdd || props.toolbarActions?.find(action=>action.key==='add')?.onPress;
  return <View style={{flex:1,minHeight:0,backgroundColor:c.pageBackground}}>
    {!ownsTitle && <View style={{paddingHorizontal:12,paddingVertical:8}}><Text accessibilityRole="header" style={{color:c.textPrimary,fontSize:18,fontWeight:'700'}}>{profile[0]}</Text></View>}
    <CollectionReadStatus catalog={preview?.experience?.catalog} endpoint={tableStore?.getters?.resourceEndpoint} color={c.textMuted} onlyProblems/>
    <DefaultTableThemeContext.Provider value={tableColors}>
    <DefaultTable {...props} columns={columns} paginationMode="pages" compactBreakpoint={760}
      initialViewMode={mobile?'cards':'table'} visibleColumnsPreferenceKey={`on-manager:${route.name}`}
      pageSize={mobile?10:20} searchPlaceholder={props.searchPlaceholder || [global.t?.t('configs', 'placeholder', 'search'), profile?.[0]].filter(Boolean).join(' ')}
      requestParams={{...props.requestParams,...(route.name==='EmployeesIndex'?employeeListFields:{}),itemsPerPage:mobile?10:20}}
      cardListProps={{...props.cardListProps,key:`on-manager:${route.name}:list`}}
      showToolbarActions showToolbarControls
      add={!!addAction} onAdd={addAction} addLabel={profile[1]} />
    </DefaultTableThemeContext.Provider>
  </View>;
}
