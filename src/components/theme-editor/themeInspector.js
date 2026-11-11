import {homeMetrics} from '../../styles/homeMetricAppearance';
const validBindings=value=>Array.isArray(value)?value.filter(item=>typeof item?.token==='string'&&typeof item?.property==='string'):[];
const uniqueBindings=bindings=>[...new Map(bindings.map(item=>[`${item.property}:${item.token}`,item])).values()];
export function inspectThemeElement(element) {
  if(!element || element.closest?.('[data-co-theme-tools="true"]'))return null;
  let node=element.closest?.('[data-co-theme]');
  const stateNode=element.closest?.('[data-co-theme-states]');
  const sourceNode=element.closest?.('[data-co-theme-source]');
  if(sourceNode && (!node || node.contains?.(sourceNode)))node=sourceNode;
  if(!node && !stateNode)return null;
  try {
    const scope=element.closest?.('[data-co-theme-screen]');
    const screenId=scope?.getAttribute?.('data-co-theme-screen');
    const screen=screenId && screenId.length<=200?{id:screenId,label:scope.getAttribute('data-co-theme-screen-label') || 'Tela atual'}:null;
    const sourceValue=sourceNode?.getAttribute?.('data-co-theme-source');
    const sources=sourceValue?JSON.parse(sourceValue):[];
    const metricId=element.closest?.('[data-co-home-metric]')?.getAttribute?.('data-co-home-metric');
    const scoped=hit=>hit?{...hit,...(screen?{screen}:{}),...(Object.hasOwn(homeMetrics,metricId)?{homeMetric:metricId}:{}),
      ...(hit.node===sourceNode && Array.isArray(sources)?{sources:sources.filter(item=>
        typeof item.property==='string' && ['category.color','routes.color','category.text_color','category.icon_color','routes.text_color','routes.icon_color','routes.icon_background_color'].includes(item.source) && typeof item.value==='string')}:{})}:hit;
    const dock=element.closest?.('[data-testid="bottom-navigation"][data-co-theme]');
    const parent=dock || element.closest?.('[role="menu"][data-co-theme]');
    const parentBindings=validBindings(parent?JSON.parse(parent.getAttribute('data-co-theme')):[]);
    const container=parent && parent!==node && parentBindings.length
      ? scoped({node:parent,bindings:parentBindings,states:{normal:parentBindings},...(dock?{kind:'shortcut-bar'}:{})})
      : null;
    const bindings=validBindings(node?JSON.parse(node.getAttribute('data-co-theme')):[]);
    // Keep a nested icon/text's own references along with its Pressable interaction states.
    if(stateNode){
      const declared=JSON.parse(stateNode.getAttribute('data-co-theme-states'));
      // Stateful children are already recorded for each state. Do not mix their
      // currently rendered Hover text into the Normal state (or vice versa).
      const stateKeys=new Set(['normal','hover'].flatMap(state=>validBindings(declared?.[state]).map(item=>`${item.property}:${item.token}`)));
      const own=node && node!==stateNode?bindings.filter(item=>!stateKeys.has(`${item.property}:${item.token}`)):[];
      const states={};
      for(const state of ['normal','hover'])if(Array.isArray(declared?.[state]))states[state]=uniqueBindings([...validBindings(declared[state]),...own]);
      if(Object.values(states).some(value=>value.length))return scoped({node:stateNode,bindings:states.normal || [],states,...(container?{container}:{})});
    }
    return bindings.length || sources.length?scoped({node,bindings,states:{normal:bindings},...(container?{container}:{})}):null;
  } catch{return null;}
}
export function attachThemeInspector(document,onHover,onSelect) {
  let touch=null,moved=false;
  // Inspector feedback must stay independent of the palette being edited. Theme-bound elements that are
  // click-through at runtime (for example the runtime footer, pointer-events: none) must still be hit
  // while inspecting, otherwise the click reaches the full-screen container behind them (#1520).
  const cursorStyle=document.createElement?.('style');
  if(cursorStyle){
    cursorStyle.textContent='body, body * { cursor: crosshair !important; } [data-co-theme-tools="true"], [data-co-theme-tools="true"] * { cursor: revert !important; } [data-co-theme], [data-co-theme-states], [data-co-theme-source] { pointer-events: auto !important; }';
    document.head?.appendChild?.(cursorStyle);
  }
  const tools=event=>event.target.closest?.('[data-co-theme-tools="true"]');
  const block=event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();};
  const select=event=>{block(event);onSelect(inspectThemeElement(event.target));};
  const move=event=>{
    if(touch && Math.hypot(event.clientX-touch.x,event.clientY-touch.y)>10)moved=true;
    onHover(inspectThemeElement(event.target));
  };
  const click=event=>{
    if(tools(event))return;
    if(moved){block(event);return;}
    select(event);
  };
  const key=event=>{if(event.key==='Escape')onSelect(null,true);};
  const down=event=>{
    if(tools(event))return;
    if(event.pointerType==='touch'){
      touch={x:event.clientX,y:event.clientY};moved=false;
      // Allow the browser's default pan while preventing component press handlers.
      event.stopPropagation();event.stopImmediatePropagation?.();return;
    }
    block(event);
  };
  const touchUp=event=>{
    if(!touch || event.pointerType!=='touch' || tools(event))return;
    touch=null;
    if(moved){event.stopPropagation();return;}
    // The compatibility click can arrive after selection unmounts the inspector.
    const suppress=click=>{if(tools(click))return;block(click);clearTimeout(timer);document.removeEventListener('click',suppress,true);};
    const timer=setTimeout(()=>document.removeEventListener('click',suppress,true),600);
    document.addEventListener('click',suppress,true);
    select(event);
  };
  const cancelTouch=()=>{touch=null;moved=true;};
  const blockTouch=event=>{if(!tools(event)){event.stopPropagation();event.stopImmediatePropagation?.();}};
  const listeners={pointermove:move,pointerdown:down,pointerup:touchUp,pointercancel:cancelTouch,mousedown:down,touchstart:blockTouch,touchend:blockTouch,click,keydown:key};
  for(const [name,handler] of Object.entries(listeners))document.addEventListener(name,handler,true);
  return()=>{for(const [name,handler] of Object.entries(listeners))document.removeEventListener(name,handler,true);cursorStyle?.remove?.();onHover(null);};
}
