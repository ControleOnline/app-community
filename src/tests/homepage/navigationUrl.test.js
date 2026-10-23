import {publicNavigationPath} from '../../routers/browserPath';

it('keeps a PDV reset signal out of the address', () => {
  expect(publicNavigationPath('/pdv-page?catalogResetKey=menu%3A1792712561898%3A1')).toBe('/pdv-page');
});

it('preserves business parameters, their encoding and the fragment', () => {
  const path = '/pdv-page?orderId=70&catalogResetKey=launch%3A70&search=caf%C3%A9%20com%20leite&categoryId=12#products';
  expect(publicNavigationPath(path)).toBe('/pdv-page?orderId=70&search=caf%C3%A9%20com%20leite&categoryId=12#products');
  expect(publicNavigationPath('/pdv-page?catalogResetKey=menu%3A1#products')).toBe('/pdv-page#products');
});

it('keeps unrelated URLs and parameter values unchanged', () => {
  for (const path of ['/pdv-page', '/orders?id=70', '/products?search=catalogResetKey', '/products#catalogResetKey=example']) {
    expect(publicNavigationPath(path)).toBe(path);
  }
});
