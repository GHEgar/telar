import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#muestrario');
});

test('filters without accents and picks with the keyboard', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'State' });
    await input.fill('queret');
    const listbox = page.getByRole('listbox');
    await expect(listbox.getByRole('option')).toHaveText(['Querétaro']);
    await expect(listbox.locator('mark')).toHaveText('Querét');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Querétaro');
    await expect(listbox).toBeHidden();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('group', { name: 'West' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Sonora' })).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('option', { name: 'Chihuahua' })).toHaveAttribute('data-active', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
});

test('collects several towns as chips', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Municipalities' });
    await input.fill('tla');
    await page.keyboard.press('Enter');
    await page.getByRole('option', { name: 'Tlajomulco' }).click();
    const field = page.getByTestId('towns');
    await expect(field.locator('.tag')).toHaveText(['Tlaquepaque', 'Tlajomulco']);
    await expect(input).toBeFocused();
    await page.keyboard.press('Backspace');
    await expect(field.locator('.tag')).toHaveText(['Tlaquepaque']);
    await field.getByRole('button', { name: 'Remove Tlaquepaque' }).click();
    await expect(field.locator('.tag')).toHaveCount(0);
});

test('searches remotely after two letters', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Remote search' });
    await input.fill('g');
    await expect(page.getByTestId('async-status')).toHaveText('Type at least 2 characters');
    await input.fill('gua');
    await expect(page.getByTestId('async-status')).toHaveText('Searching…');
    await expect(page.getByRole('option', { name: 'Guadalajara' })).toBeVisible();
    await expect(page.getByTestId('async-status')).toHaveText('1 result');
});

test('creates a new tag from the typed text', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Tags' });
    await input.fill('River');
    await expect(page.getByRole('option', { name: 'Create “River”' })).toHaveAttribute('data-active', 'true');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('tags').locator('.tag')).toHaveText(['river']);
});

test('scrolls a virtual list of 2000 options with the keyboard', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Long list (2000)' }).click();
    const list = page.getByTestId('virtual');
    expect(await list.getByRole('option').count()).toBeLessThan(30);
    await page.keyboard.press('ArrowUp');
    const last = page.getByRole('option', { name: 'Block 2000' });
    await expect(last).toBeInViewport();
    await expect(last).toHaveAttribute('aria-posinset', '2000');
    await expect(last).toHaveAttribute('aria-setsize', '2000');
});

test('runs a command without filling the input and lays the list out in the flow', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Command' });
    await input.fill('exp');
    const list = page.getByTestId('commands');
    await expect(list.getByRole('option')).toHaveText(['Export map']);
    expect(await list.getAttribute('style')).toBeNull();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('command-ran')).toHaveText('Export map');
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
});
