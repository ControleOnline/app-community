import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ManagerConfiguratorPage,{configuratorPresentation} from '../../components/manager-preview/ManagerConfiguratorPage';
import {resolveManagerTheme} from '../../styles/managerTheme';
import theme from '../../../docs/themes/on-manager-neutral/theme.json';
let mockPreview={colors:resolveManagerTheme(theme.colors,'light')};let mockWidth=393;
jest.mock('react-native',()=>({Pressable:'Pressable',Text:'Text',View:'View',useWindowDimensions:()=>({width:mockWidth}),Platform:{select:v=>v.default},StyleSheet:{create:v=>v}}));
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>mockPreview}));
jest.mock('@controleonline/ui-config/src/react/pages/ConfiguratorPage',()=> 'ExistingConfigurator');
it.each(['light','dark'])('maps the hub surfaces and text to the configured %s theme',mode=>{
 const c=resolveManagerTheme(theme.colors,mode),p=configuratorPresentation(c,1200),allowed=new Set(Object.values(c));
 for(const style of Object.values(p.styles))for(const [key,value]of Object.entries(style))if(key==='color'||key.endsWith('Color'))expect(allowed.has(value)).toBe(true);
 expect(p.styles.heroCard.backgroundColor).toBe(c.cardBackground);expect(p.styles.actionCard.flexBasis).toBe('48%');
 expect(configuratorPresentation(c,1440).styles.actionCard.flexBasis).toBe('32%');
 expect(p.styles.actionCard.minHeight).toBe(108);
 expect(p.styles.actionCard.flexGrow).toBe(0);
 expect(configuratorPresentation(c,393).styles.actionCard.flexBasis).toBe('100%');
});
it('keeps the route, offers back when available and passes the mobile layout',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;const navigation={canGoBack:()=>true,goBack:jest.fn()},route={name:'ConfiguratorPage'};let tree;
 act(()=>{tree=renderer.create(<ManagerConfiguratorPage route={route} navigation={navigation}/>);});
 const page=tree.root.findByType('ExistingConfigurator');expect(page.props.route).toBe(route);expect(page.props.presentation.styles.actionCard.flexBasis).toBe('100%');
 act(()=>tree.root.findByProps({accessibilityLabel:'Voltar'}).props.onPress());expect(navigation.goBack).toHaveBeenCalledTimes(1);
});

it('provides Portuguese labels and descriptions keyed to the eight existing destinations',()=>{
 const p=configuratorPresentation(mockPreview.colors,1440);
 expect(Object.keys(p.actionText)).toHaveLength(8);
 expect(p.actionText.ProductShowcasesPage.label).toBe('Vitrines de produtos');
 expect(p.actionText.CronJobsPage.label).toBe('Agendamentos');
 expect(p.actionText.ThemeManagerPage.label).toBe('Temas');
 expect(Object.values(p.actionText).every(item=>item.label&&item.description&&item.label!==item.description)).toBe(true);
});
