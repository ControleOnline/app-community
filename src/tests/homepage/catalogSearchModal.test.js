import React from 'react';
import renderer,{act} from 'react-test-renderer';
import SearchModal from '@controleonline/ui-default/src/react/components/table/DefaultSearchModal';
jest.mock('react-native',()=>({KeyboardAvoidingView:'KeyboardAvoidingView',Modal:'Modal',Text:'Text',TouchableOpacity:'TouchableOpacity',View:'View',StyleSheet:{create:x=>x},Platform:{OS:'android',select:x=>x.default}}));
jest.mock('react-native-vector-icons/Feather',()=> 'Icon');
jest.mock('@controleonline/ui-default/src/react/components/filters/DefaultSearch',()=> 'ExistingSearch');
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>()=>({modalColors:{}}));
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
it('reuses the search field with controlled catalog callbacks and closes after submission',()=>{
 let tree;const onSearch=jest.fn(),onClose=jest.fn(),onChangeFilters=jest.fn(),filters={search:'água'};
 act(()=>{tree=renderer.create(<SearchModal storeName="products" visible title="Buscar produto" filters={filters} value="água" onChangeFilters={onChangeFilters} onSearch={onSearch} onClose={onClose}/>);});
 expect(tree.root.findByType('KeyboardAvoidingView').props.behavior).toBe('height');
 const field=tree.root.findByType('ExistingSearch');
 expect(field.props).toMatchObject({filters,value:'água',onChangeFilters});
 act(()=>field.props.onSearch('suco'));
 expect(onSearch).toHaveBeenCalledWith('suco');expect(onClose).toHaveBeenCalledTimes(1);
 act(()=>tree.unmount());
});
it('preserves the uncontrolled default search used by other lists',()=>{
 let tree;const onClose=jest.fn();
 act(()=>{tree=renderer.create(<SearchModal storeName="people" visible onClose={onClose}/>);});
 const field=tree.root.findByType('ExistingSearch');expect(field.props.filters).toBeUndefined();
 act(()=>field.props.onSearch('cliente'));expect(onClose).toHaveBeenCalledTimes(1);
 act(()=>tree.unmount());
});
