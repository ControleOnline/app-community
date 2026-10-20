# Traduções: distinguir herança de revisão — #1099

Escopo local autorizado: corrigir a classificação apresentada nas traduções, preservar a herança entre empresas e os textos cadastrados, validar web/AVD. Sem publicação.

## Causa e correção

`TranslationReviewRow` usava somente `!row.hasOverride` para chamar a tradução de fallback. A própria empresa principal também pode ter esse campo falso; portanto isso não comprova herança. A página já informa se a empresa ativa é diferente da principal (`hasMainFallback`).

A linha agora exige essa diferença para indicar herança. A marcação usa “Herdada”, e a mensagem informa separadamente se a tradução da principal está revisada. Na principal, uma tradução revisada permite “Salvar”, sem oferecer “Criar sobrescrita”. O resumo “Herdadas” só aparece quando existe outra empresa principal. O texto introdutório também respeita esse contexto.

Não foram alteradas as operações de gravação, critérios de revisão, conteúdo das traduções, permissões ou consultas. A correção está no componente compartilhado de Traduções, aplicado por overlay com versão/hash verificados, sem uma cópia específica da tela no Manager.

## Regressões

- Testes da linha reproduziram três falhas antes da correção: falso fallback na principal, ação de sobrescrita na principal revisada e apresentação da herança na filial.
- Dois testes da página reproduziram o resumo incoerente antes da correção.
- Após a correção, os 13 testes específicos de linha, página e paginação controlada passaram.
- Suíte Manager: 74 suítes / 297 testes passaram. A saída contém os avisos de depreciação do `react-test-renderer` já usados pela suíte.
- Aplicador dos overlays verificado idempotente; `git diff --check` passou.

## Paginação web

Na sessão anterior os botões não alteraram o rodapé. Após recarregar o aplicativo compilado, a página 2 exibiu 21–40 de 1081 e a última página exibiu 1081–1081, desabilitando o avanço. Instrumentação temporária confirmou que o callback recebeu os parâmetros corretos; foi removida. A última página também respondeu após nova carga sem instrumentação.

Não foi aplicada uma correção especulativa no motor compartilhado: a causa da ocorrência transitória anterior não foi estabelecida. A regressão controlada também passou com carga assíncrona e novas identidades dos dados. Conferência final do novo pacote registrada nas evidências de runtime.

Evidências: `.codex/qa-native-manager-api25/final-validation-20261019/translation-inheritance-fix/` no workspace pai. Resultados de build, runtime e hashes finais serão registrados após a conclusão das execuções.

## Pacotes atualizados

- Android compilou com sucesso em 11m39s. Versão 1.10.72 / código 110072, localpreview, minSdk 24, ABI x86 e assinatura Android Debug verificados; somente para o AVD.
- Exportação web de produção concluída com 109 arquivos e 22 fontes TTF; ZIP íntegro. Não contém a instrumentação temporária do pager.
- ZIP web: SHA256 `8ad7c2557c733ff5134c771e489e7c5c9a8b1c15a97d264fb1460c668ca7abfe`.
- APK AVD: SHA256 `8b17eaca63427e2800bab23df7a1b482305d8d38c4d4d5b5584aa10873419143`.
- A web corrigida exibiu a empresa principal sem “Fallback” ou “Herdadas”, mantendo “Pendente”. Página 2, última página (1081–1081), retorno à penúltima (1061–1080) e primeira página conferidos; avanço também conferido em 393px.
- Herança real entre filial/principal validada pelos testes do componente, sem trocar a empresa ou gravar traduções no banco compartilhado.

Os limites de publicação do relatório final permanecem: ativação do Manager fora de localhost, assinatura/identidade/arquiteturas oficiais do Android e entrega remota precisam de etapa própria. Nada publicado nesta etapa.

## Conferência final no AVD

O APK corrigido foi instalado com `adb install -r` (Success) no Pixel_2_API_25, sem apagar dados. A sessão não foi retomada; login realizado pela interface com a credencial local do ERP e autorização explícita do usuário, sem registrar a senha.

Versão instalada confirmada pelo gerenciador Android: 1.10.72 / 110072. GYROS abriu autenticada; Traduções retornou 1081 registros. O resumo não mostra herança na própria principal, e o card exibiu “Pendente”, “Tradução da empresa ativa” e a mensagem de entrada própria, sem falso fallback. Navegação do rodapé `1–20 de 1081` → `21–40 de 1081` conferida no novo APK. A travessia completa das 55 páginas permanece evidência da versão anterior; não foi repetida sem necessidade para a correção de rótulos.

Não houve POST/PUT/PATCH/DELETE de traduções no log desta conferência. Evidências: `native-loaded.xml`, `native-card.xml/png`, `native-first-footer.xml`, `native-second-footer.xml/png`, `native-smoke.json`. AVD deixado em Traduções, API e web locais em execução.

Roteiro humano: em Traduções na GYROS, conferir que “Pendente” não implica “Herdada”; avançar e voltar no rodapé. Em uma filial com herança real, a marca “Herdada” deve continuar existindo separadamente da revisão. Não é necessário tocar em Revisar/Salvar para esse teste.
