import React from 'react';
import {useRoute} from '@react-navigation/native';
import {isPublicRoute} from '@controleonline/ui-common/src/react/router/publicRoutes';
import {useStore} from '@store';
import AppTypeSwitcher from '../../node_modules/@controleonline/ui-common/src/react/components/AppTypeSwitcher';

// Keep the shared ADMIN selector unavailable until authentication is established.
export default function AuthenticatedAppTypeSwitcher(props) {
  const route = useRoute();
  const {isLogged} = useStore('auth').getters;
  return isLogged && !isPublicRoute(route.name) ? <AppTypeSwitcher {...props} /> : null;
}
