import React from 'react';
import renderer, {act} from 'react-test-renderer';
const {beforeAll, beforeEach, expect, it} = global;
const {jest} = require('@jest/globals');

let mockMainCompany;
let mockCurrentCompany;
jest.mock('react-native', () => ({Image: 'Image', Text: 'Text', View: 'View', StyleSheet: {create: value => value}}));
jest.mock('@store', () => ({useStore: () => ({getters: {
  mainCompany: mockMainCompany,
  currentCompany: mockCurrentCompany,
}})}));
jest.mock('@controleonline/ui-default/src/react/components/files/DefaultFile', () => 'DefaultFile');
const ManagerBrand = require('../../components/manager-preview/ManagerBrand').default;

const render = props => {
  let tree;
  act(() => {tree = renderer.create(<ManagerBrand colors={{}} {...props} />);});
  return tree;
};
beforeAll(() => {global.IS_REACT_ACT_ENVIRONMENT = true;});
beforeEach(() => {
  mockMainCompany = {id: 3, alias: 'LAVE-GO - FRANQUIAS', logo: {id: 1}, icon: {id: 2}};
  mockCurrentCompany = {id: 99, alias: 'Franquia selecionada', logo: {id: 99}, icon: {id: 98}};
});

it('uses the selected company logo and label in the drawer', () => {
  const tree = render();
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 99});
  expect(tree.root.findByType('DefaultFile').props.company).toBe(mockCurrentCompany);
  expect(JSON.stringify(tree.toJSON())).toContain('Franquia selecionada');
  expect(JSON.stringify(tree.toJSON())).not.toContain('LAVE-GO - FRANQUIAS');
});
it('prefers the icon in the compact home link, with logo as an alternative', () => {
  const tree = render({home: true});
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 98});
  mockCurrentCompany = {...mockCurrentCompany, icon: null};
  act(() => tree.update(<ManagerBrand colors={{}} home />));
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 99});
});
it('keeps the existing image when the owner has no media or a download fails', () => {
  const tree = render();
  act(() => tree.root.findByType('DefaultFile').props.onLoad());
  expect(tree.root.findAllByType('Image')).toHaveLength(0);
  act(() => tree.root.findByType('DefaultFile').props.onError());
  expect(tree.root.findAllByType('DefaultFile')).toHaveLength(0);
  expect(tree.root.findAllByType('Image')).toHaveLength(1);
  mockMainCompany = null;
  mockCurrentCompany = null;
  act(() => tree.update(<ManagerBrand colors={{}} />));
  expect(JSON.stringify(tree.toJSON())).toContain('On Manager');
});
it('keeps the existing mark when no logo or icon is configured', () => {
  mockMainCompany = {id: 3, alias: 'Empresa sem marca'};
  mockCurrentCompany = {id: 99, alias: 'Franquia sem marca'};
  const tree = render();
  expect(tree.root.findAllByType('DefaultFile')).toHaveLength(0);
  expect(tree.root.findAllByType('Image')).toHaveLength(1);
});
it('updates the brand when the selected company changes without changing the domain', () => {
  const tree = render();
  act(() => tree.root.findByType('DefaultFile').props.onError());
  mockCurrentCompany = {id: 7, alias: 'Outra franquia', logo: {id: 7}};
  act(() => tree.update(<ManagerBrand colors={{}} />));
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 7});
  expect(JSON.stringify(tree.toJSON())).toContain('Outra franquia');
});

it('uses domain media when the selected company has none, while preserving the selected label', () => {
  mockCurrentCompany = {id: 99, alias: 'Franquia sem marca'};
  const tree = render();
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 1});
  expect(tree.root.findByType('DefaultFile').props.company).toBe(mockMainCompany);
  expect(JSON.stringify(tree.toJSON())).toContain('Franquia sem marca');
});
it('uses the domain identity while there is no selected company', () => {
  mockCurrentCompany = null;
  const tree = render({home: true});
  expect(tree.root.findByType('DefaultFile').props.file).toEqual({id: 2});
  expect(tree.root.findByType('DefaultFile').props.company).toBe(mockMainCompany);
});
