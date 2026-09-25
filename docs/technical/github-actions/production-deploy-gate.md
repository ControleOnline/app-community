> Cópia operacional no repositório (`docs/technical/github-actions/`). A [wiki do app-community](https://github.com/ControleOnline/app-community/wiki/production-deploy-gate) é a fonte primária de leitura humana.

# Production deploy gate (staging checks)

## Objetivo

Documentar o job **1.5 · Require staging checks** dos workflows de deploy de produção do `app-community`, incluindo a lógica de aceite após a correção do hotfix [#566](https://github.com/ControleOnline/app-community/issues/566).

O gate existe para impedir publicação em produção (`master`) sem evidência de que o código passou por checks bem-sucedidos em `staging`. A regra antiga (match **exato** de SHA) bloqueava permanentemente o deploy após qualquer commit exclusivo de `master` (ex.: bump de versão, hotfixes paralelos), porque o SHA de produção nunca aparecia como `headSha` de um run de `pull-request-checks.yml` em `staging`.

## Arquivos afetados

| Arquivo | Papel |
| --- | --- |
| `.github/workflows/deploy.yml` | Pipeline principal (web + android + lg-webOS). Job `production-gate` (nome legível: **1.5 · Require staging checks**). |
| `.github/workflows/android-deploy-lavego-shop-v2.yml` | Deploy Android do Shop Lave Go. Mesma lógica de gate no job `production-gate`. |

## Quando o gate roda

- **Só em produção** (`TARGET_ENV == master` / branch `master`).
- Em `dev` e `staging` o job **pula** (`Production gate skipped for …`) e o pipeline segue.
- O job `web` (e o `build` no Android) declara `needs: [configure, production-gate]` (ou equivalente), portanto qualquer falha no gate interrompe o restante do Deploy.

## Critérios de aceite (ordem)

O gate consulta runs concluídos com sucesso de `pull-request-checks.yml` na branch **`staging`** (até 50 runs recentes) e aplica, nesta ordem:

1. **Match exato de SHA**  
   `headSha` do check de staging == `github.sha` do run de produção (cenário ideal de promote fast-forward).

2. **SHA ancestral**  
   Via Compare API (`repos/{owner}/{repo}/compare/{CHECK_SHA}...{TARGET_SHA}`): se o status for `ahead` ou `identical`, o check de staging é ancestral (ou idêntico) ao commit de master. Cobre promote + commits pós-promote em master (ex.: version bump).

3. **Fallback controlado (fail-open com aviso)**  
   Se nenhum check ancestral for encontrado, aceita quando existem **ambos**:
   - último (ou recente) run **sucesso** de `pull-request-checks.yml` em `staging`;
   - último (ou recente) run **sucesso** de `deploy.yml` em `staging`.  
   Emite `WARNING` no log com as URLs e o motivo (`TARGET_SHA` diverged from staging tips). Objetivo: não travar produção por divergência residual legítima.

Se nenhum dos três critérios for satisfeito, o job falha com:

```text
Production deploy blocked: no successful Pull Request Checks on staging related to $TARGET_SHA.
Need exact match, ancestor staging check, or green staging PR Checks + Deploy.
```

## Fluxo resumido

```text
push master (ou workflow_dispatch master)
  → configure
  → production-gate (1.5)
       ├─ env != master → skip
       ├─ exact SHA match → allow
       ├─ staging check is ancestor of master SHA → allow
       ├─ green staging PR Checks + green staging Deploy → allow (WARNING)
       └─ senão → fail (bloqueia web/android)
  → web / build / demais jobs
```

## O que o gate **não** faz

- Não reexecuta testes em master.
- Não exige que `staging` e `master` estejam alinhados em tip (só que haja evidência de checks verdes relacionados).
- Não aplica a regra em `dev`/`staging`.
- Não substitui o dual-gate de produto (QA/Security em issues); é apenas barreira de pipeline de publicação.

## Manutenção

- Qualquer alteração na lógica de aceite deve manter os três níveis (exact → ancestor → fallback) documentados nesta página e no comentário do script nos workflows.
- Ao adicionar novos workflows de deploy **produção**, reutilizar a mesma política (ou extrair action compartilhada) para evitar regressão do bloqueio permanente por SHA idêntico.
- Logs de `WARNING` no fallback devem ser monitorados; frequência alta pode indicar divergência crônica staging/master que merece alinhamento de processo (promote + bump no mesmo fluxo).

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
