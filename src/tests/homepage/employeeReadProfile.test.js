import {employeeListFields} from '../../experience/readProfiles';
jest.mock('react-native',()=>({Platform:{OS:'web'}}));
jest.mock('@controleonline/ui-common/src/api/fetch',()=>jest.fn());
it('encodes the sparse employee read with PHP bracket syntax rather than dotted properties',()=>{
 global.localStorage={getItem:()=>null};
 const {api}=require('@controleonline/ui-common/src/api');
 const query=api.serialize(employeeListFields).join('&');
 expect(query).toContain('listFields[]=id');expect(query).toContain('listFields[people][]=name');expect(query).toContain('listFields[company][]=id');expect(query).not.toContain('listFields.');delete global.localStorage;
});
