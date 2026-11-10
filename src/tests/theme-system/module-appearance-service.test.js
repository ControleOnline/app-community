import {api} from '@controleonline/ui-common/src/api';
import {appearanceChanges, loadModuleAppearance, mergeModuleGroups, moduleAppearanceContext, saveModuleAppearance} from '../../components/theme-editor/moduleAppearanceService';
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: jest.fn()}}));
jest.mock('../../components/theme-editor/themeService', () => ({editorContext: () => 'local'}));
beforeEach(() => api.fetch.mockReset());

test('merges home and toolbar entries without discarding routes in a repeated category', () => {
  const groups = mergeModuleGroups([{id: 3, menus: [{id: 1, menuType: 'home'}]},
    {id: 3, menus: [{id: 2, menuType: 'toolbar'}]}]);
  expect(groups).toHaveLength(1);expect(groups[0].menus.map(item => item.id)).toEqual([1, 2]);
});

test('loads every page, including disabled menus, and retains route identity', async () => {
  const row = id => ({id, category: {id: 3, name: 'Financeiro', color: '#123456'},
    route: {id: 42, route: 'FinancialHubPage', icon: 'dollar-sign', color: '#0284c7'}, enabled: false});
  api.fetch.mockResolvedValueOnce({member: Array.from({length: 200}, (_, i) => row(i + 1)), totalItems: 201})
    .mockResolvedValueOnce({member: [row(201)], totalItems: 201});
  const groups = await loadModuleAppearance(moduleAppearanceContext());
  expect(api.fetch).toHaveBeenCalledTimes(2);
  expect(groups[0].menus).toHaveLength(201);
  expect(groups[0].menus[0]).toMatchObject({routeId: 42, route: 'FinancialHubPage', color: '#0284c7', enabled: false});
  expect(api.fetch.mock.calls.every(([, options]) => !options.method)).toBe(true);
});

test('a route save sends only changed existing appearance fields to the menu endpoint', async () => {
  const original = {id: 99, routeId: 42, color: '#123456', icon: 'users'};
  api.fetch.mockResolvedValueOnce({id: 99});
  await saveModuleAppearance({kind: 'route', original,
    draft: {...original, color: '#abcdef', textColor: '#ffffff', iconColor: '#000000', iconBackgroundColor: '#112233', sortOrder: 99},
    palette: {}, context: moduleAppearanceContext()});
  expect(api.fetch).toHaveBeenCalledWith('menu-config/99', {method: 'PATCH', body: {color: '#abcdef'}});
  expect(original.color).toBe('#123456');
});

test('category saving never includes preview colors or changes its company or order', async () => {
  const original = {id: 3, color: '#123456', icon: 'users'};
  await saveModuleAppearance({kind: 'category', original, draft: {...original, icon: 'grid', textColor: '#ffffff', company: 9},
    palette: {}, context: moduleAppearanceContext()});
  expect(api.fetch).toHaveBeenCalledWith('menu-config/categories/3', {method: 'PATCH', body: {icon: 'grid'}});
});

test('temporary properties alone do not trigger any request', async () => {
  const original = {id: 3, color: '#123456', icon: 'users'};
  await saveModuleAppearance({kind: 'category', original, draft: {...original, textColor: '#ffffff', iconColor: '#abcdef'},
    palette: {}, context: moduleAppearanceContext()});
  expect(api.fetch).not.toHaveBeenCalled();
});

test('invalid colors and stale contexts cannot write, while references keep their original form', async () => {
  const original = {id: 3, color: '#123456', icon: 'users'};
  expect(appearanceChanges(original, {...original, color: '$primary'}, {primary: '#abcdef'})).toEqual({color: '$primary'});
  await expect(saveModuleAppearance({kind: 'category', original, draft: {...original, color: '$missing'}, palette: {},
    context: moduleAppearanceContext()})).rejects.toThrow('cor válida');
  await expect(saveModuleAppearance({kind: 'category', original, draft: {...original, color: '#ffffff'}, palette: {},
    context: 'another-domain'})).rejects.toThrow('contexto');
  expect(api.fetch).not.toHaveBeenCalled();
});
