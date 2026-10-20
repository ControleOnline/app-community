# Manager — acesso do time e entrega #1117

## Caminho padrão

O visual novo é o padrão do MANAGER na web e no Android, inclusive ao usar o Expo diretamente. Os dois lados usam a mesma composição de módulos, stores, defaults e regras de negócio.

Usar Node 20 e instalar as dependências do projeto. Não definir APP_ENV=dev sem instalar a composição de módulos fonte correspondente.

| Objetivo | Comando principal |
| --- | --- |
| Web | `npx expo start --web` ou `npm run web` |
| Iniciar o Expo | `npm start` |
| Android | `npm run android` |
| Exportar web | `npx expo export --platform web` |

O comando Android inclui a preparação dos módulos e a compatibilidade nativa já usada na #1117. Os módulos publicados incorporam os ajustes compartilhados; `manager:prepare` confere as versões e hashes e, nesta composição, não precisa sobrescrever arquivos.

`web:manager`, `web:manager-preview`, `export:manager` e `android:manager` continuam como atalhos compatíveis. O time não precisa escolher entre esses atalhos para obter o visual novo.

## Contingência

- Web anterior: `npm run web:legacy`.
- Android anterior: `npm run android:legacy`.
- Exportação anterior: `npm run export:legacy`.

A variável explícita `EXPO_PUBLIC_MANAGER_LAYOUT=legacy` prevalece sobre o padrão e as antigas flags de preview. Reiniciar o Metro ao trocar de apresentação. A regra de ativação e o Metro compartilham a mesma definição do padrão.

## Escopo e publicação

Somente o tipo MANAGER efetivo recebe a apresentação nova na web e no Android. A seleção por domínio/empresa, permissões, stores, configurações de device e modo single-item continuam no core. ADMIN/POS/SHOP e iOS mantêm seu comportamento.

Dev e staging usam `modern` no pipeline. Os workflows de produção continuam com escolha explícita `legacy` por padrão, controlada por `MANAGER_LAYOUT`; tornar o Expo local moderno não publica nem ativa produção. Endereços de API/domínio permanecem no fluxo oficial, sem transportar configuração local ou proxy para os domínios publicados.

## Estado da entrega

A #1117 publicou seus módulos e dependências e já teve deploy de dev concluído em 20/10/2026. O bloqueio de Traduções foi corrigido em ui-translate 1.1.69; os contratos de módulos e empresa passaram. O Expo padrão foi integrado em dev pelo PR #1126. A composição final usa ui-common 1.2.102 com proteção de origem para credenciais de imagens.

Staging depende de Security e revalidação do Manager, seguidos pelo freeze da RC a partir do master remoto atual e promoção do mesmo snapshot. A revisão de Security é executada diretamente nesta sessão, por orientação humana, sem depender do Paperclip; a decisão e a composição exata ficam registradas na #1117. Android e single-item serão homologados pelo responsável em In Review. Não houve publicação desta entrega em produção.

Inventários e limites da auditoria permanecem em `docs/inventory` e na issue ControleOnline/app-community#1117. Os resultados globais de CI da API não devem ser apresentados como aprovados.
