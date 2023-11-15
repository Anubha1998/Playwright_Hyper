const { chromium } = require('playwright')
const {expect} = require("expect");
const cp = require('child_process');
const playwrightClientVersion = cp.execSync('npx playwright --version').toString().trim().split(' ')[1];

(async () => {
  const capabilities = {
    'browserName': 'MicrosoftEdge', // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
    'browserVersion': 'latest',
    'LT:Options': {
      'platform': process.env.HYPEREXECUTE_PLATFORM,
      'build': 'Playwright HyperExecute Build',
      'name': 'Playwright HyperExecute Test',
      'user': "anubhas",
      'accessKey': "JvGShZ2Bm8RdgmGFbbx4ZtbOb6DeQ8nqSvtHDZdDY7PzqaZMTq",
      'network': true,
      'video': true,
      'console': true,
      'tunnel': false, // Add tunnel configuration if testing locally hosted webpage
     // 'tunnelName': '', // Optional
      //'geoLocation': '', // country code can be fetched from https://www.lambdatest.com/capabilities-generator/
      'playwrightClientVersion': playwrightClientVersion
    }
  }

  const browser = await chromium.connect({
    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`
  })

  const page = await browser.newPage()

  await page.goto("https://duckduckgo.com");

  let element = await page.locator("[name=\"q\"]");
  await element.click();
  await element.type("LambdaTest");
  await element.press("Enter");
  const title = await page.title()

  try {
    expect(title).toEqual('LambdaTest at DuckDuckGo')
    // Mark the test as completed or failed
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: 'Title matched' } })}`)
    await teardown(page, browser)
  } catch (e) {
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'failed', remark: e.stack } })}`)
    await teardown(page, browser)
    throw e
  }

})()

async function teardown(page, browser) {
  await page.close();
  await browser.close();
}