import {api} from '@controleonline/ui-common/src/api';
import {resolveAppDomain} from '@controleonline/ui-common/src/utils/appDomain';
import {env} from '@env';
import {editorContext} from './themeService';
import {refreshDomainTheme} from '../../styles/themeRuntime';

const assertCurrent=(context,isCurrent)=>{
 if(context!==editorContext() || !isCurrent())throw new Error('A sessão ou o domínio mudou. Abra a lista novamente.');
};
export async function loadThemeCatalog(context=editorContext(),isCurrent=()=>true,scope='companies'){
 const items=[];let page=1,domain,canDeleteUnused,canManageGlobal;
 do {
  assertCurrent(context,isCurrent);
  const result=await api.fetch('theme-management',{params:{domain:resolveAppDomain(env.DOMAIN),page,scope}});
  assertCurrent(context,isCurrent);
  if(!Array.isArray(result?.items))throw new Error('Não foi possível carregar os temas e seus vínculos.');
  if(page===1){domain=result.domain;canDeleteUnused=result.canDeleteUnused;canManageGlobal=Boolean(result.canManageGlobal);}
  items.push(...result.items);
  if(result.nextPage!=null && (!Number.isInteger(result.nextPage) || result.nextPage<=page))throw new Error('A paginação dos temas é inválida. Atualize a lista.');
  page=result.nextPage;
 }while(page!=null);
 return {items,domain,canDeleteUnused,canManageGlobal,scope};
}
export async function applyDomainTheme(domain,theme,context,isCurrent=()=>true){
 assertCurrent(context,isCurrent);
 if(!domain?.canApply || !domain?.id || !theme?.id)throw new Error('Sem permissão para trocar o tema deste domínio.');
 const result=await api.fetch(`theme-management/domains/${domain.id}/theme`,{method:'PUT',body:{themeId:Number(theme.id),expectedThemeId:domain.themeId==null?null:Number(domain.themeId)}});
 assertCurrent(context,isCurrent);
 if(Number(result?.domainId)!==Number(domain.id) || Number(result?.themeId)!==Number(theme.id))throw new Error('A API não confirmou a troca do tema. Atualize a lista.');
 refreshDomainTheme();
 return result;
}
export async function loadCatalogTheme(theme,context,isCurrent=()=>true){
 assertCurrent(context,isCurrent);
 const result=await api.fetch(`themes/${theme.id}`);
 assertCurrent(context,isCurrent);
 if(Number(result?.id)!==Number(theme.id) || !result.colors || typeof result.colors!=='object')throw new Error('Não foi possível ler as cores deste tema.');
 return result;
}
export async function deleteUnusedTheme(theme,context,isCurrent=()=>true){
 assertCurrent(context,isCurrent);
 if(!theme?.canDelete || theme?.usage?.count!==0)throw new Error('Este tema não pode ser excluído. Consulte seus vínculos e permissões.');
 const result=await api.fetch(`theme-management/themes/${theme.id}`,{method:'DELETE'});
 assertCurrent(context,isCurrent);
 if(Number(result?.deletedThemeId)!==Number(theme.id))throw new Error('A API não confirmou a exclusão. Atualize a lista.');
}
