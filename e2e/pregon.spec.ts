import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#pregon');
});

test('announces a toast, pauses it while hovered and closes it with its button', async ({ page }) => {
    await page.clock.install();
    await page.getByRole('button', { name: 'Upload' }).click();
    const stack = page.getByRole('region', { name: 'Notifications' });
    await expect(stack.getByText('Layer uploaded')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Layer uploaded. roads.geojson, 1 204 features');
    await expect(page.getByRole('button', { name: 'Upload' })).toBeFocused();
    await stack.hover();
    await page.clock.runFor(8000);
    await expect(stack.getByText('Layer uploaded')).toBeVisible();
    await stack.getByRole('button', { name: 'Dismiss' }).click();
    await expect(page.getByTestId('toast-log')).toHaveText('Layer uploaded: close');
    await expect(stack.getByText('Layer uploaded')).toBeHidden();
});

test('puts errors in the alert region, keeps actions open and closes the newest with Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Fail' }).click();
    await expect(page.getByRole('alert')).toHaveText('Network error. The tiles could not load');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('toast-log')).toHaveText('Network error: escape');
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByTestId('toast-log')).toHaveText('Layer removed: action');
});
