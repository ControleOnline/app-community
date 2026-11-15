import React from 'react';
import SignIn from '@controleonline/ui-login/src/react/pages/sign-in';
import {managerPreviewEnabled} from './model';
import {managerSignInPresentation} from './managerSignInPresentation';

// Reuse the real native login; the experimental web avatar is never mounted here.
export default function ManagerSignIn(props) {
  if (!managerPreviewEnabled) return <SignIn {...props} />;
  return <SignIn {...props} {...managerSignInPresentation} />;
}
