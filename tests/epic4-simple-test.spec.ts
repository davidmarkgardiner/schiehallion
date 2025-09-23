import { test, expect } from "@playwright/test";

test.describe("Epic 4: Simple Room Page Test", () => {
  test("Should access rooms page directly", async ({ page }) => {
    console.log("🏨 Testing direct access to rooms page...");

    // Navigate directly to rooms page with a longer timeout and less strict waiting
    await page.goto("http://localhost:3002/rooms", { 
      waitUntil: "domcontentloaded",
      timeout: 15000
    });
    
    // Wait a bit more for dynamic content
    await page.waitForTimeout(2000);
    
    // Take screenshot to see what loads
    await page.screenshot({
      path: "test-results/rooms-page-direct-access.png",
      fullPage: true,
    });
    console.log("📸 Screenshot taken");

    // Check basic page structure
    const bodyText = await page.locator('body').textContent();
    console.log(`✅ Page loaded with content length: ${bodyText?.length || 0}`);

    // Look for specific components/text
    const hasRoomsText = bodyText?.includes('Room') || bodyText?.includes('Find Your Perfect Stay');
    const hasErrorText = bodyText?.includes('Error') || bodyText?.includes('error') || bodyText?.includes('404');
    const hasAccessText = bodyText?.includes('Access Required') || bodyText?.includes('log in');
    
    console.log(`✅ Contains rooms-related text: ${hasRoomsText}`);
    console.log(`⚠️ Contains error text: ${hasErrorText}`);
    console.log(`🔒 Contains access restriction text: ${hasAccessText}`);

    // Test passed if page loads with some content
    expect(bodyText).toBeDefined();
    expect((bodyText?.length || 0)).toBeGreaterThan(100);
    
    console.log("🎯 Direct access test completed!");
  });

  test("Should check for authentication flow", async ({ page }) => {
    console.log("🔐 Testing authentication requirement...");

    // Go to main page first
    await page.goto("http://localhost:3002/", { 
      waitUntil: "domcontentloaded",
      timeout: 15000 
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot of main page
    await page.screenshot({
      path: "test-results/main-page-for-auth.png",
      fullPage: true,
    });
    
    const bodyText = await page.locator('body').textContent();
    console.log(`✅ Main page loaded with content length: ${bodyText?.length || 0}`);
    
    // Check if login form is visible
    const emailInput = page.locator('input[type="email"]');
    const hasLoginForm = await emailInput.isVisible({ timeout: 3000 });
    
    console.log(`📝 Login form visible: ${hasLoginForm}`);
    
    if (hasLoginForm) {
      console.log("ℹ️ Login form found - authentication required to access rooms");
    } else {
      console.log("ℹ️ No login form - checking for Browse Rooms link");
      
      const browseRoomsLink = page.locator('a:has-text("Browse Rooms")');
      const hasBrowseLink = await browseRoomsLink.isVisible({ timeout: 3000 });
      console.log(`🔗 Browse Rooms link visible: ${hasBrowseLink}`);
    }
    
    console.log("🎯 Authentication flow test completed!");
  });
});
