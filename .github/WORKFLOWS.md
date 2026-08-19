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
