import { test, expect } from "@playwright/test";

test.describe("PackPally smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("browse trips page loads", async ({ page }) => {
    await page.goto("/browse-trips");
    await expect(
      page.getByRole("heading", { name: "Browse Adventures" })
    ).toBeVisible({ timeout: 30_000 });
  });
});
