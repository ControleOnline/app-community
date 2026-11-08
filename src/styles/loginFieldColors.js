export function resolveLoginFieldColors(theme) {
  return {
    backgroundColor: theme.loginInputBackground || theme.inputBackground,
    textColor: theme.loginInputText || theme.inputText,
    placeholderColor: theme.loginInputPlaceholderText || theme.inputPlaceholderText,
  };
}
