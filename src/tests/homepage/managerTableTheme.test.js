import {managerTableTheme} from '../../components/manager-preview/managerTableTheme';

it('shares Manager tokens with default tables without discarding domain status and modal tokens', () => {
  const colors={cardBackground:'surface',textPrimary:'text',textMuted:'muted',buttonBackground:'accent',
    tableHeaderBackground:'header',tableRowOddBackground:'odd',tableRowEvenBackground:'even',
    cardBorder:'border',orderStatusPaid:'paid',modalBackground:'modal'};
  expect(managerTableTheme(colors)).toMatchObject({compact:true,background:'surface',primary:'accent',
    listItemOddRow:'odd',listItemEvenRow:'even',orderStatusPaid:'paid',modalBackground:'modal'});
  expect(colors).not.toHaveProperty('compact');
});

it('keeps the list canvas separate from cards in light and dark palettes',()=>{
 for(const mode of ['light','dark']){
  const colors={pageBackground:mode+'-page',cardBackground:mode+'-card',cardIconBackground:mode+'-avatar',cardIconColor:mode+'-ink'};
  expect(managerTableTheme(colors)).toMatchObject({panelBackground:mode+'-page',cardBackground:mode+'-card',cardIconBackground:mode+'-avatar',cardIconColor:mode+'-ink'});
 }
});
