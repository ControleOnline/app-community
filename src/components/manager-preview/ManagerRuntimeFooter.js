import React from 'react';
import RuntimeInfoFooter from '../../../node_modules/@controleonline/ui-common/src/react/components/RuntimeInfoFooter';
import {managerPreviewEnabled} from './model';

// Reuse the shared centered spacing; retain legacy appearance outside this preview.
export default function ManagerRuntimeFooter(props) {
  return <RuntimeInfoFooter {...props} appearance={managerPreviewEnabled ? 'soft' : props.appearance} />;
}
