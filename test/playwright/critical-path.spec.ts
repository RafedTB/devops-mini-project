import { test, expect } from '@playwright/test';

test.describe("Tests de l'interface utilisateur (E2E Playwright)", () => {
  const testUser = {
    email: process.env.TEST_USER_EMAIL || 'user@nestlearn.com',
    password: process.env.TEST_USER_PASSWORD || 'user123',
  };

  test("Parcours critique : Connexion -> Catalogue -> Consultation -> Dépôt d'avis", async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*\/login/);

    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');
    const userTrigger = page.locator('.profile-nav-trigger');
    await expect(userTrigger).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.nav-user-name')).toBeVisible();

    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });

    const productTitle = await productCard.locator('h3').innerText();
    await productCard.locator('h3 a').click();

    await expect(page).toHaveURL(/\/products\/\d+/);
    await expect(page.locator('.product-detail h2')).toHaveText(productTitle);

    await page.reload();
    await expect(page.locator('.product-detail h2')).toHaveText(productTitle);

    const reviewComment = `Test automatisé Playwright - ${Date.now()}`;
    const reviewForm = page.locator('.reviews-section form');
    await expect(reviewForm).toBeVisible();

    await page.selectOption('.reviews-section form select', '5');
    await page.fill('.reviews-section form textarea', reviewComment);
    await page.click('.reviews-section form button[type="submit"]');

    const newReview = page.locator('.review-card', { hasText: reviewComment });
    await expect(newReview).toBeVisible({ timeout: 10000 });
    await expect(newReview.locator('.review-rating')).toContainText('★★★★★');
  });
});
