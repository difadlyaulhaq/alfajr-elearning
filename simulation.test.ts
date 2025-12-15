
import { test, expect } from '@playwright/test';

test('User completes a lesson and progress is updated in the admin report', async ({ page }) => {
  // 1. Login as a user
  await page.goto('/login');
  await page.fill('input[type="email"]', 'user@test.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/learning/dashboard');

  // 2. Navigate to a course and complete a lesson
  await page.goto('/learning/catalog');
  // Assuming there is at least one course, click on the first one
  await page.locator('.course-card').first().click();
  await page.waitForURL(/\/learning\/course\/.*/);

  // Assuming there is at least one lesson, click on the first one
  await page.locator('.lesson-item').first().click();
  await page.waitForURL(/\/learning\/course\/.*\/lesson\/.*/);


  // Mark the lesson as complete
  await page.click('button:has-text("Mark as Complete")');

  // 3. Logout
  await page.goto('/api/auth/logout');
  await page.waitForURL('/login');

  // 4. Login as an admin
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@alfajr.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin/dashboard');

  // 5. Navigate to the admin report
  await page.goto('/admin/reports');

  // 6. Verify that the progress is updated in the report
  const reportRow = page.locator('tr:has-text("user@test.com")').first();
  await expect(reportRow).toContainText('in-progress');
});
