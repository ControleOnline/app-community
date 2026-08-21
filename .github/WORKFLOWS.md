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

## `deploy-lave-go.yml` (White-label Lave-Go) — HOTFIX #420

Disparo: **somente** `workflow_dispatch`.

```
1 · Configure (apinew.lave-go.com)
2 · Web MANAGER → SFTP public_html/
3 · Android POS (com.lavego.app): AAB+APK SFTP + Google Play (internal)
```

Secrets: `FTPHOST_APPLAVEGO`, `FTPUSER_APPLAVEGO`, `FTPPASS_APPLAVEGO`, `CERT`, keystore, `ANDROID_SERVICE_ACCOUNT_JSON`.
