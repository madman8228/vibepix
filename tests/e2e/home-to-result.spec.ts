import { expect, test } from "playwright/test";

test("user uploads an avatar and sees AI recommendations", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Avatar upload")).toBeVisible();

  await page
    .getByLabel("Avatar upload")
    .setInputFiles("tests/fixtures/avatar.jpg");

  await expect(page.getByText(/recommended styles/i)).toBeVisible();
});
