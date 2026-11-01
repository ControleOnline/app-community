import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Card from '../../components/single-item/SingleItemOrderCard';
jest.mock('react-native',()=>({Text:'Text',View:'View',TouchableOpacity:'TouchableOpacity',StyleSheet:{create:v=>v},Platform:{OS:'web'}}));
jest.mock('@appType',()=>({app_type:'POS'}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>()=>({themeColors:{cardText:'text',cardBackground:'panel',cardBorder:'border',textSecondary:'muted'}}));
jest.mock('@controleonline/ui-common/src/utils/formatter',()=>({__esModule:true,default:{formatMoney:v=>`R$ ${v}`,formatDateYmdTodmY:()=> '31/10/2026'}}));
let tree;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
afterEach(()=>act(()=>tree?.unmount()));
it('preserves the existing row action and displays the order total once',()=>{
 const openRow=jest.fn(),onOpenOrder=jest.fn();
 const order={id:73076,price:25,status:{status:'open',realStatus:'open'},client:{name:'Cliente de teste'},orderDate:'2026-10-31'};
 act(()=>{tree=renderer.create(<Card order={order} openRow={openRow} onOpenOrder={onOpenOrder}/>);});
 act(()=>tree.root.findByProps({accessibilityLabel:'Abrir pedido 73076'}).props.onPress());
 expect(openRow).toHaveBeenCalledTimes(1);expect(onOpenOrder).not.toHaveBeenCalled();
 expect(tree.root.findAllByType('Text').filter(n=>n.props.children==='R$ 25')).toHaveLength(1);
});
it('uses the domain open callback when no table row wrapper exists',()=>{
 const onOpenOrder=jest.fn(),order={id:10,price:0};
 act(()=>{tree=renderer.create(<Card order={order} onOpenOrder={onOpenOrder}/>);});
 act(()=>tree.root.findByProps({accessibilityLabel:'Abrir pedido 10'}).props.onPress());
 expect(onOpenOrder).toHaveBeenCalledWith(order);
});
