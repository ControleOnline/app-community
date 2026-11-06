import {api} from '@controleonline/ui-common/src/api';
import {editorContext} from './themeService';
import {COMPANY_BRANDING_KEY,readCompanyBranding,validLogoReference} from '../manager-preview/companyBranding';
export async function loadCompanyBranding(company) {
  const response=await api.fetch('configs',{params:{people:company.id,configKey:COMPANY_BRANDING_KEY,itemsPerPage:50}});
  const rows=response?.['hydra:member'] || response?.member || response;
  if(!Array.isArray(rows))throw new Error('Não foi possível ler a identidade da empresa.');
  const record=rows.find(row=>row.configKey===COMPANY_BRANDING_KEY);
  return {record,branding:readCompanyBranding({configs:{[COMPANY_BRANDING_KEY]:record?.configValue}})};
}
export async function saveCompanyBranding(company,baseline,draft,context,isCurrent=()=>true) {
  if(!isCurrent() || !company?.id || context!==editorContext())throw new Error('A sessão ou empresa mudou. Reabra o editor.');
  if(!Object.values(draft).every(validLogoReference))throw new Error('Use endereços de imagem válidos.');
  const latest=await loadCompanyBranding(company);
  if(!isCurrent() || context!==editorContext())throw new Error('A sessão mudou. Reabra o editor.');
  if(JSON.stringify(latest.branding)!==JSON.stringify(baseline))throw new Error('Os logos foram alterados por outra edição. Reabra o editor.');
  const saved=await api.fetch('configs/add-configs',{method:'POST',body:{people:company.id,configKey:COMPANY_BRANDING_KEY,configValue:JSON.stringify(draft),visibility:'public'}});
  if(!saved || saved.error || saved.errors || !(saved.id || saved['@id']))throw new Error('A API não confirmou a gravação dos logos.');
  if(!isCurrent() || context!==editorContext())throw new Error('A sessão mudou durante a gravação. Recarregue a empresa.');
  return draft;
}
