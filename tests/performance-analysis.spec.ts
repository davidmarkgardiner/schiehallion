import { test, expect } from '@playwright/test';

// Test credentials from environment
const TEST_EMAIL = 'playright@example.com';
const TEST_PASSWORD = 'playright';

test.describe('Performance Analysis with Authentication', () => {
  test('Complete Performance Test - All Pages', async ({ page, context }) => {
    test.setTimeout(120000); // 2 minutes timeout

    const performanceResults: any = {
      pages: {},
      consoleErrors: [],
      jsErrors: [],
      networkRequests: [],
    };

    // Monitor console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        performanceResults.consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
        });
      }
    });

    // Monitor JavaScript errors
    page.on('pageerror', (error) => {
      performanceResults.jsErrors.push({
        message: error.message,
        stack: error.stack,
      });
    });

    // Monitor network requests
    page.on('response', (response) => {
      performanceResults.networkRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        contentType: response.headers()['content-type'],
      });
    });

    console.log('\n======================================');
    console.log('SCHIEHALLION HOTEL PERFORMANCE ANALYSIS');
    console.log('======================================\n');

    // 1. TEST HOMEPAGE (WITHOUT AUTH)
    console.log('1. TESTING HOMEPAGE (Login Page)');
    console.log('----------------------------------');

    try {
      const startTime = Date.now();
      const response = await page.goto('http://localhost:3000', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const loadTime = Date.now() - startTime;

      if (response) {
        console.log(`Status: ${response.status()}`);
        console.log(`Load Time: ${loadTime}ms`);

        // Take screenshot
        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/01-homepage-login.png',
          fullPage: true,
        });

        // Get performance metrics
        const perfMetrics = await page.evaluate(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintEntries = window.performance.getEntriesByType('paint');
          const resourceEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

          // Calculate resource breakdown
          const resourcesByType: Record<string, { count: number; size: number; duration: number }> = {};
          resourceEntries.forEach((resource) => {
            const type = resource.initiatorType || 'other';
            if (!resourcesByType[type]) {
              resourcesByType[type] = { count: 0, size: 0, duration: 0 };
            }
            resourcesByType[type].count++;
            resourcesByType[type].size += resource.transferSize || 0;
            resourcesByType[type].duration += resource.duration;
          });

          return {
            dns: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcp: perfData.connectEnd - perfData.connectStart,
            ttfb: perfData.responseStart - perfData.requestStart,
            download: perfData.responseEnd - perfData.responseStart,
            domInteractive: perfData.domInteractive,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            firstPaint: paintEntries.find((e) => e.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || 0,
            transferSize: perfData.transferSize,
            decodedBodySize: perfData.decodedBodySize,
            totalResources: resourceEntries.length,
            resourcesByType,
          };
        });

        performanceResults.pages.homepage = {
          loadTime,
          status: response.status(),
          metrics: perfMetrics,
        };

        console.log(`\nPerformance Metrics:`);
        console.log(`- DNS Lookup: ${perfMetrics.dns.toFixed(2)}ms`);
        console.log(`- TCP Connection: ${perfMetrics.tcp.toFixed(2)}ms`);
        console.log(`- Time to First Byte: ${perfMetrics.ttfb.toFixed(2)}ms`);
        console.log(`- Download Time: ${perfMetrics.download.toFixed(2)}ms`);
        console.log(`- DOM Interactive: ${perfMetrics.domInteractive.toFixed(2)}ms`);
        console.log(`- DOM Content Loaded: ${perfMetrics.domContentLoaded.toFixed(2)}ms`);
        console.log(`- First Paint: ${perfMetrics.firstPaint.toFixed(2)}ms`);
        console.log(`- First Contentful Paint: ${perfMetrics.firstContentfulPaint.toFixed(2)}ms`);
        console.log(`- Transfer Size: ${(perfMetrics.transferSize / 1024).toFixed(2)}KB`);
        console.log(`- Total Resources: ${perfMetrics.totalResources}`);

        console.log(`\nResources Breakdown:`);
        Object.entries(perfMetrics.resourcesByType).forEach(([type, stats]: [string, any]) => {
          console.log(
            `- ${type}: ${stats.count} files, ${(stats.size / 1024).toFixed(2)}KB, ${stats.duration.toFixed(2)}ms total`
          );
        });
      }
    } catch (error: any) {
      console.error(`Error loading homepage: ${error.message}`);
      performanceResults.pages.homepage = { error: error.message };
    }

    // 2. LOGIN
    console.log('\n\n2. PERFORMING LOGIN');
    console.log('----------------------------------');

    try {
      // Fill in login form
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);

      const loginStart = Date.now();

      // Click login and wait for navigation
      await Promise.all([
        page.waitForNavigation({ timeout: 15000, waitUntil: 'networkidle' }),
        page.click('button[type="submit"]')
      ]);

      const loginTime = Date.now() - loginStart;
      console.log(`Login completed in ${loginTime}ms`);

      // Wait a bit for any post-login actions
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/02-homepage-authenticated.png',
        fullPage: true,
      });

      console.log('Login successful, proceeding to test pages...');
    } catch (error: any) {
      console.error(`Login error: ${error.message}`);
      // Continue with tests even if login fails
    }

    // 3. TEST RESTAURANT PAGE
    console.log('\n\n3. TESTING RESTAURANT PAGE');
    console.log('----------------------------------');

    try {
      const startTime = Date.now();
      const response = await page.goto('http://localhost:3000/restaurant', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      if (response) {
        console.log(`Status: ${response.status()}`);
        console.log(`Load Time: ${loadTime}ms`);

        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/03-restaurant-page.png',
          fullPage: true,
        });

        const perfMetrics = await page.evaluate(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintEntries = window.performance.getEntriesByType('paint');

          return {
            ttfb: perfData.responseStart - perfData.requestStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: paintEntries.find((e) => e.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || 0,
            transferSize: perfData.transferSize,
          };
        });

        performanceResults.pages.restaurant = {
          loadTime,
          status: response.status(),
          metrics: perfMetrics,
        };

        console.log(`- TTFB: ${perfMetrics.ttfb.toFixed(2)}ms`);
        console.log(`- FCP: ${perfMetrics.firstContentfulPaint.toFixed(2)}ms`);
        console.log(`- Transfer Size: ${(perfMetrics.transferSize / 1024).toFixed(2)}KB`);
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      performanceResults.pages.restaurant = { error: error.message };
    }

    // 4. TEST ADMIN RESTAURANT PAGE
    console.log('\n\n4. TESTING ADMIN RESTAURANT PAGE');
    console.log('----------------------------------');

    try {
      const startTime = Date.now();
      const response = await page.goto('http://localhost:3000/admin/restaurant', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      if (response) {
        console.log(`Status: ${response.status()}`);
        console.log(`Load Time: ${loadTime}ms`);

        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/04-admin-restaurant.png',
          fullPage: true,
        });

        const perfMetrics = await page.evaluate(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            ttfb: perfData.responseStart - perfData.requestStart,
            transferSize: perfData.transferSize,
          };
        });

        performanceResults.pages.adminRestaurant = {
          loadTime,
          status: response.status(),
          metrics: perfMetrics,
        };

        console.log(`- TTFB: ${perfMetrics.ttfb.toFixed(2)}ms`);
        console.log(`- Transfer Size: ${(perfMetrics.transferSize / 1024).toFixed(2)}KB`);
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      performanceResults.pages.adminRestaurant = { error: error.message };
    }

    // 5. TEST ADMIN ROOM IMAGES PAGE
    console.log('\n\n5. TESTING ADMIN ROOM IMAGES PAGE');
    console.log('----------------------------------');

    try {
      const startTime = Date.now();
      const response = await page.goto('http://localhost:3000/admin/room-images', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      if (response) {
        console.log(`Status: ${response.status()}`);
        console.log(`Load Time: ${loadTime}ms`);

        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/05-admin-room-images.png',
          fullPage: true,
        });

        const perfMetrics = await page.evaluate(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            ttfb: perfData.responseStart - perfData.requestStart,
            transferSize: perfData.transferSize,
          };
        });

        performanceResults.pages.adminRoomImages = {
          loadTime,
          status: response.status(),
          metrics: perfMetrics,
        };

        console.log(`- TTFB: ${perfMetrics.ttfb.toFixed(2)}ms`);
        console.log(`- Transfer Size: ${(perfMetrics.transferSize / 1024).toFixed(2)}KB`);
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      performanceResults.pages.adminRoomImages = { error: error.message };
    }

    // 6. TEST ADMIN DASHBOARD PAGE
    console.log('\n\n6. TESTING ADMIN DASHBOARD PAGE');
    console.log('----------------------------------');

    try {
      const startTime = Date.now();
      const response = await page.goto('http://localhost:3000/admin/dashboard', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      if (response) {
        console.log(`Status: ${response.status()}`);
        console.log(`Load Time: ${loadTime}ms`);

        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/06-admin-dashboard.png',
          fullPage: true,
        });

        const perfMetrics = await page.evaluate(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            ttfb: perfData.responseStart - perfData.requestStart,
            transferSize: perfData.transferSize,
          };
        });

        performanceResults.pages.adminDashboard = {
          loadTime,
          status: response.status(),
          metrics: perfMetrics,
        };

        console.log(`- TTFB: ${perfMetrics.ttfb.toFixed(2)}ms`);
        console.log(`- Transfer Size: ${(perfMetrics.transferSize / 1024).toFixed(2)}KB`);
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      performanceResults.pages.adminDashboard = { error: error.message };
    }

    // 7. TEST ROOMS PAGE
    console.log('\n\n7. TESTING ROOMS PAGE');
    console.log('----------------------------------');

    try {
      const startTime = Date.now();
      const response = await page.goto('http://localhost:3000/rooms', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      if (response) {
        console.log(`Status: ${response.status()}`);
        console.log(`Load Time: ${loadTime}ms`);

        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/07-rooms-page.png',
          fullPage: true,
        });

        const perfMetrics = await page.evaluate(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            ttfb: perfData.responseStart - perfData.requestStart,
            transferSize: perfData.transferSize,
          };
        });

        performanceResults.pages.rooms = {
          loadTime,
          status: response.status(),
          metrics: perfMetrics,
        };

        console.log(`- TTFB: ${perfMetrics.ttfb.toFixed(2)}ms`);
        console.log(`- Transfer Size: ${(perfMetrics.transferSize / 1024).toFixed(2)}KB`);
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      performanceResults.pages.rooms = { error: error.message };
    }

    // FINAL SUMMARY
    console.log('\n\n======================================');
    console.log('PERFORMANCE SUMMARY');
    console.log('======================================\n');

    console.log('Console Errors:', performanceResults.consoleErrors.length);
    if (performanceResults.consoleErrors.length > 0) {
      console.log('\nConsole Errors:');
      performanceResults.consoleErrors.slice(0, 10).forEach((err: any, idx: number) => {
        console.log(`${idx + 1}. ${err.text}`);
      });
    }

    console.log('\nJavaScript Errors:', performanceResults.jsErrors.length);
    if (performanceResults.jsErrors.length > 0) {
      console.log('\nJavaScript Errors:');
      performanceResults.jsErrors.slice(0, 5).forEach((err: any, idx: number) => {
        console.log(`${idx + 1}. ${err.message}`);
      });
    }

    console.log('\n\nPage Load Times Summary:');
    Object.entries(performanceResults.pages).forEach(([page, data]: [string, any]) => {
      if (data.loadTime) {
        console.log(`- ${page}: ${data.loadTime}ms`);
      } else if (data.error) {
        console.log(`- ${page}: ERROR - ${data.error}`);
      }
    });

    // Save detailed results to file
    const fs = require('fs');
    fs.writeFileSync(
      '/Users/davidgardiner/Desktop/repo/schiehallion/performance-results.json',
      JSON.stringify(performanceResults, null, 2)
    );

    console.log('\n\nDetailed results saved to: performance-results.json');
    console.log('Screenshots saved to: screenshots/ directory\n');
  });
});
