import {resolveFileImageUrl} from '@controleonline/ui-common/src/react/utils/fileUrl';
import {resolvePeopleImageUrl} from '@controleonline/ui-people/src/react/utils/peopleImage';

// Validate candidates before choosing one; an empty FileService object must not
// hide a usable logo. Keep the original file so DefaultFile retains auth/domain metadata.
export function resolveCompanyMedia(company, {home = false} = {}) {
  if (!company || typeof company !== 'object') return null;
  for (const key of home ? ['logo', 'icon'] : ['icon', 'logo']) {
    const field = company[key];
    const file = typeof field === 'string' ? field.trim() : field;
    if (!file || Array.isArray(file)) continue;
    if (resolveFileImageUrl(file, {company})) return file;
    const nested = typeof file === 'object' && (file.url || file.uri || file.path);
    if (typeof nested === 'string' && nested.trim()) {
      const url = resolveFileImageUrl(nested.trim(), {company});
      if (url) return url;
    }
  }
  return resolvePeopleImageUrl(
    {...company, peopleType: company.peopleType || 'J'}, resolveFileImageUrl,
    {usePeopleImage: true, fileOptions: {company}},
  ) || null;
}
