import {api} from '@controleonline/ui-common/src/api';
import {extractFileId, resolveFileImageUrl} from '@controleonline/ui-common/src/react/utils/fileUrl';
import {editorContext} from './themeService';

// Fetch the public domain company without replacing the signed-in user's company or app type.
export async function loadLoginPreviewCompany() {
  const context = editorContext();
  const response = await api.fetch('people/company/default', {skipSession: true});
  if (context !== editorContext()) throw new Error('O contexto mudou. Reabra a prévia do login.');
  const company = response?.response?.data || response?.data || response;
  if (!company?.id) throw new Error('A empresa do domínio não está disponível para a prévia do login.');
  return company;
}

export function loginPreviewMedia(company, type) {
  const file = type === 'logo' ? company?.logo : company?.theme?.background;
  return {type, file, companyId: company?.id, fileId: file ? extractFileId(file) : '',
    url: file ? resolveFileImageUrl(file, {company}) : '',
    source: type === 'logo' ? 'mainCompany.logo' : 'mainCompany.theme.background'};
}

export function loginPreviewReferences(values) {
  return Object.fromEntries(Object.entries(values).filter(([,value]) => typeof value === 'string' && value.trim())
    .map(([token]) => [token, `var(--co-theme-${token})`]));
}
