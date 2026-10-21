import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Catalog,{categoryTint,pdvCategoryPresentation} from '../../components/manager-preview/ManagerPdvCatalog';
import CategoryCard from '@controleonline/ui-products/src/react/pages/CategoriesPage/CategoryCard';
let mockWidth=393,mockMode='cards';
jest.mock('@store',()=>({useStore:name=>({getters:name==='categories'?{configs:{effectiveViewMode:mockMode},columns:[{name:'icon',inputType:'icon'},{name:'name'},{name:'categoryFiles',inputType:'files'}]}:{currentCompany:{id:3}}})}));
const mockColors={pageBackground:'#101621',cardBackground:'#141b27',cardBorder:'#273140',textPrimary:'#edf1f9',textMuted:'#a3afc2'};
jest.mock('react-native',()=>({Pressable:'Pressable',Text:'Text',View:'View',Image:'Image',TouchableOpacity:'TouchableOpacity',useWindowDimensions:()=>({width:mockWidth}),Platform:{select:v=>v.default},StyleSheet:{create:v=>v}}));
jest.mock('@controleonline/ui-default/src/react/components/files/DefaultFile',()=>({__esModule:true,default:'AuthenticatedFile',DefaultFileCacheContext:require('react').createContext(null)}));
jest.mock('@expo/vector-icons',()=>({MaterialCommunityIcons:'Icon'}));
jest.mock('@controleonline/ui-products/src/react/components/MarketplaceSyncIndicators',()=> 'SyncIndicators');
jest.mock('@controleonline/ui-products/src/react/pages/CategoriesPage/categoryPageUtils',()=>({buildCoverUrl:()=>null}));
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>({colors:mockColors})}));
jest.mock('../../../node_modules/@controleonline/ui-default/src/react/components/table/DefaultTable',()=> 'ExistingTable');
jest.mock('../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>({DefaultTableThemeContext:require('react').createContext(null)}));
const category={id:7,name:'Águas',color:'#00aabb'};
const mount=props=>{let tree;act(()=>{tree=renderer.create(<Catalog {...props}/>);});return tree;};
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockWidth=393;mockMode='cards';});
it('reuses the category callback and preserves query/order data while hiding optional administration',()=>{
 const onOpen=jest.fn(),onEdit=jest.fn(),onSync=jest.fn(),requestParams={company:3,context:'products'},actions={getItems:jest.fn()};
 const props={storeName:'categories',requestParams,actions,data:[category],add:true,onAdd:jest.fn(),onRowPress:onOpen,renderCard:({item})=><CategoryCard category={item} brandColors={{}} isManagerApp getCategoryStatuses={()=>[]} onOpen={onOpen} onEdit={onEdit} onSync={onSync}/>};
 const tree=mount(props);let table=tree.root.findByType('ExistingTable');
 expect(table.props.requestParams).toBe(requestParams);expect(table.props.actions).toBe(actions);expect(table.props.data).toBe(props.data);
 expect(table.props.add).toBe(false);expect(table.props.showToolbarActions).toBe(false);expect(table.props.cardListProps.numColumns).toBe(2);
 let card;act(()=>{card=renderer.create(table.props.renderCard({item:category}));});
 expect(card.root.findAllByType('SyncIndicators')).toHaveLength(0);
 expect(card.root.findByProps({accessibilityLabel:'Águas'}).props.accessibilityRole).toBe('button');
 act(()=>card.root.findByProps({accessibilityLabel:'Águas'}).props.onPress());expect(onOpen).toHaveBeenCalledWith(category);expect(onEdit).not.toHaveBeenCalled();expect(onSync).not.toHaveBeenCalled();
 act(()=>tree.root.findByProps({accessibilityLabel:'Mais opções do catálogo'}).props.onPress());table=tree.root.findByType('ExistingTable');
 expect(table.props.add).toBe(true);expect(table.props.onAdd).toBe(props.onAdd);expect(table.props.showToolbarActions).toBe(true);
 act(()=>card.update(table.props.renderCard({item:category})));
 expect(card.root.findAllByType('SyncIndicators')).toHaveLength(1);
 const edit=card.root.findAllByType('TouchableOpacity')[1];act(()=>edit.props.onPress());expect(onEdit).toHaveBeenCalledWith(category);
});
it.each([[760,2],[1000,3],[1440,5]])('uses compact grid at width %s', (width,columns)=>{
 mockWidth=width;const tree=mount({storeName:'categories'});expect(tree.root.findByType('ExistingTable').props.cardListProps.numColumns).toBe(columns);
});
it('keeps the original category card presentation and administrative actions without the opt-in props',()=>{
 let card;act(()=>{card=renderer.create(<CategoryCard category={category} brandColors={{primary:'#001122'}} isManagerApp getCategoryStatuses={()=>[]} onOpen={jest.fn()}/>);});
 expect(card.root.findAllByType('SyncIndicators')).toHaveLength(1);
 const image=card.root.findAllByType('View')[0];expect(image.props.style[0].aspectRatio).toBe(3/4);
});
it('passes the file from store metadata to the authenticated default renderer and keeps fixed widths on the last row',()=>{
 const file={id:6046,fileType:'image'},withCover={...category,categoryFiles:[{id:116,file}]};
 const tree=mount({storeName:'categories',renderCard:({item})=><CategoryCard category={item} brandColors={{}} onOpen={jest.fn()}/>});
 const table=tree.root.findByType('ExistingTable');expect(table.props.rowStyle.maxWidth).toBe('48%');
 let card;act(()=>{card=renderer.create(table.props.renderCard({item:withCover}));});
 expect(card.root.findByType('AuthenticatedFile').props.file).toBe(file);
});

