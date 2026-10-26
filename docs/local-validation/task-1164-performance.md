# Task #1164 — correção local de desempenho

Não publicado. Base local de composição: b60aeb19 (RC 1.10.83-rc.3). Pasta original app-community preservada. API localhost:8000 validada com override da base isolada co_single_item, porta 33085; web localhost:8081 respondendo HTTP 200.

## Delta

- webThemeColorCache mantém as cores do tema por revisão de style do elemento raiz. MutationObserver.takeRecords detecta alterações síncronas; applyThemeCssVariables invalida explicitamente o cache. Não serializa cssText por cor renderizada. Remapeamento e tokens existentes mantidos.
- Single Item compartilha a descoberta/configuração dos meios de pagamento durante a montagem do checkout, incluindo requisição simultânea. Chave muda com empresa, device e suas configurações; erro não fica retido. Outros modos mantêm descoberta sem esse cache.
- Single Item usa ensureCompanyDeviceConfigsLoaded já existente, com fallback compatível. Não altera persistência de pedido, cálculo de saldo, proteção de empresa, regras do carimbo ou confirmação de pagamento.
- Payload do ui-orders registrado no mecanismo local de patches com versão/checksums, sem depender de edição solta em node_modules.

## Evidências

Antes: /tmp/co-single-item-measurement-20261026/README.md, network.json, cpu.json. Perfil local em desenvolvimento: ScriptDuration 12,75 s na seleção, cerca de 6,94 s próprios em isConfiguredWebThemeColor; descoberta/meios de pagamento duplicados.

Depois (testes): 6 suítes, 34 testes aprovados: checkoutPaymentLoading, webThemeColorCache, managerDarkThemeRegression, singleItemBalance, singleItemProductSelection, singleItemCheckout. Incluem concorrência de discovery, alteração de empresa/device, falha sem retenção e preservação do caminho dos demais modos. Aplicador de patches idempotente passou.

## Medição posterior no navegador

Aba HTTP reaberta pelo usuário; medição concluída em 26/10/2026 no localhost, pedido #73057 com carimbo, sem pagamento. Tela de identificação por CPF confirmada. Registros em /tmp/co-single-item-measurement-20261026/after.json e after-stamp.png.

ScriptDuration: 12,753 s antes → 3,432 s depois (queda observada de 73%). Cadeia entre primeiro PUT e último GET de meios de pagamento: 12,822 s antes → 4,470 s depois. São janelas de rede/CPU, não evento de pintura medido. Antes sem carimbo, depois com carimbo, ambos em desenvolvimento com profiler; não é benchmark controlado de staging.

Discovery e wallet_payment_types: 2 chamadas de cada antes → 1 de cada depois. Conferência financeira e releitura dos itens mantidas. Todas as respostas da captura posterior foram 200. Usuário também confirmou melhoria perceptível e autorizou publicação em dev/staging na #1164; master aguarda homologação.

Verificação final: seis suítes, 34 testes aprovados, lint focado, aplicador idempotente e git diff --check aprovados. Sem alterações de API/Composer ou versão de pacote npm nesta rodada; payload guardado no app pelo mecanismo de patches existente. Configuração stamp do device local não faz parte da publicação.
