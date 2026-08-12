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

### `App-Domain`

Deploys Android gravam `DOMAIN` no `env.local.js`.

- No web, o deploy não grava `DOMAIN`; o front usa `window.location.host` para preservar domínios customizados e multi-tenant.
- No Android, cada app em `master` usa seu namespace direto: `crm.controleonline.com`, `pos.controleonline.com`, `checkout.controleonline.com`, etc.
- No Android, onde não existe `window.location.host`, o `DOMAIN` do build define o `App-Domain` e o tema retornado por `/themes-colors.css`.
