import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Table from '../../components/manager-preview/ManagerDefaultTable';
import {buildParentCompanyRequestParams} from '../../../node_modules/@controleonline/ui-people/src/react/utils/peopleLinkFilters';
let mockWidth=1280, mockRoute='ProductsPage', mockColors={}, mockParams={};
const mockSetVisible=jest.fn(), mockResolvePreference=jest.fn(), mockPersistPreference=jest.fn();
let mockColumns=[],mockConfigs={};
jest.mock('@controleonline/ui-default/src/react/components/files/DefaultFile',()=>({__esModule:true,default:'AuthenticatedFile',DefaultFileCacheContext:require('react').createContext(null)}));
jest.mock('@store',()=>({useStore:name=>({getters:{columns:mockColumns,configs:mockConfigs,currentCompany:{id:3}},actions:{setVisibleColumns:mockSetVisible}})}));
jest.mock('../../../node_modules/@controleonline/ui-default/src/react/utils/tableVisibleColumnsPreferences',()=>({
 resolveDefaultTablePreferenceScope:({companyId,storeName,preferenceKey})=>({companyKey:String(companyId),storeKey:storeName,routeKey:preferenceKey}),
 resolveStoredVisibleColumnsPreference:(...args)=>mockResolvePreference(...args),
 persistVisibleColumnsPreference:(...args)=>mockPersistPreference(...args),
 sanitizeVisibleColumnsPreference:({visibleColumns})=>visibleColumns,
}));
jest.mock('../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>({DefaultTableThemeContext:require('react').createContext(null)}));
jest.mock('react-native',()=>({Pressable:'Pressable',View:'View',Text:'Text',useWindowDimensions:()=>({width:mockWidth})}));
jest.mock('@react-navigation/native',()=>({useRoute:()=>({name:mockRoute,params:mockParams})}));
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>({colors:mockColors})}));
jest.mock('../../components/manager-preview/model',()=>({managerPreviewEnabled:true}));
jest.mock('../../../node_modules/@controleonline/ui-default/src/react/components/table/DefaultTable',()=>{const React=require('react');return props=>React.createElement('ExistingTable',{...props,inheritedTheme:React.useContext(require('../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableTheme').DefaultTableThemeContext)});});
const onAdd=jest.fn(), onImport=jest.fn();
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockWidth=1280;mockRoute='ProductsPage';mockColors={};mockParams={};mockConfigs={};onAdd.mockClear();onImport.mockClear();mockColumns=[];mockSetVisible.mockClear();mockResolvePreference.mockReset();mockPersistPreference.mockClear();});
it('reuses the real table with a smaller page, company filters, real add and optional advanced tools',()=>{
 let tree;act(()=>{tree=renderer.create(<Table storeName="products" add onAdd={onAdd} importAction={onImport} requestParams={{company:3,context:'supplies'}}/>);});
 let props=tree.root.findByType('ExistingTable').props;
 expect(props.requestParams).toEqual({company:3,context:'supplies'});
 expect(props.initialViewMode).toBe('table');expect(props.showToolbarActions).toBe(true);expect(props.importAction).toBeNull();
 act(()=>tree.root.findByProps({accessibilityLabel:'Novo produto'}).props.onPress());expect(onAdd).toHaveBeenCalledTimes(1);expect(onImport).not.toHaveBeenCalled();
 act(()=>tree.root.findByProps({accessibilityLabel:'Opções administrativas'}).props.onPress());
 expect(tree.root.findByType('ExistingTable').props.showToolbarActions).toBe(true);
 act(()=>tree.unmount());
});
it('starts small touch lists on narrow devices and leaves unrelated modules untouched',()=>{
 mockWidth=360;let tree;act(()=>{tree=renderer.create(<Table storeName="products" requestParams={{company:3}}/>);});
 const props=tree.root.findByType('ExistingTable').props;
 expect(props.requestParams).toEqual({company:3});expect(props.initialViewMode).toBe('cards');expect(props.cardListProps.numColumns).toBe(1);
 act(()=>tree.unmount());mockRoute='UnknownPage';
 act(()=>{tree=renderer.create(<Table storeName="people" requestParams={{company:3}}/>);});
 expect(tree.root.findByType('ExistingTable').props.requestParams).toEqual({company:3});
 act(()=>tree.unmount());
});

