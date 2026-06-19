const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 800 } });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('BROWSER UNCAUGHT EXCEPTION:', error.message);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
  } catch (e) {
    console.log('GOTO ERROR:', e.message);
  }

  // Wait for React to render
  await new Promise(r => setTimeout(r, 3000));
  
  await page.screenshot({ path: 'C:/Users/User/.gemini/antigravity-ide/brain/50af44ca-6b89-429a-97b1-87cb97aef7d2/blank_screen_fixed.png' });
  console.log('Screenshot saved!');
  
  await browser.close();
})();
