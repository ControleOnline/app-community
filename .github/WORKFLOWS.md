# CI/CD (app-community)

Deploys e verificações do app-community. Pipelines **independentes** — sem trigger cruzado.

| Arquivo | Produto |
|---------|---------|
| `deploy.yml` | **Controle Online** |
| `deploy-lave-go.yml` | **White-label Lave-Go** |
| `pull-request-checks.yml` | CI de PR |
| `web-deploy-production-app-lavego.yml` | Legado Lave-Go web (desativado — usar `deploy-lave-go.yml`) |

## `deploy.yml` (Controle Online)

```
1 · Configure (dev | staging | master)
2 · Web: MANAGER + SHOP + ADMIN (FTP de cada produto)
3 · Android AAB+APK (só master) → GitHub Releases + Play
4 · LG webOS (só master) → GitHub Releases
```

Sem trigger cruzado entre pipelines.

## `deploy-lave-go.yml` (White-label Lave-Go)

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
