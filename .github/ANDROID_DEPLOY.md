# Android / Cielo deploy

## Core

`.github/workflows/android-build.yml` — **único** pipeline de build (Expo prebuild + Gradle).

| Input | Uso |
|-------|-----|
| `app_type` | CHECKOUT, CRM, POS, … |
| `build_aab` / `build_apk` | Play Store vs Cielo |
| `publish_play` / `publish_ftp` / `publish_github` | canais |
| `package_name`, `expo_name`, `api_*` | whitelabel (Lave-Go) |

## Callers

| Workflow | Artefato | Destino |
|----------|----------|---------|
| `android-deploy-global.yml` | AAB + APK | Play + GitHub Release |
| `cielo-deploy-pdv-ctrl.yml` | APK | FTP |
| `cielo-deploy-pdv-lavego.yml` | APK | FTP (Lave-Go) |

## Por que ainda há um prebuild por app_type?

`applicationId`, nome, assets e `google-services.json` mudam por produto — o prebuild nativo **não** é compartilhado entre POS e MANAGER. O que unificamos é o **processo** (um script), não um único artefato intermediário para todos os tipos.

Cielo ≠ Android Play só no **formato** (APK vs AAB) e **publicação** (FTP vs Play).
