import React from 'react';
import {themeStateBindings} from '../../styles/themeProvenance';
import {inspectThemeElement,attachThemeInspector} from '../../components/theme-editor/themeInspector';
const binding=token=>({property:'backgroundColor',token});
test('keeps declared Normal/Hover token identities even if their colors resolve to the same RGB',()=>{
 const style=({hovered})=>({backgroundColor:`var(--co-theme-${hovered?'listItemActiveBackground':'listItemBackground'})`,borderColor:'var(--co-theme-listItemBorder)'});
 expect(themeStateBindings(style)).toEqual({normal:[binding('listItemBackground'),{property:'borderColor',token:'listItemBorder'}],hover:[binding('listItemActiveBackground'),{property:'borderColor',token:'listItemBorder'}]});
 expect(themeStateBindings(()=>({color:'var(--co-theme-textPrimary)'}))).toEqual({normal:[{property:'color',token:'textPrimary'}]});
 expect(themeStateBindings(()=>({backgroundColor:'#ffffff'}))).toBeNull();
});
test('selecting a nested label keeps its text token and the parent interaction states',()=>{
 const parent={getAttribute:()=>JSON.stringify({normal:[binding('listItemBackground')],hover:[binding('listItemActiveBackground')]})};
 const label={getAttribute:()=>JSON.stringify([{property:'color',token:'listItemText'}])};
 const target={closest:selector=>selector.includes('tools')?null:selector.includes('states')?parent:label};
 const hit=inspectThemeElement(target);
 expect(hit.node).toBe(parent);
 expect(hit.states.normal).toContainEqual(binding('listItemBackground'));
 expect(hit.states.hover).toContainEqual(binding('listItemActiveBackground'));
 expect(hit.states.normal).toContainEqual({property:'color',token:'listItemText'});
});
test('menu render children expose different text and icon tokens for Normal and Hover',()=>{
 const children=({hovered})=><><fake-icon color={`var(--co-theme-${hovered?'menuActiveIcon':'menuIcon'})`}/><fake-text style={{color:`var(--co-theme-${hovered?'menuActiveText':'menuText'})`}}>Profile</fake-text></>;
 const states=themeStateBindings(({hovered})=>({backgroundColor:`var(--co-theme-${hovered?'menuActiveBackground':'containerTransparentBackground'})`}),children);
 expect(states.normal).toContainEqual({property:'color',token:'menuText'});
 expect(states.normal).toContainEqual({property:'color',token:'menuIcon'});
 expect(states.hover).toContainEqual({property:'color',token:'menuActiveText'});
 const parent={getAttribute:()=>JSON.stringify(states)};
 const label={getAttribute:()=>JSON.stringify([{property:'color',token:'menuActiveText'}])};
 const menuBindings=[binding('menuBackground'),{property:'borderColor',token:'menuBorder'}];
 const menu={getAttribute:()=>JSON.stringify(menuBindings)};
 const target={closest:selector=>selector.includes('tools')?null:selector.includes('role=')?menu:selector.includes('states')?parent:label};
 const hit=inspectThemeElement(target);
 expect(hit.states.normal).not.toContainEqual({property:'color',token:'menuActiveText'});
 expect(hit.states.normal).toContainEqual({property:'color',token:'menuText'});
 expect(hit.container.bindings).toEqual(menuBindings);
});
function harness(){
 const events=new Map();
 const document={addEventListener:(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn);},removeEventListener:(name,fn)=>events.get(name)?.delete(fn)};
 const node={getAttribute:()=>JSON.stringify([binding('cardBackground')])};
 const target={closest:selector=>selector.includes('tools') || selector.includes('states')?null:node};
 const event=extra=>({target,pointerType:'touch',clientX:30,clientY:40,preventDefault:jest.fn(),stopPropagation:jest.fn(),stopImmediatePropagation:jest.fn(),...extra});
 const dispatch=(name,e)=>{for(const handler of [...(events.get(name) || [])])handler(e);};
 return {document,event,dispatch};
}
test('touch selection blocks the business press and its delayed click after the inspector closes',()=>{
 jest.useFakeTimers();const {document,event,dispatch}=harness();const selected=jest.fn();
 const cleanup=attachThemeInspector(document,jest.fn(),selected);
 const down=event();dispatch('pointerdown',down);expect(down.stopPropagation).toHaveBeenCalled();expect(down.preventDefault).not.toHaveBeenCalled();
 const up=event();dispatch('pointerup',up);expect(up.preventDefault).toHaveBeenCalled();expect(selected).toHaveBeenCalledTimes(1);
 cleanup();const click=event();dispatch('click',click);expect(click.preventDefault).toHaveBeenCalled();
 jest.runOnlyPendingTimers();jest.useRealTimers();
});
test('scroll gestures remain scrollable and do not select an element',()=>{
 const {document,event,dispatch}=harness();const selected=jest.fn();const cleanup=attachThemeInspector(document,jest.fn(),selected);
 const down=event();dispatch('pointerdown',down);dispatch('pointermove',event({clientY:100}));
 const up=event({clientY:100});dispatch('pointerup',up);
 expect(down.preventDefault).not.toHaveBeenCalled();expect(up.preventDefault).not.toHaveBeenCalled();expect(selected).not.toHaveBeenCalled();
 cleanup();
});
