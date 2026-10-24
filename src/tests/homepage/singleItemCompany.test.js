import {resolveCurrentCompanySelection} from '@controleonline/ui-people/src/react/utils/currentCompanySelection';
it('does not restore an unavailable company, or select one when every company is unavailable',()=>{
 const disabled={id:3,panel_enabled:false}, enabled={id:4,panel_enabled:true};
 expect(resolveCurrentCompanySelection({companies:[disabled,enabled],session:{mycompany:3}})?.id).toBe(4);
 expect(resolveCurrentCompanySelection({companies:[disabled],session:{mycompany:3}})).toBeNull();
});
it('does not select a company with disabled user access',()=>{
 expect(resolveCurrentCompanySelection({companies:[{id:3,user:{enabled:false}},{id:4}],session:{mycompany:3}})?.id).toBe(4);
});

import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {useNativeDeviceConfigFetch} from '@controleonline/ui-common/src/react/components/DefaultProvider.native.lifecycle';
import {useWebDeviceConfigFetch} from '@controleonline/ui-common/src/react/components/DefaultProvider.web.configuration';
it.each([['web',useWebDeviceConfigFetch],['native',useNativeDeviceConfigFetch]])('ignores late device configuration after a company switch on %s',async(_platform,useConfig)=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 let resolveOld;const old=new Promise(resolve=>{resolveOld=resolve;});
 const actions={setItem:jest.fn(),getItems:jest.fn().mockReturnValueOnce(old).mockResolvedValueOnce([{id:20}])};
 const done=jest.fn(), synced=jest.fn(), select=({items})=>items[0],parse=x=>x||{};
 function Probe({company}){useConfig({currentCompany:{id:company},device:{id:'web-10'},isLogged:true,deviceConfigPeopleIri:`/people/${company}`,setDeviceConfigFetched:done,setDeviceRuntimeConfigSynced:synced,deviceConfigsActions:actions,runtimeDeviceType:'PDV',selectRuntimeDeviceConfig:select,parseConfigsObject:parse});return null;}
 let tree;await act(async()=>{tree=renderer.create(<Probe company={3}/>);});
 await act(async()=>tree.update(<Probe company={2}/>));
 expect(actions.setItem).toHaveBeenLastCalledWith({id:20,configs:{}});
 actions.setItem.mockClear();done.mockClear();
 await act(async()=>resolveOld([{id:10}]));
 expect(actions.setItem).not.toHaveBeenCalled();expect(done).not.toHaveBeenCalled();
 await act(async()=>tree.unmount());
});
