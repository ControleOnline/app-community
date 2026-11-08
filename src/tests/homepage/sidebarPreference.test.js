import React from 'react';
import renderer, {act} from 'react-test-renderer';
import useSidebarPreference from '../../components/manager-preview/useSidebarPreference';

jest.mock('react-native', () => ({Platform:{OS:'web'}}));
function Probe({principal}) {
  return <preference value={useSidebarPreference(principal)} />;
}

test('remembers sidebar visibility for the same account and keeps other accounts separate', async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const stored = new Map();
  global.localStorage = {getItem:key => stored.get(key), setItem:(key,value) => stored.set(key,value)};
  let tree;
  const preference = () => tree.root.findByType('preference').props.value;
  try {
    await act(async () => {tree = renderer.create(<Probe principal="alice" />);});
    expect(preference()).toMatchObject({ready:true,visible:true});
    await act(async () => preference().setRememberedVisible(false));
    expect(preference().visible).toBe(false);
    await act(async () => tree.update(<Probe principal="bob" />));
    expect(preference().visible).toBe(true);
    await act(async () => tree.update(<Probe principal="alice" />));
    expect(preference().visible).toBe(false);
    await act(async () => preference().setRememberedVisible(true));
    expect(preference().visible).toBe(true);
  } finally {
    if (tree) await act(async () => tree.unmount());
    delete global.localStorage;
  }
});
