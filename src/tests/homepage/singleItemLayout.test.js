jest.mock('react-native', () => ({Platform:{OS:'web'}}));
import {isSingleItemPos,singleItemNavigation} from '../../components/single-item/policy';
it('activates only for POS single-item devices',()=>{
 expect(isSingleItemPos('POS',{'pos-operation-mode':'single-item'})).toBe(true);
 for(const type of ['MANAGER','SHOP','ADMIN'])expect(isSingleItemPos(type,{'pos-operation-mode':'single-item'})).toBe(false);
 expect(isSingleItemPos('POS',{'pos-operation-mode':'waiter','check-order-type':'tab'})).toBe(false);
});
it('derives sales destinations from authorized home/toolbar menus',()=>{
 const items=singleItemNavigation([{menus:[{menuType:'home',route:'OrderHistoryPage',routeParams:{orderTypeFilter:'sale'}},{menuType:'toolbar',route:'ProfilePage'}]}],['HomePage','OrderHistoryPage','ProfilePage']);
 expect(items.map(i=>i.route)).toEqual(['HomePage','OrderHistoryPage','ProfilePage']);
 expect(items[1].routeParams).toMatchObject({interactionMode:'pdv',orderTypeFilter:'sale'});
 expect(singleItemNavigation([],['HomePage','OrderHistoryPage','ProfilePage']).map(i=>i.route)).toEqual(['ProfilePage']);
});
it('does not expose unregistered destinations',()=>{
 expect(singleItemNavigation([{menus:[{route:'OrderHistoryPage'}]}],['ProfilePage']).map(i=>i.route)).toEqual(['ProfilePage']);
});
