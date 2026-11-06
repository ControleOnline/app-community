import {ManagementPageTitleContext} from '../../components/manager-preview/ManagementPageTitleContext';
import React from 'react';
import {Text} from 'react-native';
import renderer,{act} from 'react-test-renderer';
import ManagerResultsPage from '../../components/manager-preview/ManagerResultsPage';
import {managerResultsStyles} from '../../components/manager-preview/managerResultsStyles';
import {resolveManagerTheme} from '../../styles/managerTheme';
import theme from '../../../docs/themes/on-manager-neutral/theme.json';
let mockPreview={colors:resolveManagerTheme(theme.colors,'dark')};
jest.mock('@controleonline/ui-common/src/react/components/AnimatedModal',()=> 'SharedModal');
jest.mock('react-native',()=>({Pressable:'Pressable',Text:'Text',View:'View',Platform:{select:v=>v.default},StyleSheet:{create:v=>v}}));
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>mockPreview}));
jest.mock('@controleonline/ui-financial/src/react/pages/reports/IncomeStatement',()=> 'ExistingReport');
jest.mock('@controleonline/ui-default/src/react/components/inputs/DefaultInput',()=> 'DefaultInput');
it.each(['light','dark'])('uses only configured colors throughout report styles in %s mode',mode=>{
 const c=resolveManagerTheme(theme.colors,mode),styles=managerResultsStyles(c),values=new Set(Object.values(c));
 for(const [name,style]of Object.entries(styles))for(const [key,value]of Object.entries(style)){
  if((key==='color'||key.endsWith('Color'))&&value!=='transparent'&&!values.has(value))throw Error(`${name}.${key}: ${value}`);
 }
 expect(styles.container.backgroundColor).toBe(c.pageBackground);
 expect(styles.textGreen.color).toBe(c.textSuccess);expect(styles.textRed.color).toBe(c.textDanger);
});
it('passes the original route to the report and delegates year editing to DefaultInput',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;const route={name:'IncomeStatement',params:{store:'invoice'}},navigation={canGoBack:()=>true,goBack:jest.fn()};let tree;
 act(()=>{tree=renderer.create(<ManagerResultsPage route={route} navigation={navigation}/>);});
 const report=tree.root.findByType('ExistingReport');expect(report.props.route).toBe(route);
 const onChangeText=jest.fn(),onSubmitEditing=jest.fn();
 const input=report.props.presentation.renderYearInput({value:'2026',onChangeText,onSubmitEditing});
 expect(input.type).toBe('DefaultInput');expect(input.props.autoSave).toBe(false);expect(input.props.onChangeValue).toBe(onChangeText);expect(input.props.onSubmitEditing).toBe(onSubmitEditing);
 expect(tree.root.findAllByProps({accessibilityLabel:'Voltar'})).toHaveLength(0);
});

it('hosts report details in the ui-common modal with the configured overlay',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;let tree;act(()=>{tree=renderer.create(<ManagerResultsPage navigation={{canGoBack:()=>false}}/>);});
 const Component=tree.root.findByType('ExistingReport').props.presentation.ModalComponent;
 const close=jest.fn();let modal;act(()=>{modal=renderer.create(<Component visible onRequestClose={close}><Text>Detalhes</Text></Component>);});
 const shared=modal.root.findByType('SharedModal');expect(shared.props.visible).toBe(true);
 expect(shared.props.overlayColor).toBe(mockPreview.colors.modalOverlay);
 act(()=>shared.props.onRequestClose());expect(close).toHaveBeenCalledTimes(1);
});

it('hides only its page title when the shared layout owns it',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;let tree;
 act(()=>{tree=renderer.create(<ManagementPageTitleContext.Provider value><ManagerResultsPage navigation={{}}/></ManagementPageTitleContext.Provider>);});
 const presentation=tree.root.findByType('ExistingReport').props.presentation;
 expect(presentation.styles.pageTitle.display).toBe('none');
 act(()=>tree.unmount());
});
it('isolates monthly summary colors from indicator and default surfaces without changing the report layout',()=>{
 const c=resolveManagerTheme({...theme.colors,'indicatorCardBackground-light':'#123456','summaryCardBackground-light':'#654321','summaryCardText-light':'#abcdef','summaryCardSecondaryText-light':'#fedcba'},'light');
 const styles=managerResultsStyles(c);
 expect(styles.monthCard.backgroundColor).toBe('#654321');expect(styles.metricBox.backgroundColor).toBe('#654321');
 expect(styles.monthTitle.color).toBe('#abcdef');expect(styles.metricLabel.color).toBe('#fedcba');
 expect(styles.filterCard.backgroundColor).toBe(c.cardBackground);expect(styles.filterCard.backgroundColor).not.toBe('#123456');
 expect(styles.monthCard.borderRadius).toBe(14);expect(styles.metricBox.marginBottom).toBe(14);
});
