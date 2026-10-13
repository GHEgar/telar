import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#muestrario');
});

test('filters without accents and picks with the keyboard', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Estado' });
    await input.fill('queret');
    const listbox = page.getByRole('listbox');
    await expect(listbox.getByRole('option')).toHaveText(['Querétaro']);
    await expect(listbox.locator('mark')).toHaveText('Querét');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Querétaro');
    await expect(listbox).toBeHidden();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('group', { name: 'Occidente' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Sonora' })).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('option', { name: 'Chihuahua' })).toHaveAttribute('data-active', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
});

test('collects several towns as chips', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Municipios' });
    await input.fill('tla');
    await page.keyboard.press('Enter');
    await page.getByRole('option', { name: 'Tlajomulco' }).click();
    const field = page.getByTestId('towns');
    await expect(field.locator('.tag')).toHaveText(['Tlaquepaque✕', 'Tlajomulco✕']);
    await expect(input).toBeFocused();
    await page.keyboard.press('Backspace');
    await expect(field.locator('.tag')).toHaveText(['Tlaquepaque✕']);
    await field.getByRole('button', { name: 'Quitar Tlaquepaque' }).click();
    await expect(field.locator('.tag')).toHaveCount(0);
});

test('searches remotely after two letters', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Búsqueda remota' });
    await input.fill('g');
    await expect(page.getByTestId('async-status')).toHaveText('Escribe al menos 2 letras');
    await input.fill('gua');
    await expect(page.getByTestId('async-status')).toHaveText('Buscando…');
    await expect(page.getByRole('option', { name: 'Guadalajara' })).toBeVisible();
    await expect(page.getByTestId('async-status')).toHaveText('1 resultado');
});
