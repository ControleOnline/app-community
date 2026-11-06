import {readCompanyBranding, fitCompanyLogo, logoForMode, validLogoReference} from '../../components/manager-preview/companyBranding';
it('selects explicit variants for each mode without borrowing the opposite artwork',()=>{
 const company={configs:{company_branding:JSON.stringify({logoLight:'/light.svg',logoDark:'/dark.svg'})}};
 expect(logoForMode(company,'light')).toBe('/light.svg');expect(logoForMode(company,'dark')).toBe('/dark.svg');
 expect(logoForMode({configs:{company_branding:{logoDark:'/white.svg'}}},'light')).toBeNull();
 expect(readCompanyBranding({configs:{company_branding:'bad json'}})).toEqual({logoLight:'',logoDark:''});
});
it('fits round, portrait and rectangular artwork without cropping or square padding',()=>{
 expect(fitCompanyLogo(200,200,40,80)).toEqual({width:40,height:40});
 expect(fitCompanyLogo(400,100,40,80)).toEqual({width:80,height:20});
 expect(fitCompanyLogo(100,200,40,80)).toEqual({width:20,height:40});
 expect(fitCompanyLogo(400,100,40,40)).toEqual({width:40,height:10});
});
it('only accepts image addresses supported by the normal file loader',()=>{
 expect(validLogoReference('/files/12/download')).toBe(true);expect(validLogoReference('https://example.test/logo.png')).toBe(true);
 expect(validLogoReference('')).toBe(true);expect(validLogoReference('javascript:alert(1)')).toBe(false);expect(validLogoReference('data:image/png;base64,x')).toBe(false);
});
