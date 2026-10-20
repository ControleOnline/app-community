# Validação final local do Manager — #1099

Escopo: concluir paginação nativa, conferência web e preparação de artefatos, preservando o visual aprovado. Sem commit, push, deploy ou alteração comercial.

## Composição

Base original: `b30349fa3c853e85f8c2a8f24ef4ecded9a6a56e`, versão 1.10.68. A diferença publicada inicialmente em 1.10.69 foi conciliada; nova leitura remota encontrou `a22cf68a1c795ce77efacb8c29a000bace7c8b67` (1.10.72). A diferença dessa referência também foi aplicada localmente, preservando scripts, componentes e overlays anteriores. Isso não é um merge commit nem entrega remota.

O único pacote alterado por essa atualização é `@controleonline/ui-products`, 1.0.36 → 1.0.37. Comparação das duas versões publicadas encontrou alterações somente em ProductForm, ProductFormFields, teste de ordem de hooks e package.json; não há sobreposição com nossos payloads. Os manifests que dependem de ui-products foram ajustados para 1.0.37, mantendo hashes dos arquivos afetados. Aplicação dos overlays e contrato de versões instaladas conferidos.

O conteúdo de `.release/rc-manifest.json` acompanha a referência upstream; não declara que nossos ajustes locais integram aquela RC publicada.

## Resultados já conferidos nesta retomada

- Manager, após conciliação: 73 suítes / 290 testes passaram.
- Proxy e regressão upstream de hooks de ProductForm: 5 testes passaram.
- Workflows alterados upstream: 2 suítes / 6 testes passaram.
- Checagem ampliada de workflows: 7 passaram e 1 falhou por referência ao arquivo ausente `deploy-lave-go-testar.yml`. O teste e a ausência do arquivo já estão em HEAD original, portanto não são regressão desta conciliação. O resultado ampliado não foi tratado como aprovado.
- API: `/themes-colors.css` retornou HTTP 200; ADB reverse 8000 confirmado. A classificação das 66 falhas anteriores da suíte da API permanece no relatório específico da API #268.
- APK release local 1.10.68 instalado com `adb install -r`: Success; abertura sem Metro e login humano confirmados. Pacote `com.controleonline.manager.localpreview`, API mínima 24, ABI x86, assinatura Android Debug. Não é APK de loja.
- Traduções abriu no APK compilado e a navegação alcançou `1081–1081 de 1081`, com próxima página desabilitada. Evidências das páginas e retorno em `.codex/qa-native-manager-api25/final-validation-20261019/` no workspace pai. O total mudou em relação à auditoria anterior porque o banco é compartilhado.

## Evidências e limites dos artefatos

As primeiras compilações 1.10.68 terminaram na rodada anterior, mas não encerram a validação do código 1.10.72 conciliado nesta retomada. Os resultados finais de build, hashes e conferência web devem ser anexados após a conclusão das execuções atuais.

## Encerramento das compilações e pendências observadas

- Android 1.10.72: BUILD SUCCESSFUL em 21m34s, código 110072, minSdk 24, ABI x86, pacote localpreview, assinatura Android Debug verificada. Atualização instalada com sucesso no emulator-5554, sem apagar dados. Artefato `on-manager-1.10.72-avd-release.apk`, SHA256 `ea988270d024a2a27c4f4a917fb62494eb426a05ecb72a108e09ad74564f3d61`.
- Exportação web de produção concluída; ZIP íntegro com 109 arquivos e 22 fontes TTF. `on-manager-1.10.72-web-production.zip`, SHA256 `910742b5337fc89c53efb6c951d7233939022f42d7124690db52d4cbb7a342a5`. Nenhum upload ou deploy.
- Conferência web usou o resultado compilado com apenas a configuração dos endpoints substituída por localhost (registrada em `web-local-configuration.json`). Home, clientes, pedidos e PDV carregaram; clientes conferidos em largura ampla/393px e claro/escuro. Console não retornou erros ou avisos nas últimas 15 entradas solicitadas.
- **Pendência funcional web:** em Traduções, total 1081 carregado e rodapé 1–20 de 1081, mas os botões Página 2 e Última página não alteraram a página, inclusive por teclado. Não marcar paginação web como aprovada. Evidência `web-translations-pagination-unresponsive.txt/png`. Paginação Android anterior percorreu as 55 páginas e retornou, sem escrita de traduções; esse resultado não substitui o teste web.
- **Aviso de fallback:** `TranslationReviewRow.js` usa somente `!row.hasOverride` para o badge e a mensagem. `TranslationsReviewPage.js` já calcula `hasMainFallback` comparando empresa ativa/principal, mas a linha não usa essa condição no badge/rodapé. Assim, ausência de sobrescrita é rotulada como herança mesmo na própria principal. Nenhuma tradução ou regra de herança foi alterada nesta validação.
- O rodapé pode exibir 1.10.68 por priorizar a versão persistida nos metadados do dispositivo em `runtimeFooter.js`; a identidade do binário instalado foi confirmada como 1.10.72 pelo gerenciador de pacotes Android.
- O novo Manager web permanece condicionado a hostname local em `shouldPreview`; ativação no domínio publicado precisa de decisão/correção antes da entrega do novo visual em produção. ZIP gerado não comprova essa ativação.
- A versão web estreita do PDV mantém ações de cabeçalho porque a composição compacta atual depende da flag nativa. Não foi alterada nesta fase de congelamento visual.
- Suítes compartilhadas: 23 suítes/138 testes Jest e 2 testes Node passaram. `git diff --check` passou após a preparação final.

Os artefatos e resultados estão no diretório de evidências acima. A existência dos ZIP/APK não declara todas as validações aprovadas nem publicação autorizada.

Após abrir o APK 1.10.72, a tela exibiu Usuário/Senha e rodapé 1.10.72. A instalação com `-r` não apagou dados, mas a sessão anterior não foi retomada; portanto o smoke autenticado dessa versão permanece pendente. O teste nativo das 55 páginas pertence ao APK 1.10.68, não deve ser atribuído à 1.10.72.

## Atualização: correção autorizada da identificação de herança

O usuário autorizou a correção após a observação acima. O falso fallback foi corrigido no componente compartilhado de Traduções; ver `manager-translation-inheritance-20261019.md` para causa, testes e artefatos novos. Esse relatório substitui a pendência anterior do aviso. Na nova web compilada, página 2, última, penúltima e primeira responderam; o avanço em largura 393px também passou. A ocorrência anterior sem resposta não foi atribuída a uma causa não comprovada e não motivou alteração especulativa do motor de paginação.

Os artefatos mais recentes estão em `translation-inheritance-fix/`, dentro do diretório de evidências; os pacotes na raiz anterior não contêm essa última correção. A nova suíte Manager passou com 74 suítes / 297 testes.

A instalação e o smoke autenticado do novo APK 1.10.72 foram concluídos: GYROS, Traduções com 1081 registros, card sem falso fallback, paginação 1–20 → 21–40. Nenhuma escrita de tradução observada. Isso encerra a pendência de smoke autenticado registrada acima; a evidência da travessia completa de 55 páginas continua sendo a do APK anterior. Detalhes e roteiro humano no relatório específico.

No AVD, o pacote antigo `com.controleonline.manager` ainda procura um servidor de desenvolvimento na porta 8081. Ele foi interrompido para evitar confundir essa tela com o pacote compilado `localpreview`. Nenhum dado de aplicativo foi apagado.

A assinatura de distribuição, o applicationId oficial e as arquiteturas para aparelhos reais são um gate distinto do APK x86 usado no AVD. O build local não deve ser enviado à loja como se fosse o pacote oficial.