it('adapts employees company-link lists without changing domain filters or callbacks',()=>{
 mockRoute='EmployeesIndex';mockWidth=650;const onRowPress=jest.fn(), actions={getItems:jest.fn()};let tree;
 act(()=>{tree=renderer.create(<Table storeName="people_link" actions={actions} onRowPress={onRowPress} showSearch={false} requestParams={{company:3,peopleType:'F',context:'all'}}/>);});
 const props=tree.root.findByType('ExistingTable').props;
 expect(props.initialViewMode).toBe('cards');expect(props.requestParams.itemsPerPage).toBe(10);
 expect(props.requestParams.company).toBe(3);expect(props.requestParams.peopleType).toBe('F');
 expect(props.actions).toBe(actions);expect(props.onRowPress).toBe(onRowPress);expect(props.showSearch).toBe(false);
 expect(props.showToolbarControls).toBe(true);expect(props.cardListProps.unframedCards).toBeUndefined();expect(tree.root.findAllByProps({accessibilityLabel:'Mais opções da lista'})).toHaveLength(0);act(()=>tree.unmount());
});
it.each([[1280,20,'table'],[360,10,'cards']])('adapts My Companies at width %s while preserving its authenticated-person company source', (width,pageSize,viewMode)=>{
 mockRoute='MyCompaniesPage';mockWidth=width;
 const requestParams=buildParentCompanyRequestParams({user:{people:'/people/42'}});
 const actions={getItems:jest.fn()}, onRowPress=jest.fn(), renderCard=jest.fn(), getOptionsForColumn=jest.fn(), onCreate=jest.fn();
 const toolbarActions=[{key:'add',onPress:onCreate}];let tree;
 act(()=>{tree=renderer.create(<Table storeName="people" actions={actions} requestParams={requestParams}
   onRowPress={onRowPress} renderCard={renderCard} getOptionsForColumn={getOptionsForColumn}
   toolbarActions={toolbarActions} searchPlaceholder="Buscar empresa" showRowActions={false}/>);});
 const props=tree.root.findByType('ExistingTable').props;
 expect(props.requestParams).toEqual({...requestParams,itemsPerPage:pageSize});
 expect(props.requestParams['company.people']).toBe('/people/42');
 expect(props.requestParams['company.linkType']).toEqual(expect.any(Array));
 expect(props.requestParams).not.toHaveProperty('link.company');
 expect(requestParams).not.toHaveProperty('itemsPerPage');
 expect(props.storeName).toBe('people');expect(props.actions).toBe(actions);
 expect(props.initialViewMode).toBe(viewMode);expect(props.pageSize).toBe(pageSize);
 expect(props.paginationMode).toBe('pages');expect(props.searchPlaceholder).toBe('Buscar empresa');
 expect(props.onRowPress).toBe(onRowPress);expect(props.renderCard).toBe(renderCard);
 expect(props.getOptionsForColumn).toBe(getOptionsForColumn);expect(props.toolbarActions).toBe(toolbarActions);
 expect(props.showRowActions).toBe(false);
 act(()=>props.toolbarActions.find(action=>action.key==='add').onPress());
 expect(onCreate).toHaveBeenCalledTimes(1);expect(actions.getItems).not.toHaveBeenCalled();
 act(()=>tree.unmount());
});
it('keeps My Companies fail-closed when the authenticated person is unavailable',()=>{
 mockRoute='MyCompaniesPage';let tree;
 const requestParams=buildParentCompanyRequestParams({user:{}});
 act(()=>{tree=renderer.create(<Table storeName="people" requestParams={requestParams}/>);});
 expect(tree.root.findByType('ExistingTable').props.requestParams).toEqual({id:0,itemsPerPage:20});
 act(()=>tree.unmount());
});
it('keeps essential product columns local and exposes original metadata only on request',()=>{
 mockColumns=[{name:'id'},{name:'product'},{name:'price'},{name:'internalCalculation'}];let tree;
 act(()=>{tree=renderer.create(<Table storeName="products"/>);});
 expect(tree.root.findByType('ExistingTable').props.presentationColumns.map(c=>c.name)).toEqual(['__productPhoto','id','product','price']);
 expect(mockSetVisible).not.toHaveBeenCalled();expect(mockPersistPreference).not.toHaveBeenCalled();
 act(()=>tree.root.findByProps({accessibilityLabel:'Opções administrativas'}).props.onPress());
 expect(tree.root.findByType('ExistingTable').props.presentationColumns.map(c=>c.name)).toContain('internalCalculation');
 expect(mockColumns).toHaveLength(4);act(()=>tree.unmount());
});

