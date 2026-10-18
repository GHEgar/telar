import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#sarta');
});

test('reorders from the keyboard and keeps focus on the moved layer', async ({ page }) => {
    const roads = page.getByRole('button', { name: 'Reorder Roads' });
    await roads.focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('status')).toHaveText('Picked up Roads. Position 1 of 5.');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await expect(page.getByTestId('stack-order')).toHaveText('Rivers, Parks, Roads, Schools, Elevation');
    await expect(roads).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('End');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('status')).toHaveText('Reorder cancelled. Roads is back at position 3 of 5.');
});

test('drags a layer by its handle with the mouse', async ({ page }) => {
    const handle = await page.getByRole('button', { name: 'Reorder Elevation' }).boundingBox();
    const target = await page.getByRole('button', { name: 'Reorder Rivers' }).boundingBox();
    if (!handle || !target) throw new Error('no handles');
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(target.x + target.width / 2, target.y, { steps: 10 });
    await page.mouse.up();
    await expect(page.getByTestId('stack-order')).toHaveText('Roads, Elevation, Rivers, Parks, Schools');
});
