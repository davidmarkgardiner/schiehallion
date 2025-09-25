const { chromium } = require('playwright');

async function testAuthFlow() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('=== Starting Authentication and Room Testing ===\n');

    try {
        // Step 1: Navigate to homepage
        console.log('1. Navigating to http://localhost:3001/');
        await page.goto('http://localhost:3001/');
        await page.waitForLoadState('networkidle');

        // Take screenshot of homepage
        await page.screenshot({ path: 'auth-test-01-homepage.png', fullPage: true });
        console.log('✓ Screenshot saved: auth-test-01-homepage.png');

        // Check browser console for any errors
        page.on('console', msg => {
            console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
        });

        page.on('pageerror', error => {
            console.log(`PAGE ERROR: ${error.message}`);
        });

        // Step 2: Try to navigate directly to /rooms first
        console.log('\n2. Attempting to navigate to /rooms page directly');
        await page.goto('http://localhost:3001/rooms');
        await page.waitForLoadState('networkidle');

        // Take screenshot of rooms page attempt
        await page.screenshot({ path: 'auth-test-02-rooms-direct.png', fullPage: true });
        console.log('✓ Screenshot saved: auth-test-02-rooms-direct.png');

        // Check if we're redirected to login or if we can see rooms
        const currentUrl = page.url();
        console.log(`Current URL after /rooms navigation: ${currentUrl}`);

        // Look for login elements or room elements
        const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
        const hasRoomElements = await page.locator('[data-testid="room"], .room-card, img[alt*="room" i], img[alt*="Room" i]').count() > 0;

        console.log(`Has login form: ${hasLoginForm}`);
        console.log(`Has room elements: ${hasRoomElements}`);

        // Step 3: Try to find and fill login form if present
        if (hasLoginForm) {
            console.log('\n3. Login form detected, attempting to login');

            // Try common test credentials
            const testCredentials = [
                { email: 'test@test.com', password: 'password' },
                { email: 'admin@test.com', password: 'admin123' },
                { email: 'user@example.com', password: 'password123' },
                { email: 'admin@example.com', password: 'admin' }
            ];

            for (let i = 0; i < testCredentials.length; i++) {
                const creds = testCredentials[i];
                console.log(`Trying credentials: ${creds.email} / ${creds.password}`);

                // Fill email
                const emailInput = page.locator('input[type="email"]').first();
                if (await emailInput.count() > 0) {
                    await emailInput.clear();
                    await emailInput.fill(creds.email);
                }

                // Fill password
                const passwordInput = page.locator('input[type="password"]').first();
                if (await passwordInput.count() > 0) {
                    await passwordInput.clear();
                    await passwordInput.fill(creds.password);
                }

                // Take screenshot of filled form
                await page.screenshot({ path: `auth-test-03-login-attempt-${i+1}.png`, fullPage: true });
                console.log(`✓ Screenshot saved: auth-test-03-login-attempt-${i+1}.png`);

                // Try to submit
                const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
                if (await submitButton.count() > 0) {
                    await submitButton.click();
                    await page.waitForTimeout(2000); // Wait for potential redirect

                    // Check if we're still on login page or if we got redirected
                    const newUrl = page.url();
                    console.log(`URL after login attempt: ${newUrl}`);

                    // Take screenshot after login attempt
                    await page.screenshot({ path: `auth-test-04-after-login-${i+1}.png`, fullPage: true });
                    console.log(`✓ Screenshot saved: auth-test-04-after-login-${i+1}.png`);

                    // If we're no longer on login page, break out of the loop
                    if (!newUrl.includes('login') && !hasLoginForm) {
                        console.log('✓ Login appears successful, proceeding to rooms test');
                        break;
                    }
                }

                // If this wasn't the last attempt, navigate back to try again
                if (i < testCredentials.length - 1) {
                    await page.goto('http://localhost:3001/rooms');
                    await page.waitForLoadState('networkidle');
                }
            }
        }

        // Step 4: Navigate to rooms page (again) and check images
        console.log('\n4. Checking rooms page for image loading');
        await page.goto('http://localhost:3001/rooms');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Give images time to load

        // Take final screenshot of rooms page
        await page.screenshot({ path: 'auth-test-05-final-rooms.png', fullPage: true });
        console.log('✓ Screenshot saved: auth-test-05-final-rooms.png');

        // Analyze images vs skeleton loaders
        const images = await page.locator('img').all();
        const skeletonLoaders = await page.locator('[class*="skeleton"], [class*="loading"], [class*="placeholder"]').all();

        console.log(`Found ${images.length} image elements`);
        console.log(`Found ${skeletonLoaders.length} skeleton/loading elements`);

        // Check each image for loading status
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const src = await img.getAttribute('src');
            const alt = await img.getAttribute('alt');
            const naturalWidth = await img.evaluate(el => el.naturalWidth);
            const naturalHeight = await img.evaluate(el => el.naturalHeight);

            console.log(`Image ${i+1}: src="${src}", alt="${alt}", loaded=${naturalWidth > 0 && naturalHeight > 0}`);
        }

        // Check network tab for failed requests
        console.log('\n5. Checking for network errors...');

        // Listen for response events to catch failed requests
        const failedRequests = [];
        page.on('response', response => {
            if (!response.ok()) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });

        // Reload to catch any failed requests
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log(`Found ${failedRequests.length} failed requests:`);
        failedRequests.forEach(req => {
            console.log(`  - ${req.status} ${req.statusText}: ${req.url}`);
        });

        // Final screenshot
        await page.screenshot({ path: 'auth-test-06-final-analysis.png', fullPage: true });
        console.log('✓ Screenshot saved: auth-test-06-final-analysis.png');

    } catch (error) {
        console.error('Error during testing:', error);
        await page.screenshot({ path: 'auth-test-error.png', fullPage: true });
    } finally {
        await browser.close();
        console.log('\n=== Testing Complete ===');
    }
}

testAuthFlow();