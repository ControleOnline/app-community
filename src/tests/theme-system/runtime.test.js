import React,{useState} from 'react';
import renderer,{act} from 'react-test-renderer';
import {useDomainThemeFetch,useDomainThemePublisher,getThemeSnapshot,setThemeMode,previewTheme,clearThemePreview} from '../../styles/themeRuntime';
import {storeSession} from '../../session/sessionScope';
import {env} from '@env';
const parseThemeCss=text=>Object.fromEntries([...text.matchAll(/--([\w-]+):([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
let tree;
let published;
let publishCount=0;
const actions={setColors:value=>{published=value;publishCount++;}};
function Probe({api,company=1}) {
  const [,setBaseThemeColors]=useState({});
  useDomainThemeFetch({api,parseThemeCss,setBaseThemeColors,currentCompany:{id:company},mainCompany:{id:1},device:{id:1}});
  useDomainThemePublisher({actions});return null;
}
beforeEach(()=>{
  const vars=new Map();global.document={documentElement:{style:{setProperty:(k,v)=>vars.set(k,v),removeProperty:k=>vars.delete(k)}},vars};
});
afterEach(async()=>{if(tree)await act(async()=>tree.unmount());tree=null;delete global.document;});
test('a new session recovers a failed load with unchanged company/device',async()=>{
  const api={fetch:jest.fn().mockRejectedValueOnce({status:503}).mockResolvedValue(':root{--cardBackground-light:#112233;}')};
  await act(async()=>{tree=renderer.create(<Probe api={api}/>);});
  expect(getThemeSnapshot().status).toBe('error');expect(getThemeSnapshot().error).toContain('Não foi possível');
  await act(async()=>{storeSession({api_key:'new'},env);});
  expect(api.fetch).toHaveBeenCalledTimes(2);expect(getThemeSnapshot().status).toBe('ready');
  expect(api.fetch).toHaveBeenLastCalledWith('themes-colors.css',{responseType:'text',skipSession:true});
});
test('late responses are discarded and removed CSS values do not survive a context reload',async()=>{
  const pending=[];const api={fetch:jest.fn(()=>new Promise(resolve=>pending.push(resolve)))};
  await act(async()=>{tree=renderer.create(<Probe api={api}/>);});
  await act(async()=>tree.update(<Probe api={api} company={2}/>));
  await act(async()=>pending[1](':root{--cardBackground-light:#222222;}'));
  await act(async()=>pending[0](':root{--cardBackground-light:#111111;--textPrimary-light:#abcdef;}'));
  expect(getThemeSnapshot().raw['cardBackground-light']).toBe('#222222');
  expect(document.vars.has('--co-theme-textPrimary')).toBe(false);
  expect(published.cardBackground).toBe('var(--co-theme-cardBackground)');
});
test('the selected API mode publishes rgba and opacity and removes prior values',async()=>{
  const api={fetch:jest.fn().mockResolvedValue(':root{--modalOverlay-light:rgba(1, 2, 3, .5);--buttonDisabledOpacity-light:0.5;--cardBackground-light:#ffffff;--cardBackground-dark:#000000;}')};
  await act(async()=>{tree=renderer.create(<Probe api={api}/>);});
  await act(async()=>setThemeMode('light'));
  expect(document.vars.get('--co-theme-modalOverlay')).toBe('rgba(1, 2, 3, .5)');
  expect(document.vars.get('--co-theme-buttonDisabledOpacity')).toBe('0.5');
  await act(async()=>setThemeMode('dark'));
  expect(document.vars.get('--co-theme-cardBackground')).toBe('#000000');
  expect(document.vars.has('--co-theme-modalOverlay')).toBe(false);
  await act(async()=>setThemeMode('light'));
});

test('a web color preview updates CSS without republishing unchanged variable references into the application store',async()=>{
 const api={fetch:jest.fn().mockResolvedValue(':root{--cardBackground-light:#ffffff;}')};
 await act(async()=>{tree=renderer.create(<Probe api={api}/>);});
 const before=publishCount;
 await act(async()=>previewTheme({'cardBackground-light':'#abcdef'},null));
 expect(document.vars.get('--co-theme-cardBackground')).toBe('#abcdef');
 expect(publishCount).toBe(before);
 await act(async()=>clearThemePreview());
});

test('scalar appearance choices survive the CSS transport and publish per-indicator colors in both modes',async()=>{
 const api={fetch:jest.fn().mockResolvedValue(':root{--indicatorCardBackground-light:#ffffff;--indicatorCardBackground-dark:#112233;--homeMetricClosedSalesAppearance:primary;--homeMetricPrimaryBackground-light:#00ff00;}')};
 await act(async()=>{tree=renderer.create(<Probe api={api}/>);});
 await act(async()=>setThemeMode('light'));
 expect(getThemeSnapshot().raw.homeMetricClosedSalesAppearance).toBe('primary');
 expect(document.vars.get('--co-theme-homeMetricClosedSalesAppliedBackground')).toBe('#00ff00');
 expect(document.vars.get('--co-theme-homeMetricClientsAppliedBackground')).toBe('#ffffff');
 expect(document.vars.get('--co-theme-homeResultsBackground')).toBe('#ffffff');
 await act(async()=>setThemeMode('dark'));
 expect(document.vars.get('--co-theme-homeMetricClosedSalesAppliedBackground')).toBe('#112233');
 await act(async()=>setThemeMode('light'));
});
