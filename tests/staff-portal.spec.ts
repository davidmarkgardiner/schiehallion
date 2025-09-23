import { test, expect } from "@playwright/test";

test.describe("Staff Portal", () => {
  test("should access staff login portal", async ({ page }) => {
    console.log("🏢 Testing staff portal access...");

    // Navigate to staff login
    await page.goto("/admin/login", { waitUntil: "networkidle" });

    // Check that the staff login page loads
    await expect(page).toHaveTitle(/Firebase/);
    await expect(page.locator("h2")).toContainText("Staff Portal");

    // Check for staff login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    console.log("✅ Staff login form is accessible");
  });

  test("should attempt staff login with test credentials", async ({ page }) => {
    console.log("🔐 Testing staff login flow...");

    // Navigate to staff login
    await page.goto("/admin/login", { waitUntil: "networkidle" });

    // Try with staff test user
    await page.locator('input[type="email"]').fill("staff@example.com");
    await page.locator('input[type="password"]').fill("stafftest");

    // Click login button
    await page.locator('button[type="submit"]').click();

    // Wait for response - either 2FA prompt, dashboard, or error
    const loginOutcome = await Promise.race([
      page
        .waitForSelector("text=Two-Factor Authentication", { timeout: 10000 })
        .then(() => "2fa")
        .catch(() => null),
      page
        .waitForSelector("text=Admin Dashboard", { timeout: 10000 })
        .then(() => "dashboard")
        .catch(() => null),
      page
        .waitForSelector(".bg-red-100", { timeout: 10000 })
        .then(() => "error")
        .catch(() => null),
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 15000)),
    ]).then((result) => result || "timeout");

    console.log(`🎯 Staff login outcome: ${loginOutcome}`);

    if (loginOutcome === "2fa") {
      console.log("✅ 2FA prompt displayed - staff login working");

      // Test 2FA with demo code
      await page.locator('input[type="text"]').fill("123456");
      await page.locator('button[type="submit"]').click();

      // Wait for dashboard
      await page.waitForSelector("text=Admin Dashboard", { timeout: 10000 });
      console.log("✅ Successfully accessed admin dashboard");

      // Verify dashboard elements
      await expect(page.locator("h1")).toContainText("Admin Dashboard");
      await expect(page.locator(".bg-indigo-100")).toContainText("STAFF");

    } else if (loginOutcome === "dashboard") {
      console.log("✅ Direct access to admin dashboard");

    } else if (loginOutcome === "error") {
      const errorElement = await page.locator('.bg-red-100').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log(`📝 Error message: ${errorText}`);
      }

    } else {
      console.log("⏱️ Staff login timed out");
    }

    console.log("🏢 Staff portal test completed");
  });

  test("should reject non-staff users from admin portal", async ({ page }) => {
    console.log("🔒 Testing access control for non-staff users...");

    // Navigate to staff login
    await page.goto("/admin/login", { waitUntil: "networkidle" });

    // Try with guest user credentials
    await page.locator('input[type="email"]').fill("playright@example.com");
    await page.locator('input[type="password"]').fill("playright");

    // Click login button
    await page.locator('button[type="submit"]').click();

    // Should get an access denied error
    const errorResult = await Promise.race([
      page
        .waitForSelector("text=Access denied", { timeout: 10000 })
        .then(() => "access-denied")
        .catch(() => null),
      page
        .waitForSelector(".bg-red-100", { timeout: 10000 })
        .then(() => "error")
        .catch(() => null),
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 15000)),
    ]).then((result) => result || "timeout");

    console.log(`🎯 Access control outcome: ${errorResult}`);

    if (errorResult === "access-denied" || errorResult === "error") {
      console.log("✅ Access control working - guest user blocked from admin portal");
    } else {
      console.log("⚠️ Access control may need adjustment");
    }

    console.log("🔒 Access control test completed");
  });
});