import React from 'react';
import renderer, {act} from 'react-test-renderer';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';
jest.mock('react-native', () => ({Platform: {OS: 'web'}, Image: 'Image', Text: 'Text', View: 'View', StyleSheet: {create: value => value}}));
it.each(['token', 'api_key'])('authenticates private web images with wrapped-session %s', async field => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const before = {fetch: global.fetch, storage: global.localStorage, create: URL.createObjectURL, revoke: URL.revokeObjectURL};
  let tree;
  global.localStorage = {getItem: () => '__q_objt|' + JSON.stringify({[field]: 'synthetic-session'})};
  global.fetch = jest.fn().mockResolvedValue({ok: true, blob: async () => ({})});
  URL.createObjectURL = jest.fn(() => 'blob:authenticated-avatar');
  URL.revokeObjectURL = jest.fn();
  try {
    await act(async () => {tree = renderer.create(<UserAvatar imageUrl="http://localhost:8000/localhost%3A8081/files/6046/download" name="Test User" useGravatar={false}/>);});
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/localhost%3A8081/files/6046/download', expect.objectContaining({headers: expect.objectContaining({'API-TOKEN': 'synthetic-session'})}));
    expect(tree.root.findByType('Image').props.source.uri).toBe('blob:authenticated-avatar');
    act(() => tree.unmount());
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:authenticated-avatar');
  } finally {
    if (tree) act(() => tree.unmount());
    global.fetch = before.fetch; global.localStorage = before.storage;
    URL.createObjectURL = before.create; URL.revokeObjectURL = before.revoke;
  }
});
