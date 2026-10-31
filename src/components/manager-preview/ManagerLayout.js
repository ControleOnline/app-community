import React from 'react';
import {View} from 'react-native';
import {useStore} from '@store';
import DefaultLayout from '@controleonline/ui-layout/src/react/layouts/DefaultLayout';
import {isPublicRoute} from '@controleonline/ui-common/src/react/router/publicRoutes';
import {managerPreviewEnabled} from './model';
import ManagerShell from './ManagerShell';
import ManagerStartup from './ManagerStartup';

/**
 * Auth / OAuth surfaces share the login chrome-free surface (no Manager
 * sidebar, header or bottom bars) even when the user is already signed in.
 */
const AUTH_BARE_ROUTES = new Set([
  'SignInPage',
  'CreateAccount',
  'ConfirmAccountPage',
  'ResetPasswordPage',
  'OauthDiscordCallbackPage',
  'McpOAuthConsentPage',
  'ForcedChangePasswordPage',
]);

export default function ManagerLayout(props) {
  const {isLogged} = useStore('auth').getters;
  const routeName = props.route?.name;

  if (!managerPreviewEnabled) {
    return <DefaultLayout {...props} />;
  }

  if (AUTH_BARE_ROUTES.has(routeName)) {
    return (
      <View
        accessibilityLabel="Auth layout"
        style={{flex: 1, backgroundColor: 'transparent'}}>
        {props.children}
      </View>
    );
  }

  if (isPublicRoute(routeName)) {
    return <DefaultLayout {...props} />;
  }

  if (!isLogged) {
    return <ManagerStartup />;
  }

  return <ManagerShell {...props} />;
}
