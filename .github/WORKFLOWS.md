# CI/CD layout (app-community)

GitHub **não** executa YAML em subpastas de `workflows/`.  
Por isso: **poucos entrypoints na raiz** + lógica em **composite actions** (estas sim podem ficar em pastas).

```
.github/
  actions/           ← lógica reutilizável (pastas OK)
    android-build/
    web-export-deploy/
  workflows/         ← só entrypoints (raiz)
    android.yml
    android-lavego.yml
    web.yml
    lg-webos.yml
    pull-request-checks.yml
    pre-flight-check-lavego.yml
    validate-*.yml
```

| Entrypoint | Função |
|------------|--------|
| `android.yml` | Matrix app_types → AAB+APK → Releases + Play |
| `android-lavego.yml` | Whitelabel APK → **FTP** |
| `web.yml` | configure → export → FTP (staging/prod/lavego) |
| `lg-webos.yml` | PPC webOS |

Destinos Android Controle Online: https://github.com/ControleOnline/app-community/releases  
FTP Android: **somente Lave-Go**.
