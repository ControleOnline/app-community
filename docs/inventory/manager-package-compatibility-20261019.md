# Compatibilidade ui-common 1.2.98 / ui-people 1.0.99

Investigação vinculada a ControleOnline/app-community#1117. Experimento isolado em `/tmp/co-compat-1117/app`, sem incorporar dependências no checkout principal, alterar regras de negócio ou publicar.

## Resultado

A atualização não é substituição direta segura. O ui-common 1.2.98 contém a correção do formatador do rodapé, mas também retira arquivos e comportamentos usados pelos nossos ajustes de navegação, espaçamento do rodapé, bootstrap e avatar. O ui-people 1.0.99 não altera o arquivo do card People em relação à 1.0.97; acrescenta a configuração appType de domínio/empresa e a gravação de app-type ao selecionar a empresa.

Na primeira candidata, com reaplicação automática dos ajustes locais e conflitos mantidos no conteúdo novo, falharam 5 de 74 suítes (8 testes falharam; 281 passaram). Arquivos ausentes impediram ainda a execução completa de algumas suítes. Falhas: navigation, footer, bootstrapNavigation, runtimeBottomNavigation e avatarSource. Esse resultado não representa a instalação oficial sem nossos ajustes; representa sua combinação automática com o trabalho local.

## Reconciliação experimental necessária

Na cópia isolada foram restaurados os seguintes arquivos da versão local aprovada, mantendo o novo formatador runtimeFooter.js da 1.2.98:

- ui-common/src/react/components/BottomNavigationBar.js
- ui-common/src/react/components/RuntimeBottomNavigationBar.js
- ui-common/src/react/components/BottomNavigationBar.soft.styles.js
- ui-common/src/react/components/RuntimeInfoFooter.js
- ui-common/src/react/components/RuntimeInfoFooter.home.spacing.js
- ui-common/src/react/components/DefaultProvider.web.js
- ui-common/src/react/components/DefaultProvider.styles.js
- ui-common/src/react/components/UserAvatar.js

Isso é uma prova de reconciliação, não uma nova versão oficial dos módulos. A consolidação futura deve portar os comportamentos necessários ao código-fonte dos módulos e revisar as diferenças restantes, sem simplesmente substituir arquivos na entrega.

## Validação

| Verificação | Resultado |
| --- | --- |
| Manager após reconciliação experimental | 74 suítes / 297 testes passaram |
| Regressões compartilhadas | 23 suítes / 138 testes Jest e 2 testes Node passaram |
| Formatador do rodapé da 1.2.98 | 18 testes passaram, Node 20 |
| Contrato novo de domínio/appType | 4 testes específicos passaram |
| Testes existentes customActions do ui-people | 2 passaram |
| Exportação web Manager preview | Concluída |
| Exportação web layout anterior, cache limpo | Concluída; flag compilada 0, preview com flag 1 |

Os quatro testes novos de contrato cobrem mainCompany com MANAGER/POS/ADMIN, preservação do payload/commit, prioridade do build fixo MANAGER, resolução do ADMIN a partir do valor armazenado e os formatadores de domínio. Não substituem a validação autenticada da Lavego/SINGLE_ITEM.

Na web nova foram conferidos Home, Clientes e PDV; Clientes em desktop e 393×852, nos temas claro/escuro, com avanço para 11–20 de 648. Os cards, avatar, navegação e rodapé permaneceram utilizáveis. O PDV apresentou 17 entradas de categorias; sua composição web mantém textos/atalhos já presentes na referência atual, portanto não são atribuídos à atualização destes pacotes. Nenhum pedido ou cliente foi criado/editado.

O layout anterior foi compilado separadamente com cache limpo e abriu Home/Clientes. Ficou sem empresa ativa selecionada e apresentou 651 clientes, enquanto o Manager novo usou GYROS e 648. Assim, a equivalência funcional com a mesma empresa no layout anterior ainda não está validada; não deve ser marcada como aprovada para publicação.

## Condições do ensaio

As portas 8086/8087 usam uma cópia de teste e transporte local até a API 8000. Como o domínio é resolvido pelo host da janela, o servidor temporário normalizou somente App-Domain localhost:8086/8087 para localhost:8081. Sem isso eram carregados outro tema/contexto e um aviso de token ausente. Essa condição de ensaio não é uma correção de produto nem foi aplicada à configuração oficial. A autenticação e a autorização da API foram preservadas. A inicialização normal pode resolver traduções/configurações automaticamente.

Uma primeira exportação do layout anterior reutilizou cache com flag 1 e foi descartada como evidência; somente a exportação legacy-clean tem flag 0. Tentativas iniciais com fixtures incompletas/runner Node inadequado não foram usadas como resultado final.

## Limites e próximo passo

61 entradas dos overlays principais conferidas por SHA-256: nenhuma mudou. Instalação principal permanece ui-common 1.2.97 e ui-people 1.0.97. Evidências, logs, capturas e prova: `/home/spawnbtc/allprojects/controle-online/.codex/qa-web-manager-compat-1117/`.

Antes de incorporar: reconciliar os oito pontos no módulo correto; atualizar/revalidar os manifests dos ajustes; concluir o contrato de seleção de empresa nos dois layouts, incluindo ADMIN/POS e Lavego SINGLE_ITEM; validar Android e gerar novamente o pacote final. Nada incorporado, enviado ou publicado nesta investigação.
