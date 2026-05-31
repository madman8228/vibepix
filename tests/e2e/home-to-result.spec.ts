import { expect, test } from "playwright/test";

test("user uploads an avatar, chooses a recommendation, and sees a generated result", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByLabel("Avatar upload")).toBeVisible();
  const uploadRequestPromise = page.waitForRequest((request) =>
    request.url().includes("/api/upload"),
  );

  await page
    .getByLabel("Avatar upload")
    .setInputFiles("tests/fixtures/avatar.jpg");

  const uploadRequest = await uploadRequestPromise;
  const uploadPayload = uploadRequest.postDataJSON() as {
    sourceUrl?: string;
  };

  expect(uploadPayload.sourceUrl).toMatch(/^data:image\/.+;base64,/);

  await expect(page.getByText(/recommended styles/i)).toBeVisible();

  const campusAnimeButton = page.getByRole("button", {
    name: /campus anime/i,
  });
  await campusAnimeButton.click();
  await expect(campusAnimeButton).toHaveAttribute("aria-pressed", "true");

  await page.reload();

  await expect(page.getByText(/recommended styles/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /campus anime/i }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /generate result/i }).click();

  await expect(
    page.getByRole("heading", { name: /mocked result pipeline/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /building your result/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /your mocked generation output/i })).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByRole("img", { name: /panel 1/i })).toBeVisible();
});
