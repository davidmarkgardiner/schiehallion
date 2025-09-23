import { test, expect } from "@playwright/test";

test("Firebase Hello World - Complete Verification", async ({ page }) => {
  console.log("🔥 Starting complete Firebase Hello World verification...");

  // Navigate to the app
  await page.goto("/", { waitUntil: "networkidle" });

  // Verify page title
  await expect(page).toHaveTitle("Firebase Hello World");
  console.log("✅ Page title verified: Firebase Hello World");

  // Wait for the main content to load and verify main heading
  const mainHeading = page.locator('h1:has-text("Firebase Hello World")');
  await expect(mainHeading).toBeVisible({ timeout: 10000 });
  console.log("✅ Main heading visible: Firebase Hello World");

  // Verify authentication form elements
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeVisible();
  console.log("✅ Authentication form elements visible");

  // Verify Google OAuth button
  const googleButton = page.locator('button:has-text("Continue with Google")');
  await expect(googleButton).toBeVisible();
  console.log("✅ Google OAuth button visible");

  // Verify feature sections
  const authSection = page.locator("text=Authentication");
  const databaseSection = page.locator("text=Database");
  const realtimeSection = page.locator("text=Real-time");
  const deploySection = page.locator("text=Deploy");

  await expect(authSection).toBeVisible();
  await expect(databaseSection).toBeVisible();
  await expect(realtimeSection).toBeVisible();
  await expect(deploySection).toBeVisible();
  console.log("✅ Feature sections visible");

  // Verify Firebase status indicator
  const statusIndicator = page.locator("text=Firebase connected and ready!");
  await expect(statusIndicator).toBeVisible();
  console.log("✅ Firebase status indicator visible");

  // Test form interaction
  await emailInput.fill("test@example.com");
  await passwordInput.fill("testpassword123");

  await expect(emailInput).toHaveValue("test@example.com");
  await expect(passwordInput).toHaveValue("testpassword123");
  console.log("✅ Form interaction working");

  // Test toggle between login and signup
  const toggleButton = page.locator(
    'button:has-text("Need an account? Sign up")',
  );
  await expect(toggleButton).toBeVisible();
  await toggleButton.click();

  const signupToggle = page.locator(
    'button:has-text("Already have an account? Login")',
  );
  await expect(signupToggle).toBeVisible();
  console.log("✅ Login/Signup toggle working");

  // Take a screenshot
  await page.screenshot({
    path: "firebase-hello-world-screenshot.png",
    fullPage: true,
  });
  console.log("📸 Screenshot saved: firebase-hello-world-screenshot.png");

  console.log(
    "🎉 Firebase Hello World verification complete! All features working correctly.",
  );
});