it('inherits dark preview tokens locally through the real table theme contract',()=>{
 mockColors={cardBackground:'#141b27',textPrimary:'#edf1f9',textSecondary:'#a3afc2',cardBorder:'#273140',buttonBackground:'#7056d4',tableHeaderBackground:'#182131',tableRowOddBackground:'#182131',tableRowEvenBackground:'#141b27'};
 let tree;act(()=>{tree=renderer.create(<Table storeName="products"/>);});
 expect(tree.root.findByType('ExistingTable').props.inheritedTheme).toMatchObject({background:'#141b27',text:'#edf1f9','bg-headers-light':'#182131',listItemOddRow:'#182131',listItemEvenRow:'#141b27',tableRowBorder:'#273140'});
 act(()=>tree.unmount());
});

it('does not render blank employee rows when the link store has no table columns',()=>{
 mockRoute='EmployeesIndex';mockColumns=[];let tree;
 act(()=>{tree=renderer.create(<Table storeName="people_link" requestParams={{company:3,context:'employee'}}/>);});
 const props=tree.root.findByType('ExistingTable').props;
 expect(props.columns.length).toBeGreaterThan(0);
 const person=props.columns.find(c=>c.name==='people');
 expect(person.format({name:'Colaborador de teste'})).toBe('Colaborador de teste');
 expect(person.sortable).toBe(false);expect(props.requestParams.context).toBe('employee');
 act(()=>tree.unmount());
});
it('limits the compact PDV catalog to the category table on PdvPage',()=>{
 mockRoute='PdvPage';let tree;act(()=>{tree=renderer.create(<Table storeName="categories" requestParams={{company:3}}/>);});
 expect(tree.root.findByType('ExistingTable').props.searchPlaceholder).toBe('Buscar categoria');
 act(()=>tree.update(<Table storeName="products" requestParams={{company:3}}/>));
 expect(tree.root.findByType('ExistingTable').props.searchPlaceholder).toBe('Buscar produto por nome ou código');
 expect(tree.root.findByType('ExistingTable').props.showSearch).toBe(true);
});

it.each([[390,1],[1200,2],[1700,3]])('keeps PDV actions and original queries at width %s', (width,count)=>{
 mockWidth=width;mockParams={interactionMode:'pdv'};
 mockColumns=[{name:'id',to:jest.fn()},{name:'product',editable:true},{name:'price',editable:true},{name:'active',editable:true}];
 const domain={id:1147},category={id:281},callback=jest.fn(),actions={getItems:jest.fn()};
 const renderCard=({item})=><ProductProbe product={item} category={category} orderId={91} singleItemMode={false} onPress={callback}/>;
 function ProductProbe(props){return <ProductView {...props}/>;}function ProductView(){return null;}
 let tree;act(()=>{tree=renderer.create(<Table storeName="products" renderCard={renderCard} actions={actions} requestParams={{company:3,context:'products',category:281}} onRowPress={callback} onEditRow={callback}/>);});
 const props=tree.root.findByType('ExistingTable').props;
 expect(props.requestParams).toEqual({company:3,context:'products',category:281});expect(props.actions).toBe(actions);
 expect(props.showToolbarControls).toBe(true);expect(props.showToolbarActions).toBe(true);
 expect(props.onRowPress).toBeNull();expect(props.onEditRow).toBeNull();
 expect(props.presentationColumns.map(c=>c.name)).toEqual(['__productPhoto','product','price']);
 expect(props.presentationColumns.every(c=>c.editable===false&&!c.to)).toBe(true);
 expect(props.cardListProps.numColumns).toBe(count);
 const card=props.renderCard({item:domain});expect(card.props).toMatchObject({product:domain,category,orderId:91,onPress:callback,presentation:{compact:true,pdv:true}});
 expect(props.showRowActions).toBe(false);expect(props.rowActionsComponent).toBeUndefined();
 expect(callback).not.toHaveBeenCalled();expect(actions.getItems).not.toHaveBeenCalled();act(()=>tree.unmount());
});
it('preserves the original manager detail wrapper and administrative callbacks',()=>{
 const open=jest.fn(),toolbar=[{key:'categories',onPress:open}],product={id:1};function Product(){return null;}
 const renderCard=({item})=><PressableProbe onPress={open}><Product product={item} orderId={91}/></PressableProbe>;function PressableProbe(){return null;}
 let tree;act(()=>{tree=renderer.create(<Table storeName="products" renderCard={renderCard} toolbarActions={toolbar} onEditRow={open} onRowPress={open} importAction={onImport}/>);});
 let props=tree.root.findByType('ExistingTable').props;expect(props.onRowPress).toBe(open);expect(props.toolbarActions).toBe(toolbar);
 const card=props.renderCard({item:product});expect(card.props.onPress).toBe(open);expect(card.props.children[0].props.orderId).toBe(91);
 act(()=>tree.root.findByProps({accessibilityLabel:'Opções administrativas'}).props.onPress());props=tree.root.findByType('ExistingTable').props;expect(props.importAction).toBe(onImport);expect(props.showAdministrativeTools).toBe(true);act(()=>tree.unmount());
});

