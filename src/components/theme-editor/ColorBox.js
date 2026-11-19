import React from 'react';
import {Platform, TextInput, View} from 'react-native';
import NativeColorInput from './NativeColorInput';

// Same box as "Menus por perfil": swatch inside the field (click opens the browser palette) plus the text.
export default function ColorBox({value, resolved, label, placeholder, disabled, colors: c, onChangeText, invalid = false, touch = false}) {
  return <View style={{alignItems: 'center', flexDirection: 'row', gap: 6, minHeight: touch ? 44 : 32, paddingHorizontal: 8, borderWidth: 1, borderRadius: 8,
    borderColor: invalid ? c.textDanger : c.inputBorder, backgroundColor: c.inputBackground}}>
    <View testID="color-swatch" style={{overflow: 'hidden', position: 'relative', width: 18, height: 18, borderRadius: 4, borderWidth: 1,
      borderColor: c.inputBorder, backgroundColor: resolved || 'transparent'}}>
      {Platform.OS === 'web' && <NativeColorInput overlay value={resolved || value} label={`${label} — escolher cor`} disabled={disabled} touch={touch} onColor={onChangeText} />}
    </View>
    <TextInput accessibilityLabel={label} value={value} editable={!disabled} placeholder={placeholder} placeholderTextColor={c.textPlaceholder}
      onChangeText={onChangeText} style={[{flex: 1, minWidth: 0, paddingHorizontal: 0, paddingVertical: 4, fontSize: 13, fontWeight: '700', color: c.inputText}, touch && {minHeight: 44, fontSize: 16}]} />
  </View>;
}

