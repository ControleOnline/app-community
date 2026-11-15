import React from 'react';
import renderer, {act} from 'react-test-renderer';

let mockType = 'SHOP';
let mockBase = 'ADMIN';
jest.mock('@appType', () => ({get app_type() {return mockType;}, get app_type_base() {return mockBase;}}));
jest.mock('react-native', () => ({Platform: {OS: 'web'}, StyleSheet: {create: value => value}, View: 'View'}));
jest.mock('../../components/HeaderAppTypeSwitcher', () => 'HeaderAppTypeSwitcher');

const load = () => require('../../components/ShopAppTypeSwitcherOverlay');
const render = () => {
  const Overlay = load().default;
  let tree; act(() => {tree = renderer.create(<Overlay><child/></Overlay>);});
  return tree;
};

it.each([['SHOP', 'ADMIN', 1], ['MANAGER', 'ADMIN', 0], ['SHOP', 'SHOP', 0]])(
  'type %s on base %s renders %s switcher(s)', (type, base, count) => {
    mockType = type; mockBase = base;
    const tree = render();
    expect(tree.root.findAllByType('HeaderAppTypeSwitcher')).toHaveLength(count);
    expect(tree.root.findAllByType('child')).toHaveLength(1);
  });
