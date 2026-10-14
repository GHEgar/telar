import { expect, test } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/#postigo');
});

test('opens from the keyboard, traps Tab and returns focus', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'New request' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'New request' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Reason' })).toBeFocused();
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await expect(page.locator('#root')).toHaveAttribute('inert', '');
    await dialog.getByRole('button', { name: 'Save' }).focus();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('textbox', { name: 'Reason' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Save' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('#root')).not.toHaveAttribute('inert');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.getByTestId('dialog-log')).toContainText('close: escape');
});

test('lets inner components keep their own Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'New request' }).click();
    const dialog = page.getByRole('dialog', { name: 'New request' });
    await dialog.getByRole('button', { name: 'Choose month' }).click();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('grid')).toBeVisible();
});

test('stacks an alert dialog that ignores outside clicks', async ({ page }) => {
    await page.getByRole('button', { name: 'New request' }).click();
    const form = page.getByRole('dialog', { name: 'New request' });
    await form.getByRole('button', { name: 'Discard' }).click();
    const alert = page.getByRole('alertdialog', { name: 'Discard the request?' });
    await expect(alert).toHaveAccessibleDescription(/What you entered will be lost/);
    await page.mouse.click(10, 10);
    await expect(alert).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(alert).toBeHidden();
    await expect(form).toBeVisible();
    await expect(form.getByRole('button', { name: 'Discard' })).toBeFocused();
    await page.mouse.click(10, 10);
    await expect(form).toBeHidden();
    await expect(page.getByTestId('dialog-log')).toContainText('close: outside');
});
