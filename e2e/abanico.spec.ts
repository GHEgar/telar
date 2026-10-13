import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#abanico');
});

test('shows tooltips on hover after a delay and on keyboard focus at once', async ({ page }) => {
    const save = page.getByRole('button', { name: 'Guardar' });
    await save.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Guarda los cambios (Ctrl+S)');
    await expect(save).toHaveAccessibleDescription('Guarda los cambios (Ctrl+S)');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
    await page.mouse.move(0, 0);
    await save.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip')).toHaveText('Deshace el último cambio');
    const tip = await page.getByRole('tooltip').boundingBox();
    const trigger = await page.getByRole('button', { name: 'Deshacer' }).boundingBox();
    expect((tip?.y ?? 0) + (tip?.height ?? 0)).toBeLessThanOrEqual(trigger?.y ?? 0);
});

test('drives the menu from the keyboard', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Acciones' });
    await button.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name: 'Acciones' });
    await expect(menu.getByRole('menuitem', { name: 'Editar' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Archivar' })).toBeFocused();
    await page.keyboard.press('e');
    await expect(menu.getByRole('menuitem', { name: 'Eliminar' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-value')).toHaveText('Eliminar');
    await expect(button).toBeFocused();
});

test('closes the menu with an outside click and ignores disabled items', async ({ page }) => {
    await page.getByRole('button', { name: 'Acciones' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('menuitem', { name: 'Compartir' }).click({ force: true });
    await expect(menu).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-value')).toHaveText('nada');
});
