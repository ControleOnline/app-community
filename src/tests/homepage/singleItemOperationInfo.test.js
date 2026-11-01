import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Info from '../../components/single-item/SingleItemOperationInfo';
const mockFetch=jest.fn();
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockFetch(...args)}}));
jest.mock('@controleonline/ui-orders/src/react/utils/posOperationInfo',()=>({buildPosOperationInfo:()=>[{key:'device',value:'web-10'}]}));
jest.mock('@controleonline/ui-default/src/react/components/help/DefaultTooltip',()=> 'Tooltip');
jest.mock('../../components/HomeIcon',()=> 'Icon');
jest.mock('react-native',()=>({Platform:{OS:'web'}}));
let tree;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockFetch.mockReset();});
afterEach(()=>act(()=>tree?.unmount()));
it('explains that no device link can still use a company default',async()=>{
 await act(async()=>{tree=renderer.create(<Info currentCompany={{id:3}} deviceConfig={{configs:{}}}/>);});
 expect(tree.root.findByType('Tooltip').props.rows.at(-1).value).toContain('padrão da empresa ou catálogo geral');
 expect(mockFetch).not.toHaveBeenCalled();
});
it('shows a configured name only for the selected company',async()=>{
 mockFetch.mockResolvedValue({name:'Lavagens',company:'/people/3'});
 await act(async()=>{tree=renderer.create(<Info currentCompany={{id:3}} deviceConfig={{configs:{'pos-product-showcase-id':8}}}/>);});
 expect(tree.root.findByType('Tooltip').props.rows.at(-1).value).toBe('Lavagens (#8)');
 mockFetch.mockResolvedValue({name:'Outra empresa',company:'/people/2'});
 await act(async()=>tree.update(<Info currentCompany={{id:4}} deviceConfig={{configs:{'pos-product-showcase-id':8}}}/>));
 expect(tree.root.findByType('Tooltip').props.rows.at(-1).value).toBe('Vitrine (#8)');
});
