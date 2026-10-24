import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Counts from '../../components/single-item/SingleItemStatusCounts';
jest.mock('react-native',()=>({View:'View',Text:'Text'}));
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
it('shows only positive complete status counts and reuses the card theme color',()=>{
 let tree;act(()=>{tree=renderer.create(<Counts summary={{total:67,statuses:[{id:1,status:'Open',quantity:47,color:'#123456'},{id:2,status:'Preparing',quantity:20,color:'#654321'},{id:3,status:'Pending',quantity:0}]}} colors={{orderStatusOpen:'brand-open'}}/>);});
 const texts=tree.root.findAllByType('Text');expect(texts).toHaveLength(2);
 expect(texts[0].props.style.color).toBe('brand-open');expect(texts[0].props.children.join('')).toBe('Open · 47');
 expect(texts[1].props.style.color).toBe('#654321');
 act(()=>tree.update(<Counts summary={{total:0,statuses:[]}} colors={{}}/>));expect(tree.toJSON()).toBeNull();act(()=>tree.unmount());
});
