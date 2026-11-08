import React, {useLayoutEffect, useRef, useState} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {useStore} from '@store';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {resolveCompanyMedia} from './companyMedia';
import {fitCompanyLogo,logoForMode} from './companyBranding';
import {useThemeRuntime} from '../../styles/themeRuntime';
import {useCompanyBranding} from '../theme-editor/companyBrandingRuntime';

export function CompanyName({label, color, dense = false, small = false, lines = 1, complete = false}) {
  const [fontSize, setFontSize] = useState(dense ? (small || complete ? 11 : 12) : 17);
  const text = useRef(null);
  const fitName = () => {
    const node = text.current;
    if (!dense || Platform?.OS !== 'web' || !node?.clientWidth) return;
    if (node.scrollWidth > node.clientWidth + 1) {
      // A single-line header caption can use the full width below the logo.
      const minimum = complete ? 1 : 9;
      if (fontSize > minimum) {
        setFontSize(complete ? Math.max(minimum, Math.floor(fontSize * node.clientWidth / node.scrollWidth * 10) / 10)
          : Math.max(minimum, fontSize - 1));
      }
    } else if (!complete && lines > 1 && node.scrollHeight > Math.round(fontSize * 1.18) * 1.5 + 1 && fontSize > 9) {
      setFontSize(size => Math.max(9, size - 1));
    }
  };
  useLayoutEffect(() => {fitName();}, [dense, fontSize, label, lines, complete]);
  return (
    <Text ref={text} accessibilityLabel={label}
      title={dense && Platform?.OS === 'web' ? label : undefined}
      numberOfLines={dense ? lines : undefined}
      adjustsFontSizeToFit={dense && (!complete || Platform?.OS !== 'web')}
      minimumFontScale={dense ? (complete ? 0.1 : 0.75) : undefined}
      onLayout={event => {
        if (dense) {fitName(); return;}
        if (event.nativeEvent.layout.height > 42 && fontSize > 12) setFontSize(size => Math.max(12, size - 1));
      }}
      style={[s.title, {color, fontSize, lineHeight: Math.round(fontSize * 1.18)},
        dense && s.denseTitle, complete ? s.completeTitle : dense && lines === 1 && s.fullTitle]}>
      {label}
    </Text>
  );
}

/**
 * Brand of the selected company only.
 * No fallback to mainCompany media and no hardcoded product logo when the
 * selected tenant has no logo/icon — leave the image area empty.
 */
export default function ManagerBrand({
  colors: c,
  textColor = c.textPrimary,
  home = false,
  homeSize = 28,
  homeWidth = homeSize,
  compact = false,
  dense = false,
  small = false,
  subtitle = true,
  trailing = null,
}) {
  const {currentCompany, mainCompany} = useStore('people').getters;
  const selectedCompany = useCompanyBranding(currentCompany?.id ? currentCompany : mainCompany);
  const {mode}=useThemeRuntime();
  // Selector (drawer) shows ICON; centered home/header link shows LOGO.
  const file = (home && logoForMode(selectedCompany,mode)) || resolveCompanyMedia(selectedCompany, {home});
  const identity = JSON.stringify([selectedCompany?.id, file]);
  const imageNode=useRef(null);
  const [dimensions, setDimensions] = useState(null);
  useLayoutEffect(()=>{
    const node=imageNode.current;
    if(!home || Platform?.OS!=='web' || !node?.querySelector)return;
    const measure=()=>{
      const image=node.querySelector('img');
      if(image?.naturalWidth>0 && image?.naturalHeight>0)setDimensions(previous=>previous?.identity===identity && previous.width===image.naturalWidth && previous.height===image.naturalHeight?previous:{identity,width:image.naturalWidth,height:image.naturalHeight});
    };
    measure();node.addEventListener('load',measure,true);
    const observer=typeof MutationObserver==='function'?new MutationObserver(measure):null;
    observer?.observe(node,{childList:true,subtree:true});
    return()=>{node.removeEventListener('load',measure,true);observer?.disconnect();};
  },[identity,home]);
  const [failed, setFailed] = useState(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const label = selectedCompany?.alias || selectedCompany?.name || 'On Manager';
  const intrinsic=dimensions?.identity===identity?dimensions:null;
  const fitted=fitCompanyLogo(intrinsic?.width,intrinsic?.height,homeSize,homeWidth);
  const imageStyle = home ? [s.homeLogo, fitted] : [s.brandIcon, dense && {width:small?18:22,height:small?18:22}];
  const showImage = Boolean(file) && failed !== identity;
  const image = showImage ? (
    <View ref={imageNode} style={imageStyle}>
      <DefaultFile
        key={identity}
        file={file}
        company={selectedCompany}
        accessibilityLabel={`Logo ${label}`}
        resizeMode="contain"
        style={[imageStyle, s.remote]}
        onLoad={event => {
          const source=event?.nativeEvent?.source;
          const target=event?.nativeEvent?.target;
          const width=source?.width || target?.naturalWidth;
          const height=source?.height || target?.naturalHeight;
          if(width>0 && height>0)setDimensions({identity,width,height});
        }}
        onError={() => setFailed(identity)}
      />
    </View>
  ) : null;

  if (home) return image;

  return (
    <View style={[s.brand,dense && {gap:4}]}>
      {image}
      {!compact && (
        <View
          style={s.label}
          onLayout={event => setLabelWidth(Math.round(event.nativeEvent.layout.width))}>
          <CompanyName key={JSON.stringify([label,labelWidth,dense,small])} label={label} color={textColor} dense={dense} small={small} />
          {subtitle ? (
            <Text style={[s.subtitle, {color: c.textMuted}]}>GESTÃO INTEGRADA</Text>
          ) : null}
        </View>
      )}
      {trailing}
    </View>
  );
}

const s = StyleSheet.create({
  brand: {flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, minWidth: 0},
  label: {flex: 1, minWidth: 0},
  // Company marks retain their full artwork rather than a user-avatar crop.
  brandIcon: {width: 40, height: 40, flexShrink: 0},
  homeLogo: {width: 28, height: 28, flexShrink: 0},
  remote: {position: 'absolute', top: 0, left: 0},
  title: {fontWeight: '600'},
  denseTitle: {textAlign: 'center'},
  completeTitle: {flexShrink: 1, minWidth: 0},
  fullTitle: {width: '100%'},
  subtitle: {fontSize: 9, letterSpacing: 1.5, marginTop: 4},
});
