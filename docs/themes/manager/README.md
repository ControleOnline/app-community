# Controle Online — paletas aprovadas

`light.json` e `dark.json` são referências de aprovação e entradas para publicação
dos dados. Não são importados pelo aplicativo em execução.
Os componentes usam os nomes canônicos de `../themes-map.md`; os valores vêm
exclusivamente da API selecionada pelo domínio.

## Registros oficiais atualizados em 2026-11-02

| Ambiente | Domínio | API | Tema |
| --- | --- | --- | --- |
| Dev | dev.controleonline.com | dd.controleonline.com | 10 |
| Staging | staging.controleonline.com | s.controleonline.com | 11 |
| Produção | manager.controleonline.com | api.controleonline.com | 12 |

Cada registro contém os 262 tokens aprovados de cada modo em `theme.colors`.
O transporte plano usa `<token>-light` e `<token>-dark`; componentes continuam
consumindo `<token>`. Os nomes sem sufixo e os tokens antigos de modo foram
preservados para compatibilidade com versões anteriores do aplicativo.
O domínio localhost:8081 do banco dev foi associado ao tema 10. No banco staging,
localhost:8081 já estava associado ao tema 11. O vínculo localhost de produção
não foi alterado. Os temas DEFAULT e de outros clientes não foram alterados.

Os 524 valores de cada ambiente foram comparados com o CSS público usando o
cabeçalho `app-domain`, sem divergências. Não houve migração de banco.
Backups anteriores:
- `/tmp/controle-theme-DEV-before-20261102-224838.json`
- `/tmp/controle-theme-STAGING-before-20261102-224838.json`
- `/tmp/controle-theme-MASTER-before-20261102-224839.json`

A correção da leitura no consumidor está local e ainda depende da publicação
pelo fluxo oficial. A presença dos dados no banco não significa que esse código
já está publicado.
