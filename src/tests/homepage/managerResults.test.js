import React from 'react';
import renderer,{act} from 'react-test-renderer';
import IncomeStatement from '@controleonline/ui-financial/src/react/pages/reports/IncomeStatement';
const mockGet=jest.fn();let mockCompany={id:3};
jest.mock('react-native',()=>({View:'View',Text:'Text',TextInput:'TextInput',TouchableOpacity:'TouchableOpacity',ScrollView:'ScrollView',Modal:'Modal',ActivityIndicator:'ActivityIndicator',Alert:{alert:jest.fn()},useWindowDimensions:()=>({width:1200}),Platform:{select:v=>v.default},StyleSheet:{create:v=>v,absoluteFillObject:{}}}));
jest.mock('react-native-safe-area-context',()=>({SafeAreaView:'SafeAreaView'}));
jest.mock('react-native-vector-icons/MaterialIcons',()=> 'Icon');
jest.mock('@store',()=>({useStore:name=>name==='invoice'?{actions:{getIncomeStatements:mockGet}}:{getters:{currentCompany:mockCompany}}}));
const response={1:{receive:{total_month_price:100,parent_categories:{a:{parent_category_name:'Vendas',categories_childs:[{category_name:'Balcão',category_price:100}]}}},pay:{total_month_price:140,parent_categories:{}}}};
const presentation={title:'Resultados',emptyText:'Selecione a empresa do relatório.',errorText:'Não foi possível carregar os resultados.',renderYearInput:props=>React.createElement('DefaultYear',props),styles:{container:{backgroundColor:'#101621'}},colors:{buttonText:'#ffeedd',textMuted:'#a3afc2',loadingSpinner:'#ffeedd'}};
const texts=tree=>tree.root.findAllByType('Text').map(n=>n.props.children).flat(Infinity).join(' ');
const mount=async(props={})=>{let tree;await act(async()=>{tree=renderer.create(<IncomeStatement {...props}/>);});return tree;};
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockCompany={id:3};mockGet.mockReset().mockResolvedValue(response);});
it('keeps twelve months, totals and category details while accepting Manager presentation',async()=>{
 const tree=await mount({presentation});
 expect(texts(tree)).toContain('Resultados');expect(texts(tree)).toContain('Janeiro');expect(texts(tree)).toContain('Dezembro');
 expect(texts(tree)).toMatch(/-R\$\s*40,00/);expect(mockGet).toHaveBeenCalledWith({people:3,year:String(new Date().getFullYear())});
 const details=tree.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel==='Ver receitas de Janeiro');
 act(()=>details.props.onPress());expect(texts(tree)).toContain('Balcão');expect(texts(tree)).toContain('Vendas');
 expect(tree.root.findByType('Modal').props.visible).toBe(true);
 act(()=>tree.root.findByType('Modal').props.onRequestClose());expect(tree.root.findByType('Modal').props.visible).toBe(false);
});
it('uses explicit year filtering and clearing without writes',async()=>{
 const tree=await mount({presentation});act(()=>tree.root.findByType('DefaultYear').props.onChangeText('20a25'));
 expect(tree.root.findByType('DefaultYear').props.value).toBe('2025');expect(mockGet).toHaveBeenCalledTimes(1);
 await act(async()=>tree.root.findByType('DefaultYear').props.onSubmitEditing());expect(mockGet).toHaveBeenLastCalledWith({people:3,year:'2025'});
 await act(async()=>tree.root.findByProps({accessibilityLabel:'Limpar filtro de ano'}).props.onPress());expect(mockGet).toHaveBeenLastCalledWith({people:3,year:String(new Date().getFullYear())});
});
it('keeps the original screen available without the optional presentation',async()=>{
 const tree=await mount();expect(texts(tree)).toContain('Comissões');expect(tree.root.findByType('TextInput')).toBeTruthy();
});
it('does not query without a company and shows the contextual empty state',async()=>{
 mockCompany=null;const tree=await mount({presentation});expect(mockGet).not.toHaveBeenCalled();expect(texts(tree)).toContain(presentation.emptyText);
});
