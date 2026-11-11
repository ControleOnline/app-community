import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {moduleListAppearance} from '../../components/manager-preview/moduleAccent';
import ModuleAppearancePreview from '../../components/theme-editor/ModuleAppearancePreview';
import {initializeGlobalChromeColors} from '../../styles/globalChromeTheme';
import {resolveManagerTheme} from '../../styles/managerTheme';
jest.mock('../../components/HomeIcon', () => 'Icon');
const colors = {moduleListIcon:'#627387', moduleListText:'#0f172a', textMuted:'#111111', cardText:'#222222',
  containerTransparentBackground:'transparent', navigationActiveBackground:'#ddeeff', navigationActiveIcon:'#333333',
  navigationIcon:'#444444', navigationActiveText:'#555555', navigationText:'#666666', navigationActiveBorder:'#abcdef'};

test('a route accent shares list and sidebar colors without tinting the icon with its background', () => {
  const home = moduleListAppearance({accent:'#0284c7', colors});
  for (const active of [true, false]) {
    expect(moduleListAppearance({accent:'#0284c7', colors, sidebar:true, active})).toEqual(home);
  }
  expect(home).toEqual({backgroundColor:'#0284c7', iconColor:'#627387', textColor:'#0f172a'});
});

test('without a route accent, each surface retains its original themed normal and active states', () => {
  expect(moduleListAppearance({colors})).toEqual({backgroundColor:'transparent',iconColor:'#111111',textColor:'#222222'});
  expect(moduleListAppearance({colors,sidebar:true})).toEqual({backgroundColor:'transparent',iconColor:'#444444',textColor:'#666666'});
  expect(moduleListAppearance({colors,sidebar:true,active:true})).toEqual({backgroundColor:'#ddeeff',iconColor:'#333333',textColor:'#555555'});
  expect(moduleListAppearance({colors,sidebar:true,highlighted:true})).toEqual({backgroundColor:'#ddeeff',iconColor:'#444444',textColor:'#666666'});
});

test('content color previews do not change captured module foregrounds in either mode', () => {
  const loaded=initializeGlobalChromeColors({'textMuted-light':'#112233','textMuted-dark':'#ddeeff',
    'cardText-light':'#223344','cardText-dark':'#eeeeee'});
  const preview={...loaded,'textMuted-light':'#ff0000','textMuted-dark':'#00ff00',
    'cardText-light':'#0000ff','cardText-dark':'#ffff00'};
  expect(resolveManagerTheme(preview,'light')).toMatchObject({moduleListIcon:'#112233',moduleListText:'#223344'});
  expect(resolveManagerTheme(preview,'dark')).toMatchObject({moduleListIcon:'#ddeeff',moduleListText:'#eeeeee'});
});

test('previews use the route rather than category for sidebar items and restore the theme when disabled', async () => {
  const props={category:{label:'Financeiro',color:'#020202'},route:{label:'Centro financeiro',color:'#0284c7',icon:'dollar-sign'},palette:colors};
  let tree;await act(async()=>{tree=renderer.create(<ModuleAppearancePreview {...props} enabled />);});
  const item=mode=>tree.root.findByProps({testID:`module-preview-item-${mode}`});
  const mainText=mode=>item(mode).findByType('Text').props.style.color;
  expect(item('sidebar').props.style.backgroundColor).toBe('#0284c7');
  expect(item('sidebar').props.style.backgroundColor).toBe(item('list').props.style.backgroundColor);
  expect(item('sidebar').findByType('Icon').props.color).toBe(item('list').findAllByType('Icon')[0].props.color);
  expect(mainText('sidebar')).toBe(mainText('list'));
  await act(async()=>tree.update(<ModuleAppearancePreview {...props} enabled={false} />));
  expect(item('sidebar').props.style.backgroundColor).toBe(colors.navigationActiveBackground);
  expect(item('sidebar').findByType('Icon').props.color).toBe(colors.navigationActiveIcon);
  expect(mainText('sidebar')).toBe(colors.navigationActiveText);
  expect(mainText('list')).toBe(colors.cardText);
  await act(async()=>tree.unmount());
});

test('registered foregrounds override each surface independently only while the switch is enabled', () => {
  const record={textColor:'#ffffff',iconColor:'$primary'};
  for(const sidebar of [false,true]) {
    expect(moduleListAppearance({colors,sidebar,record,enabled:true,palette:{primary:'#ffff00'}})).toMatchObject({textColor:'#ffffff',iconColor:'#ffff00'});
    expect(moduleListAppearance({accent:undefined,colors,sidebar,record,enabled:false})).toEqual(moduleListAppearance({colors,sidebar}));
    expect(moduleListAppearance({accent:'#0284c7',colors,sidebar,record:{textColor:null,iconColor:null},enabled:true})).toMatchObject({textColor:colors.moduleListText,iconColor:colors.moduleListIcon});
  }
});

test('category icon color is visible in category-only previews, without borrowing route properties', async () => {
  let tree;await act(async()=>{tree=renderer.create(<ModuleAppearancePreview enabled palette={colors} category={{label:'Commercial',color:'#020202',textColor:'#ffffff',iconColor:'#ffff00',icon:'grid'}} route={null}/>);});
  expect(tree.root.findByProps({testID:'module-preview-item-grid'}).findByType('Icon').props.color).toBe('#ffff00');
  expect(tree.root.findByProps({testID:'module-preview-item-grid'}).findByType('Text').props.style.color).toBe('#ffffff');
  await act(async()=>tree.unmount());
});

test('grid preview applies transparent icon background and all route foregrounds, then restores theme colors', async () => {
  const props={palette:{...colors,iconBackground:'#eeeeee',listItemIcon:'#123456',listItemText:'#234567'},category:{label:'Commercial'},route:{label:'Clients',textColor:'#ffffff',iconColor:'#ffff00',iconBackgroundColor:'transparent'}};
  let tree;await act(async()=>{tree=renderer.create(<ModuleAppearancePreview {...props} enabled/>);});
  const grid=()=>tree.root.findByProps({testID:'module-preview-item-grid'});
  expect(grid().findByType('Icon').props.color).toBe('#ffff00');
  expect(grid().findByType('Icon').parent.props.style.backgroundColor).toBe('transparent');
  await act(async()=>tree.update(<ModuleAppearancePreview {...props} enabled={false}/>));
  expect(grid().findByType('Icon').props.color).toBe('#123456');
  expect(grid().findByType('Icon').parent.props.style.backgroundColor).toBe('#eeeeee');
  await act(async()=>tree.unmount());
});
