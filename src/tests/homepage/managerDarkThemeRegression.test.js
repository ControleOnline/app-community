import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {resolveManagerTheme} from '../../styles/managerTheme';
import {managerTableTheme} from '../../components/manager-preview/managerTableTheme';
import {useDefaultTableStoreSync} from '../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableStoreSync';

jest.mock('../../../node_modules/@controleonline/ui-default/src/react/utils/tableVisibleColumnsPreferences',()=>({
 persistTableFiltersPreference:jest.fn(),resolveStoredTableFiltersPreference:()=>null,
 resolveStoredVisibleColumnsPreference:()=>null,sanitizeTableFiltersPreference:({filters})=>filters||{},
 sanitizeVisibleColumnsPreference:({visibleColumns})=>visibleColumns||[],
}));
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
const domain={darkCard:'night-card',darkBorder:'night-border','bg-dark':'night-page',
 'bg-headers-dark':'night-header','bg-even-dark':'night-even','bg-odd-dark':'night-odd',
 'bg-menu-dark':'night-nav','text-headers-dark':'night-text','text-menu-dark':'night-muted',
 cardBackground:'day-card',toolbarBackground:'day-toolbar',tableFooterBackground:'day-footer',
 tableFooterText:'day-text',badgeBackground:'day-badge',badgeText:'day-text',
 navigationActiveIcon:'day-icon',navigationActiveText:'day-nav',tableActionIcon:'day-action',
 buttonBackground:'brand',buttonText:'brand-ink',orderStatusPaid:'paid'};
it('maps shared list surfaces, text and selected navigation to the configured dark tokens',()=>{
 const colors=managerTableTheme(resolveManagerTheme(domain,'dark'));
 expect(colors).toMatchObject({toolbarBackground:'night-card',tableFooterBackground:'night-card',
  tableFooterText:'night-text',badgeBackground:'night-header',badgeText:'night-text',
  navigationActiveIcon:'night-text',navigationActiveText:'night-text',tableActionIcon:'night-text',
  buttonBackground:'brand',buttonText:'brand-ink',orderStatusPaid:'paid'});
 expect(resolveManagerTheme(domain,'light')).toMatchObject({toolbarBackground:'day-toolbar',tableFooterBackground:'day-footer'});
 expect(domain.cardBackground).toBe('day-card');
});
function Table({store,renderCard,storeName='people'}){
 useDefaultTableStoreSync({columns:[],columnsForTable:[],defaultTableConfigs:{renderCard},
  defaultTableConfigsSignature:'unchanged-data-and-filters',store,storeColumnsLength:0,
  storeFilters:{},storeName,tablePreferenceScope:{companyKey:'3',storeKey:'people',routeKey:'clients'}});
 return null;
}
it('draws custom cards with current theme without publishing configs on every callback identity change',()=>{
 const store={getters:{},actions:{}};
 store.actions.setConfigs=jest.fn(config=>{store.getters.configs=config;});
 let tree;const renderLight=()=>React.createElement('card',{background:'day-card'});
 act(()=>{tree=renderer.create(<Table store={store} renderCard={renderLight}/>);});
 expect(store.getters.configs.renderCard().props.background).toBe('day-card');
 act(()=>{tree.update(<Table store={store} renderCard={()=>React.createElement('card',{background:'night-card'})}/>);});
 expect(store.getters.configs.renderCard().props.background).toBe('night-card');
 expect(store.actions.setConfigs).toHaveBeenCalledTimes(1);
 act(()=>{tree.update(<Table store={store} renderCard={null}/>);});
 expect(store.getters.configs.renderCard).toBeNull();
 act(()=>tree.unmount());
});

it('keeps renderers isolated when the table changes store owner',()=>{
 const a={getters:{},actions:{}};const b={getters:{},actions:{}};
 for(const store of [a,b])store.actions.setConfigs=jest.fn(config=>{store.getters.configs=config;});
 let tree;act(()=>{tree=renderer.create(<Table store={a} renderCard={()=>'A'}/>);});
 const saved=a.getters.configs.renderCard;
 act(()=>{tree.update(<Table store={b} storeName="products" renderCard={()=>'B'}/>);});
 expect(saved()).toBe('A');expect(b.getters.configs.renderCard()).toBe('B');
 act(()=>{tree.update(<Table store={b} storeName="products" renderCard={null}/>);});
 expect(b.getters.configs.renderCard).toBeNull();
 act(()=>{tree.update(<Table store={b} storeName="products" renderCard={()=>'B2'}/>);});
 expect(b.getters.configs.renderCard()).toBe('B2');expect(saved()).toBe('A');
 act(()=>tree.unmount());
});

it('maps avatar background and initials to configured dark theme tokens',()=>{
 expect(resolveManagerTheme(domain,'dark')).toMatchObject({cardIconBackground:'night-header',cardIconColor:'night-text'});
});
