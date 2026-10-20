import React from 'react';
import {useStore} from '@store';
import DefaultLayout from '@controleonline/ui-layout/src/react/layouts/DefaultLayout';
import {isPublicRoute} from '@controleonline/ui-common/src/react/router/publicRoutes';
import {managerPreviewEnabled} from './model';
import ManagerShell from './ManagerShell';

export default function ManagerLayout(props) {
  const {isLogged} = useStore('auth').getters;
  if (!managerPreviewEnabled || !isLogged || isPublicRoute(props.route?.name)) return <DefaultLayout {...props} />;
  return <ManagerShell {...props} />;
}
