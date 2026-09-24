# #857 — baseline dos dois achados e revisão das correções

## Comparação direta solicitada

Foi compilada a base `d84cfa176d5d24c5b9830c720e6b0f518f53e58c` com seus gitlinks, autenticação na mesma conta de revisão, API real `dd.controleonline.com`, mesma rota `/my-company-details?clientId=103054&contextKey=company` e viewport móvel `390x844`.

- **Abas (Design): preexistente em d84.** Na faixa Geral/Fiscal/Media/Sellers/Franchise Links/Contacts/Contracts, `Franchise Links` termina em x=283.8, `Contacts` começa em x=276.5 (sobreposição de ~7 px), e `Contracts` termina em x=394.8. Não havia rolagem horizontal para recuperar os rótulos.
- **Vendedores (UX): preexistente em d84.** Estado vazio exibiu somente `Nenhum vendedor vinculado`, sem orientação ou ação para continuar.
- Os mesmos dois achados estavam registrados no snapshot `4c02072a1291e9f0fe8b70d23a13a163c6a6c08d`. Portanto, não foram introduzidos pela composição. O checklist canônico, porém, rejeita qualquer `fail` de tela/jornada e não prevê dispensa automática de falha preexistente; a correção dos dois pontos foi explicitamente autorizada para desbloquear os gates.

## Correção mínima e evidências

Atualização apenas em `ui-customers`, integrada na branch da composição pelo PR #36. O pai aponta para `ca17f6fbcd7956924571247f0c6a3bc128f29264`.

- Abas e skeleton usam faixa horizontal rolável. Em 390x844: largura rolável de 568 px, sem sobreposição; a aba fora da primeira tela abriu por clique. Em 1440x1000: todos os rótulos cabem sem overflow.
- No vazio de Vendedores, a conta sem permissão de gestão recebeu instrução para pedir a um administrador. A ação visível `Vincular vendedor` continua condicionada ao `canManage` existente e abre o modal de associação já usado no fluxo com permissão. Nenhuma regra de vínculo, endpoint ou gravação foi alterada.
- `npm run test:salesman-tab`: 12 testes passaram. Build web Expo passou. Playwright 1.60 autenticado: zero pageerrors, zero erros HTTP relacionados à API; um 404 isolado de Gravatar.

#809/#835 seguem preservadas pelos pins preexistentes de `ui-orders` e pela ancestralidade da PR #846. O produto permanece delimitado à #857. Estes resultados ainda não são pareceres formais de Design/UX/QA/Security nem homologação: cada gate deve decidir sobre os SHAs integrados à nova RC.
