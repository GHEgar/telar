import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#nonio');
});

test('moves a slider from the keyboard with its value text', async ({ page }) => {
    const hour = page.getByRole('slider', { name: 'Hour' });
    await hour.focus();
    await page.keyboard.press('ArrowRight');
    await expect(hour).toHaveAttribute('aria-valuetext', '14:30');
    await page.keyboard.press('PageUp');
    await expect(page.getByTestId('hour-value')).toHaveText('17:30');
    await page.keyboard.press('End');
    await expect(hour).toHaveAttribute('aria-valuenow', '23.5');
});

test('drags a thumb along the track and the window between two thumbs', async ({ page }) => {
    const opacity = page.getByRole('slider', { name: 'Opacity' });
    const track = await opacity.locator('..').boundingBox();
    if (!track) throw new Error('no track');
    await page.mouse.move(track.x + track.width * 0.25, track.y + track.height / 2);
    await page.mouse.down();
    await page.mouse.move(track.x + track.width * 0.5, track.y + track.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect(page.getByTestId('opacity-value')).toHaveText('50 %');
    await expect(opacity).toBeFocused();

    const start = page.getByRole('slider', { name: 'Start year' });
    const end = page.getByRole('slider', { name: 'End year' });
    const from = await start.boundingBox();
    const to = await end.boundingBox();
    if (!from || !to) throw new Error('no thumbs');
    const middle = (from.x + to.x + to.width) / 2;
    await page.mouse.move(middle, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(middle + 300, from.y + from.height / 2, { steps: 6 });
    await page.mouse.up();
    const [low, high] = (await page.getByTestId('window-value').textContent() ?? '').split('–').map(Number);
    expect((high ?? 0) - (low ?? 0)).toBe(5);
    expect(low).toBeGreaterThan(2010);
});
