export const COMPANY_BRANDING_KEY = 'company_branding';
export function readCompanyBranding(company) {
  let value=company?.configs?.[COMPANY_BRANDING_KEY];
  try {if(typeof value==='string')value=JSON.parse(value);} catch {value=null;}
  return {logoLight:typeof value?.logoLight==='string'?value.logoLight:'',logoDark:typeof value?.logoDark==='string'?value.logoDark:''};
}
export const validLogoReference = value => !value || /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]+)$/.test(value);
export function logoForMode(company,mode) {
  const branding=readCompanyBranding(company);
  const value=branding[mode==='dark'?'logoDark':'logoLight'];
  return value && validLogoReference(value)?value:null;
}
export function fitCompanyLogo(width,height,maxHeight=40,maxWidth=80) {
  if(!(width>0 && height>0))return {width:Math.min(maxHeight,maxWidth),height:maxHeight};
  const scale=Math.min(maxWidth/width,maxHeight/height);
  return {width:Math.round(width*scale),height:Math.round(height*scale)};
}
