const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  console.log('=== BOOKING PAGE TEST START ===\n');

  // Collect console messages
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(text);
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('Page Error:', error.message);
  });

  try {
    // Step 1: Navigate to booking page
    console.log('\n--- Step 1: Navigate to booking page ---');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000); // Wait for dynamic content
    await page.screenshot({ path: path.join(screenshotsDir, '01-booking-page-initial.png'), fullPage: true });
    console.log('✓ Page loaded successfully');

    // Step 2: Check page title and main elements
    console.log('\n--- Step 2: Verify page structure ---');
    const title = await page.title();
    console.log('Page title:', title);

    const url = page.url();
    console.log('Current URL:', url);

    // Check for form elements
    const formExists = await page.$('form');
    console.log('Form exists:', !!formExists);

    // Get page heading
    const h1 = await page.$('h1');
    if (h1) {
      const h1Text = await h1.textContent();
      console.log('Main heading:', h1Text);
    }

    // Step 3: Identify and test input fields
    console.log('\n--- Step 3: Test form inputs ---');

    // Try to find common booking form fields
    const nameInput = await page.$('input[name="name"], input[id*="name" i], input[placeholder*="name" i]');
    const emailInput = await page.$('input[type="email"], input[name="email"], input[id*="email" i]');
    const phoneInput = await page.$('input[type="tel"], input[name="phone"], input[id*="phone" i]');
    const dateInput = await page.$('input[type="date"], input[name="date"], input[id*="date" i]');
    const timeInput = await page.$('input[type="time"], input[name="time"], input[id*="time" i]');
    const guestsInput = await page.$('input[type="number"], input[name="guests"], input[id*="guests" i], input[id*="people" i]');

    console.log('Name field found:', !!nameInput);
    console.log('Email field found:', !!emailInput);
    console.log('Phone field found:', !!phoneInput);
    console.log('Date field found:', !!dateInput);
    console.log('Time field found:', !!timeInput);
    console.log('Guests field found:', !!guestsInput);

    // Get all input fields for debugging
    const allInputs = await page.$$('input, select, textarea');
    console.log(`\nTotal input fields found: ${allInputs.length}`);

    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const tagName = await input.evaluate(el => el.tagName);
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`  Input ${i + 1}: <${tagName}> type="${type}", name="${name}", id="${id}", placeholder="${placeholder}"`);
    }

    // Step 4: Fill out the form
    console.log('\n--- Step 4: Fill out booking form ---');

    if (nameInput) {
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.click();
      await nameInput.fill('Test User');
      console.log('✓ Name filled: Test User');
      await page.waitForTimeout(500);
    }

    if (emailInput) {
      await emailInput.scrollIntoViewIfNeeded();
      await emailInput.click();
      await emailInput.fill('test@example.com');
      console.log('✓ Email filled: test@example.com');
      await page.waitForTimeout(500);
    }

    if (phoneInput) {
      await phoneInput.scrollIntoViewIfNeeded();
      await phoneInput.click();
      await phoneInput.fill('1234567890');
      console.log('✓ Phone filled: 1234567890');
      await page.waitForTimeout(500);
    }

    if (dateInput) {
      await dateInput.scrollIntoViewIfNeeded();
      await dateInput.click();
      await dateInput.fill('2025-10-15');
      console.log('✓ Date filled: 2025-10-15');
      await page.waitForTimeout(500);
    }

    if (timeInput) {
      await timeInput.scrollIntoViewIfNeeded();
      await timeInput.click();
      await timeInput.fill('19:00');
      console.log('✓ Time filled: 19:00');
      await page.waitForTimeout(500);
    }

    if (guestsInput) {
      await guestsInput.scrollIntoViewIfNeeded();
      await guestsInput.click();
      await guestsInput.fill('4');
      console.log('✓ Guests filled: 4');
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '02-form-filled.png'), fullPage: true });

    // Step 5: Look for submit button
    console.log('\n--- Step 5: Locate submit button ---');
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Book"), button:has-text("Submit"), button:has-text("Reserve"), button:has-text("Confirm")');
    console.log('Submit button found:', !!submitButton);

    if (submitButton) {
      const buttonText = await submitButton.textContent();
      console.log('Submit button text:', buttonText.trim());
    }

    // Get all buttons for debugging
    const allButtons = await page.$$('button');
    console.log(`\nTotal buttons found: ${allButtons.length}`);

    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const disabled = await button.getAttribute('disabled');
      console.log(`  Button ${i + 1}: text="${text.trim()}", type="${type}", disabled="${disabled}"`);
    }

    // Step 6: Test form submission
    console.log('\n--- Step 6: Test form submission ---');

    if (submitButton) {
      const isDisabled = await submitButton.isDisabled();
      console.log('Submit button disabled:', isDisabled);

      if (!isDisabled) {
        await submitButton.scrollIntoViewIfNeeded();
        console.log('Clicking submit button...');

        // Click and wait for response
        await submitButton.click();
        await page.waitForTimeout(4000); // Wait for submission processing

        await page.screenshot({ path: path.join(screenshotsDir, '03-after-submit.png'), fullPage: true });

        const currentUrl = page.url();
        console.log('URL after submit:', currentUrl);

        // Check for success/error messages
        const pageContent = await page.textContent('body');
        const hasSuccess = pageContent.toLowerCase().includes('success') ||
                          pageContent.toLowerCase().includes('confirmed') ||
                          pageContent.toLowerCase().includes('thank you') ||
                          pageContent.toLowerCase().includes('booking received');
        const hasError = pageContent.toLowerCase().includes('error') ||
                        pageContent.toLowerCase().includes('failed') ||
                        pageContent.toLowerCase().includes('invalid');

        console.log('Success message detected:', hasSuccess);
        console.log('Error message detected:', hasError);

        // Look for any modal or alert
        const modal = await page.$('[role="dialog"], .modal, [class*="modal"]');
        console.log('Modal/Dialog present:', !!modal);
        if (modal) {
          const modalText = await modal.textContent();
          console.log('Modal content:', modalText.substring(0, 200));
        }
      } else {
        console.log('⚠ Submit button is disabled - checking why');

        // Check form validity
        const formValidationMessages = await page.$$eval('input:invalid', inputs =>
          inputs.map(input => ({
            name: input.name,
            validationMessage: input.validationMessage
          }))
        );

        if (formValidationMessages.length > 0) {
          console.log('Form validation issues:');
          formValidationMessages.forEach(msg => {
            console.log(`  - ${msg.name}: ${msg.validationMessage}`);
          });
        }
      }
    } else {
      console.log('⚠ Cannot test submission - no submit button found');
    }

    // Step 7: Test edge cases - empty form
    console.log('\n--- Step 7: Test edge cases (empty form) ---');

    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const emptySubmitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Book"), button:has-text("Submit")');
    if (emptySubmitButton) {
      const isDisabled = await emptySubmitButton.isDisabled();
      console.log('Submit button disabled on empty form:', isDisabled);

      if (!isDisabled) {
        await emptySubmitButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotsDir, '04-empty-form-submit.png'), fullPage: true });
        console.log('✓ Tested empty form submission');

        // Check for validation messages
        const validationMessages = await page.$$eval('input', inputs =>
          inputs.filter(input => input.validationMessage).map(input => ({
            name: input.name || input.id,
            message: input.validationMessage
          }))
        );

        if (validationMessages.length > 0) {
          console.log('Validation messages shown:');
          validationMessages.forEach(msg => {
            console.log(`  - ${msg.name}: ${msg.message}`);
          });
        }
      }
    }

    // Step 8: Test responsive design
    console.log('\n--- Step 8: Test responsive design ---');

    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '05-mobile-view.png'), fullPage: true });
    console.log('✓ Mobile view (375x667) captured');

    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '06-tablet-view.png'), fullPage: true });
    console.log('✓ Tablet view (768x1024) captured');

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Console messages captured: ${consoleMessages.length}`);
    console.log(`JavaScript errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nJavaScript Errors:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    // Filter console messages for warnings and errors
    const warnings = consoleMessages.filter(msg => msg.includes('[warning]'));
    const consoleErrors = consoleMessages.filter(msg => msg.includes('[error]'));

    console.log(`\nConsole warnings: ${warnings.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);

    if (warnings.length > 0) {
      console.log('\nWarnings (first 10):');
      warnings.slice(0, 10).forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
    }

    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors:');
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    console.log('\n✓ Test completed successfully');
    console.log(`Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('\n✗ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
    try {
      await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png'), fullPage: true });
    } catch (screenshotError) {
      console.error('Could not capture error screenshot:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== BOOKING PAGE TEST END ===');
})();