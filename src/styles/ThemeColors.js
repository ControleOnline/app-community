import {Platform} from 'react-native';
import contract from './themeContract.generated';

// Web variable references retain provenance even in styles created before the API responds.
export const colors=Object.fromEntries(contract.names.map(name=>[name,Platform.OS==='web'?`var(--co-theme-${name})`:undefined]));
for(const name of ['primary','secondary','background','text','border','success','warning','error','info','white','black']) {
  colors[name]=Platform.OS==='web'?`var(--co-theme-${name})`:undefined;
}
export default colors;
