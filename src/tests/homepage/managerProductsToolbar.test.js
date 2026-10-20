jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableCompactToolbar', () => () => null);
const React = require('react');
const renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
let mockConfigs;
jest.mock('@store', () => ({useStore: () => ({getters: {configs: mockConfigs}})}));
jest.mock('react-native', () => ({
 View: props => require('react').createElement('view', props, props.children),
 Text: props => require('react').createElement('text', props, props.children),
 StyleSheet: {create: value => value},
 Platform: {select: value => value.web || value.default || null},
 useWindowDimensions: () => ({width: 400}),
}));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableControls', () => () => require('react').createElement('controls'));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultToolbarAction', () => props => require('react').createElement('action', props));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableImportModal', () => () => null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableSearch', () => ({
 DefaultTableCollapsedSearch: () => null, DefaultTableCompactSearch: () => null, DefaultTableInlineSearch: () => require('react').createElement('search'),
}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme', () => () => ({tableBorderColors: {}, toolbarColors: {}}));
const Toolbar = require('@controleonline/ui-default/src/react/components/table/DefaultTableToolbar').default;
let tree;
beforeEach(() => {mockConfigs = {toolbarActions: [{key: 'custom', onPress: jest.fn()}], importAction: jest.fn(), exportAction: jest.fn()};});
afterEach(() => {if(tree) renderer.act(() => tree.unmount());});
it('hides stored product import without clearing its configuration or hiding frequent controls',()=>{
 const config={enabled:true,importType:'product'};
 mockConfigs={import:config,showAdministrativeTools:false,toolbarActions:[{key:'categories',onPress:jest.fn()}]};
 renderer.act(()=>{tree=renderer.create(React.createElement(Toolbar,{storeName:'products'}));});
 expect(tree.root.findAllByType('action')).toHaveLength(1);
 expect(tree.root.findAllByType('controls')).toHaveLength(1);
 expect(mockConfigs.import).toBe(config);
 mockConfigs={...mockConfigs,showAdministrativeTools:true};
 renderer.act(()=>tree.update(React.createElement(Toolbar,{storeName:'products'})));
 expect(tree.root.findAllByType('action')).toHaveLength(2);expect(mockConfigs.import).toBe(config);
});
