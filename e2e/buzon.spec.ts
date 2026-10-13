import { expect, test } from './fixtures.js';

const file = (name: string, mimeType: string, size = 64) => ({ name, mimeType, buffer: Buffer.alloc(size, 1) });

test.beforeEach(async ({ page }) => {
    await page.goto('/#buzon');
});

test('accumulates images up to the limit and explains rejections', async ({ page }) => {
    const input = page.getByTestId('images-input');
    await input.setInputFiles([file('a.png', 'image/png'), file('notas.txt', 'text/plain')]);
    await expect(page.locator('.thumbs img')).toHaveCount(1);
    await expect(page.getByRole('alert')).toContainText('notas.txt: tipo no permitido');
    await input.setInputFiles([file('b.jpg', 'image/jpeg'), file('c.webp', 'image/webp'), file('d.png', 'image/png')]);
    await expect(page.locator('.thumbs img')).toHaveCount(3);
    await expect(page.getByRole('alert')).toContainText('d.png: excede el máximo de archivos');
    await expect(page.getByTestId('images')).toHaveAttribute('data-full', 'true');
    await page.getByRole('button', { name: 'Quitar a.png' }).click();
    await expect(page.locator('.thumbs img')).toHaveCount(2);
    await expect(page.locator('.thumbs img').first()).toHaveAttribute('src', /^blob:/);
});

test('shows drag state without flicker and drops', async ({ page }) => {
    const zone = page.getByTestId('images');
    const transfer = await page.evaluateHandle(() => {
        const data = new DataTransfer();
        data.items.add(new File(['%PDF'], 'informe.pdf', { type: 'application/pdf' }));
        return data;
    });
    await zone.dispatchEvent('dragenter', { dataTransfer: transfer });
    await zone.locator('strong').dispatchEvent('dragenter', { dataTransfer: transfer });
    await zone.dispatchEvent('dragleave', { dataTransfer: transfer });
    await expect(zone).toHaveAttribute('data-drag', 'reject');
    await zone.dispatchEvent('drop', { dataTransfer: transfer });
    await expect(zone).not.toHaveAttribute('data-dragging');
    await expect(page.getByRole('alert')).toContainText('informe.pdf: tipo no permitido');
});

test('replaces the single PDF and opens from the keyboard', async ({ page }) => {
    const input = page.getByTestId('pdf-input');
    await input.setInputFiles([file('uno.pdf', 'application/pdf')]);
    await input.setInputFiles([file('dos.pdf', 'application/pdf')]);
    await expect(page.getByTestId('pdf-file')).toHaveText(/dos\.pdf/);
    const chooser = page.waitForEvent('filechooser');
    await page.getByTestId('pdf').focus();
    await page.keyboard.press('Enter');
    await (await chooser).setFiles([file('tres.pdf', 'application/pdf')]);
    await expect(page.getByTestId('pdf-file')).toHaveText(/tres\.pdf/);
});

test('takes pasted images and ignores files dropped outside', async ({ page }) => {
    const prevented = await page.evaluate(() => {
        const data = new DataTransfer();
        data.items.add(new File(['x'], 'captura.png', { type: 'image/png' }));
        document.body.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
        const drop = new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true });
        document.body.dispatchEvent(drop);
        return drop.defaultPrevented;
    });
    expect(prevented).toBe(true);
    await expect(page.locator('.thumbs img')).toHaveCount(1);
    await expect(page.locator('.thumbs img')).toHaveAttribute('alt', 'captura.png');
});
