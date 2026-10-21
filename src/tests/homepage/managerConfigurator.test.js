import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Configurator from '@controleonline/ui-config/src/react/pages/ConfiguratorPage';
jest.mock('react-native',()=>({ScrollView:'ScrollView',Text:'Text',TouchableOpacity:'TouchableOpacity',View:'View',Platform:{select:v=>v.default},StyleSheet:{create:v=>v}}));
jest.mock('react-native-safe-area-context',()=>({SafeAreaView:'SafeAreaView'}));
jest.mock('react-native-vector-icons/Feather',()=> 'Icon');
jest.mock('@store',()=>({useStore:name=>({getters:name==='theme'?{colors:{background:'#eeeeee'}}:{currentCompany:{id:3,theme:{colors:{background:'#ff0000'}}}}})}));
const routes=['GeneralSettings','GenericLogPage','ConnectionsPage','IntegrationsPage','ProductShowcasesPage','CronJobsPage','TranslationsReviewPage','ThemeManagerPage'];
it('preserves all eight shortcuts and navigates only on an explicit press',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;const navigate=jest.fn();let tree;
 act(()=>{tree=renderer.create(<Configurator navigation={{navigate}}/>);});
 const cards=tree.root.findAllByType('TouchableOpacity');expect(cards).toHaveLength(8);expect(navigate).not.toHaveBeenCalled();
 cards.forEach((card,i)=>{act(()=>card.props.onPress());expect(navigate).toHaveBeenLastCalledWith(routes[i]);});
});
it('accepts the active Manager theme without a company palette override',()=>{
 const presentation={palette:{background:'#101621',textPrimary:'#edf1f9',textMuted:'#a3afc2',cardText:'#edf1f9'},styles:{heroTitle:{fontSize:18}}};let tree;
 act(()=>{tree=renderer.create(<Configurator navigation={{navigate:jest.fn()}} presentation={presentation}/>);});
 expect(tree.root.findByType('SafeAreaView').props.style[1].backgroundColor).toBe('#101621');
 expect(tree.root.findAllByType('Text').find(n=>n.props.children==='Central de configuração').props.style).toEqual({fontSize:18});
});
it('uses local Portuguese presentation texts even when the translation returns English labels',()=>{
 global.t={t:()=> 'Product Showcases'};
 const presentation={actionText:{ProductShowcasesPage:{label:'Vitrines de produtos',description:'Consulte produtos, preços e estoque por integração.'},CronJobsPage:{label:'Agendamentos',description:'Configure tarefas automáticas.'},ThemeManagerPage:{label:'Temas',description:'Gerencie paletas por domínio.'}},text:{title:'Central de configuração',description:'Ajustes da empresa.',sectionTitle:'Acessos',sectionDescription:'Escolha uma área.'}};
 const navigate=jest.fn();let tree;act(()=>{tree=renderer.create(<Configurator navigation={{navigate}} presentation={presentation}/>);});
 const cards=tree.root.findAllByType('TouchableOpacity');
 expect(cards[4].props.accessibilityLabel).toBe('Vitrines de produtos');
 expect(cards[5].props.accessibilityLabel).toBe('Agendamentos');expect(cards[7].props.accessibilityLabel).toBe('Temas');
 act(()=>cards[4].props.onPress());expect(navigate).toHaveBeenCalledWith('ProductShowcasesPage');
 delete global.t;
});
