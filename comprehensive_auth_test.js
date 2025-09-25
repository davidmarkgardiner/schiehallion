const { chromium } = require('playwright');

async function comprehensiveAuthTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('=== Comprehensive Authentication and Rooms Testing ===\n');

    const consoleMessages = [];
    const pageErrors = [];
    const networkErrors = [];

    // Set up event listeners
    page.on('console', msg => {
        const message = `[${msg.type()}] ${msg.text()}`;
        consoleMessages.push(message);
        console.log(`CONSOLE: ${message}`);
    });

    page.on('pageerror', error => {
        const errorMsg = `PAGE ERROR: ${error.message}`;
        pageErrors.push(errorMsg);
        console.log(errorMsg);
    });

    page.on('response', response => {
        if (!response.ok() && response.status() >= 400) {
            const errorMsg = `${response.status()} ${response.statusText()}: ${response.url()}`;
            networkErrors.push(errorMsg);
            console.log(`NETWORK ERROR: ${errorMsg}`);
        }
    });

    try {
        // Step 1: Navigate to homepage and analyze login form
        console.log('1. Navigating to http://localhost:3001/');
        await page.goto('http://localhost:3001/');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'comp-test-01-homepage.png', fullPage: true });

        // Step 2: Try the "Staff Portal" link
        console.log('\n2. Checking Staff Portal link');
        const staffPortalLink = page.locator('text="Staff Portal"');
        if (await staffPortalLink.count() > 0) {
            await staffPortalLink.click();
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: 'comp-test-02-staff-portal.png', fullPage: true });
            console.log(`Current URL after Staff Portal: ${page.url()}`);
        }

        // Step 3: Go back to main login and try actual authentication
        console.log('\n3. Testing authentication with Firebase');
        await page.goto('http://localhost:3001/');
        await page.waitForLoadState('networkidle');

        // Try some realistic test credentials that might work with Firebase
        const testCredentials = [
            { email: 'test@schiehallion.com', password: 'test123456' },
            { email: 'demo@example.com', password: 'demo123456' },
            { email: 'user@test.com', password: 'password123' },
            { email: 'admin@schiehallion.com', password: 'admin123456' }
        ];

        for (let i = 0; i < testCredentials.length; i++) {
            const creds = testCredentials[i];
            console.log(`\nTrying credentials ${i + 1}: ${creds.email}`);

            // Clear and fill email
            await page.locator('input[type="email"]').fill(creds.email);
            await page.locator('input[type="password"]').fill(creds.password);

            await page.screenshot({ path: `comp-test-03-login-filled-${i + 1}.png`, fullPage: true });

            // Click login button
            await page.locator('button:has-text("Login")').click();

            // Wait a bit for potential authentication
            await page.waitForTimeout(3000);

            const currentUrl = page.url();
            console.log(`URL after login attempt: ${currentUrl}`);

            await page.screenshot({ path: `comp-test-04-after-login-${i + 1}.png`, fullPage: true });

            // Check if we're authenticated by trying to access rooms
            await page.goto('http://localhost:3001/rooms');
            await page.waitForLoadState('networkidle');

            const hasAccessRequired = await page.locator('text="Access Required"').count() > 0;

            if (!hasAccessRequired) {
                console.log('✓ Authentication successful! Now on rooms page');
                await page.screenshot({ path: `comp-test-05-authenticated-rooms-${i + 1}.png`, fullPage: true });
                break;
            } else {
                console.log('✗ Authentication failed, still seeing Access Required');
                // Go back to try next credentials
                await page.goto('http://localhost:3001/');
                await page.waitForLoadState('networkidle');
            }
        }

        // Step 4: Try Google Sign-In button if regular auth failed
        console.log('\n4. Testing Google Sign-In button');
        await page.goto('http://localhost:3001/');
        await page.waitForLoadState('networkidle');

        const googleButton = page.locator('text="Continue with Google"');
        if (await googleButton.count() > 0) {
            console.log('Found Google Sign-In button, clicking...');
            await googleButton.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'comp-test-06-google-signin.png', fullPage: true });
            console.log(`URL after Google button click: ${page.url()}`);
        }

        // Step 5: Final rooms page analysis
        console.log('\n5. Final analysis of rooms page');
        await page.goto('http://localhost:3001/rooms');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // Wait for any async operations

        await page.screenshot({ path: 'comp-test-07-final-rooms.png', fullPage: true });

        // Check current state
        const hasAccessRequired = await page.locator('text="Access Required"').count() > 0;
        const hasRoomElements = await page.locator('img[alt*="room"], .room-card, [data-testid*="room"]').count() > 0;
        const hasSkeletonLoaders = await page.locator('.animate-pulse, [class*="skeleton"], [class*="loading"]').count() > 0;

        console.log(`\n=== FINAL STATUS ===`);
        console.log(`Access Required shown: ${hasAccessRequired}`);
        console.log(`Room elements found: ${hasRoomElements}`);
        console.log(`Skeleton loaders found: ${hasSkeletonLoaders}`);

        // Analyze all images if we can see the rooms page
        if (!hasAccessRequired) {
            const images = await page.locator('img').all();
            console.log(`\nFound ${images.length} images:`);

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const src = await img.getAttribute('src');
                const alt = await img.getAttribute('alt') || '';

                // Check if image is loaded
                const isLoaded = await img.evaluate(el => {
                    return el.complete && el.naturalHeight > 0;
                });

                console.log(`  Image ${i + 1}: ${alt} (${src}) - Loaded: ${isLoaded}`);
            }
        }

        // Step 6: Check for any Firebase errors or auth state
        console.log('\n6. Checking browser storage and auth state');

        // Check localStorage for auth tokens
        const localStorage = await page.evaluate(() => {
            const items = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                items[key] = localStorage.getItem(key);
            }
            return items;
        });

        console.log('\nLocalStorage contents:');
        Object.entries(localStorage).forEach(([key, value]) => {
            if (key.includes('firebase') || key.includes('auth')) {
                console.log(`  ${key}: ${value?.substring(0, 100)}...`);
            }
        });

    } catch (error) {
        console.error('\nError during testing:', error);
        await page.screenshot({ path: 'comp-test-error.png', fullPage: true });
    } finally {
        // Summary
        console.log('\n=== TESTING SUMMARY ===');
        console.log(`Console messages: ${consoleMessages.length}`);
        console.log(`Page errors: ${pageErrors.length}`);
        console.log(`Network errors: ${networkErrors.length}`);

        if (pageErrors.length > 0) {
            console.log('\nPage Errors:');
            pageErrors.forEach(error => console.log(`  - ${error}`));
        }

        if (networkErrors.length > 0) {
            console.log('\nNetwork Errors:');
            networkErrors.forEach(error => console.log(`  - ${error}`));
        }

        await browser.close();
        console.log('\n=== Testing Complete ===');
    }
}

comprehensiveAuthTest();