# Integração local do master e do DefaultTable — task #1099

## Estado em 19/10/2026

Branch local task-1099, base b30349fa3c853e85f8c2a8f24ef4ecded9a6a56e, confirmada novamente como ponta de origin/master. Código do app 1.10.68. Task: https://github.com/ControleOnline/app-community/issues/1099, vinculada ao Project #1 em Ready. Esta etapa é local; sem commit, push, merge remoto, build de release ou publicação. A task não está concluída oficialmente. O trabalho anterior está preservado; cópia de segurança/stash anterior à integração permanece disponível.

## Resultado e abrangência

A atualização é do componente compartilhado do aplicativo inteiro, não apenas do PDV. Inventário de fonte encontrou 39 arquivos consumidores em 12 módulos. Todos recebem a implementação atualizada de ui-default; o shell Manager fornece o mesmo contexto de tema às tabelas de todos os módulos. O inventário é estático, não prova execução de todas as telas.

Pins instalados e manifesto concordam: ui-default 1.0.280, ui-orders 1.3.47, ui-financial 1.1.42, ui-manager 1.0.21. As versões foram verificadas pelo conteúdo dos pacotes publicados; não houve troca indiscriminada dos módulos para suas branches master, que têm composição diferente. As dependências dos quatro pacotes não mudaram. Lock local e instalação foram conciliados.

O master trouxe o default compacto global, grade responsiva, carregamento das opções de status no histórico, paginação financeira e rename do resolver do avatar. O shell e o seletor de empresa agora importam resolveHomeAvatarUrl, sem conflito de caixa com HomeAvatar.

Os adaptadores de clientes/fornecedores/empresas/colaboradores deixam de forçar aparência soft e uma coluna em todas as larguras; herdam os controles e a grade responsiva compartilhados, com tokens do Manager. Cadastro de produtos também herda a aparência padrão. O PDV preserva a apresentação soft apenas onde necessária para a entrada e as ações operacionais já aprovadas. Nenhum carregamento, filtro, ordenação, autorização ou regra comercial foi substituído por implementação paralela.

Nos overlays, preservamos transformData de hierarquia, viewMode controlado da entrada em cards, presentationColumns, filtros/colunas, cache de imagens e os reparos de ownership/refresh. O key do FlatList inclui o número efetivo de colunas mesmo com uma key customizada constante. Versões/hashes/payloads foram atualizados. Os scripts de aplicação são idempotentes e a verificação final não encontrou divergência entre arquivos instalados e payloads.

## Verificação automatizada final

- Manager: 67 suítes, 260 testes aprovados, saída zero.
- Defaults/histórico/providers: 23 suítes Jest, 138 testes aprovados, saída zero; dois testes node:test de menu aprovados, zero falhas.
- Catálogo/garçom: cinco suítes, 37 testes aprovados, saída zero.
- Lint contextual dos arquivos tocados: saída zero, sem desativar regras. Configuração acrescenta uso de JSX e globals Jest/TextEncoder ausentes no baseline; não é lint integral do repositório.
- git diff --check aprovado.

O runner publicado de compact executava um teste node:test dentro do Jest, gerando suíte vazia. Agora separa os runners e mantém propagação de falhas. Mock publicado do DefaultSearchModal precisava expor KeyboardAvoidingView, já utilizado pelo overlay nativo; corrigido e preservado em payload. As falhas foram registradas antes do reparo e os testes foram repetidos com os comandos corretos.

## Conferência funcional representativa

AVD Pixel_2_API_25 / Android 7.1.1, sessão já autenticada LEANDRO/GYROS, empresa 3:

- Home e navegação lateral preservadas.
- Clientes: controles compactos compartilhados; página 1 e página 2 com faixa 1–10 / 11–20 de 648 e itens diferentes; aparência em cards.
- Pedidos: controles default, rodapé de receita/ticket, vazio filtrado; modal de filtros abre; seletor de Status lista Aguardando pagamento, Pago, Open, Canceled, Closed, Ready e Preparing, além de outras opções configuradas.
- Financeiro: busca/filtros/modos, Nova conta a receber, paginação e totais preservados. Estado vazio assentado conferido; não houve criação/pagamento de invoice.
- Cadastro de produtos: 45 resultados, busca/controles default e cards; somente leitura.
- Colaboradores: sete resultados, cards e paginação, sem linhas vazias por ausência de colunas no store de vínculos.
- PDV: entrada em cards coloridos; Combos retornou os produtos correspondentes após a consulta assentar; retorno por Categorias preservado. Não foi executada inclusão, customização, venda ou produção. Durante a transição podem permanecer linhas da lista anterior até a resposta assentar; esta rodada não declara resolvida a política geral de transição de stores.
- Retorno à Home, AVD deixado disponível. Captura final final-home.png. Log do processo 6024 sem entradas ReactNativeJS:E/AndroidRuntime:E na conferência final. Warning de Firebase do pacote local continua conhecido.

