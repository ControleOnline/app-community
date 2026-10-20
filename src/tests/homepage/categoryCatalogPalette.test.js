jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>({DefaultTableThemeContext:require('react').createContext(null)}));
import {resolveCategoryPresentationPalette} from '@controleonline/ui-products/src/react/pages/CategoriesPage/categoryPresentationPalette';
/* global it, expect */
it('uses resolved presentation surfaces without replacing company brand colors',()=>{
 const company={background:'day',cardBackground:'white',cardText:'black',primary:'company-brand',buttonBackground:'brand'};
 const resolved={pageBackground:'night-page',cardBackground:'night-card',cardBorder:'night-border',textPrimary:'night-text',textMuted:'night-muted'};
 expect(resolveCategoryPresentationPalette(company,resolved,true)).toMatchObject({background:'night-page',cardBackground:'night-card',cardText:'night-text',text:'night-text',textSecondary:'night-muted',cardBorder:'night-border',primary:'company-brand',buttonBackground:'brand'});
 expect(resolveCategoryPresentationPalette(company,resolved,false)).toBe(company);
 expect(resolveCategoryPresentationPalette(company,null,true)).toBe(company);
});
