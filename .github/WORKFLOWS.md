# CI/CD (app-community)

| Arquivo | Uso |
|---------|-----|
| `deploy.yml` | Controle Online |
| `deploy-lave-go.yml` | Whitelabel Lave-Go |
| `pull-request-checks.yml` | CI de PR |

## Fluxo `deploy.yml`

```
1 · Configure (dev | staging | master)
2 · Web matrix: MANAGER + SHOP + ADMIN  → cada um no seu FTP
3 · Android matrix (só master) → AAB+APK → Releases + Play
4 · LG webOS (só master) → IPK → Releases
```

### Web FTP (produção / master)

| app_type | Secrets |
|----------|---------|
| MANAGER | `FTPHOST`, `FTPUSER`, `FTPPASS` |
| SHOP | `SHOP_HOST`, `SHOP_USER`, `SHOP_PASS` |
| ADMIN | `ADMIN_HOST`, `ADMIN_USER`, `ADMIN_PASS` |

dev/staging usam `DEV_*` / `STAGING_*` (mesmo host de ambiente para os três builds).

### Nativo

Só **`master`** (sem staging): Android + LG.
