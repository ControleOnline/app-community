import {resolveLoginFieldColors} from '../../styles/loginFieldColors';
import contract from '../../styles/themeContract.generated';

const form = {inputBackground:'#ffcc00',inputText:'#fafafa',inputPlaceholderText:'#666666'};

test('keeps the Lave-Go login white with black text when dedicated colors are absent', () => {
  expect(resolveLoginFieldColors(form, 'https://app.lave-go.com')).toEqual({
    backgroundColor:'#FFFFFF',textColor:'#000000',placeholderColor:'#000000',
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
