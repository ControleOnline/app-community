import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Tabs from '@controleonline/ui-products/src/react/pages/CategoriesPage/PdvCategoryTabs';
jest.mock('react-native',()=>({View:'View',Text:'Text',ScrollView:'ScrollView',TouchableOpacity:'TouchableOpacity',StyleSheet:{create:s=>s},Platform:{select:v=>v.web||v.default}}));
const drinks={id:276,name:'Bebidas'},water={id:281,name:'Águas',parent:'/categories/276'},beer={id:282,name:'Cervejas',parent:{id:276}},combo={id:296,name:'Combos'};
it('keeps principal and child selections on horizontal rows with distinct product totals and original targets',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;const onSelectCategory=jest.fn();let tree;
 const props={hierarchical:true,categories:[combo,water,beer,drinks],selectedCategoryId:'276',counts:{276:12,281:2,282:4},onSelectCategory,palette:{}};
 act(()=>{tree=renderer.create(<Tabs {...props}/>);});
 expect(tree.root.findAllByType('ScrollView')).toHaveLength(2);
 expect(tree.root.findByProps({testID:'pdv-main-categories'}).props.horizontal).toBe(true);
 expect(tree.root.findByProps({testID:'pdv-subcategories-276'}).props.horizontal).toBe(true);
 const main=tree.root.findByProps({accessibilityLabel:'Bebidas, 12 produtos'});expect(main.props.accessibilityState.selected).toBe(true);expect(main.props.style.minHeight).toBeGreaterThanOrEqual(44);
 act(()=>tree.root.findByProps({accessibilityLabel:'Águas, 2 produtos'}).props.onPress());expect(onSelectCategory).toHaveBeenLastCalledWith(water);
 act(()=>tree.update(<Tabs {...props} selectedCategoryId="281"/>));expect(tree.root.findByProps({accessibilityLabel:'Bebidas, 12 produtos'}).props.accessibilityState.selected).toBe(true);
 act(()=>tree.root.findByProps({accessibilityLabel:'Todos, 12 produtos'}).props.onPress());expect(onSelectCategory).toHaveBeenLastCalledWith(drinks);
 act(()=>tree.unmount());
});
it('keeps the original flat component unchanged without hierarchical opt-in',()=>{
 let tree;act(()=>{tree=renderer.create(<Tabs categories={[water,drinks]} onSelectCategory={jest.fn()}/>);});
 expect(tree.root.findAllByType('ScrollView')).toHaveLength(1);expect(tree.root.findAllByProps({testID:'pdv-main-categories'})).toHaveLength(0);act(()=>tree.unmount());
});
