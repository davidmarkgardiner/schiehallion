import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

async function testWebsite() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Listen for console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Listen for page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  // Listen for network errors
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
  });

  try {
    console.log('Navigating to https://schiehallion.vercel.app/...');
    await page.goto('https://schiehallion.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-homepage.png',
      fullPage: true
    });
    console.log('Screenshot saved to screenshot-homepage.png');

    // Get page content
    const bodyContent = await page.evaluate(() => {
      return {
        bodyHTML: document.body.innerHTML.substring(0, 5000),
        bodyText: document.body.innerText.substring(0, 1000),
        backgroundColor: window.getComputedStyle(document.body).backgroundColor,
        color: window.getComputedStyle(document.body).color,
        hasLoginForm: !!document.querySelector('form'),
        hasError: !!document.querySelector('[class*="error"]'),
        title: document.title,
        headLinks: Array.from(document.querySelectorAll('head link')).map(l => ({
          rel: l.rel,
          href: l.href
        }))
      };
    });

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      url: 'https://schiehallion.vercel.app/',
      pageContent: bodyContent,
      consoleMessages: consoleMessages.slice(0, 50), // Limit to first 50
      pageErrors,
      networkErrors: networkErrors.slice(0, 20), // Limit to first 20
      screenshots: ['screenshot-homepage.png']
    };

    writeFileSync(
      '/Users/davidgardiner/Desktop/repo/schiehallion/website-test-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n=== TEST RESULTS ===');
    console.log('Title:', bodyContent.title);
    console.log('Background Color:', bodyContent.backgroundColor);
    console.log('Text Color:', bodyContent.color);
    console.log('Has Login Form:', bodyContent.hasLoginForm);
    console.log('Has Error:', bodyContent.hasError);
    console.log('\nBody Text (first 500 chars):', bodyContent.bodyText.substring(0, 500));
    console.log('\nConsole Messages:', consoleMessages.length);
    console.log('Page Errors:', pageErrors.length);
    console.log('Network Errors:', networkErrors.length);

    if (consoleMessages.length > 0) {
      console.log('\n=== CONSOLE MESSAGES ===');
      consoleMessages.forEach(msg => {
        console.log(`[${msg.type}] ${msg.text}`);
      });
    }

    if (pageErrors.length > 0) {
      console.log('\n=== PAGE ERRORS ===');
      pageErrors.forEach(err => {
        console.log('Error:', err.message);
        if (err.stack) console.log('Stack:', err.stack);
      });
    }

    if (networkErrors.length > 0) {
      console.log('\n=== NETWORK ERRORS ===');
      networkErrors.forEach(err => {
        console.log('URL:', err.url);
        console.log('Failure:', err.failure);
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-error.png'
    });
  } finally {
    await browser.close();
  }
}

testWebsite().catch(console.error);
