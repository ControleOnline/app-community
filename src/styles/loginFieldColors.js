import {resolveAppDomain} from '@controleonline/ui-common/src/utils/appDomain';

export function resolveLoginFieldColors(theme, configuredDomain) {
  const laveGo = resolveAppDomain(configuredDomain).toLowerCase() === 'app.lave-go.com';
  return {
    backgroundColor: theme.loginInputBackground || (laveGo ? '#FFFFFF' : theme.inputBackground),
    textColor: theme.loginInputText || (laveGo ? '#000000' : theme.inputText),
    placeholderColor: theme.loginInputPlaceholderText || (laveGo ? '#000000' : theme.inputPlaceholderText),
  };
}
