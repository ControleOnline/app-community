import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ModuleAppearanceCatalog from '../../components/theme-editor/ModuleAppearanceCatalog';
import {loadModuleAppearance, saveModuleAppearance} from '../../components/theme-editor/moduleAppearanceService';
let mockSuper = false;
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: jest.fn()}}));
jest.mock('@appType', () => ({app_type: 'MANAGER', app_type_base: 'ADMIN'}));
jest.mock('@store', () => ({useStore: name => name === 'auth' ? {getters: {user: {roles: mockSuper ? ['ROLE_SUPER'] : []}}} :
  name === 'people' ? {getters: {currentCompany: {id: 5}}} : {actions: {setMenus: jest.fn()}}}));
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('../../components/theme-editor/NativeColorInput', () => 'ColorPicker');
jest.mock('@controleonline/ui-default/src/react/components/inputs/DefaultFeatherIconPicker', () => 'IconPicker');
jest.mock('../../components/theme-editor/moduleAppearanceService', () => ({
  ...jest.requireActual('../../components/theme-editor/moduleAppearanceService'),
  moduleAppearanceContext: () => 'local', loadModuleAppearance: jest.fn(), saveModuleAppearance: jest.fn(), refreshModuleMenus: jest.fn(),
}));
const groups = [{id: 3, label: 'Financeiro', color: '#020202', icon: 'grid', menus: [
  {id: 99, routeId: 42, label: 'Centro financeiro', route: 'FinancialHubPage', color: '#0284c7', icon: 'dollar-sign', menuType: 'home'},
  {id: 100, routeId: 43, label: 'Resultados', route: 'IncomeStatement', color: '#16a34a', icon: 'bar-chart-2', menuType: 'toolbar'},
]}];
const palette = {cardBackground: '#ffffff', cardText: '#111111', navigationActiveText: '#222222', navigationActiveBackground: '#dddddd',
  navigationIcon: '#333333', navigationActiveIcon: '#444444', listItemText: '#555555', listItemIcon: '#666666', textMuted: '#777777'};
const view = () => <ModuleAppearanceCatalog menus={groups} palette={palette} enabled colors={palette} />;
const expand = async (tree, label) => act(async () => {
  const header = tree.root.findByProps({accessibilityLabel: label});
  if (!header.props.accessibilityState.expanded) header.props.onPress();
});
const openRoute = async tree => {
  await expand(tree, 'Categoria: Financeiro');
  await expand(tree, 'Rota: Centro financeiro');
};
beforeEach(() => {mockSuper = false;loadModuleAppearance.mockReset().mockResolvedValue(groups);saveModuleAppearance.mockReset().mockResolvedValue({id: 99});});

test('ordinary users see routes and all previews without requesting the privileged catalog', async () => {
  let tree;await act(async () => {tree = renderer.create(view());});
  expect(loadModuleAppearance).not.toHaveBeenCalled();
  expect(tree.root.findByProps({accessibilityLabel: 'Categoria: Financeiro'}).props.accessibilityState.expanded).toBe(false);
  await openRoute(tree);
  expect(tree.root.findAllByProps({accessibilityLabel: 'Rota: Resultados'})).toHaveLength(1);
  for (const mode of ['list', 'grid', 'sidebar']) expect(tree.root.findByProps({testID: `module-preview-${mode}`})).toBeDefined();
  const input = tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'});
  expect(input.props.editable).toBe(false);
  expect(tree.root.findAllByType('Pressable').some(node => node.props.accessibilityLabel?.startsWith('Salvar cadastro'))).toBe(false);
  await expand(tree, 'Rota — cores adicionais');
  const temporary = tree.root.findByProps({accessibilityLabel: 'Rota — cor do texto'});
  await act(async () => temporary.props.onChangeText('#abcdef'));
  expect(saveModuleAppearance).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

test('super administrators can draft colors and icons; saving requires an explicit press', async () => {
  mockSuper = true;
  let tree;await act(async () => {tree = renderer.create(view());});
  expect(loadModuleAppearance).toHaveBeenCalledWith('local');
  await openRoute(tree);
  await expand(tree, 'Rota — cores adicionais');
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.onChangeText('#abcdef'));
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Rota — cor do texto'}).props.onChangeText('#ffffff'));
  expect(saveModuleAppearance).not.toHaveBeenCalled();
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Salvar cadastro: Centro financeiro'}).props.onPress());
  expect(saveModuleAppearance).toHaveBeenCalledTimes(1);
  expect(saveModuleAppearance).toHaveBeenCalledWith(expect.objectContaining({kind: 'route',
    original: expect.objectContaining({id: 99, routeId: 42}), draft: expect.objectContaining({color: '#abcdef', textColor: '#ffffff'})}));
  expect(tree.root.findAllByType('Text').some(node => node.children.join('').includes('Campos de prévia não foram gravados'))).toBe(true);
  await act(async () => tree.unmount());
});

test('an access-denied catalog stays read-only and a denied save keeps the draft', async () => {
  mockSuper = true;loadModuleAppearance.mockRejectedValueOnce(new Error('Forbidden'));
  let tree;await act(async () => {tree = renderer.create(view());});
  await openRoute(tree);
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.editable).toBe(false);
  await act(async () => tree.unmount());
  saveModuleAppearance.mockRejectedValueOnce(new Error('Sem permissão'));
  await act(async () => {tree = renderer.create(view());});
  await openRoute(tree);
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.onChangeText('#abcdef'));
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Salvar cadastro: Centro financeiro'}).props.onPress());
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.value).toBe('#abcdef');
  expect(tree.root.findAllByProps({accessibilityRole: 'alert'}).some(node => node.children.join('').includes('Sem permissão'))).toBe(true);
  await act(async () => tree.unmount());
});

