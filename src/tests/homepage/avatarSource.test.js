import React from 'react';
import renderer, {act} from 'react-test-renderer';
import HomeAvatar from '../../components/HomeAvatar';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';

let mockAuthUser;
jest.mock('@store', () => ({useStore: () => ({getters: {user: mockAuthUser}})}));

jest.mock('react-native', () => ({Platform: {OS: 'android'}, Image: 'Image',
  View: 'View', Text: 'Text', StyleSheet: {create: value => value}}));
jest.mock('@env', () => ({env: {API_ENTRYPOINT: 'http://api.test', DOMAIN: 'tenant.test'}}));
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockAuthUser = {api_key: 'synthetic-token'};
  // The shared avatar still has its own existing storage reader; home headers
  // must follow the reactive auth store even when persisted data is stale.
  global.localStorage = {getItem: () => JSON.stringify({api_key: 'stale-synthetic-token'})};
});
afterEach(() => {delete global.localStorage;});

it.each(['http://api.test/tenant.test/files/5/download', 'https://api.test/tenant.test/files/5/download', 'https://external.test/logo.png'])(
  'passes the native home source correctly for %s', async uri => {
    let tree;
    await act(async () => {tree = renderer.create(<HomeAvatar imageUrl={uri} name="Leandro" email="synthetic@example.test" />);});
    const source = tree.root.findByType('Image').props.source;
    expect(source.uri).toBe(uri.includes('api.test/') ? uri.replace('https:', 'http:') : uri);
    expect(source.headers).toEqual(uri.includes('api.test/')
      ? {'API-TOKEN': 'synthetic-token', 'App-Domain': 'tenant.test'} : undefined);
    expect(tree.root.findByType(UserAvatar).props.useGravatar).toBe(false);
    act(() => tree.unmount());
  },
);

it('updates native download credentials from the auth store and removes them on logout', async () => {
  let tree;
  const props = {imageUrl: 'http://api.test/tenant.test/files/5/download', useGravatar: false};
  await act(async () => {tree = renderer.create(<HomeAvatar {...props} />);});
  mockAuthUser = {api_key: 'new-synthetic-token'};
  await act(async () => {tree.update(<HomeAvatar {...props} />);});
  expect(tree.root.findByType('Image').props.source.headers['API-TOKEN']).toBe('new-synthetic-token');
  mockAuthUser = null;
  await act(async () => {tree.update(<HomeAvatar {...props} />);});
  expect(tree.root.findByType('Image').props.source.headers).toBeUndefined();
  act(() => tree.unmount());
});

it('does not add download headers to existing avatar consumers', async () => {
  let tree;
  await act(async () => {tree = renderer.create(<UserAvatar imageUrl="http://api.test/tenant.test/files/5/download" useGravatar={false} />);});
  expect(tree.root.findByType('Image').props.source).toEqual({uri: 'http://api.test/tenant.test/files/5/download'});
  act(() => tree.unmount());
});