Web localhost:8081:

- Compilação concluída (5299 módulos); servidor respondeu HTTP 200 novamente na conferência final.
- Sessão autenticada existente recuperada, sem informar senha.
- Clientes em tela larga: dados, controles, paginação e troca Tabela → Cards conferidos. Capturas web-clients-wide.jpg e web-clients-cards-wide.jpg. Grade de três colunas visível na largura padrão capturada.
- Resize para 390 × 844: DOM confirmou menu móvel, clientes em cards, controles e paginação 1–10 de 648, sem crash observado nessa transição.
- A interrupção por “Local browser use is disabled in Work settings” foi resolvida pelo usuário, que habilitou a opção e reiniciou o aplicativo. A conferência representativa foi retomada com acesso normal, sem contornar a configuração.
- Pedidos de venda: controles compactos, totais e opções configuradas de Status carregadas; modal fechado sem aplicar mudanças. Captura web-orders-status-final.jpg.
- Financeiro: controles, totais zerados e paginação conferidos em janela larga e em 390 × 844. Capturas web-financial-wide-final.jpg e web-financial-mobile-final.jpg.
- Colaboradores: sete resultados, cards e paginação em largura móvel, com opções da lista expandidas. Captura web-employees-mobile-final.jpg.
- Cadastro de produtos: 45 resultados e alternância para cards em janela larga. Captura web-products-wide-final.jpg.
- PDV: categoria Combos e produtos correspondentes após o carregamento, com apresentação móvel conferida; nenhuma inclusão ou customização. Captura web-pdv-mobile-final.jpg.
- Nenhum erro retornado pela consulta dos últimos erros do navegador nessa conferência. Viewport temporário restaurado e web deixada na Home. Esta é validação representativa; não é homologação funcional das 39 telas.

Nenhum teste em pinpad físico/iOS foi realizado. Outros perfis/empresas, alterações de dados, finanças e produção não foram homologados por esta revisão de UI. Fonte compartilhada atualizada não equivale a aprovação funcional de todos os menus.

## Versões exibidas e execução

A base JS está em 1.10.68 e a web passou a exibir v1.10.68 após o reinício completo. O APK local existente não foi recompilado; seu rodapé nativo ainda indica v1.10.62. Não usar o rodapé como prova da composição de pacotes; pins/arquivos/testes estão registrados acima. Nenhuma dependência nativa mudou nesta integração.

Após o reinício do desktop, API local porta 8000, Metro Android 8084, web 8081 e AVD API 25 foram reiniciados. Sessão existente recuperada. Captura final nativa final-home-reopened-settled.png; processo 2406 sem entradas ReactNativeJS:E/AndroidRuntime:E na leitura final. Web HTTP 200; Home nativa com indicadores da API e sessão LEANDRO/GYROS carregados. Nenhum segredo foi inserido na evidência. Os arquivos XML/screenshots com dados de homologação permanecem somente no workspace local.

## Roteiro para o usuário

1. No AVD, abrir Clientes; abrir Mais opções da lista; alternar Cards/Tabela, abrir Filtros e fechar sem aplicar. Trocar para página 2 e voltar para página 1; conferir itens e contagem.
2. Abrir Pedidos de venda; Filtros → Status; conferir opções e fechar sem aplicar. Conferir rodapé de totais e retorno à Home.
3. Abrir Financeiro; conferir os mesmos controles, paginação e totais. Não é necessário criar nem pagar nada para esta validação visual.
4. Abrir Produtos e Colaboradores; conferir cards, dados e navegação.
5. Abrir PDV; conferir cards coloridos, escolher Combos, aguardar assentar, voltar por Categorias e abrir/fechar menu.
6. Avatar → ocultar/mostrar barra nesta sessão; conferir espaço útil e retorno à Home pelo símbolo no cabeçalho.
7. Na web http://localhost:8081, repetir Clientes/Pedidos/Financeiro em janela larga e estreita. A conferência representativa do agente foi concluída após a reabilitação do navegador.

Evidências: .codex/qa-native-manager-api25/master-default-table-integration-20261019/ na raiz do workspace. Relatório de comparação anterior: pasta master-default-table-review-20261019. Próxima fronteira: aceite humano local; publicação oficial fica para etapa separada autorizada.
