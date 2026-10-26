import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useStore} from '@store';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';

// Application branding follows the domain owner, never the selected franchise.
export default function ManagerBrand({colors: c, home = false, compact = false}) {
  const {mainCompany} = useStore('people').getters;
  const file = home
    ? mainCompany?.icon || mainCompany?.logo
    : mainCompany?.logo || mainCompany?.icon;
  const identity = JSON.stringify([mainCompany?.id, file]);
  const [failed, setFailed] = useState(null);
  const [loaded, setLoaded] = useState(null);
  const label = mainCompany?.alias || mainCompany?.name || 'On Manager';
  const imageStyle = home ? s.homeLogo : s.brandIcon;
  const fallback = home
    ? require('../../assets/manager/logo 512x512 r.png')
    : require('../../assets/manager/logo.png');
  const image = <View style={imageStyle}>
    {(loaded !== identity || failed === identity) && <Image source={fallback} accessibilityLabel={file ? undefined : 'Logo On Manager'} resizeMode="contain" style={imageStyle} />}
    {file && failed !== identity && <DefaultFile key={identity} file={file} company={mainCompany}
        accessibilityLabel={`Logo ${label}`} resizeMode="contain"
        style={[imageStyle, s.remote]} onLoad={() => setLoaded(identity)} onError={() => setFailed(identity)} />}
  </View>;

  if (home) return image;
  return <View style={s.brand}>
    {image}
    {!compact && <View style={s.label}>
      <Text numberOfLines={2} style={[s.title, {color: c.textPrimary}]}>{label}</Text>
      <Text style={[s.subtitle, {color: c.textMuted}]}>GESTÃO INTEGRADA</Text>
    </View>}
  </View>;
}

const s = StyleSheet.create({
  brand: {flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, minWidth: 0},
  label: {flex: 1, minWidth: 0},
  brandIcon: {width: 40, height: 40, borderRadius: 10, flexShrink: 0},
  homeLogo: {width: 28, height: 28},
  remote: {position: 'absolute', top: 0, left: 0},
  title: {fontWeight: '700', fontSize: 17},
  subtitle: {fontSize: 9, letterSpacing: 1.5, marginTop: 4},
});
