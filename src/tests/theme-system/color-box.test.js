import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ColorBox from '../../components/theme-editor/ColorBox';

jest.mock('../../components/theme-editor/NativeColorInput', () => 'ColorPicker');
const colors = {inputBorder: '#ccc', inputBackground: '#fff', inputText: '#111', textDanger: '#f00', textPlaceholder: '#999'};
const flat = style => Object.assign({}, ...[style].flat(Infinity).filter(Boolean));
const box = props => renderer.create(<ColorBox colors={colors} label="Cor" value="#112233" resolved="#112233" onChangeText={() => {}} {...props} />);

// Controls share the app height of 32px, border included (app-community#1711); touch keeps the 44px target.
test('the color box is 32px high, and 44px on touch screens', async () => {
  let tree;
  await act(async () => {tree = box({});});
  expect(flat(tree.root.findByType('View').props.style).minHeight).toBe(32);
  expect(flat(tree.root.findByType('TextInput').props.style).paddingVertical).toBe(4);
  await act(async () => {tree.update(<ColorBox colors={colors} touch label="Cor" value="#112233" resolved="#112233" onChangeText={() => {}} />);});
  expect(flat(tree.root.findByType('View').props.style).minHeight).toBe(44);
  await act(async () => tree.unmount());
});
