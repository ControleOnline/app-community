import React from 'react';
import SignIn from '@controleonline/ui-login/src/react/pages/sign-in';
import {managerPreviewEnabled} from './model';

// Reuse the real native login; the experimental web avatar is never mounted here.
export default function ManagerSignIn(props) {
  if (!managerPreviewEnabled) return <SignIn {...props} />;
  return <SignIn {...props} introMessage="Eu sou" createAccountLabel="Nova conta"
    identifierLabel="Usuário" identifierRequiredMessage="Usuário é obrigatório" identifierIcon="user" />;
}
