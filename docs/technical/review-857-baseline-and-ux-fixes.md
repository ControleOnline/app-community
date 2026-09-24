# #857 — baseline dos dois achados e revisão das correções

## Comparação direta solicitada

Foi compilada a base `d84cfa176d5d24c5b9830c720e6b0f518f53e58c` com seus gitlinks, autenticação na mesma conta de revisão, API real `dd.controleonline.com`, mesma rota `/my-company-details?clientId=103054&contextKey=company` e viewport móvel `390x844`.

- **Abas (Design): preexistente em d84.** Na faixa Geral/Fiscal/Media/Sellers/Franchise Links/Contacts/Contracts, `Franchise Links` termina em x=283.8, `Contacts` começa em x=276.5 (sobreposição de ~7 px), e `Contracts` termina em x=394.8. Não havia rolagem horizontal para recuperar os rótulos.
- **Vendedores (UX): preexistente em d84.** Estado vazio exibiu somente `Nenhum vendedor vinculado`, sem orientação ou ação para continuar.
- Os mesmos dois achados estavam registrados no snapshot `4c02072a1291e9f0fe8b70d23a13a163c6a6c08d`. Portanto, não foram introduzidos pela composição. O checklist canônico, porém, rejeita qualquer `fail` de tela/jornada e não prevê dispensa automática de falha preexistente; a correção dos dois pontos foi explicitamente autorizada para desbloquear os gates.

## Correção mínima e evidências

Atualização apenas em `ui-customers`, integrada na branch da composição pelo PR #36 (implementação) e PR #37 (regressões focadas). A composição foi integrada em `rc/1.10.31-rc.9`: ui-customers `1b2c45c7790c932613156fd0616d8075ac363b85`, ui-people `fb105d4577e8a8f560e720b56720a602519ef7db`, ui-default `db2790e195642742f77255cee53c1e0053771310`. Os respectivos trees preservam os arquivos revisados em `e1130fdf37a0b054794136540ec487c18ba3eeb5`, `4cec40bad47498aafe9af1cc83edf0473760025a` e `9f8846a53114e9ecb0c211008458f1054471cef4`.

- Abas e skeleton usam faixa horizontal rolável. Em 390x844: largura rolável de 568 px, sem sobreposição; a aba fora da primeira tela abriu por clique. Em 1440x1000: todos os rótulos cabem sem overflow.
- No vazio de Vendedores, a conta sem permissão de gestão recebeu instrução para pedir a um administrador. A ação visível `Vincular vendedor` continua condicionada ao `canManage` existente e abre o modal de associação já usado no fluxo com permissão. Nenhuma regra de vínculo, endpoint ou gravação foi alterada.
- `npm run test:salesman-tab`: 14 testes passaram, incluindo 2 novos testes dos comportamentos aprovados. Build web Expo passou no SHA exato com helper de apresentação e testes. Playwright 1.60 autenticado: zero pageerrors, zero erros HTTP relacionados à API; um 404 isolado de Gravatar. O workflow suplementar Actions 36027223608 teve baseline-checks aprovado e quatro browser-smokes falhando por sessão staging/credenciais ausentes, CORS do tema e timeouts de API; falhas mantidas visíveis, sem serem chamadas de aceite nem atribuídas aos dois ajustes.

#809/#835 seguem preservadas pelos pins preexistentes de `ui-orders` e pela ancestralidade da PR #846. A RC ainda não está congelada nem promovida. O produto permanece delimitado à #857. Estes resultados ainda não são pareceres formais de Design/UX/QA/Security nem homologação: cada gate deve decidir sobre os SHAs integrados à nova RC.
