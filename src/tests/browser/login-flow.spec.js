const { expect, test } = require('playwright/test');

const openLoginPage = async page => {
  await page.goto('/');

  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Senha')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
};

test.describe('browser smoke', () => {
  test('loads the login shell and keeps the route visible in the browser', async ({
    page,
  }) => {
    await openLoginPage(page);

    await expect(
      page.getByText('Entre com suas credenciais para acessar'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test('navigates to create account and returns to login', async ({ page }) => {
    await openLoginPage(page);

    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL(/create-account/);
    await expect(page.getByText('Criar Conta')).toBeVisible();

    await page.goBack();

    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('shows the create-account validation dialog in the browser', async ({
    page,
  }) => {
    await openLoginPage(page);

    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByText('Criar Conta')).toBeVisible();

    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    const dialog = await dialogPromise;

    expect(dialog.message()).toBe('Informe o nome');
    await dialog.accept();
  });
});
