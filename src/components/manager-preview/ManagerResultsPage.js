import {useManagementPageTitle} from './ManagementPageTitleContext';
import React,{useMemo} from 'react';
import {Text,View} from 'react-native';
import IncomeStatement from '@controleonline/ui-financial/src/react/pages/reports/IncomeStatement';
import AnimatedModal from '@controleonline/ui-common/src/react/components/AnimatedModal';
import DefaultInput from '@controleonline/ui-default/src/react/components/inputs/DefaultInput';
import {useManagerPreview} from './ManagerPreviewProvider';
import {managerResultsStyles} from './managerResultsStyles';

function ResultsDetailsModal({visible,onRequestClose,children,colors}) {
  return <AnimatedModal visible={visible} onRequestClose={onRequestClose}
    overlayColor={colors.modalOverlay} contentStyle={{justifyContent:'center'}}>
    {children}
  </AnimatedModal>;
}

export default function ManagerResultsPage(props) {
  const ownsTitle=useManagementPageTitle();
  const preview=useManagerPreview();
  const c=preview?.colors;
  const styles=useMemo(()=>{if(!c)return null;const base=managerResultsStyles(c);return ownsTitle?{...base,pageTitle:{...base.pageTitle,display:'none'}}:base;},[c,ownsTitle]);
  const ModalComponent=useMemo(()=>function ThemedDetailsModal(modalProps){return <ResultsDetailsModal {...modalProps} colors={c}/>;},[c]);
  if(!preview)return <IncomeStatement {...props}/>;
  const presentation={styles,colors:c,ModalComponent,title:'Resultados',
    errorText:'Não foi possível carregar os resultados.',
    emptyText:'O relatório de resultados precisa de uma empresa ativa para carregar os dados.',
    renderYearInput:({value,onChangeText,onSubmitEditing})=><DefaultInput
      column={{name:'year',label:'Ano',inputType:'number'}} value={value} variant="form" editing
      autoFocus={false} autoSave={false} maxLength={4} accentColor={c.buttonBackground}
      onChangeValue={onChangeText} onSubmitEditing={onSubmitEditing} inputStyle={styles.yearInput}/>};
  return <View style={{flex:1,minHeight:0,backgroundColor:c.pageBackground}}>

    <IncomeStatement {...props} presentation={presentation}/>
  </View>;
}
