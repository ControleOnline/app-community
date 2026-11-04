import {resolveCompanyMedia} from '../../components/manager-preview/companyMedia';
import {resolveFileImageUrl} from '@controleonline/ui-common/src/react/utils/fileUrl';
import {resolvePeopleImageUrl} from '@controleonline/ui-people/src/react/utils/peopleImage';

jest.mock('@controleonline/ui-common/src/react/utils/fileUrl', () => ({
  resolveFileImageUrl: jest.fn(file => typeof file === 'string' ? file.trim()
    : file?.id ? `/files/${file.id}/download` : file?.url || ''),
}));
jest.mock('@controleonline/ui-people/src/react/utils/peopleImage', () => ({resolvePeopleImageUrl: jest.fn(() => '')}));
beforeEach(() => jest.clearAllMocks());

it('preserves FileService metadata and tenant context for authenticated loading', () => {
  const company = {id: 7, icon: {id: 9, domain: 'tenant.example', public: false}};
  expect(resolveCompanyMedia(company)).toBe(company.icon);
  expect(resolveFileImageUrl).toHaveBeenCalledWith(company.icon, {company});
});
it('skips empty icon values instead of hiding a valid logo', () => {
  for (const icon of [{}, '   ', []]) {
    expect(resolveCompanyMedia({icon, logo: {id: 8}})).toEqual({id: 8});
  }
});
it.each(['url', 'uri', 'path'])('accepts a nested %s image address', key => {
  expect(resolveCompanyMedia({icon: {[key]: '/brand.png'}})).toEqual(key === 'url' ? {url: '/brand.png'} : '/brand.png');
});
it('preserves icon priority in the sidebar and logo priority in the header', () => {
  const company = {icon: {id: 1}, logo: {id: 2}};
  expect(resolveCompanyMedia(company)).toBe(company.icon);
  expect(resolveCompanyMedia(company, {home: true})).toBe(company.logo);
});
it('uses people media only when direct image fields are unusable', () => {
  resolvePeopleImageUrl.mockReturnValueOnce('/media.png');
  const company = {id: 7, icon: {}};
  expect(resolveCompanyMedia(company)).toBe('/media.png');
  expect(resolvePeopleImageUrl).toHaveBeenCalledWith({...company, peopleType: 'J'}, resolveFileImageUrl,
    {usePeopleImage: true, fileOptions: {company}});
});
it('returns no image for missing media so the existing placeholder remains available', () => {
  expect(resolveCompanyMedia({id: 7})).toBeNull();
  expect(resolveCompanyMedia(null)).toBeNull();
});
