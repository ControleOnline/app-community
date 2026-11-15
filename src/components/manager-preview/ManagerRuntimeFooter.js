import React from 'react';
import {Platform} from 'react-native';
import {colors} from '../../styles/ThemeColors';
import RuntimeInfoFooter from '../../../node_modules/@controleonline/ui-common/src/react/components/RuntimeInfoFooter';
import {managerPreviewEnabled} from './model';

// Reuse the shared centered spacing; retain legacy appearance outside this preview.
export default function ManagerRuntimeFooter(props) {
  const footerColors = Platform.OS === 'web' ? {...props.colors, footerText: colors.footerCompanyText} : props.colors;
  return <RuntimeInfoFooter {...props} colors={footerColors} appearance={managerPreviewEnabled ? 'soft' : props.appearance} />;
}
