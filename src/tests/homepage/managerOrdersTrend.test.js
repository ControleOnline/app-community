import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerOrdersTrend from '../../components/manager-preview/ManagerOrdersTrend';

jest.mock('react-native', () => ({
  ScrollView: 'ScrollView', View: 'View', Text: 'Text', ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {create: x => x},
}));
jest.mock('@expo/vector-icons', () => ({MaterialCommunityIcons: 'Icon'}));

it('keeps the full history in one scrollable row with a common scale and no visible zero bar', () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const items = Array.from({length: 14}, (_, i) => ({key: String(i), label: `Mês ${i}`, orders: i}));
  let tree;
  act(() => {tree = renderer.create(<ManagerOrdersTrend items={items} ppcColors={{panelBg: '#ffffff'}} accentColor="#ff9900" />);});
  const row = tree.root.findByProps({accessibilityLabel: 'Pedidos concluídos por período'});
  expect(row.props.style.flexDirection).toBe('row');
  expect(row.props.children).toHaveLength(14);
  expect(tree.root.findByType('ScrollView').props.horizontal).toBe(true);
  const fills = row.findAllByType('View').filter(node => Array.isArray(node.props.style) && node.props.style[1]?.minHeight === 0);
  expect(fills).toHaveLength(14);
  expect(fills[0].props.style[1].height).toBe(0);
  expect(fills[13].props.style[1].height).toBe(118);
  expect(fills.every(node => node.props.style[1].height <= 118)).toBe(true);
  act(() => tree.unmount());
});
