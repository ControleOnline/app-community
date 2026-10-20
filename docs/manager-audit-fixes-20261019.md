# Correções locais da auditoria do Manager — 19/10/2026

Continuação de app-community#1099; dependência API api-community#268. Base do app1.10.68 em task-1099; API em task-268. Nenhum commit, push, deploy ou encerramento de task nesta rodada. Os ajustes locais anteriores foram preservados.

## Correções

- Traduções: recebe o callback já existente das operações; reutiliza opções normalizadas de Store/Type, evitando `[object Object]`. A API resolve a rota estática `/translates/overview` antes do identificador genérico, mantendo segurança/provider.
- Status administrativo do catálogo: metadata lida em lote somente nos dois GETs relevantes, isolada por requisição. Valores e escolha do último registro duplicado preservados; nenhum cache entre usuários/requisições ou alteração de escrita.
- Imagens: o parser compartilhado de sessão aceita JSON comum e o envelope do storage. Avatar e DefaultFile usam a mesma extração de token; a miniatura em tabela de produtos reaproveita DefaultFile. O prefixo de domínio da URL permanece conforme o contrato da API, com autorização preservada.
- Contagens do catálogo: reutilizam o cache existente do catálogo por consulta/empresa/contexto/sessão/device/revisão, com validade de60s. Falhas/abortos não entram no cache, invalidação cancela leitura antiga e retry explícito ignora a entrada anterior. Não foi criado cache offline universal.
- Tema: componentes compartilhados recebem tokens de superfície, busca, ações, chip, paginação, rodapé e navegação escuros já existentes no banco. Nenhuma cor nova nem escrita de tema no banco. O renderer dos cards acompanha o tema sem republicar configs continuamente e sem compartilhar callbacks entre stores diferentes. Produtos também aplica o fundo temático à área segura, eliminando a faixa clara residual.

## Evidência de desempenho da API

GETs autenticados locais, mesmo provider3 e mesmos hashes canônicos de resposta antes/depois. Estes são tempos desta amostra com instrumentação de desenvolvimento; não são mediana nem promessa para produção.

| Leitura | Antes | Depois estável |
| --- | ---: | ---: |
| Status do catálogo | 675 SQL /25,150s |106 SQL /8,014s |
| Integrações |222 SQL /6,059s |87 SQL /2,980s |
| Overview de traduções |200 /15 SQL |200 /15 SQL |

A primeira leitura imediatamente após restaurar o código ainda executou opcode anterior; foi preservada, sem mascaramento, e repetida após estabilização. O código corrigido foi restaurado e os hashes dos overlays verificados. Evidência segura: API `docs/patches/api268-marketplace-read/runtime-comparison.json`.

## Verificação local

- Manager:71 suítes/282 testes passaram antes do ajuste adicional de paginação descrito abaixo.
- Componentes compartilhados:23 suítes/138 testes Jest e2 testes de menu no runner Node passaram.
- Garçom/catálogo:104 testes passaram;10 testes ignorados pelo filtro intencional do runner de histórico. Mocks de limites externos ajustados, mantendo asserções.
- ui-common:89 testes passaram em Node20; parser de sessão tem6 casos.
- API metadata/rota:5 testes/24 assertions e3 testes do overlay passaram; sintaxe PHP conferida.
- Overlays do app: aplicação sobre os pacotes publicados, idempotência, igualdade de checksums e rejeição de mudanças desconhecidas conferidas. As alterações instaladas estão preservadas em payloads/manifests versionáveis.
- Lint dirigido à produção alterada e fixtures Jest passou com globals de teste explícitos. A configuração padrão do app não declara globals Jest e não reconhece referências JSX para no-unused-vars; a primeira execução sem esse contexto falhou e não foi apresentada como lint global aprovado.
- Web: Clientes648 resultados, alternância claro/escuro atualizando os cards; Produtos45 resultados e fotos visíveis; PDV recuperou categorias/contagens e produtos; Traduções carregou overview e confirmou nomes reais no seletor Store após correção. Sem gravar clientes, vendas ou traduções.
- Android API25: Clientes648 resultados,10 por página, tema escuro/rodapé/barra inferior e avatar confirmados. A tela de Traduções abriu com1073 registros, mas sua renderização completa causou lentidão e o processo nativo encerrou com SIGABRT; o aparelho voltou ao app antigo, que NÃO foi contado como validação do preview.

## Limites e pendências de validação

A suíte completa da API terminou com986 testes,51 erros e15 falhas. Não há baseline completo idêntico para atribuir essas falhas; isso permanece pendente, com nomes registrados na validação da API. Portanto, esta rodada não aprova a publicação irrestrita de todo o ERP.

As duas respostas históricas500 de imagens não foram reproduzidas nem tiveram causa estabelecida. Na janela local a partir de12:40 foram observados30 downloads200 e nenhum403/500, em web e Android combinados; isso comprova os caminhos exercitados, não todos os arquivos do banco.

Traduções também revelou renderização sem limite de todos os itens e contador de tabela controlada divergente. A correção e sua revalidação estão em andamento; não considerar a homologação nativa de Traduções encerrada até o adendo final.

Push/Firebase não está configurado no APK de preview; o aviso não é prova de defeito no carregamento das tabelas. O APK conserva metadados1.10.62, enquanto o código JS usa a base1.10.68. Não houve nova dependência nativa.

## Adendo final da rodada

- Paginação controlada compartilhada: `paginationMode="pages"` limita a renderização local após a ordenação global, sem descartar os dados completos ou emitir leituras remotas para mudar de página. Traduções usa20 por página, informa total explícito e alcança a última página nos testes. Tabelas antigas em modo infinito preservam seu total externo; regressões compartilhadas conferiram essa compatibilidade.
- Na abertura nativa final, Traduções exibiu1074 registros no total (o banco mudou durante a sessão), abriu e permitiu sair para PDV sem novo encerramento. O aviso de listas virtualizadas aninhadas permanece; a navegação de todas as páginas no AVD não foi homologada. Testes cobrem20/20/13 itens para amostra1073, ordenação, troca de filtros e ausência de HTTP na mudança de página.
- PDV: o cabeçalho e as abas agora recebem as superfícies resolvidas do contexto compartilhado, mantendo as cores e ações da empresa. Captura final Android confirma que a faixa clara foi eliminada e os cards coloridos permanecem.
- Resultado automatizado final:73 suítes/286 testes Manager;23 suítes/138 testes compartilhados +2 Node; garçom97+7 testes,10 ignorados pelo filtro intencional. Overlays verificados idempotentes e `git diff --check` aprovado.
- AVD permanece no PDV corrigido. API8000, web8081, Metro Android8084. Nenhuma publicação.
- O navegador ficou indisponível por configuração do Work na última tentativa. A web foi conferida antes desse bloqueio para tema, fotos e filtros; o adendo final da paginação e do tema do PDV recebeu testes e validação Android, sem uma nova homologação visual web.

Evidência final: `.codex/qa-native-manager-api25/audit-fixes-20261019/native-pdv-dark-final.png`, `native-clients-dark.png`, `web-clients-dark.png`, `web-products-table-files.png`. A falha SIGABRT anterior está preservada como ocorrência, sem atribuição definitiva de causa nativa apenas pelo sintoma de excesso de renderização.
