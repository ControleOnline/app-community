import {resolveLoginFieldColors} from '../../styles/loginFieldColors';
import contract from '../../styles/themeContract.generated';

const form = {inputBackground:'#ffcc00',inputText:'#fafafa',inputPlaceholderText:'#666666'};

test('uses the theme field colors when dedicated login values are absent even for Lave-Go', () => {
  expect(resolveLoginFieldColors(form, 'https://app.lave-go.com')).toEqual({
    backgroundColor:'#ffcc00',textColor:'#fafafa',placeholderColor:'#666666',
  });
});

test('allows each login color to be set independently through the theme contract', () => {
  const keys = ['loginInputBackground', 'loginInputText', 'loginInputPlaceholderText'];
  expect(contract.names).toEqual(expect.arrayContaining(keys));
  expect(resolveLoginFieldColors({...form,loginInputBackground:'#eee',loginInputText:'#222',
    loginInputPlaceholderText:'#333'}, 'https://app.lave-go.com')).toEqual({
    backgroundColor:'#eee',textColor:'#222',placeholderColor:'#333',
  });
});

test('retains the shared field colors on domains without a login palette', () => {
  expect(resolveLoginFieldColors(form, 'https://app.controleonline.com')).toEqual({
    backgroundColor:'#ffcc00',textColor:'#fafafa',placeholderColor:'#666666',
  });
});

test('the sign-in link labels have their own theme tokens (#1506)', () => {
  expect(contract.names).toEqual(expect.arrayContaining(['loginLabelCreateAccount', 'loginLabelForgotPassword']));
});
