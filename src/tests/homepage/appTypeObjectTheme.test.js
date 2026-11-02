import {appTypeThemeStyles} from '@controleonline/ui-common/src/react/components/AppTypeSwitcher.styles';
jest.mock('react-native',()=>({StyleSheet:{create:value=>value}}));
it('maps the shared selector to object tokens without substituting missing colors',()=>{
 const colors={selectBackground:'select',selectBorder:'line',selectText:'ink',selectIcon:'arrow',modalBackground:'sheet',modalOverlay:'scrim',modalHeaderText:'title',selectOptionSelectedBackground:'selected',inputText:'input'};
 const styles=appTypeThemeStyles(colors);
 expect(styles.button).toEqual({backgroundColor:'select',borderColor:'line'});
 expect(styles.buttonText.color).toBe('ink');
 expect(styles.modalPanel.backgroundColor).toBe('sheet');
 expect(styles.optionRowActive.backgroundColor).toBe('selected');
 expect(appTypeThemeStyles({}).button.backgroundColor).toBeUndefined();
 expect(appTypeThemeStyles({}).modalTitle.color).toBeUndefined();
 expect(colors).not.toHaveProperty('cardBackground');
});
