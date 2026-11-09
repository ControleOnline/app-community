import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ModuleAccentSettings from '../../components/theme-editor/ModuleAccentSettings';
import useManagerPreference from '../../components/manager-preview/useManagerPreference';
import {moduleAccentBackground, resolveModuleAccent} from '../../components/manager-preview/moduleAccent';

jest.mock('../../components/HomeIcon', () => 'Icon');

const categories = [
  {id:122, label:'Comercial', color:'$primary', menus:[{menuType:'home'}]},
  {id:124, label:'Financeiro', color:'#757575', menus:[{menuType:'home'}]},
];
const colors = {primary:'#147568',navigationActiveBorder:'#123456',navigationActiveIcon:'#456789'};
test('uses the active palette for a reference and leaves literal category colors intact', () => {
  expect(resolveModuleAccent('$primary', colors)).toBe('#147568');
  expect(resolveModuleAccent('#757575', colors)).toBe('#757575');
  expect(resolveModuleAccent('$missing', colors)).toBeUndefined();
  expect(resolveModuleAccent('var(--unknown)', colors)).toBeUndefined();
  expect(resolveModuleAccent('#0000', colors)).toBeUndefined();
  expect(resolveModuleAccent('rgba(0,0,0,0)', colors)).toBeUndefined();
  expect(resolveModuleAccent('rgb(1..2, 0, 0)', colors)).toBeUndefined();
});

test('shows the resolved colors and keeps preview separate from the saved preference', async () => {
  const save = jest.fn();
  let tree;
  await act(async () => {
    tree = renderer.create(<ModuleAccentSettings menus={categories} palette={colors}
      preference={{ready:true,value:false,setValue:save}} colors={colors} />);
  });
  const label = 'Usar as cores das categorias do menu';
  expect(tree.root.findAllByType('Text').map(node=>node.children.join('')).join(' ')).toContain('$primary → #147568');
  await act(async () => tree.root.findByProps({accessibilityLabel:label}).props.onValueChange(true));
  expect(save).not.toHaveBeenCalled();
  const finance=tree.root.findByProps({accessibilityLabel:'Prévia de Financeiro'});
  await act(async () => finance.props.onPress());
  expect(tree.root.findByProps({testID:'module-accent-preview'}).props.style).toMatchObject({borderLeftColor:'#757575', backgroundColor:'#757575'});
  await act(async () => tree.root.findByProps({accessibilityLabel:'Salvar preferência de destaque'}).props.onPress());
  expect(save).toHaveBeenCalledWith(true);
  await act(async () => tree.unmount());
});

test('remembers the accent only for the same preference key', async () => {
  const previousStorage = global.localStorage;
  const saved = new Map();
  global.localStorage = {getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value)};
  function Probe({scope}) {return <preference value={useManagerPreference(scope)} />;}
  let tree;
  try {
    await act(async () => {tree = renderer.create(<Probe scope="domain-a/account-a" />);});
    const preference = () => tree.root.findByType('preference').props.value;
    expect(preference().value).toBe(false);
    await act(async () => preference().setValue(true));
    await act(async () => tree.update(<Probe scope="domain-b/account-a" />));
    expect(preference().value).toBe(false);
    await act(async () => tree.update(<Probe scope="domain-a/account-a" />));
    expect(preference().value).toBe(true);
  } finally {
    if (tree) await act(async () => tree.unmount());
    global.localStorage = previousStorage;
  }
});

test('preserves database colors without adding opacity to normal or highlighted backgrounds', () => {
  for (const color of ['#147568', 'rgba(20, 117, 104, 0.6)']) {
    expect(moduleAccentBackground(color)).toBe(color);
    expect(moduleAccentBackground(color, true)).toBe(color);
  }
  expect(moduleAccentBackground(undefined)).toBeUndefined();
});
