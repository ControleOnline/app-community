# Android / Cielo deploy

## Core

`.github/workflows/android-build.yml` — pipeline único (prebuild → gradle → publish).

## Destinos

| Produto | AAB | APK | Destino |
|---------|-----|-----|---------|
| Controle Online (todos app_types) | sim | sim | [GitHub Releases](https://github.com/ControleOnline/app-community/releases) + Play Store (AAB) |
| Cielo PDV Ctrl | sim | sim | [GitHub Releases](https://github.com/ControleOnline/app-community/releases) |
| **Lave-Go** (whitelabel) | não | sim | **FTP apenas** |

FTP **não** é mais usado para Controle Online — só Lave-Go.

## Callers

| Workflow | publish |
|----------|---------|
| `android-deploy-global.yml` | Play + GitHub Releases |
| `cielo-deploy-pdv-ctrl.yml` | GitHub Releases |
| `cielo-deploy-pdv-lavego.yml` | FTP |
| `cielo-deploy-pdv-lavego-STAGING.yml` | FTP |
