import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures.js';

const day = (scope: Locator, iso: string): Locator => scope.locator(`[data-iso="${iso}"]:not([data-outside])`);

const open = async (page: Page): Promise<[Locator, Locator]> => {
    await page.clock.setFixedTime(new Date('2026-10-13T12:00:00'));
    await page.goto('/#almanaque');
    const sections = page.locator('section');
    return [sections.nth(0), sections.nth(1)];
};

test('selects a single date with mouse and keyboard', async ({ page }) => {
    const [single] = await open(page);
    await expect(single.getByRole('grid')).toHaveAttribute('aria-label', 'October 2026');
    await expect(day(single, '2026-10-13')).toHaveAttribute('aria-current', 'date');
    await day(single, '2026-10-20').click();
    await expect(page.getByTestId('single-value')).toHaveText('2026-10-20');
    await page.keyboard.press('ArrowRight');
    await expect(day(single, '2026-10-21')).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect(single.getByRole('grid')).toHaveAttribute('aria-label', 'November 2026');
    await expect(day(single, '2026-11-21')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('single-value')).toHaveText('2026-11-21');
});

test('jumps through the months and years views', async ({ page }) => {
    const [single] = await open(page);
    await single.getByRole('button', { name: 'Choose month' }).click();
    await single.getByRole('button', { name: 'Dec' }).click();
    await expect(single.getByRole('grid')).toHaveAttribute('aria-label', 'December 2026');
    await single.getByRole('button', { name: 'Choose year' }).click();
    await expect(single.locator('[data-year]')).toHaveText(['2025', '2026', '2027']);
    await single.getByRole('button', { name: '2025' }).click();
    await expect(single.getByRole('grid')).toHaveAttribute('aria-label', 'December 2025');
    await single.getByRole('button', { name: 'Choose month' }).click();
    await expect(single.getByRole('button', { name: 'Sep' })).toBeDisabled();
    await single.getByRole('button', { name: 'Oct' }).click();
    await expect(day(single, '2025-10-12')).toHaveAttribute('aria-disabled', 'true');
    await expect(day(single, '2025-10-13')).not.toHaveAttribute('aria-disabled');
});

test('picks a range with limits across two months', async ({ page }) => {
    const [, range] = await open(page);
    await expect(range.getByRole('grid')).toHaveCount(2);
    await expect(day(range, '2026-10-17')).toHaveAttribute('aria-disabled', 'true');
    await day(range, '2026-10-14').click();
    await expect(day(range, '2026-10-28')).toHaveAttribute('aria-disabled', 'true');
    await day(range, '2026-10-22').hover();
    await expect(day(range, '2026-10-19')).toHaveAttribute('data-preview', 'true');
    await day(range, '2026-10-22').click();
    await expect(page.getByTestId('range-value')).toHaveText('2026-10-14 → 2026-10-22');
    await expect(day(range, '2026-10-19')).toHaveAttribute('data-in-range', 'true');
});

test('drives the months and years views with the keyboard', async ({ page }) => {
    const [single] = await open(page);
    await single.getByRole('button', { name: 'Choose month' }).focus();
    await page.keyboard.press('Enter');
    await expect(single.getByRole('button', { name: 'Oct' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(single.getByRole('button', { name: 'Jan' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(single.getByRole('grid')).toHaveAttribute('aria-label', 'January 2027');
    await expect(day(single, '2027-01-11')).toBeFocused();
    await single.getByRole('button', { name: 'Choose year' }).click();
    await expect(single.getByRole('button', { name: '2027' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Escape');
    await expect(single.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
});

test('keeps a range from crossing disabled days when asked', async ({ page }) => {
    const [, range] = await open(page);
    await range.getByLabel('Without crossing disabled days').check();
    await day(range, '2026-10-14').click();
    await expect(day(range, '2026-10-16')).not.toHaveAttribute('aria-disabled');
    await expect(day(range, '2026-10-19')).toHaveAttribute('aria-disabled', 'true');
    await expect(day(range, '2026-10-12')).not.toHaveAttribute('aria-disabled');
    await day(range, '2026-10-16').click();
    await expect(page.getByTestId('range-value')).toHaveText('2026-10-14 → 2026-10-16');
});
