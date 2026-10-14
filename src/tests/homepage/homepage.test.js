import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {resolveHomepagePalette} from '../../styles/homepagePalette';
import createStyles from '@controleonline/ui-layout/src/react/components/AppMenuGrid.styles';
import legacyStyles from './fixtures/AppMenuGrid.styles';
import Grid from '@controleonline/ui-layout/src/react/components/AppMenuGrid';
import {usesSoftHomepage} from '../../pages/homeAppearance';

let mockWidth = 393;
let mockInteraction = {hovered: false, focused: false, pressed: false};
const mockColors = {primary: '#7777ff', cardIconBackground: '#7777ff',
  cardBackground: '#ffffff', textPrimary: '#203047', textSecondary: '#637287',
  cardText: '#203047', cardShadow: '#203047', iconMuted: '#637287',
  buttonFocusBorder: '#7777ff', buttonPressedBackground: '#eeeeff', dividerBorder: '#e5e9f2',
  cardBorder: '#e5e9f2', pageBackground: '#f6f7fb', iconBackground: '#000000', iconColor: '#ffffff'};
const mockMenus = [{id: 1, label: 'Operações', menuType: 'home', menus: [
  {id: 2, label: 'Pedidos', menuKey: 'orders', route: 'OrderHistoryPage',
    routeParams: {orderTypeFilter: 'purchase'}},
]}];
jest.mock('react-native', () => ({
  StyleSheet: {create: value => value}, View: 'View', Text: 'Text', TouchableOpacity: 'TouchableOpacity',
  Pressable: ({children, ...props}) => require('react').createElement('Pressable', props, children(mockInteraction)),
  useWindowDimensions: () => ({width: mockWidth}),
}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('@store', () => ({useStore: name => ({getters: name === 'theme'
  ? {colors: mockColors} : name === 'people' ? {currentCompany: {id: 3}} : {}})}));

describe('home-only appearance', () => {
  beforeEach(() => {
    mockWidth = 393;
    mockInteraction = {hovered: false, focused: false, pressed: false};
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });
  it.each([
    ['HomePage', 'MANAGER', 'soft', true],
    ['HomePage', 'ADMIN', 'soft', true],
    ['HomePage', 'POS', 'soft', false],
    ['OrderHistoryPage', 'MANAGER', 'soft', false],
    ['HomePage', 'MANAGER', undefined, false],
  ])('isolates chrome for %s/%s/%s', (route, type, appearance, expected) => {
    expect(usesSoftHomepage(route, type, appearance)).toBe(expected);
  });
  it.each([320, 393, 768, 1280])('preserves default grid styles at width %i', width => {
    expect(createStyles({colors: mockColors, width})).toEqual(legacyStyles({colors: mockColors, width}));
  });
  it.each([[320, '100%', true], [393, '50%', false], [768, `${100 / 3}%`, true], [1280, '25%', true]])(
    'adapts soft cards at %i without shrinking touch height', (width, basis, arrow) => {
      const styles = createStyles({colors: resolveHomepagePalette(mockColors), width, appearance: 'soft'});
      expect(styles.cardOuter.flexBasis).toBe(basis);
      expect(styles.card.minHeight).toBeGreaterThanOrEqual(64);
      expect(styles.showChevron).toBe(arrow);
    },
  );
  it('derives both identities without mutating shared tokens', () => {
    const input = Object.freeze({...mockColors});
    const gyros = resolveHomepagePalette(input);
    const lavego = resolveHomepagePalette({...input, cardIconBackground: '#ffb83e'});
    expect(gyros.cardIconBackground).not.toBe(lavego.cardIconBackground);
    expect(input.cardIconBackground).toBe('#7777ff');
    expect(gyros.cardBackground).toBe(input.cardBackground);
    expect(resolveHomepagePalette({...input, cardBorder: '#abc123'}).cardBorder).toBe('#abc123');
  });
  it('preserves destination and parameters in the real grid interaction', () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    const navigation = {navigate: jest.fn()};
    let tree;
    act(() => {tree = renderer.create(<Grid appearance="soft" menus={mockMenus} navigation={navigation} />);});
    const button = tree.root.findByType('Pressable');
    expect(button.props.accessibilityLabel).toBe('Pedidos');
    act(() => button.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('OrderHistoryPage', {orderTypeFilter: 'purchase'});
    expect(tree.root.findAllByType('Icon').some(icon => icon.props.name === 'chevron-right')).toBe(false);
    act(() => tree.unmount());
  });
  it('renders the existing empty state without inventing modules', () => {
    let tree;
    act(() => {tree = renderer.create(<Grid appearance="soft" menus={[]} />);});
    expect(tree.root.findAllByType('TouchableOpacity')).toHaveLength(0);
    expect(tree.root.findByType('Text').props.children).toBe('Nenhum menu disponivel.');
    act(() => tree.unmount());
  });
  it.each(['hovered', 'focused'])('highlights border and arrow on %s and restores them on exit', state => {
    mockWidth = 1280;
    const palette = resolveHomepagePalette(mockColors);
    let tree;
    const render = () => <Grid appearance="soft" colorTokens={palette} menus={mockMenus} />;
    act(() => {tree = renderer.create(render());});
    const arrow = () => tree.root.findAllByType('Icon').find(icon => icon.props.name === 'chevron-right');
    expect(arrow().props.color).toBe(palette.iconMuted);
    mockInteraction = {...mockInteraction, [state]: true};
    act(() => tree.update(render()));
    expect(arrow().props.color).toBe(palette.cardIconColor);
    expect(arrow().props.style[1].opacity).toBe(1);
    expect(tree.root.findAllByType('View').some(view => Array.isArray(view.props.style)
      && view.props.style.some(style => style?.borderColor === palette.buttonFocusBorder))).toBe(true);
    mockInteraction = {...mockInteraction, [state]: false};
    act(() => tree.update(render()));
    expect(arrow().props.color).toBe(palette.iconMuted);
    expect(arrow().props.style[1]).toBe(false);
    act(() => tree.unmount());
  });
  it('keeps the legacy consumer without hover behavior', () => {
    let tree;
    act(() => {tree = renderer.create(<Grid menus={mockMenus} />);});
    expect(tree.root.findAllByType('Pressable')).toHaveLength(0);
    expect(tree.root.findAllByType('TouchableOpacity')).toHaveLength(1);
    act(() => tree.unmount());
  });
});
