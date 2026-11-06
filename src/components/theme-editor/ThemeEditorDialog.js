import { themeEditorText as t, useThemeEditorPalette } from "./themeToolPresentation";import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import ThemeColorEditor from './ThemeColorEditor';
export default function ThemeEditorDialog({ theme, onClose, onSaved, selectedTokens, onPreviewColors }) {const c = useThemeEditorPalette();
  if (!theme) return null;
  return <Modal transparent visible animationType="fade" onRequestClose={onClose}>
    <View dataSet={{ coThemeTools: 'true' }} style={{ flex: 1, backgroundColor: c.modalOverlay, justifyContent: 'center', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 850, maxHeight: '90%', alignSelf: 'center', backgroundColor: c.modalBackground, borderRadius: 14, overflow: 'hidden' }}>
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: c.modalText }}>{t("Cores por modo · ")}{theme.theme}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t("Fechar editor e cancelar prévia")} onPress={onClose}><Text style={{ color: c.modalText, padding: 8 }}>{t("Fechar ✕")}</Text></Pressable>
        </View>
        <ScrollView><ThemeColorEditor theme={theme} selectedTokens={selectedTokens} onSaved={onSaved} onPreviewColors={onPreviewColors} /></ScrollView>
      </View>
    </View>
  </Modal>;
}
