// Isolated local contract/visual probe. Never connects to the ERP API.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../src/experience');
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jornada · prova local</title>
<style>body{margin:0;background:#0b1018;color:#edf1f9;font:14px system-ui}main{max-width:960px;margin:auto;padding:28px}h1{font-size:25px}p,small{color:#a3afc2;line-height:1.6}section{border:1px solid #273140;border-radius:18px;padding:20px;background:#141b27;margin:16px 0}button{font:inherit;margin:4px;padding:11px 15px;border-radius:10px;border:1px solid #3b4a60;background:#182131;color:#edf1f9;cursor:pointer}button:focus-visible{outline:2px solid #ffbd78}canvas{width:280px;height:280px}#scene{display:flex;gap:20px;align-items:center;flex-wrap:wrap}#events{max-height:200px;overflow:auto;font-size:12px;line-height:1.7}#fallback{font-size:80px}strong{color:#ffbd78}</style>
<main><small>CONTROLE ONLINE · AMBIENTE ISOLADO DE VALIDAÇÃO</small><h1>Jornada observável</h1><p>Dados de demonstração. Esta página não acessa a API nem a sessão do ERP.</p>
<section><h2>Leitura e antecipação</h2><button id="home">Dashboard</button><button id="clients">Clientes</button><button id="predict">Preparar Clientes</button><button id="company">Trocar empresa de teste</button><button id="app">Alternar MANAGER / SHOP</button><p id="result" aria-live="polite">Comece por Clientes. A resposta de teste demora cerca de 600 ms.</p><p id="stats"></p></section>
<section><h2>Acontecimentos correlacionados</h2><p>Tempo de consulta e apresentação são observações distintas. Nenhum corpo de resposta aparece no registro.</p><div id="events"></div></section></main>
<script type="module">
import {createErpExperience} from '/experience/erpAdapter.js';
const $=id=>document.getElementById(id);
let context={application:'MANAGER',company:'3',principal:'synthetic-user',session:'synthetic-session'};
const api={fetch:async()=>{const response=await fetch('/fixture');return response.json();}};
const x=createErpExperience({api,getContext:()=>context,cacheTtlMs:1000});x.install();x.setCapabilities(['ClientsIndex']);
x.journal.subscribe(()=>{const snap=x.journal.snapshot();$('events').replaceChildren(...snap.events.slice(-16).map(e=>{const p=document.createElement('div');p.textContent=e.journeyId+' · '+e.type+' · '+(e.route||e.resource||'')+(e.durationMs!==undefined?' · '+e.durationMs.toFixed(1)+' ms':'');return p;}));const s=x.stats();$('stats').textContent='Reusos: '+s.hits+' · Antecipações aproveitadas: '+s.predictionHits+' · Contexto: '+context.application+' / empresa '+context.company;});
x.begin('HomePage','trigger');x.present('HomePage');
const query=()=>({params:{'link.company':'/people/'+context.company,'link.linkType':'client',itemsPerPage:20,page:1}});
$('clients').onclick=async()=>{x.begin('ClientsIndex','click');x.present('ClientsIndex');$('result').textContent='Consultando…';const t=performance.now();try{await api.fetch('people',query());$('result').textContent='Leitura de demonstração disponível em '+(performance.now()-t).toFixed(1)+' ms';x.dataCommitted('ClientsIndex');}catch{$('result').textContent='Leitura descartada: o contexto mudou.';}};
$('home').onclick=()=>{x.begin('HomePage','click');x.present('HomePage');$('result').textContent='Volte para Clientes para conferir o reaproveitamento.';};
$('predict').onclick=async()=>{$('result').textContent='Preparando uma leitura permitida…';const ok=await x.prefetchRoute('ClientsIndex');$('result').textContent=ok?'Leitura preparada. Abra Clientes para aproveitá-la.':'Sem receita permitida neste contexto. Visite Clientes primeiro.';};
$('company').onclick=()=>{context={...context,company:context.company==='3'?'9':'3'};x.present('HomePage');$('result').textContent='Contexto alterado; respostas anteriores foram descartadas.';};
$('app').onclick=()=>{context={...context,application:context.application==='MANAGER'?'SHOP':'MANAGER'};x.present('HomePage');$('result').textContent='Mesmo contrato; contexto de aplicativo diferente.';};
</script></html>`;
http.createServer((req,res) => {
  const url = new URL(req.url,'http://localhost');
  if (url.pathname === '/') {res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html);return;}
  if (url.pathname === '/fixture') {setTimeout(()=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({member:[{id:1}],totalItems:1}));},600);return;}
  if (url.pathname.startsWith('/experience/')) {
    let relative = url.pathname.slice('/experience/'.length); if (!relative.endsWith('.js')) relative += '.js';
    const file = path.resolve(root,relative);
    if (file.startsWith(root+path.sep) && fs.existsSync(file) && file.endsWith('.js')) {res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(file));return;}
  }
  res.statusCode=404;res.end('Not found');
}).listen(8098,'127.0.0.1',()=>process.stdout.write('Isolated experience preview: http://127.0.0.1:8098/\n'));
