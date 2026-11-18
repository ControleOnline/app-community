import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ModuleSourceEditor from '../../components/theme-editor/ModuleSourceEditor';
import {loadModuleAppearanceCached, saveModuleAppearance} from '../../components/theme-editor/moduleAppearanceService';
let mockSuper = false;
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: jest.fn()}}));
jest.mock('@appType', () => ({app_type: 'MANAGER', app_type_base: 'ADMIN'}));
jest.mock('@store', () => ({useStore: name => name === 'auth' ? {getters: {user: {roles: mockSuper ? ['ROLE_SUPER'] : []}}} :
  name === 'people' ? {getters: {currentCompany: {id: 5}}} : {actions: {setMenus: jest.fn()}}}));
jest.mock('../../components/theme-editor/NativeColorInput', () => 'ColorPicker');
jest.mock('../../components/theme-editor/moduleAppearanceService', () => ({
  ...jest.requireActual('../../components/theme-editor/moduleAppearanceService'),
  moduleAppearanceContext: () => 'local', loadModuleAppearanceCached: jest.fn(), saveModuleAppearance: jest.fn(), refreshModuleMenus: jest.fn(),
}));
const groups = [{id: 128, label: 'Financeiro', color: '#020202', categoryCardBackground: '#2c5484', menus: [
  {id: 99, routeId: 42, label: 'Centro financeiro', route: 'FinancialHubPage', color: '#0284c7', routeMenuBackground: null, routeMenuIcon: null, routeMenuText: null, menuType: 'home'}]}];
const sources = [
  {property: 'backgroundColor', source: 'category.categoryCardBackground', record: '128', value: '#2c5484'},
  {property: 'color', source: 'routes.routeMenuText', record: 'FinancialHubPage', value: '#ffffff'},
  {property: 'color', source: 'routes.routeCardText', record: 'FinancialHubPage', value: '#000000'},
];
const view = () => <ModuleSourceEditor sources={sources} palette={{}} colors={{}} />;
beforeEach(() => {mockSuper = false;loadModuleAppearanceCached.mockReset().mockResolvedValue(groups);saveModuleAppearance.mockReset().mockResolvedValue({id: 99});});

test('without ROLE_SUPER the sources stay read-only and nothing is loaded', async () => {
  let tree;await act(async () => {tree = renderer.create(view());});
  expect(loadModuleAppearanceCached).not.toHaveBeenCalled();
  expect(tree.root.findAllByType('TextInput')).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain('category.categoryCardBackground');
});

test('super administrators edit category and route sources and save per record', async () => {
  mockSuper = true;
  let tree;await act(async () => {tree = renderer.create(view());});
  expect(loadModuleAppearanceCached).toHaveBeenCalledWith('local');
  const input = tree.root.findByProps({accessibilityLabel: 'Categoria — category.categoryCardBackground'});
  expect(input.props.value).toBe('#2c5484');
  expect(tree.root.findAllByProps({accessibilityLabel: 'Rota — routes.routeMenuText'})).toHaveLength(1);
  // routeCardText is not returned by this (older) API record, so it remains read-only.
  expect(tree.root.findAllByProps({accessibilityLabel: 'Rota — routes.routeCardText'})).toHaveLength(0);
  await act(async () => input.props.onChangeText('#abcdef'));
  expect(saveModuleAppearance).not.toHaveBeenCalled();
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Salvar cadastro: Financeiro'}).props.onPress());
  expect(saveModuleAppearance).toHaveBeenCalledWith(expect.objectContaining({kind: 'category', original: groups[0],
    draft: expect.objectContaining({categoryCardBackground: '#abcdef'})}));
  await act(async () => tree.unmount());
});

test('selecting a sidebar button offers its three menu colors even when none is set', async () => {
  mockSuper = true;
  const record = {kind: 'route', record: 'FinancialHubPage', fields: ['routeMenuBackground', 'routeMenuIcon', 'routeMenuText']};
  let tree;await act(async () => {tree = renderer.create(<ModuleSourceEditor sources={[]} record={record} palette={{}} colors={{}} />);});
  for (const field of record.fields) {
    const input = tree.root.findByProps({accessibilityLabel: `Rota — routes.${field}`});
    expect(input.props.value).toBe('');
    expect(input.props.editable).toBe(true);
  }
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Rota — routes.routeMenuIcon'}).props.onChangeText('#abcdef'));
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Salvar cadastro: Centro financeiro'}).props.onPress());
  expect(saveModuleAppearance).toHaveBeenCalledWith(expect.objectContaining({kind: 'route',
    draft: expect.objectContaining({routeMenuIcon: '#abcdef'})}));
  await act(async () => tree.unmount());
});
