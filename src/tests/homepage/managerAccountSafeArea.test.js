import React from 'react';
import renderer, {act} from 'react-test-renderer';
import Menu from '../../components/manager-preview/ManagerAccountMenu';

let mockInsets = {top: 24, bottom: 48, left: 0, right: 0};
let mockFrame = {width: 360, height: 640};
jest.mock('react-native', () => ({
  Modal: 'Modal', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
  StyleSheet: {create: value => value, absoluteFill: {}},
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const Context = React.createContext(null);
  return {
    // Simulate a modal window whose safe bounds differ from the activity's.
    SafeAreaProvider: ({children}) => React.createElement(Context.Provider, {value: true}, children),
    useSafeAreaInsets: () => React.useContext(Context) ? mockInsets : {top: 0, bottom: 0, left: 0, right: 0},
    useSafeAreaFrame: () => mockFrame,
  };
});
jest.mock('../../components/HomeIcon', () => 'Icon');
beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true;});

it.each([
  [{top: 24, bottom: 48, left: 0, right: 0}, {width: 360, height: 640}],
  [{top: 24, bottom: 34, left: 0, right: 0}, {width: 393, height: 852}],
  [{top: 0, bottom: 0, left: 0, right: 0}, {width: 320, height: 480}],
  [{top: 0, bottom: 0, left: 48, right: 24}, {width: 640, height: 360}],
])('keeps the mobile account panel inside the modal safe bounds: %j', (insets, frame) => {
  mockInsets = insets; mockFrame = frame;
  const onProfile = jest.fn();
  let tree; act(() => {tree = renderer.create(<Menu anchor="header" mobile colors={{}} name="Usuário"
    mode="light" canOpenProfile onProfile={onProfile} onLogout={() => {}} />);});
  const panel = tree.root.findByProps({accessibilityLabel: 'Opções do usuário'});
  const style = Object.assign({}, ...panel.props.style);
  expect(style.bottom).toBeGreaterThanOrEqual(insets.bottom + 12);
  expect(style.left).toBeGreaterThanOrEqual(insets.left);
  expect(style.right).toBeGreaterThanOrEqual(insets.right);
  expect(style.maxHeight).toBeLessThanOrEqual(frame.height - insets.top - style.bottom);
  act(() => tree.root.findByProps({accessibilityLabel: 'Meu perfil'}).props.onPress());
  expect(onProfile).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});
