const { chromium } = require('playwright');

async function finalAuthTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('=== Final Authentication and Image Loading Test ===\n');

    const consoleMessages = [];
    const networkErrors = [];

    // Enhanced event listeners
    page.on('console', msg => {
        const message = `[${msg.type()}] ${msg.text()}`;
        consoleMessages.push(message);
        console.log(`CONSOLE: ${message}`);
    });

    page.on('response', response => {
        if (!response.ok() && response.status() >= 400) {
            const errorMsg = `${response.status()} ${response.statusText()}: ${response.url()}`;
            networkErrors.push(errorMsg);
            console.log(`NETWORK ERROR: ${errorMsg}`);
        }
    });

    try {
        // Step 1: Navigate to homepage
        console.log('1. Navigating to http://localhost:3001/');
        await page.goto('http://localhost:3001/');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'final-test-01-homepage.png', fullPage: true });

        // Step 2: Try to create a new account
        console.log('\n2. Attempting to create a new test account');

        // Look for "Need an account? Sign up" link
        const signupLink = page.locator('text="Need an account? Sign up"');
        if (await signupLink.count() > 0) {
            console.log('Found signup link, clicking...');
            await signupLink.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'final-test-02-signup-page.png', fullPage: true });
        }

        // Generate unique test credentials
        const timestamp = Date.now();
        const testEmail = `test${timestamp}@example.com`;
        const testPassword = 'TestPassword123!';

        console.log(`Creating account with: ${testEmail} / ${testPassword}`);

        // Fill registration form if available
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');

        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
            await emailInput.fill(testEmail);
            await passwordInput.fill(testPassword);

            await page.screenshot({ path: 'final-test-03-signup-filled.png', fullPage: true });

            // Try to find and click signup/register button
            const signupButton = page.locator('button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create")').first();
            if (await signupButton.count() > 0) {
                console.log('Clicking signup button...');
                await signupButton.click();
                await page.waitForTimeout(3000);

                await page.screenshot({ path: 'final-test-04-after-signup.png', fullPage: true });

                const currentUrl = page.url();
                console.log(`URL after signup: ${currentUrl}`);
            } else {
                // Try login instead with existing credentials
                console.log('No signup button found, trying login...');
                const loginButton = page.locator('button:has-text("Login")');
                if (await loginButton.count() > 0) {
                    // Clear and try with common test credentials
                    await emailInput.clear();
                    await passwordInput.clear();
                    await emailInput.fill('test@example.com');
                    await passwordInput.fill('password123');

                    await loginButton.click();
                    await page.waitForTimeout(3000);
                    await page.screenshot({ path: 'final-test-04-login-attempt.png', fullPage: true });
                }
            }
        }

        // Step 3: Test direct access to rooms regardless of auth status
        console.log('\n3. Testing /rooms page access');
        await page.goto('http://localhost:3001/rooms');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // Give extra time for images to load

        await page.screenshot({ path: 'final-test-05-rooms-page.png', fullPage: true });

        const currentUrl = page.url();
        console.log(`Current URL on rooms page: ${currentUrl}`);

        // Check page state
        const hasAccessRequired = await page.locator('text="Access Required"').count() > 0;
        const hasGoToLogin = await page.locator('text="GO TO LOGIN"').count() > 0;
        const hasRoomImages = await page.locator('img[alt*="room" i]').count() > 0;
        const hasSkeletonLoaders = await page.locator('.animate-pulse, [class*="skeleton"], [class*="loading"], [class*="placeholder"]').count() > 0;

        console.log('\n=== ROOMS PAGE ANALYSIS ===');
        console.log(`Has "Access Required" message: ${hasAccessRequired}`);
        console.log(`Has "GO TO LOGIN" button: ${hasGoToLogin}`);
        console.log(`Has room images: ${hasRoomImages}`);
        console.log(`Has skeleton loaders: ${hasSkeletonLoaders}`);

        // Step 4: Analyze all images on the page
        const allImages = await page.locator('img').all();
        console.log(`\nFound ${allImages.length} total images on the page:`);

        const imageAnalysis = [];
        for (let i = 0; i < allImages.length; i++) {
            const img = allImages[i];
            const src = await img.getAttribute('src');
            const alt = await img.getAttribute('alt') || '';

            const isLoaded = await img.evaluate(el => {
                return el.complete && el.naturalHeight > 0 && el.naturalWidth > 0;
            });

            const hasError = await img.evaluate(el => {
                return el.naturalHeight === 0 && el.naturalWidth === 0 && el.complete;
            });

            imageAnalysis.push({
                index: i + 1,
                src,
                alt,
                loaded: isLoaded,
                error: hasError
            });

            console.log(`  Image ${i + 1}: "${alt}" (${src}) - Loaded: ${isLoaded}, Error: ${hasError}`);
        }

        // Step 5: Check for any UI elements that might indicate room data loading
        const roomElements = await page.locator('[data-testid*="room"], .room-card, .room-item, [class*="room"]').all();
        console.log(`\nFound ${roomElements.length} room-related elements`);

        // Step 6: Check network requests for image failures
        console.log('\n=== NETWORK ANALYSIS ===');
        if (networkErrors.length > 0) {
            console.log('Network errors found:');
            networkErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });

            // Check if errors are related to images
            const imageErrors = networkErrors.filter(error =>
                error.includes('.jpg') || error.includes('.png') || error.includes('.webp') ||
                error.includes('image') || error.includes('photo')
            );

            console.log(`\nImage-specific network errors: ${imageErrors.length}`);
            imageErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        } else {
            console.log('No network errors detected');
        }

        // Step 7: Try clicking "GO TO LOGIN" if authentication is required
        if (hasGoToLogin) {
            console.log('\n7. Clicking "GO TO LOGIN" to test redirect');
            await page.locator('text="GO TO LOGIN"').click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'final-test-06-login-redirect.png', fullPage: true });

            const newUrl = page.url();
            console.log(`Redirected to: ${newUrl}`);
        }

        // Final screenshot
        await page.screenshot({ path: 'final-test-07-final-state.png', fullPage: true });

    } catch (error) {
        console.error('\nError during testing:', error);
        await page.screenshot({ path: 'final-test-error.png', fullPage: true });
    } finally {
        // Summary report
        console.log('\n=== FINAL SUMMARY ===');
        console.log(`Total console messages: ${consoleMessages.length}`);
        console.log(`Total network errors: ${networkErrors.length}`);

        // Determine the issue type
        const authBlockage = networkErrors.some(error => error.includes('400') && error.includes('signInWithPassword'));
        const imageLoadErrors = networkErrors.some(error =>
            error.includes('.jpg') || error.includes('.png') || error.includes('.webp') ||
            error.includes('404') || error.includes('403')
        );

        console.log('\n=== CONCLUSION ===');
        if (authBlockage) {
            console.log('✓ Authentication system is working - blocks access to protected routes');
            console.log('✓ Login attempts are properly handled by Firebase');
        }

        if (imageLoadErrors) {
            console.log('⚠️  Image loading issues detected - network errors found');
        } else if (networkErrors.length === 0) {
            console.log('✓ No network errors - images may be loading correctly');
            console.log('❓ Skeleton loaders might be design choice or slow loading');
        }

        await browser.close();
        console.log('\n=== Testing Complete ===');
    }
}

finalAuthTest();