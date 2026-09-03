# Staging web — APP_TYPE ADMIN

> Espelho versionado no Git. Fonte primária de leitura: [wiki Staging web — APP_TYPE ADMIN](https://github.com/ControleOnline/app-community/wiki/staging-web-app-type-admin).

Documentação técnica da publicação do app **ADMIN** em `https://staging.controleonline.com` (em vez de MANAGER).

> Fonte de leitura humana: esta página na [wiki do app-community](https://github.com/ControleOnline/app-community/wiki). Espelho versionado: `docs/technical/github-actions/staging-web-app-type-admin.md` no repositório. Issue de origem: [app-community#717](https://github.com/ControleOnline/app-community/issues/717).

## Objetivo

Homologação web em staging passa a refletir a visão **ADMIN** (menus, acessos e cadastros super), alinhada ao uso operacional de testes e smokes que dependem de login/contexto ADMIN, sem alterar o domínio público de staging.

## Contrato de ambiente

| Ambiente | Branch / input | Domínio web | `app_type` | `ftp_product` |
| --- | --- | --- | --- | --- |
| dev | `dev` | `https://dev.controleonline.com` | MANAGER | manager |
| **staging** | `staging` | **`https://staging.controleonline.com`** | **ADMIN** | **admin** |
| master (produção web) | `master` | matrix multi-app | MANAGER, SHOP, ADMIN, MKT (domínios próprios) | manager, shop, admin, mkt |

- O **domínio** de staging permanece `https://staging.controleonline.com` (não há host novo).
- API/socket de staging continuam `https://s.controleonline.com` / `wss://s.controleonline.com`.
- Produção **não** muda: ADMIN de produção permanece em `https://admin.controleonline.com`.

## Onde a regra vive

Arquivo canônico do pipeline:

- `.github/workflows/deploy.yml` — job `configure`, case `staging` da variável `WEB_MATRIX`:

```text
WEB_MATRIX='{"include":[{"app_type":"ADMIN","ftp_product":"admin","app_domain":"https://staging.controleonline.com"}]}'
```

O job web consome a matrix (`matrix.app_type`, `matrix.ftp_product`, `matrix.app_domain`) e exporta o build com `APP_TYPE` correspondente.

## Teste de contrato

Arquivo: `src/tests/scripts/resolveAppDomain.test.js`

O suite exige, entre outros, que o workflow em disco contenha a linha de staging com ADMIN:

```text
"app_type":"ADMIN","ftp_product":"admin","app_domain":"https://staging.controleonline.com"
```

Comando de referência:

```bash
npx jest src/tests/scripts/resolveAppDomain.test.js --runInBand
```

Qualquer regressão que volte staging para MANAGER (ou altere o domínio sem atualizar o teste) falha o contrato.

## Encaixe em APP_TYPE / modos

Conforme [MODOS_OPERACAO.md](https://github.com/ControleOnline/app-community/blob/master/MODOS_OPERACAO.md):

- **ADMIN** — visão administrativa inicial para menus, acessos e cadastros super.
- **MANAGER** — visão administrativa operacional (governança da operação e da empresa).

Staging deixa de publicar a visão MANAGER no host único de homologação e passa a publicar ADMIN. Isso **não** redefine as fronteiras de produto entre ADMIN e MANAGER no código da aplicação; apenas escolhe qual app type o pipeline web de staging exporta e envia por FTP.

Smokes e helpers que fazem login ADMIN / device-configuração em ambiente de homologação passam a bater no mesmo host onde o ADMIN está publicado (`staging.controleonline.com`).

## O que esta mudança não faz

- Não altera produção (`master` / cron / dispatch master).
- Não cria domínio novo nem remove `https://admin.controleonline.com`.
- Não muda o gate de produção ([Production deploy gate](production-deploy-gate)).
- Não é documentação de uso para cliente final (Central de Ajuda); é contrato interno de deploy e CI.

## Referências

| Destino | Link |
| --- | --- |
| Issue | https://github.com/ControleOnline/app-community/issues/717 |
| Workflow | https://github.com/ControleOnline/app-community/blob/master/.github/workflows/deploy.yml |
| Teste de contrato | https://github.com/ControleOnline/app-community/blob/master/src/tests/scripts/resolveAppDomain.test.js |
| Modos de operação | https://github.com/ControleOnline/app-community/blob/master/MODOS_OPERACAO.md |
| Production deploy gate (wiki) | [production-deploy-gate](production-deploy-gate) |
| CI / Node | [ci-node-runtime](ci-node-runtime) |
