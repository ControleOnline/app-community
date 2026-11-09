import {themeBindings} from '../../styles/themeProvenance';
import {inspectThemeElement,attachThemeInspector} from '../../components/theme-editor/themeInspector';
test('records variable identity even when two roles have the same visible color',()=>{
  expect(themeBindings([{color:'var(--co-theme-cardText)'},{backgroundColor:'var(--co-theme-cardBackground)',color:'var(--co-theme-textPrimary)'}])).toEqual([{property:'color',token:'textPrimary'},{property:'backgroundColor',token:'cardBackground'}]);
  expect(themeBindings({backgroundColor:'#ffffff'})).toEqual([]);
});
test('click inspection prevents business actions and keeps tool controls interactive',()=>{
  const listeners={};const document={addEventListener:(name,fn)=>{listeners[name]=fn;},removeEventListener:jest.fn()};
  const node={getAttribute:()=>JSON.stringify([{property:'backgroundColor',token:'cardBackground'}])};
  const target={closest:selector=>selector.includes('tools')?null:node};
  const select=jest.fn();const hover=jest.fn();const cleanup=attachThemeInspector(document,hover,select);
  const event={target,preventDefault:jest.fn(),stopPropagation:jest.fn(),stopImmediatePropagation:jest.fn()};
  listeners.click(event);expect(event.preventDefault).toHaveBeenCalled();expect(event.stopPropagation).toHaveBeenCalled();
  expect(select.mock.calls[0][0].bindings[0].token).toBe('cardBackground');
  select.mockClear();listeners.click({...event,target:{closest:()=>({})}});expect(select).not.toHaveBeenCalled();
  listeners.keydown({key:'Escape'});expect(select).toHaveBeenCalledWith(null,true);cleanup();expect(document.removeEventListener).toHaveBeenCalled();
});
test('a literal or a malformed annotation never gets an inferred token',()=>{
  expect(inspectThemeElement({closest:()=>null})).toBeNull();
  const node={getAttribute:()=>'{invalid'};expect(inspectThemeElement({closest:selector=>selector.includes('tools')?null:node})).toBeNull();
});
test('exposes the shortcut bar background from a tap on an individual shortcut',()=>{
  const dock={getAttribute:()=>JSON.stringify([
    {property:'backgroundColor',token:'shortcutBarBackground'},
    {property:'borderColor',token:'shortcutBarBorder'},
  ])};
  const icon={getAttribute:()=>JSON.stringify([{property:'color',token:'navigationIcon'}])};
  const hit=inspectThemeElement({closest:selector=>{
    if(selector==='[data-co-theme]')return icon;
    if(selector.includes('bottom-navigation'))return dock;
    return null;
  }});
  expect(hit.bindings).toEqual([{property:'color',token:'navigationIcon'}]);
  expect(hit.container).toMatchObject({kind:'shortcut-bar',node:dock,bindings:[
    {property:'backgroundColor',token:'shortcutBarBackground'},
    {property:'borderColor',token:'shortcutBarBorder'},
  ]});
});


test.each([
  ['manager-sidebar', 'Menu lateral'],
  ['manager-mobile-rail', 'Menu lateral'],
  ['manager-header', 'Cabeçalho'],
  ['manager-account-menu', 'Menu da conta'],
  ['bottom-navigation', 'Barra de atalhos'],
])('keeps %s global even when a route context exists', (id, label) => {
  const bindings = [{property:'backgroundColor', token:'navigationBackground'}];
  const node = {getAttribute:()=>JSON.stringify(bindings)};
  const scope = {getAttribute:()=> 'screen-context'};
  const shared = {getAttribute:()=>id};
  const hit = inspectThemeElement({closest:selector=>{
    if (selector === '[data-co-theme]') return node;
    if (selector === '[data-co-theme-screen]') return scope;
    if (selector.includes('manager-sidebar')) return shared;
    return null;
  }});
  expect(hit).toMatchObject({sharedLabel:label, bindings});
  expect(hit.screen).toBeUndefined();
});

test('keeps screen editing available for page content', () => {
  const bindings = [{property:'backgroundColor', token:'cardBackground'}];
  const node = {getAttribute:()=>JSON.stringify(bindings)};
  const scope = {getAttribute:key=>key === 'data-co-theme-screen' ? 'financial-screen' : 'Financeiro'};
  const hit = inspectThemeElement({closest:selector=>{
    if (selector === '[data-co-theme]') return node;
    if (selector === '[data-co-theme-screen]') return scope;
    return null;
  }});
  expect(hit.screen).toEqual({id:'financial-screen', label:'Financeiro'});
  expect(hit.sharedLabel).toBeUndefined();
});
