import {describeThemeColor,resolveManagerTheme} from '../../styles/managerTheme';
test('reports the actual mode key, shared key and absent values without fabricating colors',()=>{
 const colors={'cardText-light':'#112233','cardText-dark':'#ffffff',buttonText:'#010203'};
 expect(describeThemeColor(colors,'cardText','light')).toEqual({value:'#112233',source:'cardText-light'});
 expect(describeThemeColor(colors,'buttonText','dark')).toEqual({value:'#010203',source:'buttonText'});
 expect(describeThemeColor(colors,'appBackground','light')).toEqual({value:'',source:null});
});
test('reports legacy aliases used by the runtime, including mode-specific table mappings',()=>{
 const colors={'bg-dark':'#102030','bg-headers-dark':'#203040',listItemEvenRow:'#abcdef'};
 expect(describeThemeColor(colors,'pageBackground','dark')).toEqual({value:'#102030',source:'bg-dark'});
 expect(describeThemeColor(colors,'tableRowEvenBackground','light')).toEqual({value:'#abcdef',source:'listItemEvenRow'});
 for(const token of ['pageBackground','headerBackground','cardText']){
  const item=describeThemeColor(colors,token,'dark');expect(item.value || undefined).toBe(resolveManagerTheme(colors,'dark')[token]);
 }
});

test('generated q aliases remain transport metadata and are not republished as independent mode colors',()=>{
 const theme={'cardText-light':'#112233','q-cardText-light':'#112233'};
 expect(resolveManagerTheme(theme,'light')).not.toHaveProperty('q-cardText-light');
 expect(describeThemeColor(theme,'cardText','light').source).toBe('cardText-light');
});
