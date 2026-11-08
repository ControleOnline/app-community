import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Configurator from '@controleonline/ui-config/src/react/pages/ConfiguratorPage';
jest.mock('react-native',()=>({ScrollView:'ScrollView',Text:'Text',TouchableOpacity:'TouchableOpacity',View:'View',Platform:{select:v=>v.default},StyleSheet:{create:v=>v}}));
jest.mock('react-native-safe-area-context',()=>({SafeAreaView:'SafeAreaView'}));
jest.mock('react-native-vector-icons/Feather',()=> 'Icon');
const mockFetch=jest.fn();
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...a)=>mockFetch(...a)}}));
const menuResponse=routeList=>({response:{success:true,data:{modules:{cfg:{id:'cfg',label:'Configuracoes',menus:routeList.map((route,i)=>({id:i,menuKey:'k'+i,label:route,route,menuType:'configurator',sortOrder:i}))}}}}});
const renderPage=async(props={})=>{global.IS_REACT_ACT_ENVIRONMENT=true;const navigate=jest.fn();let tree;
 await act(async()=>{tree=renderer.create(<Configurator navigation={{navigate}} {...props}/>);});return {tree,navigate};};
beforeEach(()=>mockFetch.mockReset());
jest.mock('@store',()=>({useStore:name=>({getters:name==='theme'?{colors:{background:'#eeeeee'}}:{currentCompany:{id:3,theme:{colors:{background:'#ff0000'}}}}})}));
const routes=['GeneralSettings','GenericLogPage','ConnectionsPage','IntegrationsPage','ProductShowcasesPage','CronJobsPage','TranslationsReviewPage','ThemeManagerPage'];
it('renders every shortcut returned by the configurator menu and navigates only on an explicit press',async()=>{
 mockFetch.mockResolvedValue(menuResponse(routes));
 const {tree,navigate}=await renderPage();
 expect(mockFetch).toHaveBeenCalledWith('menus-people',{params:{myCompany:3,appType:'MANAGER',menuType:'configurator'}});
 const cards=tree.root.findAllByType('TouchableOpacity');expect(cards).toHaveLength(8);expect(navigate).not.toHaveBeenCalled();
 cards.forEach((card,i)=>{act(()=>card.props.onPress());expect(navigate).toHaveBeenLastCalledWith(routes[i]);});
});
it('hides a shortcut that the menu does not return (e.g. Integrações disabled)',async()=>{
 mockFetch.mockResolvedValue(menuResponse(routes.filter(r=>r!=='IntegrationsPage')));
 const {tree}=await renderPage();
 const labels=tree.root.findAllByType('TouchableOpacity').map(c=>c.props.accessibilityLabel);
 expect(labels).toHaveLength(7);expect(labels).not.toContain('Integrações');
});
it('shows no shortcut when the profile is allowed none (empty response is not a fallback)',async()=>{
 mockFetch.mockResolvedValue({response:{success:true,data:{modules:{}}}});
 const {tree}=await renderPage();expect(tree.root.findAllByType('TouchableOpacity')).toHaveLength(0);
});
it('offers only the authorized theme shortcut when the company menu is empty',async()=>{
 mockFetch.mockResolvedValue(menuResponse([]));
 const {tree,navigate}=await renderPage({showThemeShortcut:true});
 const cards=tree.root.findAllByType('TouchableOpacity');
 expect(cards.map(card=>card.props.accessibilityLabel)).toEqual(['Temas']);
 act(()=>cards[0].props.onPress());
 expect(navigate).toHaveBeenCalledWith('ThemeManagerPage');
 await act(async()=>tree.unmount());
});
it('shows no shortcut while the menu is still loading',()=>{
 mockFetch.mockReturnValue(new Promise(()=>{}));global.IS_REACT_ACT_ENVIRONMENT=true;let tree;
 act(()=>{tree=renderer.create(<Configurator navigation={{navigate:jest.fn()}}/>);});
 expect(tree.root.findAllByType('TouchableOpacity')).toHaveLength(0);
});
it.each([['request rejects',()=>mockFetch.mockRejectedValue(new Error('offline'))],['API reports failure',()=>mockFetch.mockResolvedValue({response:{success:false,data:[]}})]])('falls back to the fixed eight shortcuts when the %s',async(_n,arrange)=>{
 arrange();const {tree}=await renderPage();
 expect(tree.root.findAllByType('TouchableOpacity')).toHaveLength(8);
});
it('accepts the active Manager theme without a company palette override',async()=>{
 mockFetch.mockResolvedValue(menuResponse(routes));global.IS_REACT_ACT_ENVIRONMENT=true;
 const presentation={palette:{background:'#101621',textPrimary:'#edf1f9',textMuted:'#a3afc2',cardText:'#edf1f9'},styles:{heroTitle:{fontSize:18}}};let tree;
 await act(async()=>{tree=renderer.create(<Configurator navigation={{navigate:jest.fn()}} presentation={presentation}/>);});
 expect(tree.root.findByType('SafeAreaView').props.style[1].backgroundColor).toBe('#101621');
 expect(tree.root.findAllByType('Text').find(n=>n.props.children==='Central de configuração').props.style).toEqual({fontSize:18});
});
it('uses local Portuguese presentation texts even when the translation returns English labels',async()=>{
 mockFetch.mockResolvedValue(menuResponse(routes));global.t={t:()=> 'Product Showcases'};
 const presentation={actionText:{ProductShowcasesPage:{label:'Vitrines de produtos',description:'Consulte produtos, preços e estoque por integração.'},CronJobsPage:{label:'Agendamentos',description:'Configure tarefas automáticas.'},ThemeManagerPage:{label:'Temas',description:'Gerencie paletas por domínio.'}},text:{title:'Central de configuração',description:'Ajustes da empresa.',sectionTitle:'Acessos',sectionDescription:'Escolha uma área.'}};
 const navigate=jest.fn();let tree;await act(async()=>{tree=renderer.create(<Configurator navigation={{navigate}} presentation={presentation}/>);});
 const cards=tree.root.findAllByType('TouchableOpacity');
 expect(cards[4].props.accessibilityLabel).toBe('Vitrines de produtos');
 expect(cards[5].props.accessibilityLabel).toBe('Agendamentos');expect(cards[7].props.accessibilityLabel).toBe('Temas');
 act(()=>cards[4].props.onPress());expect(navigate).toHaveBeenCalledWith('ProductShowcasesPage');
 delete global.t;
});
