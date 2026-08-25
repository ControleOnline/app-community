# Production Deploy Gate (Require staging checks)

Documentação técnica do gate de produção no pipeline de deploy do `app-community`.

> Cópia versionada em `docs/technical/github-actions/`. A [wiki do app-community](https://github.com/ControleOnline/app-community/wiki) é a fonte primária de leitura humana.

## Objetivo

Impedir deploy de produção (`master`) quando não houver evidência de que o código passou com sucesso pelos checks de `staging`. O gate evita promoção de commits que nunca rodaram (ou falharam) em staging, sem travar permanentemente a produção após commits exclusivos de master (ex.: bump de versão).

## Arquivos

| Arquivo | Job / papel |
| --- | --- |
| `.github/workflows/deploy.yml` | Job **1.5 · Require staging checks** (`production-gate`) |
| `.github/workflows/android-deploy-lavego-shop-v2.yml` | Job `production-gate` (mesma lógica) |

## Quando o gate roda

- **Só em produção**: o job verifica `TARGET_ENV == master` (ou equivalente no Android). Em `dev` e `staging` o gate é **skipped**.
- Disparado em `push` para `master` (e `workflow_dispatch` com environment=master).

## Critérios de aceite (ordem de avaliação)

O gate consulta runs bem-sucedidos de `pull-request-checks.yml` na branch **staging** (até 50 mais recentes) e aceita o deploy se **qualquer** condição for verdadeira, nesta ordem:

1. **Match exato de SHA**  
   Existe um run de PR Checks em staging com `headSha == github.sha` (promote fast-forward).

2. **SHA de staging é ancestral do SHA de master**  
   Via Compare API (`repos/{owner}/{repo}/compare/{CHECK_SHA}...{TARGET_SHA}`): status `ahead` ou `identical`.  
   Cobre o caso típico: promote `staging → master` + commits pós-promote (version bump, hotfixes de workflow, etc.).

3. **Fallback controlado (fail-open)**  
   Existe pelo menos um PR Checks **verde** em staging **e** um Deploy **verde** em staging (tips recentes).  
   Emite `WARNING` no log com as URLs dos runs.  
   Usado quando staging e master estão residualmente diverged (commits paralelos) e a igualdade/ancestralidade estrita não se aplica, sem bloquear produção indevidamente.

Se nenhuma condição for satisfeita, o job falha com:

```text
Production deploy blocked: no successful Pull Request Checks on staging related to $TARGET_SHA.
Need exact match, ancestor staging check, or green staging PR Checks + Deploy.
```

## Por que a igualdade estrita não basta

Após `staging → master` + bump de versão (ou qualquer commit só em master), os SHAs divergem. O SHA de produção **nunca** aparece como `headSha` de um run em `staging`. Exigir `headSha == github.sha` bloqueia **permanentemente** todos os deploys de produção até alguém force um reset artificial de histórico — cenário observado nos failures de 2026-08-25 (runs 32866510134, 32866458971 e anteriores).

A correção (issue #566) introduz ancestralidade + fallback, mantendo a intenção original: produção só publica se staging tiver passado recentemente.

## Dependências do job

No `deploy.yml`, o job `web` (e demais etapas de produção) declara:

```yaml
needs: [configure, production-gate]
```

Assim, nenhuma etapa de publicação em master avança se o gate falhar.

## Relação com outros fluxos

- **Pull Request Checks** (`pull-request-checks.yml`): fonte primária de evidência de qualidade em staging.
- **Deploy em staging**: usado apenas no fallback (confirma que o tip de staging chegou a publicar).
- **PushTrigger / fluxos legados**: ver `docs/pushtrigger.md`. O pipeline unificado atual é `deploy.yml`.
- **Hotfix / RC**: o gate não substitui dual-gate de QA/Security; ele é um controle de pipeline de ambiente.

## Operação e troubleshooting

| Sintoma | Verificação |
| --- | --- |
| Job 1.5 falha em master | Confirmar se existe run verde de `pull-request-checks.yml` em staging recente; se master divergiu demais, o fallback exige também Deploy verde em staging. |
| Gate skipped | Normal em `dev`/`staging`. |
| WARNING de fallback | Staging e master divergiram; o tip de staging está verde. Revisar se o delta de master é intencional (bump, hotfix de workflow). |
| Android Lave-Go Shop v2 | Mesma lógica no workflow dedicado; tratar falhas de forma análoga. |

## Histórico

- **#566 (2026-08-25)**: gate passou a aceitar ancestral + fallback; eliminação do bloqueio permanente por igualdade estrita de SHA após divergência staging/master.

## Links

- Issue: https://github.com/ControleOnline/app-community/issues/566
- Workflow: https://github.com/ControleOnline/app-community/blob/master/.github/workflows/deploy.yml
- Android: https://github.com/ControleOnline/app-community/blob/master/.github/workflows/android-deploy-lavego-shop-v2.yml
- Wiki (página canônica): https://github.com/ControleOnline/app-community/wiki/Production-Deploy-Gate