it('adds only a subtle category tint over the active surface and keeps uncolored categories neutral',()=>{
 expect(categoryTint('#ffffff','#0000ff')).toBe('#f0f0ff');
 expect(categoryTint('#101010','#ffffff')).toBe('#1e1e1e');
 expect(categoryTint('#ffffff',null)).toBe('#ffffff');
 expect(categoryTint('#ffffff','invalid')).toBe('#ffffff');
 const p=pdvCategoryPresentation(mockColors,false,'#00aabb');
 expect(p.background).toBe(categoryTint(mockColors.cardBackground,'#00aabb'));
 expect(p.styles.cardOverlay.backgroundColor).toBe(p.background);
 expect(p.styles.cardOverlayName.color).toBe(mockColors.textPrimary);
});

it('does not apply card widths to table rows and preserves specialized column types',()=>{
 mockMode='table';const tree=mount({storeName:'categories'}),table=tree.root.findByType('ExistingTable');
 expect(table.props.rowStyle).toBeUndefined();
 expect(table.props.columns).toEqual([{name:'icon',label:'Ícone',inputType:'icon'},{name:'name',label:'Categoria'},{name:'categoryFiles',label:'Imagem',inputType:'files'}]);
});

it('renders child categories indented under their parent and preserves each original navigation target',()=>{
 const parent={id:276,name:'Bebidas'},water={id:281,name:'Águas',parent:'/categories/276'};
 const onOpen=jest.fn(),onEdit=jest.fn(),requestParams={company:3,context:'products'};
 const tree=mount({storeName:'categories',data:[water,parent],requestParams,renderCard:({item})=><CategoryCard category={item} brandColors={{}} onOpen={onOpen} onEdit={onEdit}/>});
 const table=tree.root.findByType('ExistingTable');expect(table.props.requestParams).toBe(requestParams);expect(table.props.data).toEqual([water,parent]);
 const grouped=table.props.cardListProps.transformData(table.props.data);expect(grouped).toHaveLength(1);
 let group;act(()=>{group=renderer.create(table.props.renderCard({item:grouped[0]}));});
 expect(group.root.findByProps({accessibilityLabel:'Subcategorias de Bebidas'}).props.style).toMatchObject({marginLeft:12,paddingLeft:10,borderLeftWidth:1});
 act(()=>group.root.findByProps({accessibilityLabel:'Águas'}).props.onPress());expect(onOpen).toHaveBeenLastCalledWith(water);
 act(()=>group.root.findByProps({accessibilityLabel:'Bebidas'}).props.onPress());expect(onOpen).toHaveBeenLastCalledWith(parent);expect(onEdit).not.toHaveBeenCalled();
 act(()=>{group.unmount();tree.unmount();});
});

it('keeps the native entry as colored root cards without the management header or nested columns',()=>{
 mockMode='table';
 const tree=mount({storeName:'categories',nativeCatalogEntry:true,toolbarActions:[{key:'product-search'}],showSearch:false});
 expect(tree.root.findAllByProps({accessibilityLabel:'Mais opções do catálogo'})).toHaveLength(0);
 const table=tree.root.findByType('ExistingTable');
 expect(table.props).toMatchObject({viewMode:'cards',showSearch:false,showToolbarActions:true,showToolbarControls:false,showAdministrativeTools:false});
 expect(table.props.rowStyle.maxWidth).toBe('48%');
 const roots=table.props.cardListProps.transformData([{id:1,name:'Bebidas'},{id:2,name:'Águas',parent:'/categories/1'}]);
 let card;act(()=>{card=renderer.create(table.props.renderCard({item:roots[0]}));});
 expect(card.root.findAllByProps({accessibilityLabel:'Subcategorias de Bebidas'})).toHaveLength(0);
 act(()=>card.unmount());act(()=>tree.unmount());
});
