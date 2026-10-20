/* global jest, beforeEach, afterEach, it, expect */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import TranslationsReviewPage from '@controleonline/ui-translate/src/react/pages/TranslationsReviewPage';

const mockFetch = jest.fn();
const mockShowError = jest.fn();
const mockPeople = {getters: {currentCompany: {id: 7}, mainCompany: {id: 7}}};
const mockTheme = {getters: {colors: {}}};
jest.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator', RefreshControl: 'RefreshControl',
  ScrollView: 'ScrollView', Text: 'Text', TouchableOpacity: 'TouchableOpacity', View: 'View',
  Platform: {select: value => value.web}, StyleSheet: {create: value => value},
}));
jest.mock('react-native-safe-area-context', () => ({SafeAreaView: 'SafeAreaView'}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
}));
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: (...args) => mockFetch(...args)}}));
jest.mock('@controleonline/ui-crm/src/react/hooks/useToastMessage', () => () => ({
  showError: mockShowError, showSuccess: jest.fn(),
}));
jest.mock('@store', () => ({useStore: name => name === 'people' ? mockPeople : mockTheme}));
// Native controls are boundaries; page, operations and normalization stay real.
jest.mock('@controleonline/ui-default/src/react/components/filters/DefaultExternalFilters', () => 'ExternalFilters');
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTable', () => 'TranslationTable');
jest.mock('@controleonline/ui-translate/src/react/pages/TranslationReviewRow', () => 'TranslationRow');

let tree;
beforeEach(() => {
  mockPeople.getters.currentCompany = {id: 7};
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockFetch.mockReset();
  mockShowError.mockClear();
  mockFetch.mockImplementation(async path => path === '/languages'
    ? {member: [{id: 1, language: 'pt-br'}]}
    : {member: [], totalItems: 0, summary: {total: 0}});
});
afterEach(() => {
  if (tree) act(() => tree.unmount());
  tree = null;
});
const mount = () => act(async () => {tree = renderer.create(React.createElement(TranslationsReviewPage));});
const externalFilters = () => tree.root.findByType('ExternalFilters');

it('does not present main-company records as inherited in the summary', async () => {
  await mount();
  expect(tree.root.findAllByType('Text').map(node => node.props.children)).not.toContain('Fallbacks');
});

it('retains the inheritance summary for a different active company', async () => {
  mockPeople.getters.currentCompany = {id: 8};
  await mount();
  expect(tree.root.findAllByType('Text').map(node => node.props.children)).toContain('Herdadas');
});

it('renders the review and applies external filters through shared operations', async () => {
  await mount();
  expect(tree.root.findByType('TranslationTable').props.data).toEqual([]);
  await act(async () => externalFilters().props.onChangeFilters({
    language: 'en', review: 'all', store: 'product', type: 'title',
  }));
  expect(externalFilters().props.filters).toEqual({
    language: 'en', review: 'all', store: 'product', type: 'title',
  });
  expect(mockFetch).toHaveBeenLastCalledWith('/translates/overview', {params: {
    people: 7, 'language.language': 'en', store: 'product', type: 'title',
  }});
  expect(mockShowError).not.toHaveBeenCalled();
});

it('keeps filters functional when an older API lacks the overview route', async () => {
  mockFetch.mockImplementation(async path => {
    if (path === '/languages') return {member: [{id: 1, language: 'pt-br'}]};
    if (path === '/translates/overview') throw {status: 404};
    return {member: [], totalItems: 0};
  });
  await mount();
  expect(tree.root.findByType('TranslationTable').props.data).toEqual([]);
  expect(mockFetch).toHaveBeenCalledWith('/translates', {params: {
    people: 7, 'language.language': 'pt-br', page: 1,
  }});
  mockFetch.mockClear();
  await act(async () => externalFilters().props.onChangeFilters({language: 'en', review: 'all'}));
  expect(mockFetch.mock.calls.filter(([path]) => path === '/translates')).toHaveLength(1);
  expect(mockFetch.mock.calls.some(([path]) => path === '/translates/overview')).toBe(false);
  expect(mockFetch).toHaveBeenCalledWith('/translates', {params: {
    people: 7, 'language.language': 'en', page: 1,
  }});
  expect(mockShowError).not.toHaveBeenCalled();
});

it('provides plain string labels and values for store and type selectors', async () => {
  mockFetch.mockImplementation(async path => path === '/languages'
    ? {member: [{id: 1, language: 'pt-br'}]}
    : {member: [
      {rowId: 'one', store: 'product', type: 'title'},
      {rowId: 'two', store: 'product', type: 'description'},
    ], summary: {total: 2}});
  await mount();
  const getOptions = externalFilters().props.getOptionsForColumn;
  expect(getOptions({name: 'store'})).toEqual([{value: 'product', label: 'product'}]);
  expect(getOptions({key: 'type'})).toEqual([
    {value: 'title', label: 'title'},
    {value: 'description', label: 'description'},
  ]);
});

it('keeps all 1073 review records available through bounded shared pages', async () => {
  const items = Array.from({length: 1073}, (_, index) => ({rowId: String(index + 1), store: 'product', type: 'title'}));
  mockFetch.mockImplementation(async path => path === '/languages'
    ? {member: [{id: 1, language: 'pt-br'}]}
    : {member: items, summary: {total: 1073}});
  await mount();
  const table = tree.root.findByType('TranslationTable');
  expect(table.props).toMatchObject({paginationMode: 'pages', pageSize: 20, totalItems: 1073});
  expect(table.props.data).toHaveLength(1073);
  expect(table.props.data.at(-1).rowId).toBe('1073');
});
