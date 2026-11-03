import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useStore} from '@store';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {resolveCompanyMedia} from './companyMedia';

function CompanyName({label, color}) {
  const [fontSize, setFontSize] = useState(17);
  return <Text accessibilityLabel={label}
    onLayout={event => {
      // Fit the actual available width; preserve the complete name and a readable minimum.
      if (event.nativeEvent.layout.height > 42 && fontSize > 12) {
        setFontSize(size => Math.max(12, size - 1));
      }
    }}
    style={[s.title, {color, fontSize, lineHeight: Math.round(fontSize * 1.18)}]}>{label}</Text>;
}

// Follow the selected tenant; domain media is only a fallback for missing media.
export default function ManagerBrand({colors: c, textColor = c.textPrimary, home = false, homeSize = 28, homeWidth = homeSize, compact = false, subtitle = true, trailing = null}) {
  const {currentCompany, mainCompany} = useStore('people').getters;
  const selectedCompany = currentCompany?.id ? currentCompany : mainCompany;
  // Company selector (drawer) shows the ICON media; the centered home link shows the LOGO media.
  const selectedFile = resolveCompanyMedia(selectedCompany, {home});
  const owner = selectedFile ? selectedCompany : mainCompany;
  const file = selectedFile || resolveCompanyMedia(mainCompany, {home});
  const identity = JSON.stringify([selectedCompany?.id, owner?.id, file]);
  const [failed, setFailed] = useState(null);
  const [loaded, setLoaded] = useState(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const label = selectedCompany?.alias || selectedCompany?.name || 'On Manager';
  const imageStyle = home ? [s.homeLogo, {width: homeWidth, height: homeSize}] : s.brandIcon;
  const fallback = home
    ? require('../../assets/manager/logo 512x512 r.png')
    : require('../../assets/manager/logo.png');
  const image = <View style={imageStyle}>
    {(loaded !== identity || failed === identity) && <Image source={fallback} accessibilityLabel={file ? undefined : 'Logo On Manager'} resizeMode="contain" style={imageStyle} />}
    {file && failed !== identity && <DefaultFile key={identity} file={file} company={owner}
        accessibilityLabel={`Logo ${label}`} resizeMode="contain"
        style={[imageStyle, s.remote]} onLoad={() => setLoaded(identity)} onError={() => setFailed(identity)} />}
  </View>;

  if (home) return image;
  return <View style={s.brand}>
    {image}
    {!compact && <View style={s.label}
      onLayout={event => setLabelWidth(Math.round(event.nativeEvent.layout.width))}>
      <CompanyName key={JSON.stringify([label, labelWidth])} label={label} color={textColor} />
      {subtitle && <Text style={[s.subtitle, {color: c.textMuted}]}>GESTÃO INTEGRADA</Text>}
    </View>}
    {trailing}
  </View>;
}

const s = StyleSheet.create({
  brand: {flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, minWidth: 0},
  label: {flex: 1, minWidth: 0},
  // Company marks retain their full artwork rather than a user-avatar crop.
  brandIcon: {width: 40, height: 40, flexShrink: 0},
  homeLogo: {width: 28, height: 28, flexShrink: 0},
  remote: {position: 'absolute', top: 0, left: 0},
  title: {fontWeight: '600'},
  subtitle: {fontSize: 9, letterSpacing: 1.5, marginTop: 4},
});
