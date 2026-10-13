import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#postigo');
});

test('opens from the keyboard, traps Tab and returns focus', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Nueva solicitud' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Nueva solicitud' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Motivo' })).toBeFocused();
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await expect(page.locator('#root')).toHaveAttribute('inert', '');
    await dialog.getByRole('button', { name: 'Guardar' }).focus();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('textbox', { name: 'Motivo' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Guardar' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('#root')).not.toHaveAttribute('inert');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.getByTestId('dialog-log')).toContainText('cierra: escape');
});

test('lets inner components keep their own Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Nueva solicitud' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nueva solicitud' });
    await dialog.getByRole('button', { name: 'Elegir mes' }).click();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('grid')).toBeVisible();
});

test('stacks an alert dialog that ignores outside clicks', async ({ page }) => {
    await page.getByRole('button', { name: 'Nueva solicitud' }).click();
    const form = page.getByRole('dialog', { name: 'Nueva solicitud' });
    await form.getByRole('button', { name: 'Descartar' }).click();
    const alert = page.getByRole('alertdialog', { name: '¿Descartar la solicitud?' });
    await expect(alert).toHaveAccessibleDescription(/Se pierde lo capturado/);
    await page.mouse.click(10, 10);
    await expect(alert).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(alert).toBeHidden();
    await expect(form).toBeVisible();
    await expect(form.getByRole('button', { name: 'Descartar' })).toBeFocused();
    await page.mouse.click(10, 10);
    await expect(form).toBeHidden();
    await expect(page.getByTestId('dialog-log')).toContainText('cierra: outside');
});
