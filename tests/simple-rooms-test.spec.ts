import { test, expect } from "@playwright/test";

test.describe("Simple Rooms Test", () => {
  test("should load rooms page without crashes", async ({ page }) => {
    // Collect console logs
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

    console.log("🏨 Testing rooms page load...");

    // Navigate directly to rooms page
    await page.goto("http://localhost:3000/rooms", {
      waitUntil: "domcontentloaded",
      timeout: 15000
    });

    // Wait for some content to appear
    await page.waitForTimeout(3000);

    // Take screenshot regardless of what we see
    await page.screenshot({
      path: "test-results/simple-rooms-test.png",
      fullPage: true,
    });

    // Log what we found
    console.log("Console messages:", consoleMessages);
    console.log("Errors:", errors);

    // Check for the specific RoomCard error
    const hasRoomCardError = errors.some(error =>
      error.includes('Cannot read properties of undefined (reading \'length\')')
    );

    console.log("RoomCard length error found:", hasRoomCardError);

    // The test passes if we don't have the specific RoomCard error
    expect(hasRoomCardError).toBe(false);

    // Check if page has some content (either error message or rooms)
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.trim().length > 0;

    console.log("Page has content:", hasContent);
    console.log("Page text preview:", bodyText?.substring(0, 200));

    expect(hasContent).toBe(true);
  });
});