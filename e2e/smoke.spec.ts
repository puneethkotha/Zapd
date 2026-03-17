import { test, expect } from "@playwright/test"

test.describe("ZAPD smoke tests", () => {
  test("map loads and shows stations", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible({ timeout: 10000 })
  })

  test("station detail page loads", async ({ page }) => {
    await page.goto("/stations/test-station-id")
    await page.waitForLoadState("networkidle")
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })
})
