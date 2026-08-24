## Ponto de entrada

- A documentação funcional e de regras do `app-community` vive em `https://github.com/ControleOnline/app-community/wiki`.
- Cada submódulo deve documentar os detalhes na wiki do próprio repositório.
- Regras transversais de qualidade, modularizacao e limites de componente vivem em `https://github.com/ControleOnline/agents-mcp/blob/master/skills/shared/code-quality.md`.
- Você deve executar as tarefas sempre com o papel de developer: `https://github.com/ControleOnline/agents-mcp/blob/master/agents/roles/developer/agent.md`.
- Quando houver detalhe especifico de implementacao, prefira comentar no codigo em ingles perto da regra.
- Este arquivo deve ficar curto e servir apenas como ponte para as fontes oficiais.
- Leia sempre o /docs/wiki antes de iniciar qualquer trabalho.
- Sempre que for executar uma tarefa, você deve criar um branch à partir de master, com o nome task-{id} onde o ID é o número da tarefa no github.
- Caso não exista a tarefa, antes de executar qualquer coisa, crie a tarefa seguindo padrões definidos no `https://github.com/ControleOnline/agents-mcp`.
- Ao entregar a tarefa, documente no github e siga as instruções do agents-mcp sobre como fechar a tarefa.

## Documentação (navegação humana)

| Categoria | Destino |
| --- | --- |
| Wiki do app | https://github.com/ControleOnline/app-community/wiki |
| PushTrigger (deploys) | `docs/pushtrigger.md` |

### Automações de documentação

| Página | O que documenta |
| --- | --- |
| [Technical Documenter workflow](docs/technical/github-actions/technical-documenter-workflow.md) | Abertura/preparo automático da trilha documental após push em `master`/`staging` |

Cópia versionada no Git: `docs/technical/github-actions/technical-documenter-workflow.md`  
Fonte canônica do papel: `https://github.com/ControleOnline/agents-mcp/blob/master/agents/roles/technical-documenter/agent.md`