test('category, route and additional-color folding preserves drafts without saving', async () => {
  mockSuper = true;
  loadModuleAppearance.mockResolvedValueOnce([...groups, {id: 4, label: 'Comercial', icon: 'users', color: '#ffffff', menus: []}]);
  let tree;await act(async () => {tree = renderer.create(view());});
  await openRoute(tree);
  expect(tree.root.findAllByProps({accessibilityLabel: 'Rota — cor do texto'})).toHaveLength(0);
  await expand(tree, 'Rota — cores adicionais');
  await act(async () => {
    tree.root.findByProps({accessibilityLabel: 'Categoria — cor cadastrada (fundo)'}).props.onChangeText('#112233');
    tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.onChangeText('#abcdef');
    tree.root.findByProps({accessibilityLabel: 'Rota — cor do texto'}).props.onChangeText('#ffffff');
    tree.root.findByProps({accessibilityLabel: 'Rota — ícone'}).props.onChange('users');
  });
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Rota — cores adicionais'}).props.onPress());
  expect(tree.root.findAllByProps({accessibilityLabel: 'Rota — cor do texto'})).toHaveLength(0);
  await expand(tree, 'Rota — cores adicionais');
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — cor do texto'}).props.value).toBe('#ffffff');
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Rota: Centro financeiro'}).props.onPress());
  expect(tree.root.findAllByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'})).toHaveLength(0);
  await expand(tree, 'Rota: Resultados');
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.value).toBe('#16a34a');
  await expand(tree, 'Rota: Centro financeiro');
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Categoria: Financeiro'}).props.onPress());
  expect(tree.root.findAllByProps({accessibilityLabel: 'Rota: Centro financeiro'})).toHaveLength(0);
  await expand(tree, 'Categoria: Comercial');
  await expand(tree, 'Categoria: Financeiro');
  expect(tree.root.findByProps({accessibilityLabel: 'Categoria — cor cadastrada (fundo)'}).props.value).toBe('#112233');
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.value).toBe('#abcdef');
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — ícone'}).props.value).toBe('users');
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — cor do texto'}).props.value).toBe('#ffffff');
  expect(saveModuleAppearance).not.toHaveBeenCalled();
  await act(async () => tree.root.findByProps({accessibilityLabel: 'Descartar prévia: Centro financeiro'}).props.onPress());
  expect(tree.root.findByProps({accessibilityLabel: 'Rota — cor cadastrada (fundo)'}).props.value).toBe('#0284c7');
  expect(tree.root.findByProps({accessibilityLabel: 'Categoria — cor cadastrada (fundo)'}).props.value).toBe('#112233');
  await act(async () => tree.unmount());
});

test('authorized users can save only additional colors when the API supports them, and reload the saved values', async () => {
  mockSuper=true;
  const migrated=[{...groups[0],textColor:null,iconColor:null,menus:groups[0].menus.map(item=>({...item,textColor:null,iconColor:null,iconBackgroundColor:null}))}];
  loadModuleAppearance.mockResolvedValue(migrated);
  let tree;await act(async()=>{tree=renderer.create(view());});
  await openRoute(tree);await expand(tree,'Rota — cores adicionais');
  const field=()=>tree.root.findByProps({accessibilityLabel:'Rota — cor do texto'});
  expect(field().props.editable).toBe(true);
  await act(async()=>field().props.onChangeText('#ffffff'));
  const saved=[{...migrated[0],menus:migrated[0].menus.map(item=>({...item,textColor:'#ffffff'}))}];
  loadModuleAppearance.mockResolvedValue(saved);
  const save=tree.root.findByProps({accessibilityLabel:'Salvar cadastro: Centro financeiro'});
  expect(save.props.disabled).toBe(false);
  await act(async()=>save.props.onPress());
  expect(saveModuleAppearance).toHaveBeenCalledWith(expect.objectContaining({kind:'route',draft:expect.objectContaining({textColor:'#ffffff'})}));
  await act(async()=>tree.root.findByProps({accessibilityLabel:'Rota: Centro financeiro'}).props.onPress());
  await openRoute(tree);
  expect(field().props.value).toBe('#ffffff');
  await act(async()=>tree.unmount());
});
