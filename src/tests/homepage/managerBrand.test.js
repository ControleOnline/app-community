import React from 'react';
import renderer, {act} from 'react-test-renderer';
const {beforeAll, beforeEach, expect, it} = global;
const {jest} = require('@jest/globals');

let mockMainCompany;
jest.mock('react-native', () => ({Image: 'Image', Text: 'Text', View: 'View', StyleSheet: {create: value => value}}));
jest.mock('@store', () => ({useStore: () => ({getters: {
  mainCompany: mockMainCompany,
  currentCompany: {id: 99, alias: 'Outra franquia', logo: {id: 99}},
}})}));
jest.mock('@controleonline/ui-default/src/react/components/files/DefaultFile', () => 'DefaultFile');
const ManagerBrand = require('../../components/manager-preview/ManagerBrand').default;

const render = props => {
  let tree;
  act(() => {tree = renderer.create(<ManagerBrand colors={{}} {...props} />);});
  return tree;
};
beforeAll(() => {global.IS_REACT_ACT_ENVIRONMENT = true;});
beforeEach(() => {mockMainCompany = {id: 3, alias: 'LAVE-GO - FRANQUIAS', logo: {id: 1}, icon: {id: 2}};});

it('uses the application owner logo in the drawer, independently of the selected franchise', () => {
  const tree = render();
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 1});
  expect(tree.root.findByType('DefaultFile').props.company).toBe(mockMainCompany);
  expect(JSON.stringify(tree.toJSON())).toContain('LAVE-GO - FRANQUIAS');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Outra franquia');
});
it('prefers the icon in the compact home link, with logo as an alternative', () => {
  const tree = render({home: true});
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 2});
  mockMainCompany = {...mockMainCompany, icon: null};
  act(() => tree.update(<ManagerBrand colors={{}} home />));
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 1});
});
it('keeps the existing image when the owner has no media or a download fails', () => {
  const tree = render();
  act(() => tree.root.findByType('DefaultFile').props.onLoad());
  expect(tree.root.findAllByType('Image')).toHaveLength(0);
  act(() => tree.root.findByType('DefaultFile').props.onError());
  expect(tree.root.findAllByType('DefaultFile')).toHaveLength(0);
  expect(tree.root.findAllByType('Image')).toHaveLength(1);
  mockMainCompany = null;
  act(() => tree.update(<ManagerBrand colors={{}} />));
  expect(JSON.stringify(tree.toJSON())).toContain('On Manager');
});
it('keeps the existing mark when no logo or icon is configured', () => {
  mockMainCompany = {id: 3, alias: 'Empresa sem marca'};
  const tree = render();
  expect(tree.root.findAllByType('DefaultFile')).toHaveLength(0);
  expect(tree.root.findAllByType('Image')).toHaveLength(1);
});
it('updates the brand when the application owner changes without changing stores', () => {
  const tree = render();
  mockMainCompany = {id: 1, alias: 'CONTROLE ONLINE', logo: {id: 7}};
  act(() => tree.update(<ManagerBrand colors={{}} />));
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 7});
  expect(JSON.stringify(tree.toJSON())).toContain('CONTROLE ONLINE');
});
