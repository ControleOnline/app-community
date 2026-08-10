# CI/CD (app-community)

Só **dois** workflows de deploy na raiz. Lógica em `.github/actions/`.

| Arquivo | Uso |
|---------|-----|
| `deploy.yml` | Controle Online — fluxo por ambiente |
| `deploy-lave-go.yml` | Whitelabel Lave-Go (FTP) |
| `pull-request-checks.yml` | CI de PR (não é deploy) |

## Fluxo `deploy.yml`

```
configure (dev | staging | master)
    │
    ├─► web          (sempre)
    │
    └─► se master:
          ├─► android matrix (AAB + APK → Releases + Play)
          └─► lg-webos (IPK → Releases)
```

| Ambiente | Web | Android / LG |
|----------|-----|----------------|
| `dev` | sim | **não** |
| `staging` | sim | **não** |
| `master` | sim | **sim** (não existe staging nativo) |

Branch de produção nativa = **`master`** (não `production`).
