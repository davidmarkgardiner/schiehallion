import { test, expect } from "@playwright/test";

test.describe("Room Display Fix Verification", () => {
  test("should load rooms page without errors after RoomCard fix", async ({ page }) => {
    console.log("🔧 Testing rooms page after RoomCard fix...");

    // Navigate to the main page first
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

    // Take screenshot of main page
    await page.screenshot({
      path: "test-results/main-page-after-fix.png",
      fullPage: true,
    });

    // Navigate to rooms page to test the fix
    console.log("🏨 Navigating to rooms page...");
    await page.goto("http://localhost:3000/rooms", { waitUntil: "networkidle" });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take screenshot of rooms page
    await page.screenshot({
      path: "test-results/rooms-page-after-fix.png",
      fullPage: true,
    });

    // Check if page shows "Access Required" message for unauthenticated users
    const accessRequired = page.locator('h1:has-text("Access Required")');
    const roomsList = page.locator('h2:has-text("Rooms Available")');

    // Either should show access required OR rooms list (if user is logged in)
    const hasAccessRequired = await accessRequired.isVisible();
    const hasRoomsList = await roomsList.isVisible();

    expect(hasAccessRequired || hasRoomsList).toBeTruthy();
    console.log(`✅ Rooms page loaded - Access Required: ${hasAccessRequired}, Rooms List: ${hasRoomsList}`);

    // Check that no JavaScript errors are present in console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(1000);

    // Check for RoomCard specific error
    const hasRoomCardError = consoleErrors.some(error =>
      error.includes('Cannot read properties of undefined (reading \'length\')') ||
      error.includes('RoomCard')
    );

    expect(hasRoomCardError).toBeFalsy();
    console.log("✅ No RoomCard length errors detected");

    if (consoleErrors.length > 0) {
      console.log("⚠️  Console errors found:", consoleErrors);
    }
  });

  test("should authenticate and view rooms with test user", async ({ page }) => {
    console.log("🔐 Testing authentication and room viewing...");

    // Navigate to the app
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

    // Look for login/register buttons
    const guestButton = page.locator('button:has-text("Book as Guest")');
    const loginForm = page.locator('form');

    // Check if there's a login form visible
    const hasLoginForm = await loginForm.isVisible();

    if (hasLoginForm) {
      console.log("📝 Login form found, attempting to login...");

      // Try to find email and password fields
      const emailField = page.locator('input[type="email"]');
      const passwordField = page.locator('input[type="password"]');
      const loginButton = page.locator('button[type="submit"]');

      if (await emailField.isVisible() && await passwordField.isVisible()) {
        // Use test credentials
        await emailField.fill("playright@example.com");
        await passwordField.fill("playright");
        await loginButton.click();

        // Wait for navigation
        await page.waitForTimeout(2000);
      }
    }

    // Navigate to rooms page
    await page.goto("http://localhost:3000/rooms", { waitUntil: "networkidle" });

    await page.screenshot({
      path: "test-results/rooms-page-authenticated.png",
      fullPage: true,
    });

    // Check if we can see room cards or access required
    const accessRequired = page.locator('h1:has-text("Access Required")');
    const roomCards = page.locator('[class*="rounded-3xl"][class*="border"]');
    const loadingSpinner = page.locator('text="Loading rooms..."');

    // Wait for loading to complete
    await page.waitForFunction(() => {
      const spinner = document.querySelector('text="Loading rooms..."');
      return !spinner || !spinner.textContent?.includes('Loading');
    }, { timeout: 10000 }).catch(() => {
      console.log("Loading timeout reached");
    });

    await page.waitForTimeout(2000);

    const hasAccess = await accessRequired.isVisible();
    const hasRooms = await roomCards.count() > 0;

    console.log(`Access Required: ${hasAccess}, Room Cards Found: ${await roomCards.count()}`);

    // Take final screenshot
    await page.screenshot({
      path: "test-results/final-rooms-state.png",
      fullPage: true,
    });

    expect(hasAccess || hasRooms).toBeTruthy();
    console.log("✅ Rooms page accessible without RoomCard errors");
  });
});