import resolveHomeAvatar from '../../components/resolveHomeAvatarUrl';
import imageHeaders, {resolveHomeImageUrl} from '../../components/homeImageHeaders';
import companyStyles from '@controleonline/ui-manager/src/react/components/CompanyFilter.styles';
import legacyStyles from './fixtures/CompanyFilter.styles';

jest.mock('react-native', () => ({StyleSheet: {create: value => value}}));
jest.mock('@controleonline/ui-common/src/react/utils/fileUrl', () => ({resolveFileImageUrl: file => file?.url || ''}));

it('reads the avatar from the auth-store payload without substituting another image', () => {
  const user = Object.freeze({avatar: {id: 8, domain: 'example.test', url: '/example.test/files/8/download'}});
  expect(resolveHomeAvatar(user, {})).toBe('/example.test/files/8/download');
  expect(resolveHomeAvatar({}, {})).toBe('');
});

it('authenticates native API downloads without sending credentials to external images', () => {
  const config = {api: 'http://10.0.2.2:8000', domain: 'example.test', token: 'synthetic-test-token'};
  expect(imageHeaders('http://10.0.2.2:8000/example.test/files/8/download', config))
    .toEqual({'API-TOKEN': 'synthetic-test-token', 'App-Domain': 'example.test'});
  expect(imageHeaders('https://external.test/files/8/download', config)).toBeUndefined();
  expect(imageHeaders('http://10.0.2.2:8000.evil.test/files/8/download', config)).toBeUndefined();
  expect(imageHeaders('http://10.0.2.2:8000/image.png', config)).toBeUndefined();
});

it('allows the home header to measure its content while keeping legacy styles', () => {
  expect(companyStyles({})).toEqual(legacyStyles({}));
  expect(companyStyles({}, 'soft', {}).container).toMatchObject({flexBasis: 'auto', flexShrink: 0});
});

it('uses the configured API protocol without rewriting external images', () => {
  const path = '/tenant.test/files/8/download';
  expect(resolveHomeImageUrl(`https://10.0.2.2:8000${path}`, 'http://10.0.2.2:8000'))
    .toBe(`http://10.0.2.2:8000${path}`);
  expect(resolveHomeImageUrl(`http://api.test${path}`, 'https://api.test')).toBe(`https://api.test${path}`);
  expect(resolveHomeImageUrl(`https://external.test${path}`, 'http://api.test')).toBe(`https://external.test${path}`);
});
