import { expect, test } from "playwright/test";

test("user uploads an avatar, opens a recommended play, rates the result, and returns to the lobby", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByLabel("Avatar upload")).toBeVisible();

  await page
    .getByLabel("Avatar upload")
    .setInputFiles("tests/fixtures/avatar.jpg");

  await expect(page.getByRole("heading", { name: /play lobby/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^recommended plays$/i }).first()).toBeVisible();

  await page.getByRole("button", { name: /start personality read/i }).first().click();

  await expect(page.getByRole("heading", { name: /play result/i })).toBeVisible();
  await expect(page.getByText(/rate this result/i)).toBeVisible();

  await page.getByRole("button", { name: "4.5 stars" }).click();
  await expect(page.getByText(/thanks for rating/i)).toBeVisible();

  await page.getByRole("link", { name: /back to play lobby/i }).click();
  await expect(page.getByRole("heading", { name: /play lobby/i })).toBeVisible();
});
