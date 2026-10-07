/* global test, expect, jest */
/* eslint no-unused-vars: ["error", {"varsIgnorePattern": "^(React|OnboardingContent)$"}] */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import OnboardingContent from '../../onboarding/OnboardingContent';
import {createDraft} from '../../onboarding/model';

jest.mock('react-native', () => ({View: 'View', Text: 'Text', ScrollView: 'ScrollView', Pressable: 'Pressable', TextInput: 'TextInput', Switch: 'Switch', Dimensions: {}, PixelRatio: {}, StyleSheet: {create: value => value}}));
const palette = {primary: '#123456', background: '#fff', text: '#111', textSecondary: '#555', border: '#ddd'};
const control = patch => ({draft: createDraft(), ready: true, runtime: null, loading: false, update: jest.fn(), refresh: jest.fn(), ...patch});
const text = tree => JSON.stringify(tree.toJSON());

test('device step opens the existing device and exposes operation, charge and command review', () => {
  const navigate = jest.fn();
  const controller = control({draft: {...createDraft(), step: 3}, runtime: {devices: {available: true, complete: true, items: [{id: 50, alias: 'Garçom', people: '/people/4', type: 'PDV', device: {id: 30}, configs: {'pos-operation-mode': 'waiter', 'check-order-type': 'tab', 'order-charge-enabled': false}}]}}});
  let tree;
  act(() => {tree = renderer.create(<OnboardingContent company={{id: 4, name: 'Example'}} access="manage" palette={palette} controller={controller} navigation={{navigate}} />);});
  expect(text(tree)).toContain('Comanda');
  expect(text(tree)).toContain('Desabilitada neste device');
  act(() => {tree.root.findByProps({testID: 'setup-device-50'}).props.onPress();});
  expect(navigate).toHaveBeenCalledWith('DeviceDetail', {deviceId: 30});
  expect(text(tree)).toContain('comandos');
  tree.unmount();
});

test('preview displays guidance but disables module mutations and completion', () => {
  const navigate = jest.fn();
  const controller = control({draft: {...createDraft(), step: 3}});
  let tree;
  act(() => {tree = renderer.create(<OnboardingContent company={{id: 4}} access="preview" palette={palette} controller={controller} navigation={{navigate}} />);});
  expect(tree.root.findByProps({testID: 'setup-route-DevicesIndex'}).props.disabled).toBe(true);
  expect(tree.root.findByProps({testID: 'setup-review-device'}).props.disabled).toBe(true);
  expect(text(tree)).toContain('Pré-visualização');
  tree.unmount();
});

test('review never describes existing records or local checkboxes as operational activation', () => {
  const controller = control({draft: {...createDraft(), step: 5, reviewed: {company: true, team: true, catalog: true, device: true}}});
  let tree;
  act(() => {tree = renderer.create(<OnboardingContent company={{id: 4}} access="manage" palette={palette} controller={controller} navigation={{navigate: jest.fn()}} />);});
  expect(text(tree)).toContain('Revisão local');
  expect(text(tree)).toContain('validação funcional');
  tree.unmount();
});
