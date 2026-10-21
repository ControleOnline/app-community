# Integração local ui-common 1.2.98 / ui-people 1.0.99 — #1117

## Melhorias do time preservadas

- ui-common: formatRuntimeFooterIdentifier mantém IPv4 completo e abrevia identificadores longos separados por dois-pontos para reticências + dois últimos blocos. O formatador novo não foi substituído por nossa versão antiga.
- ui-people: coluna editável appType em people_domains, vocabulário/formatadores de tipo de app, armazenamento normalizado do app-type retornado por mainCompany. Cadastro/consulta e regras de seleção continuam nos módulos compartilhados.

## Conciliação

O pacote common novo retira suporte de aparência usado pelo nosso dock/rodapé, a preservação da navegação durante bootstrap de traduções e headers nativos do avatar. Mantivemos os comportamentos locais aprovados nesses pontos, preservando o delta útil da equipe. People/card recebeu somente a base visual já aprovada; o delta novo de domínio permaneceu.

Fontes editáveis dos módulos: `.codex/task-1117/modules/ui-common` e `ui-people` no workspace pai, branch task-1117. A instalação local e os manifests/payloads existentes foram atualizados para 1.2.98/1.0.99. Quatro arquivos adicionais do common passam a ser reproduzidos pelo manifesto manager-package-reconciliation.json, executado no script de auditoria já usado pelo preview. Eles não substituem a futura integração/publicação dos módulos fonte.

Também foi retirada do manifesto PDV a entrada antiga que substituía o package.json de ui-products por uma cópia 1.0.36. O pacote 1.0.37 e sua correção de ProductForm permanecem. Hashes de ProductCatalogCacheService foram normalizados conforme a leitura LF do aplicador. Os aplicadores passaram sem escrita adicional depois da conciliação.

## Evidências disponíveis

- Manager: 75 suítes / 301 testes passaram.
- Compartilhados: 23 suítes / 138 Jest e 2 Node passaram.
- Formatador de rodapé: 18 Node passaram.
- ui-people: 3 suítes / 10 testes passaram, incluindo mainCompany e seleção da empresa. A execução inicial não descobria os testes porque o runner era de outros módulos; jest.people-compat.config.cjs delimita os roots corretos e a execução por caminho confirmou os testes.
- Web nova exportada e autenticada na API local; Clientes GYROS: 648 registros, 1–20 → 21–40. Capturas no diretório de evidências.
- APK x86 compilado. A primeira instalação foi recusada porque o projeto Android local ainda marcava 1.10.62/11031, abaixo do app instalado 1.10.72/110072. Metadados locais corrigidos e reempacotamento iniciado, sem apagar dados.

## Em andamento / não aprovados ainda

- Web antiga: exportação separada com flag 0, para comparar a mesma empresa. A exportação inicial ficou retida na varredura de arquivos com pressão de I/O; retomada com a configuração local já existente que exclui pastas nativas/artefatos da varredura. Não é mudança visual ou de produção.
- Instalação e smoke do APK corrigido no AVD.
- Lavego single-item: credencial local disponível foi recusada em POST /token com HTTP 401. Solicitado contexto de teste ao usuário; não houve troca de senha, configuração de device ou criação de venda. Não atribuir o smoke GYROS à Lavego.

A conciliação permanece local, conforme instrução humana. Sem push, merge remoto, publicação npm, deploy ou entrega definitiva declarada. Evidências: `/home/spawnbtc/allprojects/controle-online/.codex/task-1117/evidence/`.

## Fechamento desta rodada — substitui as pendências de execução acima

