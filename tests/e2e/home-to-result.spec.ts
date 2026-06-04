import { expect, test } from "playwright/test";

test("user uploads an avatar, stays on the home workbench, sees an inline result, rates it, and keeps the selector visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByLabel("Avatar upload")).toBeVisible();

  await page
    .getByLabel("Avatar upload")
    .setInputFiles("tests/fixtures/avatar.jpg");

  await expect(page.getByRole("button", { name: "跳过裁剪" })).toBeVisible();
  await page.getByRole("button", { name: "跳过裁剪" }).click();

  await expect(page.getByRole("tab", { name: /解读/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /今天适合先玩哪个/i })).toBeVisible();

  await page.getByRole("button", { name: /开始性格解读/i }).click();

  await expect(page.getByText(/整体气质不张扬，但有自己的温度/i)).toBeVisible();
  await expect(page.getByText(/这次结果你喜欢吗/i)).toBeVisible();

  await page.getByRole("button", { name: "4.5 stars" }).click();
  await expect(page.getByText(/谢谢反馈/i)).toBeVisible();

  await expect(page.getByRole("tab", { name: /心情/i })).toBeVisible();
});
