import { chromium } from '@playwright/test';

async function testCSSLoading() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Track CSS loading
  const cssFiles = [];
  const failedResources = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('.css')) {
      cssFiles.push({
        url,
        status: response.status(),
        ok: response.ok()
      });
    }
    if (!response.ok() && response.status() !== 304) {
      failedResources.push({
        url,
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    console.log('Testing CSS loading on https://schiehallion.vercel.app/...');
    await page.goto('https://schiehallion.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Check computed styles
    const styleCheck = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main');

      const bodyStyles = window.getComputedStyle(body);
      const mainStyles = main ? window.getComputedStyle(main) : null;

      return {
        body: {
          backgroundColor: bodyStyles.backgroundColor,
          color: bodyStyles.color,
          minHeight: bodyStyles.minHeight,
          background: bodyStyles.background,
          fontFamily: bodyStyles.fontFamily
        },
        main: mainStyles ? {
          backgroundColor: mainStyles.backgroundColor,
          color: mainStyles.color,
          background: mainStyles.background,
          className: main.className
        } : null,
        cssLinksCount: document.querySelectorAll('link[rel="stylesheet"]').length,
        cssLinks: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => ({
          href: link.href,
          loaded: link.sheet !== null,
          disabled: link.disabled
        }))
      };
    });

    console.log('\n=== CSS LOADING RESULTS ===');
    console.log('CSS Files Loaded:', cssFiles.length);
    cssFiles.forEach(css => {
      console.log(`  ${css.ok ? '✓' : '✗'} ${css.url} (${css.status})`);
    });

    console.log('\nFailed Resources:', failedResources.length);
    failedResources.forEach(res => {
      console.log(`  ✗ ${res.url} (${res.status} ${res.statusText})`);
    });

    console.log('\n=== COMPUTED STYLES ===');
    console.log('Body Background:', styleCheck.body.backgroundColor);
    console.log('Body Color:', styleCheck.body.color);
    console.log('Body Min Height:', styleCheck.body.minHeight);
    console.log('Font Family:', styleCheck.body.fontFamily);

    console.log('\nMain Element:');
    if (styleCheck.main) {
      console.log('  Class:', styleCheck.main.className);
      console.log('  Background:', styleCheck.main.backgroundColor);
    } else {
      console.log('  No main element found');
    }

    console.log('\n=== CSS LINKS IN PAGE ===');
    console.log('Total CSS Links:', styleCheck.cssLinksCount);
    styleCheck.cssLinks.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.loaded ? '✓ Loaded' : '✗ Not Loaded'} ${link.disabled ? '(Disabled)' : ''}`);
      console.log(`     ${link.href}`);
    });

    // Test with different viewports
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-mobile.png',
      fullPage: false
    });
    console.log('\nMobile screenshot saved.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testCSSLoading().catch(console.error);
