# Lave-Go — paletas aprovadas

`light.json` e `dark.json` são referências da aprovação visual e entrada para
publicação dos dados, nunca a fonte de cores do aplicativo em execução.
Os componentes consomem os nomes canônicos de `../themes-map.md`.

## Fonte oficial

Banco da API `apinew.lave-go.com`, registro `theme.id=2` (`LAVE-GO`), coluna
JSON `colors`, vinculado ao domínio `app.lave-go.com`. O mesmo registro atende
Admin, Shop e POS da Lave-Go, conforme autorizado pelo responsável.

A API existente serializa esse mapa plano em `/themes-colors.css`. Cada token
canônico tem duas entradas de transporte, `<token>-light` e `<token>-dark`.
O aplicativo seleciona o modo e entrega aos componentes o nome canônico sem
sufixo. Os sufixos identificam modos, não novos papéis visuais.
As entradas sem sufixo preservam a paleta clara para clientes antigos; os nomes
legados do escuro permanecem disponíveis. O aplicativo mantém a leitura legada
para temas que ainda não têm entradas por modo.

Em 2026-11-02, as duas paletas foram gravadas e os 122 tokens de cada modo foram
comparados com o CSS público da API, sem divergências. Não houve migração.
Backup anterior: `/tmp/lavego-theme-2-before-20261102-223429.json`.

A alteração do consumidor está local e ainda depende do fluxo oficial de
publicação. A troca de API/domínio não seleciona uma paleta embutida no app.
Os demais bancos não foram modificados nesta operação.
