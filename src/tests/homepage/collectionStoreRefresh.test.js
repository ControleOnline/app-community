import {getOnlineItems} from '@controleonline/ui-default/src/store/default/actions';
import {api} from '@controleonline/ui-common/src/api';
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
jest.mock('@controleonline/ui-common/src/api/localDB',()=>jest.fn());
jest.mock('@controleonline/ui-common/src/api/queue',()=>({queue:{}}));
it('keeps the same query visible during explicit background refresh, but clears another query',async()=>{
 let done;api.fetch.mockImplementation(()=>new Promise(resolve=>{done=resolve;}));
 const getters={resourceEndpoint:'people',items:[{id:1}],lastCompletedRequest:{requestKey:'{"append":false,"endpoint":"people","params":{"company":3}}'}};
 const commit=jest.fn();const pending=getOnlineItems({commit,getters},{company:3,__storeMeta:{preserveItems:true}});
 expect(commit.mock.calls.some(([type,value])=>type==='SET_ISLOADING'&&value===true)).toBe(false);
 expect(commit.mock.calls.some(([type,value])=>type==='SET_ITEMS'&&Array.isArray(value)&&!value.length)).toBe(false);
 done({member:[{id:2}],totalItems:1});await pending;
 commit.mockClear();const other=getOnlineItems({commit,getters},{company:4,__storeMeta:{preserveItems:true}});
 expect(commit.mock.calls.some(([type,value])=>type==='SET_ITEMS'&&Array.isArray(value)&&!value.length)).toBe(true);done({member:[],totalItems:0});await other;
});
