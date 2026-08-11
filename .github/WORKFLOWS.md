# CI/CD (app-community)

Deploys e verificações do app-community.

| Arquivo | Produto |
|---------|---------|
| `deploy.yml` | **Controle Online** |
| `pull-request-checks.yml` | CI de PR |

## `deploy.yml` (Controle Online)

```
1 · Configure (dev | staging | master)
2 · Web: MANAGER + SHOP + ADMIN (FTP de cada produto)
3 · Android AAB+APK (só master) → GitHub Releases + Play
4 · LG webOS (só master) → GitHub Releases
```

Sem trigger cruzado entre pipelines.
