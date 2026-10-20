import React,{useMemo} from 'react';
import {Pressable,Text,View,useWindowDimensions} from 'react-native';
import Configurator from '@controleonline/ui-config/src/react/pages/ConfiguratorPage';
import {createStyles} from '@controleonline/ui-config/src/react/pages/ConfiguratorPage.styles';
import {useManagerPreview} from './ManagerPreviewProvider';

export function configuratorPresentation(c,width) {
  const palette={...c,background:c.pageBackground,text:c.textPrimary,mutedText:c.textMuted,
    cardText:c.textPrimary,actionBackground:c.cardBackground,actionText:c.textPrimary};
  const styles=createStyles(palette);
  return {palette,
    text:{title:'Central de configuração',description:'Ajustes, conexões e ferramentas da empresa em um só lugar.',sectionTitle:'Acessos do configurador',sectionDescription:'Escolha a área que deseja configurar.'},
    actionText:{
      GeneralSettings:{label:'Configurações gerais',description:'Consulte e ajuste as configurações da empresa.'},
      GenericLogPage:{label:'Registros de atividade',description:'Consulte eventos e registros do sistema.'},
      ConnectionsPage:{label:'Conexões',description:'Configure os canais de comunicação da empresa.'},
      IntegrationsPage:{label:'Integrações',description:'Gerencie conexões com plataformas e serviços externos.'},
      ProductShowcasesPage:{label:'Vitrines de produtos',description:'Consulte produtos, preços e estoque por integração.'},
      CronJobsPage:{label:'Agendamentos',description:'Configure a execução de tarefas automáticas.'},
      TranslationsReviewPage:{label:'Traduções',description:'Revise os textos e traduções usados pela empresa.'},
      ThemeManagerPage:{label:'Temas',description:'Gerencie paletas e sua associação aos domínios.'},
    },styles:{...styles,
    scroll:{...styles.scroll,padding:width<=760?12:18},
    heroCard:{...styles.heroCard,backgroundColor:c.cardBackground,borderWidth:1,borderColor:c.cardBorder,borderRadius:14,padding:16,marginBottom:16,shadowColor:c.cardShadow,boxShadow:'none'},
    heroEyebrow:{...styles.heroEyebrow,color:c.textMuted},
    heroTitle:{...styles.heroTitle,color:c.textPrimary,fontSize:20,marginTop:6,paddingRight:56},
    heroText:{...styles.heroText,color:c.textMuted,marginTop:6,fontSize:13,lineHeight:19},
    heroBadge:{...styles.heroBadge,width:40,height:40,borderRadius:12,top:14,right:14},
    sectionTitle:{...styles.sectionTitle,marginBottom:6},
    sectionDescription:{...styles.sectionDescription,marginBottom:12},
    actionHeader:{...styles.actionHeader,gap:10,marginBottom:8},
    actionIconWrap:{...styles.actionIconWrap,width:36,height:36,borderRadius:10},
    actionLabel:{...styles.actionLabel,fontSize:14},
    actionDescription:{...styles.actionDescription,lineHeight:19},
    actionCard:{...styles.actionCard,flexBasis:width<=760?'100%':width>=1280?'32%':'48%',flexGrow:0,minHeight:108,padding:14,minWidth:0,borderRadius:14,shadowColor:c.cardShadow,boxShadow:'none'},
  }};
}
export default function ManagerConfiguratorPage(props) {
  const preview=useManagerPreview(),{width}=useWindowDimensions();
  const presentation=useMemo(()=>preview?configuratorPresentation(preview.colors,width):null,[preview?.colors,width]);
  if(!preview)return <Configurator {...props}/>;
  return <View style={{flex:1,minHeight:0,backgroundColor:preview.colors.pageBackground}}>
    {props.navigation.canGoBack?.()&&<Pressable accessibilityRole="button" accessibilityLabel="Voltar"
      onPress={()=>props.navigation.goBack()} style={{minHeight:44,paddingHorizontal:26,justifyContent:'center',alignSelf:'flex-start'}}>
      <Text style={{color:preview.colors.textPrimary}}>← Voltar</Text>
    </Pressable>}
    <Configurator {...props} presentation={presentation}/>
  </View>;
}
