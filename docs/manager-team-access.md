# Manager — acesso e entrega da tarefa #1117

## Comandos para o time

Usar Node 20 e instalar as dependências. Os comandos explícitos abaixo executam manager:prepare, que aplica os ajustes por versão/hash. O comando Expo direto requer executar antes npm run manager:prepare nesta etapa transitória. Não usar APP_ENV=dev enquanto os módulos fonte não estiverem instalados na composição própria do projeto.

| Objetivo | Comando |
| --- | --- |
| Nova apresentação, web | `npm run web:manager` |
| Atalho já conhecido para a nova apresentação | `npm run web:manager-preview` |
| Apresentação anterior, web | `npm run web:legacy` |
| Exportar nova web para o domínio configurado | `npm run export:manager` |
| Exportar apresentação anterior | `npm run export:legacy` |
| Android com nova apresentação | `npm run android:manager` |
| Android com apresentação anterior | `npm run android:legacy` |

`npx expo start --web` continua disponível: sem a variável de layout no ambiente, abre a apresentação anterior. Para evitar ambiguidade, usar os comandos explícitos acima. Limpar o cache/reiniciar Metro ao alternar composições. Os dois comandos usam as mesmas stores, módulos e regras; não são dois sistemas ou bancos separados.

## Domínio oficial

A nova composição usa `EXPO_PUBLIC_MANAGER_LAYOUT=modern`. A anterior usa `legacy`, que prevalece sobre as antigas flags locais. A escolha é de compilação; não muda autorização, empresa, APP_TYPE ou configuração de device. Apenas MANAGER na web e no Android é elegível; ADMIN/POS/SHOP e iOS mantêm o comportamento existente.

Os workflows Deploy e Lavego recebem a variável GitHub `MANAGER_LAYOUT`, com padrão seguro `legacy` até a ativação aprovada pelo time. Na etapa autorizada, configurar `modern` e compilar/publicar o alvo MANAGER. A reversão usa `legacy` e nova compilação/publicação. Não mudar a variável ou publicar agora. Os endereços de API/domínio continuam vindos do fluxo oficial; não transportar env.local.js, proxy de QA ou URLs de localhost para a entrega.

Recomendação: avisar o time na revisão, tornar a nova apresentação o padrão quando aprovada e manter a anterior como alternativa temporária de compilação. Não foi enviado aviso por mensagem nem escolhida uma data de remoção.

## Tema e preservação

O tema Lavego fornece listItemEvenRow, usado pelo DefaultTable. O adaptador Manager agora usa esse token quando bg-even-light está ausente, preservando valores explícitos de cada modo e sem gravar no banco. Não há cor fixa nova.

## Ordem da entrega

1. Versionar os fontes dos módulos na task-1117 e registrar seus SHAs; os manifests atuais mantêm a instalação reproduzível enquanto os novos pacotes oficiais não existem.
2. Integrar/publicar os módulos conforme o fluxo do projeto; reservar versões npm/Composer numéricas e atualizar os pins do app/API somente depois dos pacotes existirem. Não apontar o app para versões ainda indisponíveis.
3. Publicar as branches de trabalho e encaminhar ao Manager/Security; integração em dev e promoção de staging seguem o rito do projeto. Não confundir commit local com código acessível ao time.
4. Revisão humana Android/Lavego a cargo do usuário em In Review. Ativação no domínio oficial e produção são posteriores à aprovação.

## Evidência e limites

As execuções anteriores registraram 301 testes Manager, 138 compartilhados + 2 Node, 18 de rodapé, 10 de people e 10 do contrato single-item; as telas foram conferidas na web e AVD conforme o relatório de integração. Nenhuma suíte foi repetida nesta preparação por solicitação humana. As alterações finais de ativação/mapeamento não receberam novo build ou execução de testes nesta rodada. A auditoria API ainda distingue 66 falhas preexistentes; não declarar a suíte global aprovada.

Inventários: manager-module-source-consolidation-20261020.json e manager-api-source-consolidation-20261020.json em docs/inventory. Pacote AVD é localpreview/x86/Debug, não distribuição Android oficial. Não houve deploy nesta preparação.

## Fechamento da preparação em 20/10/2026

63 arquivos de UI foram consolidados em dez módulos fonte, e 11 arquivos PHP nos dois módulos de API; todos têm commits locais task-1117 e incluem seus origin/master confirmados nesta rodada. O app incorporou a master a22cf68a por merge, preservando a composição aprovada. API-community está em task-1117; config/reference.php gerado e .env.dev local foram preservados fora dos commits. Nenhuma migração foi executada. O master atual de api-platform-people foi incorporado somente na cópia de fontes; a API em execução continua com seu pacote instalado e não foi atualizada por essa operação.

Os workflows web/Android aplicam manager:prepare antes de compilar. Payloads têm atributos Git -text para preservar os checksums na clonagem. Alguns arquivos históricos .patch preservam espaços de contexto e não devem ser apresentados como falha do código executável.

**Falta para acesso do time e promoção:** publicar as branches task-1117 dos módulos/app/API, integrar e disponibilizar as novas versões oficiais das dependências, atualizar os pins e encaminhar os SHAs ao fluxo Manager/Security → dev → staging → revisão humana. Isso não foi confundido com deploy em produção. A variável MANAGER_LAYOUT permanece sem alteração remota; sua ativação modern precisa acompanhar o alvo Manager aprovado.

## Compatibilidade com a dev existente

A composição preserva o core já existente em dev que resolve app_type pelo domínio/defaultCompany e a proteção de props opcionais do avatar. APP_TYPE fixo não deve ser usado para sobrepor o domínio. O novo visual continua restrito ao tipo MANAGER efetivo. Dev/staging compilam a flag modern; produção continua legacy até ativação explícita aprovada. A apresentação anterior continua disponível pelo comando web:legacy. Os campos da integração Sem Parar que já estavam em dev do ui-common foram preservados na conciliação; um prefixo inválido no import existente foi reparado, sem mudar seus campos ou regras. Essa composição passa a ui-common 1.2.100, substituindo a publicação inicial 1.2.99.
