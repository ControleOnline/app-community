import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ProductItem from '@controleonline/ui-products/src/react/components/products/ProductItem';
const mockNavigate=jest.fn();
jest.mock('@controleonline/ui-default/src/react/components/files/DefaultFile',()=> 'DefaultFile');
jest.mock('react-native',()=>({View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',Image:'Image'}));
jest.mock('@react-navigation/native',()=>({useNavigation:()=>({navigate:mockNavigate})}));
jest.mock('@expo/vector-icons',()=>({MaterialCommunityIcons:'Icon'}));
jest.mock('@appType',()=>({app_type:'MANAGER'}));
jest.mock('@controleonline/ui-common/src/utils/formatter',()=>({__esModule:true,default:{formatMoney:v=>`R$ ${v}`}}));
jest.mock('@controleonline/ui-orders/src/react/components/cart/ProductQuantity',()=> 'ProductQuantity');
jest.mock('@controleonline/ui-orders/src/react/components/cart/ProductTotem',()=> 'ProductTotem');
jest.mock('@controleonline/ui-products/src/react/components/products/SingleItemProductCard',()=> 'SingleItemProductCard');
jest.mock('@controleonline/ui-products/src/react/components/MarketplaceSyncIndicators',()=> 'MarketplaceSyncIndicators');
jest.mock('@controleonline/ui-products/src/react/components/ProductReferenceLink',()=> 'ProductReferenceLink');
jest.mock('@controleonline/ui-products/src/react/domain/productMedia',()=>({resolveProductCoverUrl:p=>p.productFiles?.length?'https://image.test/cover':null}));
jest.mock('@controleonline/ui-products/src/react/components/products/ProductSearchResult',()=> 'ProductSearchResult');
jest.mock('@controleonline/ui-products/src/react/components/products/ProductItem.styles',()=>({}));
const product={id:1147,product:'Água mineral',type:'product',price:5},presentation={compact:true,pdv:true,styles:{},FileComponent:'AuthenticatedFile'};
let tree;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockNavigate.mockClear();});
afterEach(()=>{if(tree)act(()=>tree.unmount());tree=null;});
const mount=props=>act(()=>{tree=renderer.create(<ProductItem product={product} presentation={presentation} interactionMode="pdv" {...props}/>);});
const text=()=>tree.root.findAllByType('Text').map(n=>n.props.children).flat().join(' ');
it('does not infer an empty category or reserve an image when relations are absent',()=>{
 mount();expect(text()).not.toContain('Sem categoria');expect(text()).not.toContain('Sem fila');
 expect(tree.root.findAllByType('Image')).toHaveLength(0);expect(tree.root.findAllByType('ProductReferenceLink')).toHaveLength(0);
 expect(tree.root.findByType('ProductQuantity').props.product).toBe(product);
});
it('preserves real category information and explicit empty categories',()=>{
 mount({product:{...product,productCategory:[{category:{id:281,name:'Águas'}}]}});expect(text()).toContain('Águas');
 act(()=>tree.update(<ProductItem product={{...product,productCategory:[]}} presentation={presentation} interactionMode="pdv"/>));expect(text()).toContain('Sem categoria');
});
it('uses the shared authenticated loader with the selected cover file',()=>{
 const file={id:22},other={id:21};mount({product:{...product,extraData:{imageCoverRelationId:2},productFiles:[{id:1,file:other},{id:2,file}]}});
 expect(tree.root.findByType('AuthenticatedFile').props.file).toBe(file);expect(tree.root.findAllByType('Image')).toHaveLength(0);
});
it('retains the original customization route and order context in table actions',()=>{
 mount({product:{...product,type:'custom'},orderId:91,singleItemMode:true,showBottomCart:true,presentation:{...presentation,actionOnly:true}});
 act(()=>tree.root.findByProps({accessibilityLabel:'Personalizar Água mineral'}).props.onPress());
 expect(mockNavigate).toHaveBeenCalledWith('CustomizeScreen',expect.objectContaining({productId:1147,orderId:91,interactionMode:'pdv',singleItemMode:true,showBottomCart:false,catalogShowBottomCart:true}));
});
it('preserves the existing single item flow and management details affordance',()=>{
 mount({singleItemMode:true,orderId:91});expect(tree.root.findByType('SingleItemProductCard').props.orderId).toBe(91);
 act(()=>tree.update(<ProductItem product={product} presentation={{...presentation,pdv:false}} interactionMode="manager"/>));
 expect(tree.root.findAllByType('ProductQuantity')).toHaveLength(0);expect(tree.root.findByType('ProductReferenceLink').props.product).toBe(product);
});
it('composes a sale card with media, identity and a full-width footer without the redundant custom badge',()=>{
 const SharedCard='SharedCard';
 const file={id:22},custom={...product,type:'custom',description:'Pão, carne e queijo',queue:{name:'Cozinha'},productFiles:[{id:1,file}]};
 mount({product:custom,presentation:{...presentation,CardComponent:({media,children,footer,...props})=><SharedCard {...props} media={media} footer={footer}>{media}{children}{footer}</SharedCard>},orderId:91});
 const shared=tree.root.findByType('SharedCard');expect(shared.props.media).toBeTruthy();expect(shared.props.footer).toBeTruthy();
 expect(text()).toContain('Cozinha');expect(text()).toContain(custom.description);expect(text()).not.toContain('Custom');
 expect(tree.root.findByProps({accessibilityLabel:'Personalizar Água mineral'}).findByType('Text').props.children).toBe('Personalizar');
 act(()=>tree.root.findByProps({accessibilityLabel:'Personalizar Água mineral'}).props.onPress());
 expect(mockNavigate).toHaveBeenCalledWith('CustomizeScreen',expect.objectContaining({productId:1147,orderId:91}));
});
it('uses the authenticated loader in table view for the selected private cover',()=>{
 const first={id:6046},selected={id:6032};
 mount({displayMode:'table',product:{...product,extraData:{imageCoverRelationId:2},productFiles:[{id:1,file:first},{id:2,file:selected}]}});
 expect(tree.root.findByType('AuthenticatedFile').props.file).toBe(selected);
 expect(tree.root.findByType('AuthenticatedFile').props.resizeMode).toBe('cover');
 expect(tree.root.findAllByType('Image')).toHaveLength(0);
});

it('uses DefaultFile in table view when no custom loader is supplied',()=>{
 const file={id:6046};
 mount({displayMode:'table',product:{...product,productFiles:[{id:1,file}]},presentation:{compact:true}});
 expect(tree.root.findByType('DefaultFile').props.file).toBe(file);
 expect(tree.root.findAllByType('Image')).toHaveLength(0);
});
