import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#abanico');
});

test('shows tooltips on hover after a delay and on keyboard focus at once', async ({ page }) => {
    const save = page.getByRole('button', { name: 'Save' });
    await save.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Saves your changes (Ctrl+S)');
    await expect(save).toHaveAccessibleDescription('Saves your changes (Ctrl+S)');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
    await page.mouse.move(0, 0);
    await save.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip')).toHaveText('Undoes the last change');
    const tip = await page.getByRole('tooltip').boundingBox();
    const trigger = await page.getByRole('button', { name: 'Undo' }).boundingBox();
    expect((tip?.y ?? 0) + (tip?.height ?? 0)).toBeLessThanOrEqual(trigger?.y ?? 0);
});

test('drives the menu from the keyboard', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Actions' });
    await button.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name: 'Actions' });
    await expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Archive' })).toBeFocused();
    await page.keyboard.press('d');
    await expect(menu.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-value')).toHaveText('Delete');
    await expect(button).toBeFocused();
});

test('closes the menu with an outside click and ignores disabled items', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('menuitem', { name: 'Share' }).click({ force: true });
    await expect(menu).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-value')).toHaveText('nothing');
});

test('opens a submenu from the keyboard and toggles a checkbox item', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Actions' });
    await button.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('e');
    const trigger = page.getByRole('menuitem', { name: /Export/ });
    await expect(trigger).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'PNG' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(trigger).toBeFocused();
    await expect(page.getByRole('menuitem', { name: 'PNG' })).toBeHidden();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('menu-value')).toHaveText('Export PDF');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await button.click();
    await page.getByRole('menuitemcheckbox', { name: /Pin/ }).click();
    await expect(page.getByRole('menuitemcheckbox', { name: /Pin/ })).toHaveAttribute('aria-checked', 'true');
});

test('opens the radial menu at a right click and drives it around the circle', async ({ page }) => {
    const map = page.getByRole('application', { name: 'Map' });
    const box = await map.boundingBox();
    if (!box) throw new Error('no map');
    await map.click({ button: 'right', position: { x: box.width / 2, y: box.height / 2 } });
    const menu = page.getByRole('menu', { name: 'Tools' });
    await expect(menu.getByRole('menuitem', { name: 'Measure' })).toBeFocused();
    const top = await menu.getByRole('menuitem', { name: 'Measure' }).boundingBox();
    const bottom = await menu.getByRole('menuitem', { name: 'Table' }).boundingBox();
    expect((top?.y ?? 0) + (top?.height ?? 0)).toBeLessThan(bottom?.y ?? 0);
    await page.keyboard.press('ArrowLeft');
    await expect(menu.getByRole('menuitem', { name: 'Share' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(menu.getByRole('menuitem', { name: 'Table' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toHaveCount(0);
    await expect(page.getByTestId('radial-value')).toHaveText('Table');
    await expect(map).toBeFocused();
    await page.keyboard.press('Shift+F10');
    await expect(menu.getByRole('menuitem', { name: 'Measure' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
});
