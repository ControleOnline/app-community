import React from 'react';
import {Text, View} from 'react-native';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {themeEditorText as t, useThemeEditorPalette} from './themeToolPresentation';
import {loginPreviewMedia} from './loginPreviewModel';

export default function LoginPreviewOrigins({company, selectedType}) {
  const c = useThemeEditorPalette();
  return <View style={{gap: 6}}>
    <Text style={{color: c.modalText}}>{t('Empresa do domínio: {{v0}} · #{{v1}}', {
      v0: company.alias || company.name || '', v1: company.id})}</Text>
    {['logo', 'background'].map(type => {
      const media = loginPreviewMedia(company, type);
      return <View key={type} style={{gap: 2, padding: 6, borderWidth: 1,
        borderColor: selectedType === type ? c.inputFocusBorder : c.modalBorder}}>
        <Text style={{color: c.modalText, fontWeight: '600'}}>{type === 'logo' ? t('Logo do login') : t('Imagem de fundo do login')}</Text>
        {media.file && <View style={{height: 120, backgroundColor: c.inputBackground, borderWidth: 1, borderColor: c.modalBorder}}>
          <DefaultFile file={media.file} company={company} resizeMode="contain" style={{width: '100%', height: '100%'}} />
        </View>}
        <Text selectable style={{color: c.modalText, fontSize: 12}}>{media.source}</Text>
        <Text selectable style={{color: c.modalText, fontSize: 12}}>{media.file
          ? t('Arquivo: {{v0}} · {{v1}}', {v0: media.fileId || t('Sem ID informado'), v1: media.url || t('Endereço não informado')})
          : t('Nenhuma imagem vinculada.')}</Text>
        <Text style={{color: c.modalText, fontSize: 12}}>{t('Origem: mídias da empresa #{{v0}}, tipo {{v1}}. A troca é feita nesse cadastro, com as permissões existentes.', {
          v0: company.id, v1: type})}</Text>
      </View>;
    })}
    <Text style={{color: c.modalText, fontSize: 12}}>{t('Os logos claro/escuro da Home não são utilizados pelo login atual.')}</Text>
  </View>;
}