- **Web nova e antiga:** mesma conta LEANDRO, mesma empresa GYROS, 648 clientes. Home e Clientes abriram nas duas. A nova avançou 1–20 → 21–40. A antiga manteve sua composição própria. A empresa ausente no primeiro ensaio era um defeito do servidor de teste: endpoints com `/people` absoluto saíam do prefixo de proxy e recebiam HTML, normalizado como coleção vazia. O encaminhamento local foi corrigido; não foi preciso alterar o core por essa ocorrência. Diagnóstico temporário de booleanos/contagem foi removido do bundle após identificar a causa.
- **AVD novo:** APK corrigido 1.10.72/110072 instalado com `-r`, sem apagar dados. Sessão LEANDRO/GYROS confirmada, foto do avatar carregada, Home e Clientes conferidos. Claro/escuro e paginação 1–10 → 11–20 de 648 conferidos. Artefato dedicado: `.codex/task-1117/on-manager-1.10.72-ui-common-1.2.98-ui-people-1.0.99-avd.apk`; hash em `evidence/android-final.sha256`. Pacote localpreview x86, assinatura de desenvolvimento: não é o pacote oficial de loja.
- **AVD antigo:** app de desenvolvimento existente `com.controleonline.manager`, carregando os fontes atuais com as flags de preview em 0 pelo Metro 8081. Clientes/GYROS/648 conferidos. A identidade antiga do binário e a versão persistida podem continuar aparecendo no rodapé; não foi gerado um APK release separado do layout antigo. O primeiro carregamento teve diálogo Android de app sem resposta durante o carregamento pesado; reabertura com bundle pronto funcionou. O app de desenvolvimento avisa que Firebase não está configurado; push não foi validado. O novo APK ficou em primeiro plano ao encerrar.
- **Lavego real:** a credencial funcionou na API oficial indicada pelo workflow (`https://apinew.lave-go.com`), não na API local GYROS. Consultas autorizadas confirmaram `device_config` 38, device 518 (`web-14`, alias app), `pos-operation-mode=single-item`, empresa LAVE-GO - FRANQUIAS. No navegador, a nova versão local usando essa API entrou no PDV e seguiu diretamente para `products-page/__all_products__`, mostrando os quatro serviços reais com quantidades em zero. Não se tocou em produto, quantidade, conferência ou pagamento.
- **Proteção de produção:** o servidor de ensaio Lavego encaminhou somente 45 GETs e um POST de autenticação. Bloqueou 3 POSTs de discovery, 3 PUTs de device e 11 POSTs de resolução de tradução. Nenhuma gravação comercial/configuração foi encaminhada. Não foi usado proxy com gravações liberadas nem desativada verificação de certificado. O servidor protegido foi encerrado depois do teste.
- **Contrato single-item:** os dez testes de addProductCatalogMode passaram; isso é cobertura do contrato compartilhado, não prova adicional de venda/pagamento em produção.

### Limites que continuam abertos

1. O tema atual da Lavego retorna o aviso de token ausente `bg-even-light`. Nenhuma cor/configuração de produção foi alterada para escondê-lo. A configuração de tema da Lavego precisa ser conciliada antes de aprovar esse domínio com o novo layout.
2. O single-item real da Lavego foi validado **na web**. Não foi validado como sessão Lavego em um device Android autorizado e configurado para esse modo. O AVD novo/antigo usou GYROS; não foi registrada uma configuração Android em produção nem copiada a identidade `web-14` para o emulador.
3. Consolidação remota dos fontes, versões npm de entrega e pacote oficial permanecem fora desta etapa local, por instrução humana de não publicar. Não marcar #1117 como entregue/publicada nem confundir os overlays reproduzíveis com módulos publicados.

Master do app reconfirmada ao final: `a22cf68a1c795ce77efacb8c29a000bace7c8b67`. Guardas dos módulos alterados: 19 entradas verificadas sem divergência. `git diff --check` passou no app e nas duas cópias de fontes dos módulos.

### Teste humano no AVD deixado aberto

1. Confira GYROS e a lista de Clientes na página 2 (`11–20 de 648`).
2. Volte à página 1 e alterne claro/escuro no cabeçalho.
3. Abra Home e depois PDV pelo menu para conferir os cards aprovados.
4. Evite adicionar itens se a intenção for somente conferir apresentação. A sessão Lavego de produção foi encerrada no navegador de teste e não ficou aberta no AVD.
