# CI/CD (app-community)

Deploys e verificações do app-community. Pipelines **independentes** — sem trigger cruzado.

| Arquivo | Produto |
|---------|---------|
| `deploy.yml` | **Controle Online** |
| `deploy-lave-go.yml` | **White-label Lave-Go** |
| `pull-request-checks.yml` | CI de PR |

## `deploy.yml` (Controle Online)

```
1 · Configure (dev | staging | master)
2 · Web: MANAGER + SHOP + ADMIN (FTP de cada produto)
3 · Android AAB+APK (só master) → GitHub Releases + Play
4 · LG webOS (só master) → GitHub Releases
```

Sem trigger cruzado entre pipelines.

### Domínio e tema por app

O deploy grava `DOMAIN` no `env.local.js` para que o runtime envie o `App-Domain`
correto ao carregar `/themes-colors.css`.

- `dev` usa `https://d.controleonline.com`.
- `staging` usa `https://staging.controleonline.com`.
- `master` usa domínio por app, por exemplo `https://crm.controleonline.com`,
  `https://pos.controleonline.com`, `https://manager.controleonline.com`,
  `https://shop.controleonline.com` e `https://admin.controleonline.com`.
- O Android também recebe domínio por app em `master`; `MANAGER_APP` permanece no
  domínio manager.

Os domínios de produção seguem os namespaces dos logos existentes em
`src/assets/<app>/`, o que mantém a resolução de tema específica por produto.

## `deploy-lave-go.yml` (White-label Lave-Go) — HOTFIX #420

Disparo: **somente** `workflow_dispatch` (não sobe em push de master/dev/staging do Controle Online).

```
1 · Configure (endpoints apinew.lave-go.com)
2 · Web MANAGER → SFTP (FTPHOST_APPLAVEGO) em public_html/
3 · Android POS (com.lavego.app):
    · AAB + APK
    · SFTP versionado: public_html/{version}/com.lavego.app/{apk|aab}/
    · Google Play (track internal)
```

Input opcional `web_only=true` pula Android/Play.

Secrets Lave-Go: `FTPHOST_APPLAVEGO`, `FTPUSER_APPLAVEGO`, `FTPPASS_APPLAVEGO` (+ `CERT`, keystore, `ANDROID_SERVICE_ACCOUNT_JSON` para Play).
