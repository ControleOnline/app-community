import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {resolveCompanyMedia} from './companyMedia';
import {companyInitialsFromName} from '@controleonline/ui-manager/src/react/utils/companyInitials';

// Keep company artwork separate from the circular user-avatar presentation.
export default function ManagerCompanyLogo({company, size = 32, colors: c}) {
  const file = resolveCompanyMedia(company);
  const identity = JSON.stringify([company?.id, file]);
  const [loaded, setLoaded] = useState(null);
  const [failed, setFailed] = useState(null);
  const label = company?.alias || company?.name || 'Empresa';
  return <View style={{width: size, height: size, flexShrink: 0, alignItems: 'center', justifyContent: 'center'}}>
    {loaded !== identity || failed === identity
      ? <Text style={{color: c.textPrimary, fontSize: 12}}>{companyInitialsFromName(label)}</Text>
      : null}
    {file && failed !== identity && <DefaultFile key={identity} file={file} company={company}
      accessibilityLabel={`Logo ${label}`} resizeMode="contain"
      style={[StyleSheet.absoluteFillObject, {width: size, height: size}]}
      onLoad={() => setLoaded(identity)} onError={() => setFailed(identity)} />}
  </View>;
}