it('shows a single original sale action in table mode and the shared cover thumbnail',()=>{
 mockParams={interactionMode:'pdv'};mockConfigs={viewMode:'table'};mockColumns=[{name:'product'},{name:'price'}];
 const product={id:1,product:'Combo',extraData:{imageCoverRelationId:2},productFiles:[{id:1,file:{id:10}},{id:2,file:{id:20}}]};
 function Product(){return null;}
 let tree;act(()=>{tree=renderer.create(<Table storeName="products" renderCard={({item})=><Product product={item}/>}/>);});
 const props=tree.root.findByType('ExistingTable').props;expect(props.showRowActions).toBe(true);
 expect(props.rowActionsComponent({row:product}).props.presentation.actionOnly).toBe(true);
 const Photo=props.presentationColumns[0].cellComponent;let photo;
 act(()=>{photo=renderer.create(<Photo row={product}/>);});
 expect(photo.root.findByType('AuthenticatedFile').props.file.id).toBe(20);
 expect(photo.root.findByType('AuthenticatedFile').props.style).toMatchObject({width:44,height:44});
 act(()=>{photo.unmount();tree.unmount();});
});

it('does not duplicate card actions when compact layout overrides a saved table preference',()=>{
 mockWidth=390;mockParams={interactionMode:'pdv'};mockConfigs={viewMode:'table',effectiveViewMode:'cards'};
 let tree;act(()=>{tree=renderer.create(<Table storeName="products"/>);});
 const props=tree.root.findByType('ExistingTable').props;expect(props.showRowActions).toBe(false);expect(props.rowActionsComponent).toBeUndefined();act(()=>tree.unmount());
});
it('omits the repeated category heading and guidance only for the compact inline sale catalog',()=>{
 mockWidth=393;mockRoute='PdvPage';mockParams={interactionMode:'pdv'};
 let tree;act(()=>{tree=renderer.create(<Table storeName="products" catalogTitle="Combos"/>);});
 expect(tree.root.findAllByProps({accessibilityRole:'header'})).toHaveLength(0);
 expect(tree.root.findByType('ExistingTable').props.showSearch).toBe(true);act(()=>tree.unmount());
});

it('keeps client composition compact and preserves module actions in the shared toolbar',()=>{
 mockRoute='ClientsIndex';mockWidth=360;let tree;const add=jest.fn();
 act(()=>{tree=renderer.create(<Table storeName="people" toolbarActions={[{key:'add',onPress:add}]} requestParams={{company:3}}/>);});
 const props=tree.root.findByType('ExistingTable').props;
 expect(props.showToolbarActions).toBe(true);expect(props.showToolbarControls).toBe(true);
 expect(JSON.stringify(tree.toJSON())).not.toContain('Consulta solicitada');
 expect(JSON.stringify(tree.toJSON())).not.toContain('Recolher opções');
 act(()=>props.toolbarActions[0].onPress());expect(add).toHaveBeenCalledTimes(1);act(()=>tree.unmount());
});
