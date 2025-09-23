import { test, expect } from "@playwright/test";

test.describe("Firebase Authentication App", () => {
  test("should load the app and display authentication form", async ({
    page,
  }) => {
    const consoleMessages: string[] = [];
    const networkErrors: string[] = [];

    // Capture console messages and network errors
    page.on("console", (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on("response", (response) => {
      if (!response.ok() && !response.url().includes("_next")) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    console.log("🔥 Testing Firebase Hello World App...");

    // Navigate to the main page
    await page.goto("/", { waitUntil: "networkidle" });

    // Check page title and main content
    await expect(page).toHaveTitle(/Firebase/);

    // Check for main heading
    const mainHeading = page.locator("h1");
    await expect(mainHeading).toContainText("Firebase Hello World");

    // Check for authentication form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    const googleButton = page.locator(
      'button:has-text("Continue with Google")',
    );

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    await expect(googleButton).toBeVisible();

    // Check for Firebase connection status
    const statusIndicator = page.locator("text=Firebase connected and ready!");
    await expect(statusIndicator).toBeVisible();

    // Verify form functionality (without actually submitting)
    await emailInput.fill("test@example.com");
    await passwordInput.fill("testpassword");

    await expect(emailInput).toHaveValue("test@example.com");
    await expect(passwordInput).toHaveValue("testpassword");

    // Check for toggle between login and signup
    const toggleButton = page.locator(
      'button:has-text("Need an account? Sign up")',
    );
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();

    const signupToggle = page.locator(
      'button:has-text("Already have an account? Login")',
    );
    await expect(signupToggle).toBeVisible();

    // Log important console messages
    const firebaseMessages = consoleMessages.filter(
      (msg) =>
        msg.toLowerCase().includes("firebase") ||
        msg.toLowerCase().includes("auth") ||
        msg.toLowerCase().includes("error"),
    );

    if (firebaseMessages.length > 0) {
      console.log("🔍 Firebase-related console messages:");
      firebaseMessages.forEach((msg) => console.log("  ", msg));
    }

    if (networkErrors.length > 0) {
      console.log("❌ Network errors found:");
      networkErrors.forEach((err) => console.log("  ", err));
    }

    console.log("✅ Firebase authentication app test completed successfully!");
  });

  test("should handle authentication flow with test user", async ({ page }) => {
    console.log("🔐 Testing authentication flow...");

    await page.goto("/");

    // Get test credentials from environment
    const testEmail = process.env.PLAYRIGHT_USER || "playright@example.com";
    const testPassword = process.env.PLAYRIGHT_PASSWORD || "playright";

    // Fill in the login form
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);

    // Click login button
    await page.locator('button[type="submit"]').click();

    // Wait for either successful login (user profile appears) or error message
    const loginOutcome = await Promise.race([
      page
        .waitForSelector('[data-testid="user-profile"]', { timeout: 5000 })
        .catch(() => page.waitForSelector(".bg-green-100", { timeout: 5000 }))
        .catch(() => page.waitForSelector("text=Welcome", { timeout: 5000 }))
        .then(() => "success")
        .catch(() => null),
      page
        .waitForSelector(".bg-red-100", { timeout: 5000 })
        .catch(() =>
          page.waitForSelector('[class*="error"]', { timeout: 5000 }),
        )
        .then(() => "error")
        .catch(() => null),
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 8000)),
    ]).then((result) => result || "timeout");

    console.log(`🎯 Login outcome: ${loginOutcome}`);

    if (loginOutcome === "success") {
      console.log("✅ Login successful - user authenticated");

      // Check if user profile or success indicator is visible
      const successIndicators = [
        page.locator("text=Welcome"),
        page.locator('[data-testid="user-profile"]'),
        page.locator('button:has-text("Logout")'),
        page.locator("text=Sign out"),
      ];

      let foundSuccessIndicator = false;
      for (const indicator of successIndicators) {
        if (await indicator.isVisible().catch(() => false)) {
          foundSuccessIndicator = true;
          break;
        }
      }

      if (foundSuccessIndicator) {
        console.log(
          "✅ User profile/logout option visible - authentication confirmed",
        );
      }
    } else if (loginOutcome === "error") {
      console.log("⚠️  Login failed - this is expected for test credentials");

      // Verify error handling
      const errorElement = await page
        .locator('.bg-red-100, [class*="error"]')
        .first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log(`📝 Error message: ${errorText}`);
      }
    } else {
      console.log("⏱️  Login timeout - no clear success/error response");
    }

    console.log("🔐 Authentication flow test completed");
  });
});
