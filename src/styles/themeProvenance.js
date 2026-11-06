import React from 'react';
import {Platform,StyleSheet} from 'react-native';

export function themeBindings(style) {
  const flat=StyleSheet.flatten(style) || {};
  const result=[];
  for(const [property,value] of Object.entries(flat)) {
    if(typeof value!=='string')continue;
    for(const match of value.matchAll(/var\(--co-theme-([\w-]+)/g))result.push({property,token:match[1]});
  }
  return result;
}
const unique=items=>[...new Map(items.map(item=>[`${item.property}:${item.token}`,item])).values()];
function childBindings(children) {
  const result=[];
  React.Children.forEach(children,child=>{
    if(!React.isValidElement(child))return;
    const props=child.props;
    if(typeof props.style!=='function')result.push(...themeBindings(props.style));
    if(props.color)result.push(...themeBindings({color:props.color}));
    if(typeof props.children!=='function')result.push(...childBindings(props.children));
  });
  return result;
}
export function themeStateBindings(style,children) {
  if(typeof style!=='function' && typeof children!=='function')return null;
  // Pressable style and children callbacks are pure functions of interaction state.
  try {
    const collect=hovered=>{
      const state={hovered,pressed:false,focused:false};
      return unique([...themeBindings(typeof style==='function'?style(state):style),
        ...childBindings(typeof children==='function'?children(state):children)]);
    };
    const normal=collect(false);
    const hover=collect(true);
    if(!normal.length && !hover.length)return null;
    return JSON.stringify(normal)===JSON.stringify(hover)?{normal}:{normal,hover};
  } catch{return null;}
}
function annotate(type,props) {
  if(!props?.style)return props;
  const pressable=type?.displayName==='Pressable' || type?.render?.name==='Pressable';
  const states=pressable?themeStateBindings(props.style,props.children):null;
  if(props.disabled && states)delete states.hover;
  const bindings=typeof props.style==='function'?[]:themeBindings(props.style);
  if(!bindings.length && !states)return props;
  const attributes={...(bindings.length?{coTheme:JSON.stringify(bindings)}:{}),...(states?{coThemeStates:JSON.stringify(states)}:{})};
  return typeof type==='string'
    ? {...props,...Object.fromEntries(Object.entries(attributes).map(([key,value])=>[key==='coTheme'?'data-co-theme':'data-co-theme-states',value]))}
    : {...props,dataSet:{...props.dataSet,...attributes}};
}
// Record actual variable references, never compare RGB values or change component behavior.
if(Platform.OS==='web' && !globalThis.__coThemeProvenanceInstalled) {
  globalThis.__coThemeProvenanceInstalled=true;
  const create=React.createElement;
  React.createElement=(type,props,...children)=>create(type,annotate(type,children.length?{...props,children:children.length===1?children[0]:children}:props),...children);
  for(const runtime of [require('react/jsx-runtime'),require('react/jsx-dev-runtime')]) {
    for(const key of ['jsx','jsxs','jsxDEV'])if(typeof runtime[key]==='function') {
      const render=runtime[key];runtime[key]=(type,props,...rest)=>render(type,annotate(type,props),...rest);
    }
  }
}
