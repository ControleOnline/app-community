import React from 'react';
import renderer, {act} from 'react-test-renderer';
import FooterText from '@controleonline/ui-common/src/react/components/RuntimeFooterMarqueeText';
import softStats from '@controleonline/ui-manager/src/react/pages/home/soft.styles';
import softGrid from '@controleonline/ui-layout/src/react/components/AppMenuGrid.soft.styles';
import homeSpacing from '@controleonline/ui-common/src/react/components/RuntimeInfoFooter.home.spacing';

jest.mock('react-native', () => ({
  Platform: {OS: 'android'}, View: 'View', Text: 'Text', StyleSheet: {create: value => value},
  Animated: {View: 'AnimatedView', Value: class {
    stopAnimation() {}
    setValue() {}
  }},
}));
beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true;});

it.each([1, 0])('keeps upstream native text intrinsic despite inherited flex: %s', inheritedFlex => {
  let tree;
  act(() => {tree = renderer.create(<FooterText text="MANAGER / v1.10.56"
    style={{flex: inheritedFlex, minWidth: 0}} color="#637287" />);});
  const text = tree.root.findByType('Text');
  const style = Object.assign({}, ...text.props.style);
  expect(style.flex).toBe(0);
  expect(style.flexBasis).toBe('auto');
  expect(text.props.children).toBe('MANAGER / v1.10.56');
  expect(tree.root.findAllByType('Text')).toHaveLength(1);
  expect(tree.root.findByType('AnimatedView').props.style.justifyContent)
    .toBe('center');
  act(() => tree.unmount());
});

it('centers indicators while preserving left-aligned module cards', () => {
  expect(softStats({}, 393).statCard).toMatchObject({justifyContent: 'center', alignContent: 'center', alignItems: 'center'});
  expect(softStats({}, 1280).statCard.justifyContent).toBe('flex-start');
  const mobile = softGrid({colors: {}, width: 393});
  expect(mobile.card.justifyContent).toBe('flex-start');
  expect(mobile.cardLabel).toMatchObject({flex: 1, flexShrink: 1, textAlign: 'left'});
  expect(softGrid({colors: {}, width: 1280}).cardLabel.flex).toBe(1);
});

it('balances footer content without removing the native safe area or changing legacy consumers', () => {
  expect(homeSpacing('soft', 'android', 0)).toEqual({contentPadding: 4, safeAreaBottom: 0});
  expect(homeSpacing('soft', 'android', 24)).toEqual({contentPadding: 4, safeAreaBottom: 24});
  expect(homeSpacing('soft', 'web', 24).safeAreaBottom).toBe(0);
  expect(homeSpacing('legacy', 'android', 24)).toBeNull();
});
