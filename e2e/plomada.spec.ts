import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#plomada');
});

test('places the panel on the chosen side and follows the trigger on scroll', async ({ page }) => {
    await page.getByRole('button', { name: 'left', exact: true }).click();
    await page.getByTestId('main-trigger').click();
    const panel = page.getByTestId('main');
    await expect(panel).toHaveAttribute('data-side', 'left');
    const trigger = await page.getByTestId('main-trigger').boundingBox();
    const box = await panel.boundingBox();
    expect(Math.round((box?.x ?? 0) + (box?.width ?? 0))).toBe(Math.round((trigger?.x ?? 0) - 10));
    await page.mouse.wheel(0, 120);
    await expect.poll(async () => {
        const [moved, floating] = await Promise.all([page.getByTestId('main-trigger').boundingBox(), panel.boundingBox()]);
        return Math.round((floating?.y ?? 0) + (floating?.height ?? 0) / 2 - (moved?.y ?? 0) - (moved?.height ?? 0) / 2);
    }).toBe(0);
});

test('flips and shifts to stay inside the window', async ({ page }) => {
    await page.getByTestId('corner-trigger').click();
    const panel = page.getByTestId('corner');
    await expect(panel).toHaveAttribute('data-side', 'top');
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((viewport?.width ?? 0) - 8);
    const trigger = await page.getByTestId('corner-trigger').boundingBox();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(trigger?.y ?? 0);
});
