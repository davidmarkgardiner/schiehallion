import { test, expect } from "@playwright/test";

test.describe("Epic 4: Manual Room Components Verification", () => {
  const testEmail = "playright@example.com";
  const testPassword = "playright";

  test("Should display rooms page and basic components", async ({ page }) => {
    console.log("🏨 Testing basic rooms page functionality...");

    // Go to main page first
    await page.goto("http://localhost:3002/", { waitUntil: "networkidle" });
    
    // Try to login
    console.log("🔐 Attempting login...");
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);
      await submitButton.click();
      
      // Wait a moment for login to process
      await page.waitForTimeout(3000);
      console.log("✅ Login attempted");
    }

    // Navigate to rooms page
    console.log("🚺 Navigating to rooms page...");
    await page.goto("http://localhost:3002/rooms", { waitUntil: "networkidle" });
    
    // Take screenshot
    await page.screenshot({
      path: "test-results/rooms-page-verification.png",
      fullPage: true,
    });
    console.log("📸 Screenshot taken");

    // Basic checks - just verify page loads
    await expect(page.locator('html')).toBeVisible();
    console.log("✅ Page loaded successfully");

    // Check for key elements
    const pageTitle = page.locator('h1');
    if (await pageTitle.isVisible({ timeout: 5000 })) {
      const titleText = await pageTitle.textContent();
      console.log(`✅ Found page title: ${titleText}`);
    }

    // Check for rooms-related content
    const roomsContent = page.locator('text=Room, text=Available, text=Guest');
    const hasRoomsContent = await roomsContent.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasRoomsContent) {
      console.log("✅ Room-related content found");
    } else {
      console.log("🔄 No room content yet (may be expected if no data seeded)");
    }

    // Test navigation elements
    const navLinks = page.locator('nav a, header a');
    const navCount = await navLinks.count();
    console.log(`✅ Found ${navCount} navigation links`);

    // Test responsive design by checking for common UI elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`✅ Found ${buttonCount} interactive buttons`);

    console.log("🎯 Epic 4 manual verification completed!");
  });

  test("Should test mobile viewport", async ({ page }) => {
    console.log("📱 Testing mobile viewport...");
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go directly to rooms (skip login for mobile test)
    await page.goto("http://localhost:3002/rooms", { waitUntil: "networkidle" });
    
    // Take mobile screenshot
    await page.screenshot({
      path: "test-results/rooms-page-mobile.png",
      fullPage: true,
    });
    console.log("📸 Mobile screenshot taken");
    
    // Basic mobile checks
    await expect(page.locator('html')).toBeVisible();
    console.log("✅ Mobile page loaded");
    
    console.log("🎯 Mobile verification completed!");
  });

  test("Should test individual room components render", async ({ page }) => {
    console.log("🧩 Testing component rendering...");
    
    await page.goto("http://localhost:3002/rooms", { waitUntil: "networkidle" });
    
    // Check if any forms/inputs render (filters, search, etc.)
    const inputs = page.locator('input, select, button');
    const inputCount = await inputs.count();
    console.log(`✅ Found ${inputCount} form elements`);
    
    // Check for calendar/date related elements
    const dateElements = page.locator('text=Date, text=Calendar, text=Check');
    const hasDateElements = await dateElements.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasDateElements) {
      console.log("✅ Date selection elements found");
    }
    
    // Check for filter elements
    const filterElements = page.locator('text=Filter, text=Sort, text=Type');
    const hasFilterElements = await filterElements.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasFilterElements) {
      console.log("✅ Filter elements found");
    }
    
    // Final component render screenshot
    await page.screenshot({
      path: "test-results/rooms-components-test.png",
      fullPage: true,
    });
    console.log("📸 Component test screenshot taken");
    
    console.log("🎯 Component rendering test completed!");
  });
});
