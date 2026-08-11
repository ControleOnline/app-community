# PushTrigger

Fluxo de disparo dos workflows de GitHub Actions do `app-community` quando ha `push` em `staging` ou `master`.

```mermaid
flowchart TD
  A[Push na branch] --> B{Branch?}

  B -->|staging| S[Workflows de staging]
  B -->|master| M[Workflows de production]

  %% STAGING
  S --> S2[web-deploy-staging-manager-ctrl.yml]
  S --> S3[web-deploy-staging-shop-ctrl.yml]

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

  %% MASTER
  M --> M1[web-deploy-production-admin-ctrl.yml]
  M --> M2[web-deploy-production-manager-ctrl.yml]
  M --> M3[web-deploy-production-shop-ctrl.yml]
  M --> M4[android-deploy-global.yml]
  M --> M5[cielo-deploy-pdv-ctrl.yml]

  M1 --> M1a[Cria env.local.js]
  M1a --> M1b[Atualiza submodules]
  M1b --> M1c[npm install]
  M1c --> M1d[expo export web]
  M1d --> M1e[FTP deploy]

  M2 --> M2a[Cria env.local.js]
  M2a --> M2b[Atualiza submodules]
  M2b --> M2c[npm install]
  M2c --> M2d[expo export web]
  M2d --> M2e[FTP deploy]

  M3 --> M3a[Cria env.local.js]
  M3a --> M3b[Atualiza submodules]
  M3b --> M3c[npm install]
  M3c --> M3d[expo export web]
  M3d --> M3e[FTP deploy]

  M4 --> M4a[Build Android multiplos apps]
  M4a --> M4b[Upload do AAB]
  M4b --> M5

  M5 --> M5a[Dispara por workflow_run do Android Apps]
```

Observacoes:

- No `master`, os workflows web de `manager` e `shop` continuam dependendo de uma execucao anterior bem-sucedida em `staging` para o mesmo commit ou um de seus parents.
- Os workflows Android de `master` podem acionar os workflows da Cielo via `workflow_run`.
