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
