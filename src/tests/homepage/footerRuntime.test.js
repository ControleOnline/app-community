import React from 'react';
import renderer, {act} from 'react-test-renderer';
import Footer from '@controleonline/ui-common/src/react/components/RuntimeInfoFooter';

let mockTone = 'success';
const mockCompany = {configs: {'device-runtime-footer-text': 'Empresa de teste — suporte'}};
jest.mock('react-native', () => ({
  Platform: {OS: 'web'}, View: 'View', Text: 'Text', ActivityIndicator: 'Loading',
  StyleSheet: {create: value => value}, useWindowDimensions: () => ({width: 1280}),
}));
jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: () => ({bottom: 0})}));
jest.mock('@store', () => ({
  useStores: () => ({}),
  useStore: name => ({getters: name === 'people'
    ? {currentCompany: mockCompany}
    : name === 'runtime_debug'
      ? {summary: {entries: {socket: {key: 'socket', indicatorTone: mockTone, lines: ['Realtime']}}}}
      : {}}),
}));
jest.mock('@controleonline/ui-common/src/react/config/deviceConfigBootstrap', () => ({
  DEVICE_RUNTIME_DEBUG_INFO_ENABLED_KEY: 'device-runtime-debug-info-enabled',
  isTruthyValue: value => Boolean(value), parseConfigsObject: value => value || {},
}));
jest.mock('@controleonline/ui-common/src/react/components/RuntimeFooterMarqueeText', () => 'FooterText');

beforeEach(() => {jest.useFakeTimers(); global.IS_REACT_ACT_ENVIRONMENT = true;});
afterEach(() => jest.useRealTimers());
const renderFooter = () => {
  let tree;
  act(() => {tree = renderer.create(<Footer appearance="soft" appVersion="1.10.56"
    device={{id: 'test-device', appType: 'MANAGER'}}
    colors={{success: 'green', warning: 'yellow', error: 'red', footerText: 'gray'}} />);});
  return tree;
};

it('alternates configured company text and version, then returns to company text', () => {
  const tree = renderFooter();
  const text = () => tree.root.findByType('FooterText').props.text;
  expect(text()).toBe('Empresa de teste — suporte');
  act(() => jest.advanceTimersByTime(4000));
  expect(text()).toContain('v1.10.56');
  act(() => jest.advanceTimersByTime(4000));
  expect(text()).toBe('Empresa de teste — suporte');
  act(() => tree.unmount());
  expect(jest.getTimerCount()).toBe(0);
});

it.each([['success', 'green'], ['warning', 'yellow'], ['error', 'red']])(
  'preserves the runtime status color for %s', (tone, color) => {
    mockTone = tone;
    const tree = renderFooter();
    const dot = tree.root.findAllByType('View').find(view =>
      Array.isArray(view.props.style) && view.props.style[0]?.width === 7);
    expect(dot.props.style[1].backgroundColor).toBe(color);
    act(() => tree.unmount());
  },
);
