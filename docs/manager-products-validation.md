# Produtos — apresentação separada por uso (local)

Data: 2026-10-16. Escopo: somente ProductsPage na prévia Manager 8081.
Sem commit, push, publicação ou gravação de cadastros, pedidos e pagamentos.

## Comportamento

- O `interactionMode` existente distingue seleção de venda (`pdv`) do cadastro.
- PDV: cartões compactos em 1/2/3 colunas conforme largura, foto opcional,
  nome e preço legíveis, quantidade ou personalização originais. Na tabela,
  Produto, Preço e ações de venda, sem edição ou navegação para cadastro.
- Cadastro: tabela inicial no desktop, cartões no celular, Código, SKU,
  Produto, Preço e Situação. Detalhes, adição e edição originais preservados.
- Busca, filtros, categorias e alternância de visualização sempre acessíveis.
  Campos completos, importação/exportação existentes e depuração ficam nas
  opções administrativas do cadastro. A configuração de importação da store
  é preservada; apenas sua exposição muda.
- Os cartões removem espaço reservado de foto ausente e rótulos redundantes
  “Produto” e “Sem fila”; fila real, descrição, tipos especiais e categorias
  carregadas continuam disponíveis.
- Fotos usam DefaultFile de ui-default, resolução de arquivos de ui-common
  e o cache binário já existente, isolado por empresa e sessão. Não foi criado
  um segundo carregador de mídia ou de catálogo.

## “Sem categoria” — evidência real

Leitura autenticada da API local, empresa 3: a coleção de Produtos e o item
1147 não incluem `productCategory`/`productCategories`. A leitura dos vínculos
em `/product_categories?product=1147&category.company=3` retornou duas categorias:
Águas e Bebidas. Logo, ausência da relação na resposta não comprova ausência
no cadastro. A apresentação compacta só exibe “Sem categoria” quando recebe
uma coleção explicitamente vazia. Não adiciona consulta por cartão e não
altera a API ou o banco. Quando o vínculo não vem, o cartão não informa a
categoria; exibir todas as categorias reais exigiria ampliar o contrato de leitura.

## Reutilização e preservação

ManagerProductsTable usa o DefaultTable existente e injeta apresentação opcional
no ProductItem original, inclusive dentro do invólucro de detalhes do cadastro.
ProductQuantity, personalização e single-item continuam nas ações canônicas,
com os mesmos produtos, categorias e contexto do pedido. Device Config, mesa,
comanda, carrinho e regras de negócio não foram reimplementados.

O DefaultTable recebe colunas de apresentação opcionais, sem substituir as
colunas completas da store, usadas por consultas/formulários. Linhas e menu de
colunas seguem essa seleção. A funcionalidade padrão dos outros consumidores
permanece quando a opção está ausente. Overlays locais guardam versões e hashes
para ui-products 1.0.36 e ui-default 1.0.278; aplicação idempotente incluída no
comando da prévia. ui-common 1.2.97 é reutilizado sem alteração.

## Validação e limites

- APP: 190 testes / 48 suítes passaram, incluindo ProductItem real, separação
  PDV/cadastro, customização, quantidade, imagens e linhas reais de DefaultTable.
- Testes compartilhados de ui-default: 37 testes / 6 suítes passaram.
- Exportação web da prévia passou; APP 8081 respondeu HTTP 200.
- Aplicação repetida dos overlays passou; `git diff --check` sem erros.
- Testes de interação são de componentes com adaptadores simulados. A consulta
  de categorias acima foi real e somente leitura. Nenhuma venda foi executada.
- Não houve homologação visual nova no navegador: o acesso da ferramenta estava
  bloqueado pela política de URL. Não foi contornado por outra automação.
  Revisão visual desktop/celular e operação transacional continuam pendentes.

## Ajustes após as capturas de Produtos/PDV

As capturas do usuário comprovaram duplicação de CUSTOMIZAR: ProductItem já
renderizava a ação, enquanto DefaultTableCards recebia também rowActionsComponent.
A adaptação agora fornece essa segunda ação exclusivamente no modo tabela,
respeitando effectiveViewMode quando o layout compacto substitui a preferência
salva. Cada cartão mantém somente a ação original. “Todos os produtos” recebeu
texto em português e apresentação secundária; seu destino não mudou.

A tabela ganhou uma coluna Foto de largura fixa 72 px, com capa 44 × 44 px,
respeitando imageCoverRelationId e reutilizando DefaultFile/contexto do cache.
Não lista todos os anexos nem abre editor. O suporte opcional cellComponent no
invólucro DefaultTableInput preserva o comportamento padrão dos outros campos.

Leituras reais da API local, sem gravação de negócio:

| Categoria | Download | Bytes | Tempo observado |
| --- | --- | ---: | ---: |
| Lanches (Gyros) | HTTP 200 | 1.967.267 | 1.246 ms |
| Batatas Fritas | HTTP 200 | 2.912.861 | 1.573 ms |
| Sobremesas | HTTP 200 | 2.919.792 | 1.559 ms |
| Bebidas | HTTP 200 | 3.353.852 | 1.765 ms |
| Combos | HTTP 200 | 3.090.784 | 1.654 ms |

Consulta de categorias: HTTP 200 / 845 ms. Downloads feitos com concorrência 2;
esta amostra não é um benchmark da pintura da tela. Batatas e Sobremesas têm
arquivos vinculados; espaço sem imagem na captura não prova ausência de arquivo.
O endpoint atual fornece o arquivo original e não possui opção de miniatura.

No cache, a imagem baixada é entregue antes da gravação IndexedDB, que passou
para fila em segundo plano com proteção de geração/logout e limites existentes.
Novas imagens PNG/JPEG/WebP podem ser reduzidas localmente para até 256 px, WebP
85%, quando createImageBitmap/OffscreenCanvas estão disponíveis; mantém o
original se incompatível, falhar, ou a prévia não for menor. O arquivo do servidor
não muda. A instância do catálogo limita 128 entradas e 64 MB. Imagens antigas já
persistidas continuam válidas até expirar/ser substituídas. Este ajuste melhora o
reuso, mas não reduz os bytes do primeiro download da API.

Validação desta rodada: 196 testes / 49 suítes APP; 37 testes / 6 suítes ui-default;
compilação web e aplicação idempotente dos overlays passaram. Testes verificam
miniatura e largura, ação única no cartão inclusive em layout compacto, contexto
do pedido, entrega antes da persistência e limites/fallback da conversão.
Conversão e persistência foram exercitadas com adaptadores simulados; não há
medição nova de pintura nem homologação visual no navegador. A primeira carga
com originais grandes permanece uma limitação para miniaturas fornecidas pela API.
