# PushTrigger

Fluxo de disparo dos workflows de GitHub Actions do `app-community` quando ha `push` em `staging` ou `master`.

```mermaid
flowchart TD
  A[Push na branch] --> B{Branch?}

  B -->|staging| S[Workflows de staging]
  B -->|master| M[Workflows de production]

  %% STAGING
  S --> S1[web-deploy-staging-admin-ctrl.yml]
  S --> S2[web-deploy-staging-manager-ctrl.yml]
  S --> S3[web-deploy-staging-shop-ctrl.yml]
  S --> S4[web-deploy-staging-app-lavego.yml.txt]

  S1 --> S1a[Cria env.local.js]
  S1a --> S1b[Atualiza submodules]
  S1b --> S1c[npm install]
  S1c --> S1d[expo export web]
  S1d --> S1e[FTP deploy]
  S1e --> S1f[tests automatizados]
  S1f --> S1g[smoke tests]
  S1g --> S1h[upload dos resultados]

  S2 --> S2a[Cria env.local.js]
  S2a --> S2b[Atualiza submodules]
  S2b --> S2c[npm install]
  S2c --> S2d[expo export web]
  S2d --> S2e[FTP deploy]
  S2e --> S2f[tests automatizados]
  S2f --> S2g[smoke tests]
  S2g --> S2h[upload dos resultados]

  S3 --> S3a[Cria env.local.js]
  S3a --> S3b[Atualiza submodules]
  S3b --> S3c[npm install]
  S3c --> S3d[expo export web]
  S3d --> S3e[FTP deploy]
  S3e --> S3f[tests automatizados]
  S3f --> S3g[smoke tests]
  S3g --> S3h[upload dos resultados]

  S4 --> S4a[Arquivo .txt nao executa como workflow]

  %% MASTER
  M --> M1[web-deploy-production-admin-ctrl.yml]
  M --> M2[web-deploy-production-manager-ctrl.yml]
  M --> M3[web-deploy-production-shop-ctrl.yml]
  M --> M4[android-deploy-global.yml]
  M --> M5[cielo-deploy-pdv-ctrl.yml]
  M --> M6[cielo-deploy-pdv-lavego.yml]

  M1 --> M1a[Confirma staging bem-sucedido]
  M1a --> M1b[Cria env.local.js]
  M1b --> M1c[Atualiza submodules]
  M1c --> M1d[npm install]
  M1d --> M1e[expo export web]
  M1e --> M1f[FTP deploy]

  M2 --> M2a[Confirma staging bem-sucedido]
  M2a --> M2b[Cria env.local.js]
  M2b --> M2c[Atualiza submodules]
  M2c --> M2d[npm install]
  M2d --> M2e[expo export web]
  M2e --> M2f[FTP deploy]

  M3 --> M3a[Confirma staging bem-sucedido]
  M3a --> M3b[Cria env.local.js]
  M3b --> M3c[Atualiza submodules]
  M3c --> M3d[npm install]
  M3d --> M3e[expo export web]
  M3e --> M3f[FTP deploy]

  M4 --> M4a[Build Android multiplos apps]
  M4a --> M4b[Upload do AAB]
  M4b --> M5
  M4b --> M6

  M5 --> M5a[Dispara por workflow_run do Android Apps]
  M6 --> M6a[Dispara por workflow_run do Android Apps]
```

Observacoes:

- O workflow `web-deploy-staging-app-lavego.yml.txt` nao executa no GitHub Actions porque esta com extensao `.txt`.
- No `master`, os workflows web de `admin`, `manager` e `shop` dependem de uma execucao anterior bem-sucedida em `staging` para o mesmo commit ou um de seus parents.
- Os workflows Android de `master` podem acionar os workflows da Cielo via `workflow_run`.
