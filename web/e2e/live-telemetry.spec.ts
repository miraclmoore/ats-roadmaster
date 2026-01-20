import { test, expect } from '@playwright/test';

/**
 * Live Telemetry Page E2E Tests - Unauthenticated Flow
 *
 * These are smoke tests that verify the page doesn't crash when accessed
 * without authentication. The expected behavior is redirect to login.
 *
 * TODO: Add authentication setup for authenticated tests in future phase
 */

test.describe('Live Telemetry Page - Unauthenticated', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    // Navigate to the live telemetry page
    await page.goto('/live');

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Should redirect to login page (expected behavior for protected routes)
    // Check URL contains 'login' or 'auth' or shows login form
    const currentUrl = page.url();
    const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordForm = await page.locator('input[type="password"]').count() > 0;

    // Assert: Either URL contains login/auth OR page shows login form
    const isRedirectedToLogin =
      currentUrl.includes('login') ||
      currentUrl.includes('auth') ||
      (hasLoginForm && hasPasswordForm);

    expect(isRedirectedToLogin).toBeTruthy();
  });

  test('page loads without errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    // Navigate to the live telemetry page
    await page.goto('/live');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');

    // Give React time to render and hydrate
    await page.waitForTimeout(1000);

    // Verify no critical JavaScript errors occurred
    // Note: Some errors might be expected (e.g., auth errors), filter those out
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('auth') &&
      !error.includes('unauthorized') &&
      !error.includes('403') &&
      !error.includes('401')
    );

    // Assert: No critical errors (auth errors are OK, those are expected)
    expect(criticalErrors.length).toBe(0);
  });

  test('live page has expected layout structure (if accessible)', async ({ page }) => {
    await page.goto('/live');

    // Wait for page load
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();

    // If redirected to login, skip layout checks (expected behavior)
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // If not redirected (mock auth in future), verify basic layout exists
    // Check for page header
    const hasHeader = await page.locator('h1, h2, header').count() > 0;
    expect(hasHeader).toBeTruthy();

    // Check for navigation elements (sidebar or menu)
    const hasNav = await page.locator('nav, [role="navigation"]').count() > 0;
    expect(hasNav).toBeTruthy();

    // Verify page renders some content (not completely blank)
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(10);
  });
});
