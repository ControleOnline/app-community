import {useSyncExternalStore} from 'react';
import {editorContext} from './themeService';
import {COMPANY_BRANDING_KEY} from '../manager-preview/companyBranding';
const listeners=new Set();
const values=new Map();
const key=company=>`${editorContext()}|${company?.id || ''}`;
const subscribe=listener=>{listeners.add(listener);return()=>listeners.delete(listener);};
export function publishCompanyBranding(company,branding,owner) {
  values.set(key(company),{branding,owner});listeners.forEach(listener=>listener());
}
export function clearCompanyBranding(company,owner) {
  let changed=false;
  for(const [id,entry] of values)if(entry.owner===owner){values.delete(id);changed=true;}
  if(changed)listeners.forEach(listener=>listener());
}
export function useCompanyBranding(company) {
  const entry=useSyncExternalStore(subscribe,()=>values.get(key(company)),()=>undefined);
  return entry?{...company,configs:{...company?.configs,[COMPANY_BRANDING_KEY]:entry.branding}}:company;
}
