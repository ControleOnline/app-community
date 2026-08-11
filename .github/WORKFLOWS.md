# CI/CD (app-community)

Dois deploys **independentes** — não se chamam.

| Arquivo | Produto |
|---------|---------|
| `deploy.yml` | **Controle Online** |
| `deploy-lave-go.yml` | **Lave-Go** (whitelabel) |
| `pull-request-checks.yml` | CI de PR |

## `deploy.yml` (Controle Online)

```
1 · Configure (dev | staging | master)
2 · Web: MANAGER + SHOP + ADMIN (FTP de cada produto)
3 · Android AAB+APK (só master) → GitHub Releases + Play
4 · LG webOS (só master) → GitHub Releases
```

Sem Lave-Go, sem trigger cruzado.

## `deploy-lave-go.yml` (Lave-Go)

```
1 · Configure
2 · Android APK → FTP Lave-Go
2 · Web → FTP Lave-Go
```

Só `workflow_dispatch`. Não entra no pipeline Controle Online.

### Web `App-Domain`

O deploy **não** grava `DOMAIN` no `env.local.js`. O front usa `window.location.host` (ex.: `erpjaguncos.com.br`).
