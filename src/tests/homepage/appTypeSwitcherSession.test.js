import React from 'react';
import renderer, {act} from 'react-test-renderer';
import AuthenticatedAppTypeSwitcher from '../../components/AuthenticatedAppTypeSwitcher';

let mockIsLogged = false;
let mockRouteName = 'HomePage';
jest.mock('@react-navigation/native', () => ({useRoute: () => ({name: mockRouteName})}));
jest.mock('@store', () => ({useStore: () => ({getters: {get isLogged() {return mockIsLogged;}}})}));
jest.mock('../../../node_modules/@controleonline/ui-common/src/react/components/AppTypeSwitcher', () => 'AppTypeSwitcher');

it('hides application selection before login and after logout, while preserving the authenticated selector', () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  let tree;
  act(() => {tree = renderer.create(<AuthenticatedAppTypeSwitcher />);});
  expect(tree.toJSON()).toBeNull();
  mockIsLogged = true;
  act(() => {tree.update(<AuthenticatedAppTypeSwitcher />);});
  expect(tree.root.findAllByType('AppTypeSwitcher')).toHaveLength(1);
  mockIsLogged = false;
  act(() => {tree.update(<AuthenticatedAppTypeSwitcher />);});
  expect(tree.toJSON()).toBeNull();
  act(() => tree.unmount());
});


it('also hides the selector on sign-in while an existing session is being redirected', () => {
  mockIsLogged = true; mockRouteName = 'SignInPage';
  let tree;
  act(() => {tree = renderer.create(<AuthenticatedAppTypeSwitcher />);});
  expect(tree.toJSON()).toBeNull();
  act(() => tree.unmount());
});
