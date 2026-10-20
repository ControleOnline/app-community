const React = require('react');
const renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
let mockStore;
jest.mock('@store', () => ({useStore: () => mockStore}));
jest.mock('@controleonline/ui-common/src/react/utils/storeColumns', () => ({formatStoreColumnLabel: () => ''}));
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: props => React.createElement('View', props, props.children),
    Text: props => React.createElement('Text', props, props.children),
    // Expose mount identity: RN FlatList cannot accept a new column count in-place.
    FlatList: props => {
      const identity = React.useRef({});
      const initialColumns = React.useRef(props.numColumns);
      if (initialColumns.current !== props.numColumns) throw Error('FlatList column count changed without remount');
      return React.createElement('List', {identity: identity.current, numColumns: props.numColumns});
    },
    StyleSheet: {create: value => value}, Platform: {select: value => value.web},
    useWindowDimensions: () => ({width:390,height:844}),
  };
});
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableInput', () => () => null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableEmptyState', () => () => null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableRowActions', () => ({__esModule: true, default: () => null, hasDefaultTableRowActionsComponent: () => false}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme', () => () => ({palette: {}}));
const Cards = require('@controleonline/ui-default/src/react/components/table/DefaultTableCards').default;

it.each([{key: 'catalog'}, {listKey: 'catalog'}, {}])(
  'remounts on column change even with caller identity %j, preserving mounts for row refresh',
  identity => {
    mockStore = {getters: {items: [{id: 1}], columns: [], configs: {
      cardListProps: {...identity, numColumns: 2}, renderCard: () => null,
    }}};
    let tree;
    renderer.act(() => {tree = renderer.create(React.createElement(Cards, {storeName: 'categories'}));});
    const firstMount = tree.root.findByType('List').props.identity;
    mockStore.getters.configs.cardListProps = {...identity, numColumns: 1};
    renderer.act(() => tree.update(React.createElement(Cards, {storeName: 'categories'})));
    const secondMount = tree.root.findByType('List').props.identity;
    expect(secondMount).not.toBe(firstMount);
    mockStore.getters.items = [{id: 1}, {id: 2}];
    renderer.act(() => tree.update(React.createElement(Cards, {storeName: 'categories'})));
    expect(tree.root.findByType('List').props.identity).toBe(secondMount);
    renderer.act(() => tree.unmount());
  },
);

it.each([[undefined, 1], [1, undefined]])(
  'keeps implicit and explicit single-column configs interchangeable: %s to %s',
  (from, to) => {
    mockStore = {getters: {items: [], columns: [], configs: {
      cardListProps: {key: 'catalog', numColumns: from}, renderCard: () => null,
    }}};
    let tree;
    renderer.act(() => {tree = renderer.create(React.createElement(Cards, {storeName: 'categories'}));});
    const firstMount = tree.root.findByType('List').props.identity;
    mockStore.getters.configs.cardListProps = {key: 'catalog', numColumns: to};
    expect(() => renderer.act(() => tree.update(React.createElement(Cards, {storeName: 'categories'})))).not.toThrow();
    expect(tree.root.findByType('List').props.identity).toBe(firstMount);
    expect(tree.root.findByType('List').props.numColumns).toBe(1);
    renderer.act(() => tree.unmount());
  },
);
