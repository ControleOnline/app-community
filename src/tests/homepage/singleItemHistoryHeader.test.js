import React from 'react';
import renderer, {act} from 'react-test-renderer';
const {beforeAll, expect, it} = global;
const {jest} = require('@jest/globals');
jest.mock('react-native', () => ({View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: {create: value => value}}));
const Header = require('../../components/single-item/SingleItemHistoryHeader').default;
const summary = {total: 76, statuses: [{id: 1, status: 'Open', quantity: 56}, {id: 2, status: 'Preparing', quantity: 20}]};
const render = props => {
  let tree;
  act(() => {tree = renderer.create(<Header summary={summary} colors={{}} {...props} />);});
  return tree;
};
beforeAll(() => {global.IS_REACT_ACT_ENVIRONMENT = true;});
it('shows the operational status counts without the redundant title and total', () => {
  const tree = render({canCreate: true});
  const text = tree.root.findAllByType('Text').map(node => node.props.children).flat().join('');
  expect(text).toContain('Open · 56');
  expect(text).toContain('Preparing · 20');
  expect(text).not.toContain('Pedidos');
  expect(text).not.toContain('76');
});
it('keeps the existing new-sale action available only when authorized', () => {
  const onNewSale = jest.fn();
  const tree = render({canCreate: true, onNewSale});
  act(() => tree.root.findByProps({accessibilityLabel: 'Nova venda'}).props.onPress());
  expect(onNewSale).toHaveBeenCalledTimes(1);
  act(() => tree.update(<Header summary={summary} colors={{}} canCreate={false} onNewSale={onNewSale} />));
  expect(tree.root.findAllByType('Pressable')).toHaveLength(0);
});
it('keeps new sale available when no pending status has a positive count', () => {
  const tree = render({summary: {total: 0, statuses: []}, canCreate: true});
  expect(tree.root.findAllByType('Pressable')).toHaveLength(1);
  expect(tree.root.findAllByProps({accessibilityLabel: 'Quantidade de pedidos por status'})).toHaveLength(0);
});
