import { test, expect } from "@playwright/test";

test.describe("Authentication and Rooms Test", () => {
  test("should login and access rooms without RoomCard errors", async ({ page }) => {
    // Collect console logs and errors
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });

    console.log("🔐 Starting authentication and rooms test...");

    // First, navigate to the home page
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.screenshot({
      path: "test-results/auth-home-page.png",
      fullPage: true,
    });

    // Look for email and password fields
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    // Check if login form is visible
    const hasLoginForm = await emailField.isVisible();
    console.log("Login form visible:", hasLoginForm);

    if (hasLoginForm) {
      console.log("📝 Filling login form...");

      // Use test credentials
      await emailField.fill("playright@example.com");
      await passwordField.fill("playright");

      await page.screenshot({
        path: "test-results/auth-form-filled.png",
        fullPage: true,
      });

      // Submit the form
      await loginButton.click();

      // Wait for potential navigation/state change
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: "test-results/auth-after-login.png",
        fullPage: true,
      });
    }

    console.log("🏨 Navigating to rooms page...");

    // Navigate to rooms page
    await page.goto("/rooms", {
      waitUntil: "domcontentloaded",
      timeout: 15000
    });

    // Wait for content to load
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: "test-results/auth-rooms-page.png",
      fullPage: true,
    });

    // Check for the specific RoomCard error
    const hasRoomCardError = errors.some(error =>
      error.includes('Cannot read properties of undefined (reading \'length\')')
    );

    console.log("Console messages:", consoleMessages);
    console.log("Errors:", errors);
    console.log("RoomCard length error found:", hasRoomCardError);

    // Main assertion: no RoomCard errors
    expect(hasRoomCardError).toBe(false);

    // Check if page shows either access required or room content
    const bodyText = await page.textContent('body');
    const hasAccessRequired = bodyText?.includes('Access Required') || false;
    const hasRoomContent = bodyText?.includes('room') || bodyText?.includes('Room') || false;
    const hasErrorPage = bodyText?.includes('404') || bodyText?.includes('This page could not be found') || false;

    console.log("Has Access Required:", hasAccessRequired);
    console.log("Has Room Content:", hasRoomContent);
    console.log("Has 404 Error:", hasErrorPage);

    // The page should not be a 404 and should have some meaningful content
    expect(hasErrorPage).toBe(false);
    expect(hasAccessRequired || hasRoomContent).toBe(true);

    console.log("✅ Test completed successfully - no RoomCard errors detected");
  });
});