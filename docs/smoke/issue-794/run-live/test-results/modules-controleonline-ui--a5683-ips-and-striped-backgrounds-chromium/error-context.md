# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: modules/controleonline/ui-financial/src/tests/browser/manager/financial-hub-page.spec.js >> financial hub authenticated browser smoke >> fluxo: financeiro-cobranca renders rows, status chips and striped backgrounds
- Location: modules/controleonline/ui-financial/src/tests/browser/manager/financial-hub-page.spec.js:92:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByPlaceholder('Email')
Expected: 0
Received: 1

Call log:
  - Expect "toHaveCount" with timeout 15000ms
  - waiting for getByPlaceholder('Email')
    8 × locator resolved to 1 element
      - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e15]:
    - generic [ref=e17]: Entre com suas credenciais para acessar
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: 
        - textbox "Email" [ref=e21]
      - generic [ref=e22]:
        - generic [ref=e23]: 
        - textbox "Senha" [ref=e24]
        - generic [ref=e26] [cursor=pointer]: 
      - generic [ref=e28] [cursor=pointer]: Entrar
      - generic [ref=e30] [cursor=pointer]: Criar conta
      - generic [ref=e32] [cursor=pointer]: Esqueci minha senha
  - generic:
    - generic:
      - generic:
        - generic:
          - generic: v1.10.23
```

# Test source

```ts
  1  | 'use strict';
  2  |
  3  | const {expect} = require('playwright/test');
  4  | const {
  5  |   getAdminCredentials,
  6  |   resolveLoginFields,
  7  | } = require('./smokeCredentials');
  8  | const {captureStep} = require('./smokeEvidence');
  9  |
  10 | const openLoginPage = async (page) => {
  11 |   await page.goto('/');
  12 |   await expect(page.getByPlaceholder('Email')).toBeVisible();
  13 |   await expect(page.getByPlaceholder('Senha')).toBeVisible();
  14 |   await expect(page.getByText('Entrar', {exact: true})).toBeVisible();
  15 | };
  16 |
  17 | const loginAsAdmin = async (page, options = {}) => {
  18 |   const credentials = options.credentials || getAdminCredentials();
  19 |   const fields = resolveLoginFields(credentials);
  20 |
  21 |   await openLoginPage(page);
  22 |   if (options.screenshot !== false) {
  23 |     await captureStep(page, 'login', {dir: options.evidenceDir});
  24 |   }
  25 |
  26 |   await page.getByPlaceholder('Email').fill(fields.email);
  27 |   await page.getByPlaceholder('Senha').fill(fields.password);
  28 |   await page.getByText('Entrar', {exact: true}).click();
  29 |
> 30 |   await expect(page.getByPlaceholder('Email')).toHaveCount(0, {timeout: 15000});
     |                                                ^ Error: expect(locator).toHaveCount(expected) failed
  31 |
  32 |   return {
  33 |     source: fields.source,
  34 |     live: credentials.live && credentials.hasSecrets,
  35 |   };
  36 | };
  37 |
  38 | module.exports = {
  39 |   resolveLoginFields,
  40 |   openLoginPage,
  41 |   loginAsAdmin,
  42 | };
  43 |
```