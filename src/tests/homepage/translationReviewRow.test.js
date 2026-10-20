import React from 'react';
import renderer, {act} from 'react-test-renderer';
import TranslationReviewRow from '@controleonline/ui-translate/src/react/pages/TranslationReviewRow';
jest.mock('react-native', () => ({ActivityIndicator:'ActivityIndicator', Text:'Text', TextInput:'TextInput', TouchableOpacity:'TouchableOpacity', View:'View', StyleSheet:{create:s=>s}, Platform:{select:v=>v.web}}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
global.IS_REACT_ACT_ENVIRONMENT = true;
const base = {rowId:'row', key:'loading', hasOverride:false, mainTranslate:'Carregando', mainRevised:false, companyRevised:false, pendingReview:true};
function check(row, hasMainFallback, assertions) {
 let tree;
 try {
  act(()=>{tree=renderer.create(<TranslationReviewRow row={row} rowDraft="Carregando" hasMainFallback={hasMainFallback} mainCompanyLabel="GYROS" brandColors={{primary:'#123456'}} onSave={()=>{}} onDraftChange={()=>{}}/>);});
  const texts=tree.root.findAllByType('Text').map(n=>n.props.children).filter(v=>typeof v==='string');
  assertions(texts,tree);
 } finally {act(()=>tree?.unmount());}
}
it('keeps the main company pending review without labelling its own translation as inherited',()=>{
 check(base,false,texts=>{expect(texts).not.toContain('Fallback');expect(texts).not.toContain('Herdada');expect(texts.some(t=>t.includes('Fallback da'))).toBe(false);expect(texts).toContain('Pendente');});
});
it('recognizes a reviewed main-company translation without offering an override',()=>{
 check({...base,pendingReview:false,mainRevised:true},false,texts=>{expect(texts).toContain('Entrada revisada manualmente nesta empresa.');expect(texts).toContain('Salvar');expect(texts).not.toContain('Criar sobrescrita');});
});
it('shows inheritance independently from review status when the branch uses its main-company translation',()=>{
 check(base,true,texts=>{expect(texts).toContain('Herdada');expect(texts).toContain('Pendente');expect(texts).toContain('Herdada da GYROS. Pendente de revisão na empresa principal.');});
});
it('keeps a branch override as its own translation and preserves its save action',()=>{
 check({...base,hasOverride:true,companyRevised:true,pendingReview:false},true,(texts,tree)=>{expect(texts).not.toContain('Herdada');expect(texts).toContain('Sobrescrita da empresa ativa');expect(texts).toContain('Salvar');expect(tree.root.findByType('TextInput').props.value).toBe('Carregando');});
});
