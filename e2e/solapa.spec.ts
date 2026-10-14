import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#solapa');
});

test('automatic tabs select as focus moves and skip disabled ones', async ({ page }) => {
    const list = page.getByTestId('tabs-auto');
    await list.getByRole('tab', { name: 'Summary' }).click();
    await page.keyboard.press('ArrowRight');
    await expect(list.getByRole('tab', { name: 'Map' })).toBeFocused();
    await expect(list.getByRole('tab', { name: 'Map' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(list.getByRole('tab', { name: 'Open data' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(list.getByRole('tab', { name: 'Summary' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tabpanel', { name: 'Summary' }).first()).toBeFocused();
});

test('manual vertical tabs wait for Enter', async ({ page }) => {
    const list = page.getByTestId('tabs-manual');
    await list.getByRole('tab', { name: 'Map' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(list.getByRole('tab', { name: 'Open data' })).toBeFocused();
    await expect(list.getByRole('tab', { name: 'Map' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(list.getByRole('tab', { name: 'Open data' })).toHaveAttribute('aria-selected', 'true');
});

test('the grid moves in two axes and by typeahead', async ({ page }) => {
    const grid = page.getByTestId('grid');
    await grid.getByRole('button', { name: 'Aguascalientes' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(grid.getByRole('button', { name: 'Chiapas' })).toBeFocused();
    await page.keyboard.type('ja');
    await expect(grid.getByRole('button', { name: 'Jalisco' })).toBeFocused();
    await page.waitForTimeout(600);
    await page.keyboard.press('m');
    await expect(grid.getByRole('button', { name: 'Michoacán' })).toBeFocused();
});
