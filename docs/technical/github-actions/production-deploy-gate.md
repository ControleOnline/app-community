> Cópia operacional no repositório (`docs/technical/github-actions/`). A [wiki do app-community](https://github.com/ControleOnline/app-community/wiki/production-deploy-gate) é a fonte primária de leitura humana.

# Production deploy gate (local readiness checks)

## Objetivo

Documentar o job **1.5 · Local production readiness checks** do workflow de deploy de produção do `app-community`.

O gate existe para impedir publicação em produção (`master`) sem verificações
locais reproduzíveis. A publicação não aguarda um deploy em `staging`: staging é
uma superfície de conferência humana, não uma dependência técnica do deploy de
produção.

## Arquivos afetados

| Arquivo | Papel |
| --- | --- |
| `.github/workflows/deploy.yml` | Pipeline principal (web + android + lg-webOS). Job `production-gate` (nome legível: **1.5 · Local production readiness checks**). |
| `.github/workflows/android-deploy-lavego-shop-v2.yml` | Deploy Android do Shop Lave Go. Mesma lógica de gate no job `production-gate`. |

## Quando o gate roda

- **Só em produção** (`TARGET_ENV == master` / branch `master`).
- Em `dev` e `staging` o job **pula** (`Production gate skipped for …`) e o pipeline segue.
- O job `web` (e o `build` no Android) declara `needs: [configure, production-gate]` (ou equivalente), portanto qualquer falha no gate interrompe o restante do Deploy.

## Critérios de aceite

O job roda somente quando o ambiente alvo é `master` e executa no commit que
será publicado:

1. instalação sem scripts;
2. verificação de sintaxe JavaScript;
3. validação do catálogo de smoke flows;
4. suíte Jest em modo serial;
5. `git diff --check`.

Se qualquer verificação falhar, a publicação para. Se todas passarem, a
publicação pode prosseguir sem esperar o ambiente `staging`.

## Fluxo resumido

```text
push master (ou workflow_dispatch master)
  → configure
  → production-gate (1.5)
       ├─ env != master → skip
       ├─ checks locais verdes → allow
       └─ falha local → bloqueia web/android
  → web / build / demais jobs
```

## O que o gate **não** faz

- Não exige deploy ou testes remotos em `staging`.
- Não substitui a autorização humana pela coluna `Deploy` nem os gates de QA/Security/Design/UX.
- Não aplica a regra em `dev`/`staging`.
- Não substitui o dual-gate de produto (QA/Security em issues); é apenas barreira de pipeline de publicação.

## Manutenção

- Qualquer alteração na lógica de aceite deve manter as verificações locais documentadas nesta página e no workflow.
- Ao adicionar novos workflows de deploy **produção**, reutilizar a mesma política (ou extrair action compartilhada) para evitar regressão do bloqueio permanente por SHA idêntico.
- Falhas das verificações locais devem ser corrigidas antes da publicação; staging pode ser executado depois para conferência humana sem bloquear a fila de produção.

## Referências

- Issue: [app-community#566](https://github.com/ControleOnline/app-community/issues/566) — hotfix que relaxou o gate.
- Commit de correção (exemplo): `3e3188f` em `master` (`fix(task-566): relax production deploy gate for staging checks`).
- Workflows: `.github/workflows/deploy.yml`, `.github/workflows/android-deploy-lavego-shop-v2.yml`.
- Página relacionada nesta wiki: [CI e runtime Node](ci-node-runtime).
- Home: [App-Home](Home).

## Histórico

| Data | Evento |
| --- | --- |
| 2026-08-25 | Gate atualizado (#566): aceite de ancestral + fallback fail-open; documentado nesta página. |
