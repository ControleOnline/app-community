import {useEffect, useRef, useSyncExternalStore} from 'react';
import {env} from '@env';
import {useStore} from '@store';
import useSessionVersion from '../session/useSessionVersion';
import {scopeFor} from '../session/sessionScope';
import {resolveManagerTheme} from './managerTheme';
import {applyPaletteToRuntimeColors, applyThemeCssVariables} from './branding';
import {applyThemeScrollbarStyles} from './scrollbarTheme';
import {colors as runtimeColors} from '@controleonline/ui-layout/src/styles/colors';
import contract from './themeContract.generated';

const names = new Set(contract.names);
const listeners = new Set();
const modeKey = 'controleonline.manager-preview.mode';
const readMode = () => {try{return globalThis.localStorage?.getItem(modeKey)==='dark'?'dark':'light';}catch{return 'light';}};
let state = {raw:{},preview:null,mode:readMode(),status:'idle',error:'',retry:0,context:'',themeId:null};
const update = patch => {state={...state,...patch};listeners.forEach(listener=>listener());};
export const subscribeTheme = listener => {listeners.add(listener);return()=>listeners.delete(listener);};
export const getThemeSnapshot = () => state;
export const useThemeRuntime = () => useSyncExternalStore(subscribeTheme,getThemeSnapshot,getThemeSnapshot);
export const setThemeMode = mode => {
  if(!['light','dark'].includes(mode)) return;
  try{globalThis.localStorage?.setItem(modeKey,mode);}catch{}
  update({mode});
};
export const previewTheme = (colors,themeId,owner) => {
  if(themeId && String(state.themeId)!==String(themeId)) return;
  update({preview:colors,previewOwner:owner});
};
export const clearThemePreview = owner => {if(state.preview && (!owner || owner===state.previewOwner))update({preview:null,previewOwner:null});};
export const registerActiveTheme = (themeId, context) => {
  if(context===state.context && String(state.themeId)!==String(themeId))update({themeId,preview:null});
};
export const refreshDomainTheme = () => update({retry:state.retry+1,preview:null});
export function useDomainThemeFetch({api,parseThemeCss,setBaseThemeColors,currentCompany,mainCompany,device}) {
  const version=useSessionVersion();
  const {retry}=useThemeRuntime();
  const context=scopeFor(env);
  useEffect(()=>{
    let current=true;
    setBaseThemeColors({});
    update({status:'loading',error:'',raw:{},preview:null,context,themeId:null});
    api.fetch('themes-colors.css',{responseType:'text',skipSession:true}).then(text=>{
      if(!current)return;
      const raw=parseThemeCss(text);
      if(!Object.keys(raw).length)throw new Error('A API não retornou cores para este domínio.');
      setBaseThemeColors(raw);
      update({raw,status:'ready',error:''});
    }).catch(error=>{
      if(!current)return;
      setBaseThemeColors({});
      update({raw:{},status:'error',error:error?.status===401?'Sessão rejeitada. Entre novamente.':'Não foi possível carregar o tema deste domínio.'});
    });
    return()=>{current=false;};
  },[api,setBaseThemeColors,version,context,retry,currentCompany?.id,mainCompany?.id,device?.id]);
}
export function useDomainThemePublisher({actions}) {
  const snapshot=useThemeRuntime();
  const published=useRef(null);
  useEffect(()=>{
    const selected=resolveManagerTheme(snapshot.preview || snapshot.raw,snapshot.mode);
    // Transport suffixes belong to the API, never to visual consumers.
    const values=Object.fromEntries(Object.entries(selected).filter(([key,value])=>value!==undefined
      && !(/-(light|dark)$/.test(key)&&names.has(key.replace(/-(light|dark)$/,'')))));
    applyThemeCssVariables({themeColors:values});
    try { applyThemeScrollbarStyles({ mode: values.mode || values.themeMode || 'light' }); } catch (_) {}
    const web=typeof document!=='undefined';
    const colors=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,web?`var(--co-theme-${key})`:value]));
    const previous=published.current;
    // CSS carries web preview values; stable variable references do not require
    // another store update and a render of the entire application.
    if(!previous || Object.keys(previous).length!==Object.keys(colors).length || Object.entries(colors).some(([key,value])=>previous[key]!==value)){
      applyPaletteToRuntimeColors(colors,runtimeColors);
      actions.setColors(colors);published.current=colors;
    }
  },[snapshot.raw,snapshot.preview,snapshot.mode,actions]);
}
