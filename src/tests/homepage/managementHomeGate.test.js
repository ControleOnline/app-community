import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Home from '../../pages/OnGestorHome';
let mockType='ADMIN',mockLogged=true,mockModern=true;
jest.mock('@appType',()=>({get app_type(){return mockType;}}));
jest.mock('@store',()=>({useStore:()=>({getters:{isLogged:mockLogged}})}));
jest.mock('../../components/manager-preview/model',()=>({get managerPreviewEnabled(){return mockModern;}}));
jest.mock('@controleonline/ui-manager/src/react/pages/home/index',()=> 'LegacyHome');
jest.mock('../../components/manager-preview/ManagerAdminHome',()=> 'AdminHome');
jest.mock('../../components/manager-preview/ManagerOverview',()=> 'ManagerHome');
jest.mock('../../components/manager-preview/ManagerStartup',()=> 'Startup');
it.each([['ADMIN',true,true,'AdminHome'],['MANAGER',true,true,'ManagerHome'],['ADMIN',false,true,'Startup'],['ADMIN',true,false,'LegacyHome']])('selects %s presentation for login=%s modern=%s', (type,logged,modern,component)=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;mockType=type;mockLogged=logged;mockModern=modern;let tree;
 act(()=>{tree=renderer.create(<Home/>);});expect(tree.root.findAllByType(component)).toHaveLength(1);act(()=>tree.unmount());
});
