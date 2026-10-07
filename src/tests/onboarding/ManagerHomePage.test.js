/* global test, expect, jest */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerHomePage from '../../onboarding/ManagerHomePage';

let mockCompany = {id: 4, user: {owner_enabled: true}};
jest.mock('react-native', () => ({View: 'View', Text: 'Text', Pressable: 'Pressable', Dimensions: {}, PixelRatio: {}}));
jest.mock('@store', () => ({useStore: name => ({getters: name === 'people' ? {currentCompany: mockCompany} : {user: {id: 8}}})}));
jest.mock('@controleonline/ui-manager/src/react/pages/home/index', () => 'CurrentManagerHome');

test('administrative home exposes onboarding while preserving the current home component', () => {
  const navigate = jest.fn();
  let tree;
  act(() => {tree = renderer.create(React.createElement(ManagerHomePage, {navigation: {navigate}}));});
  expect(tree.root.findByType('CurrentManagerHome')).toBeTruthy();
  act(() => tree.root.findByProps({testID: 'open-operation-setup'}).props.onPress());
  expect(navigate).toHaveBeenCalledWith('OnboardingPage');
  act(() => tree.unmount());
});

test('home does not offer setup to a collaborator without administrative company access', () => {
  mockCompany = {id: 4, user: {employee_enabled: true}};
  let tree;
  act(() => {tree = renderer.create(React.createElement(ManagerHomePage, {navigation: {navigate: jest.fn()}}));});
  expect(tree.root.findAllByProps({testID: 'open-operation-setup'})).toHaveLength(0);
  act(() => tree.unmount());
});
