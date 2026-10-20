import React from 'react';
import HomePage from '@controleonline/ui-manager/src/react/pages/home/index';
import ManagerOverview from '../components/manager-preview/ManagerOverview';
import ManagerStartup from '../components/manager-preview/ManagerStartup';
import {managerPreviewEnabled} from '../components/manager-preview/model';
import {useStore} from '@store';

export default function OnGestorHome(props) {
  const {isLogged} = useStore('auth').getters;
  if (managerPreviewEnabled) return isLogged ? <ManagerOverview {...props} /> : <ManagerStartup />;
  return <HomePage {...props} appearance="soft" />;
}
