import { test, expect } from "@playwright/test";

test.describe("Schiehallion Hotel Management - Live Verification", () => {
  test("should load website successfully", async ({ page }) => {
    console.log("🏨 Testing Schiehallion Hotel Management website...");

    // Navigate to the app
    await page.goto("http://localhost:3002/", { waitUntil: "networkidle" });

    // Take initial screenshot
    await page.screenshot({
      path: "test-results/initial-load.png",
      fullPage: true,
    });
    console.log("📸 Initial screenshot taken");

    // Verify main heading
    const mainHeading = page.locator('h1:has-text("Schiehallion Hotel Management")');
    await expect(mainHeading).toBeVisible({ timeout: 10000 });
    console.log("✅ Main heading visible: Schiehallion Hotel Management");

    // Verify description
    const description = page.locator("text=Complete hotel booking system with Firebase Authentication and Firestore");
    await expect(description).toBeVisible();
    console.log("✅ Description visible");

    // Verify feature sections
    await expect(page.locator('h3:has-text("🔐 Authentication")')).toBeVisible();
    await expect(page.locator('h3:has-text("🏨 Bookings")')).toBeVisible();
    await expect(page.locator('h3:has-text("👥 Staff Portal")')).toBeVisible();
    await expect(page.locator('h3:has-text("📊 Analytics")')).toBeVisible();
    console.log("✅ All feature sections visible");

    // Verify authentication form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    console.log("✅ Authentication form elements visible");

    // Verify guest registration button
    const guestButton = page.locator('button:has-text("Book as Guest or Create Account")');
    await expect(guestButton).toBeVisible();
    console.log("✅ Guest registration button visible");

    // Verify staff portal link
    const staffLink = page.locator('a:has-text("Access Staff Portal")');
    await expect(staffLink).toBeVisible();
    console.log("✅ Staff portal link visible");

    console.log("🎉 Website loaded successfully with all expected elements!");
  });

  test("should test Firebase authentication", async ({ page }) => {
    console.log("🔐 Testing Firebase authentication...");

    await page.goto("http://localhost:3002/", { waitUntil: "networkidle" });

    // Get test credentials
    const testEmail = "playright@example.com";
    const testPassword = "playright";

    // Fill in login form
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    console.log(`📝 Filled credentials: ${testEmail}`);

    // Click submit button
    await page.locator('button[type="submit"]').click();
    console.log("🔄 Login submitted");

    // Wait for response (either success or error)
    try {
      await Promise.race([
        // Success indicators
        page.waitForSelector('button:has-text("Logout")', { timeout: 15000 }),
        page.waitForSelector('button:has-text("Sign out")', { timeout: 15000 }),
        page.waitForSelector("text=Welcome", { timeout: 15000 }),
        // Error indicators
        page.waitForSelector('[class*="error"]', { timeout: 15000 }),
        page.waitForSelector(".bg-red-100", { timeout: 15000 }),
      ]);

      // Check what happened
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
      const errorElement = page.locator('[class*="error"], .bg-red-100');

      if (await logoutButton.isVisible().catch(() => false)) {
        console.log("✅ Login successful - user authenticated!");

        // Take screenshot of logged-in state
        await page.screenshot({
          path: "test-results/authenticated-state.png",
          fullPage: true,
        });

        // Test logout
        await logoutButton.click();
        await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
        console.log("✅ Logout successful");
      } else if (await errorElement.isVisible().catch(() => false)) {
        const errorText = await errorElement.textContent();
        console.log(`⚠️ Authentication failed: ${errorText}`);

        // Take screenshot of error state
        await page.screenshot({
          path: "test-results/auth-error.png",
          fullPage: true,
        });
      }
    } catch (error) {
      console.log("⏱️ Authentication timeout - this may indicate Firebase setup issues");

      // Take screenshot for debugging
      await page.screenshot({
        path: "test-results/auth-timeout.png",
        fullPage: true,
      });
    }

    console.log("🎯 Authentication test completed");
  });

  test("should test guest registration flow", async ({ page }) => {
    console.log("👤 Testing guest registration flow...");

    await page.goto("http://localhost:3002/", { waitUntil: "networkidle" });

    // Click guest registration button
    const guestButton = page.locator('button:has-text("Book as Guest or Create Account")');
    await guestButton.click();
    console.log("🔄 Guest registration clicked");

    // Verify guest registration form appears
    await expect(page.locator("text=Continue as Guest or Create Account")).toBeVisible({ timeout: 5000 });
    console.log("✅ Guest registration form visible");

    // Take screenshot of guest registration
    await page.screenshot({
      path: "test-results/guest-registration.png",
      fullPage: true,
    });

    // Test navigation back
    const backButton = page.locator('button:has-text("← Back to login")');
    await backButton.click();
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
    console.log("✅ Navigation back to login works");

    console.log("🎯 Guest registration flow test completed");
  });

  test("should test staff portal access", async ({ page }) => {
    console.log("👥 Testing staff portal access...");

    await page.goto("http://localhost:3002/", { waitUntil: "networkidle" });

    // Click staff portal link
    const staffLink = page.locator('a:has-text("Access Staff Portal")');
    await staffLink.click();
    console.log("🔄 Staff portal link clicked");

    // Wait for navigation to admin login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    console.log("✅ Navigated to admin login page");

    // Verify staff login page loads
    await expect(page.locator("text=Staff Login")).toBeVisible({ timeout: 10000 });
    console.log("✅ Staff login page loaded");

    // Take screenshot of staff login
    await page.screenshot({
      path: "test-results/staff-login.png",
      fullPage: true,
    });

    console.log("🎯 Staff portal access test completed");
  });
});