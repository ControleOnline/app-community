# Matriz operacional do checkout canonico

Referencia: app-community#315.

O checkout operacional do POS possui um unico ponto de entrada em `ui-orders`. Os modos nao criam fluxos financeiros paralelos: eles selecionam apenas politicas operacionais, principalmente o destino depois da quitacao.

| Modo | Saldo parcial | Pedido quitado |
| --- | --- | --- |
| `single-item` | detalhe do pedido | historico/listagem |
| `counter` / balcao | detalhe do pedido | destino de balcao |
| `totem` | detalhe do pedido | catalogo de autoatendimento |
| `cashier`, `pos-type=simple` | detalhe do pedido | historico/listagem |
| `cashier`, `pos-type=full` | detalhe do pedido | detalhe do pedido |
| `waiter` / mesa / comanda | detalhe do pedido | detalhe/contexto do pedido |

## Regras compartilhadas

- `Order` permanece o agregado principal; abrir checkout nao cria `Invoice`.
- `Invoice` e criada ou atualizada somente quando a operacao financeira exigir.
- Pagamento local, remoto e sem gateway convergem para a mesma politica de conclusao.
- Pagamento parcial mantem o pedido no detalhe para continuidade.
- Retirada, entrega e pagamento na entrega variam por configuracao, status e meio de pagamento; nao criam uma segunda orquestracao de checkout.
- A transicao de estado do pedido, idempotencia e persistencia dos efeitos financeiros continuam sendo responsabilidade da API.
- O APP materializa o resultado e impede interacoes duplicadas enquanto a submissao esta em curso.

## Escopo de regressao

Validar pelo menos: `single-item`, balcao, totem, caixa simples/completo, garcom/mesa/comanda, pagamento parcial, antecipado, posterior e na entrega quando habilitados. SHOP nao participa deste recorte operacional.
