import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Input from '@controleonline/ui-default/src/react/components/table/DefaultTableInput';
import {getColumnStyle} from '@controleonline/ui-default/src/react/components/table/DefaultTable.layoutUtils';
jest.mock('react-native',()=>({View:'View',StyleSheet:{create:s=>s},Platform:{select:v=>v.web||v.default}}));
jest.mock('@store',()=>({useStore:()=>({getters:{columns:[],configs:{}}}),getAllStores:()=>({})}));
jest.mock('@controleonline/ui-default/src/react/components/inputs/DefaultInput',()=> 'DefaultInput');
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>()=>({themeColors:{}}));
it('reuses the shared table cell wrapper with a fixed small preview and no editor',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;const row={id:1};
 function Photo({row}){return <Thumbnail product={row}/>;}function Thumbnail(){return null;}
 const column={name:'__productPhoto',width:72,minWidth:72,editable:false,cellComponent:Photo};let tree;
 act(()=>{tree=renderer.create(<Input column={column} row={row} storeName="products"/>);});
 expect(tree.root.findByType(Thumbnail).props.product).toBe(row);expect(tree.root.findAllByType('DefaultInput')).toHaveLength(0);
 expect(Object.assign({},...getColumnStyle(column))).toMatchObject({width:72,maxWidth:72,flexGrow:0});act(()=>tree.unmount());
});
