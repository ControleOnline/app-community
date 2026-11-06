import contract from './themeContract.generated';
const names=new Set(contract.names);
const encode=value=>value.split('').map(char=>char.charCodeAt(0).toString(16).padStart(4,'0')).join('');
export const screenThemeKey=(screen,token,mode)=>{
  if(!screen || screen.length>200 || !names.has(token) || !['light','dark'].includes(mode))throw new Error('Invalid screen theme key.');
  return `screen_${encode(screen)}__${token}-${mode}`;
};
export function parseScreenThemeKey(key){
  const match=/^screen_([a-f0-9]{4,800})__([a-z][a-zA-Z0-9]*)-(light|dark)$/.exec(key);
  if(!match || match[1].length%4 || !names.has(match[2]))return null;
  const screen=match[1].match(/.{4}/g).map(part=>String.fromCharCode(parseInt(part,16))).join('');
  return {screen,token:match[2],mode:match[3]};
}
export function identifyThemeScreen(route,appType='MANAGER',label=''){
  if(!route?.name)return null;
  // Route instance keys, record IDs, filters and pagination never identify a screen.
  const store=typeof route.params?.store==='string'?route.params.store:'';
  const id=JSON.stringify([appType,route.name,store]);
  return id.length<=200?{id,label:typeof label==='string'&&label.trim()?label:route.name}:null;
}
