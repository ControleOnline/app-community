import contract from '../../../styles/themeContract.generated';
import {recordSave} from './store';
const colors={primary:'#0369a1',secondary:'#475569',background:'#f3f5fa',text:'#0f172a',border:'#cbd5e1'};
for(const mode of ['light','dark'])for(const token of contract.names){
  let value=mode==='light'?'#ffffff':'#172033';
  if(/Text|Icon|text|Spinner/.test(token))value=mode==='light'?'#0f172a':'#e2e8f0';
  if(/Border/.test(token))value=mode==='light'?'#cbd5e1':'#475569';
  if(token==='buttonBackground')value='#0369a1';
  if(token==='buttonText')value='#ffffff';
  if(token==='buttonDisabledOpacity')value='0.5';
  if(token==='containerTransparentBackground')value='transparent';
  colors[`${token}-${mode}`]=value;
}
let theme={id:99,theme:'Demonstração local — sem banco',colors};
export const api={fetch:async(resource,options={})=>{
  const name=resource.replace(/^\//,'');
  if(name==='themes-colors.css')return ':root{'+Object.entries(theme.colors).map(([key,value])=>`--${key}:${value};`).join('')+'}';
  if(name==='people_domains')return {'hydra:member':[{domain:'localhost:8084',theme:'/themes/99'}]};
  if(name==='themes/99'){
    if(options.method==='PUT'){theme={...theme,...options.body};recordSave();}
    return JSON.parse(JSON.stringify(theme));
  }
  throw new Error('Esta demonstração não acessa a API real.');
}};
