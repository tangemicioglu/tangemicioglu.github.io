/* Run against an isolated safe Jekyll preview: GARDEN_URL=http://127.0.0.1:8779 node tests/garden-browser.cjs */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.GARDEN_URL || 'http://127.0.0.1:8779';

(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const visit = async path => { await page.goto(base + path, {waitUntil: 'domcontentloaded'}); };
    await visit('/projects/');
    assert.equal(await page.locator('[data-garden-item]').count(), 24);
    await page.getByRole('button', {name: 'Gallery view', exact: true}).click();
    assert.equal(await page.locator('.garden-archive.is-gallery').count(), 1);
    await visit('/publications/');
    assert.equal(await page.locator('.garden-archive.is-gallery').count(), 1, 'Gallery preference carries to Publications');
    assert.equal(await page.locator('[data-garden-item]').count(), 17);
    const expectedCredits = [
      ['Master classes', 'Stephanie L Cernera*, Tan Gemicioglu* et al.'],
      ['BreathePulse', 'Tan Gemicioglu*, Thalia Viranda*, Yiran Zhao* et al.'],
      ['EchoForce', 'Kian Mahmoodi*, Yudong Xie*, Tan Gemicioglu* et al.'],
      ['Workshop on Augmenting Human Dexterity', 'Shan-Yuan Teng et al.']
    ];
    for (const [title, credits] of expectedCredits) {
      const card = page.locator('[data-garden-item]').filter({has: page.locator('.archive__item-title', {hasText: title})});
      assert.equal((await card.locator('.garden-publication-authors-short').innerText()).trim(), credits);
    }
    const longPublication = page.locator('[data-garden-item]').filter({hasText: 'Stephanie L Cernera'});
    const authors = (await longPublication.locator('.garden-publication-authors').textContent()).trim();
    const abstract = (await longPublication.locator('.garden-publication-abstract p').textContent()).trim();
    assert.ok((await longPublication.locator('.garden-publication-authors-short').innerText()).length < 80, 'Long author lists stay compact in gallery cards');
    assert.equal(await longPublication.locator('.garden-publication-authors').isVisible(), false);
    assert.equal(await longPublication.locator('.garden-publication-abstract').isVisible(), false);
    const readPublication = longPublication.locator('[data-read-publication]');
    await readPublication.click();
    const dialog = page.getByRole('dialog');
    assert.ok((await dialog.boundingBox()).width >= 700, 'Abstract opens in a wide reading dialog');
    assert.equal((await dialog.locator('.garden-dialog-authors').textContent()).trim(), authors, 'Full author list is preserved');
    assert.equal((await dialog.locator('.garden-dialog-content > p').nth(1).textContent()).trim(), abstract, 'Abstract is preserved verbatim');
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(), false);
    assert.ok(await readPublication.evaluate(link => document.activeElement === link), 'Closing returns keyboard focus');
    await page.setViewportSize({width: 375, height: 850});
    await readPublication.click();
    assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth && el.getBoundingClientRect().width <= innerWidth - 10), 'Mobile dialog fits without horizontal scrolling');
    await dialog.getByRole('button', {name: 'Close'}).click();
    await page.locator('html.publication-dialog-open').waitFor({state: 'detached'});
    assert.equal(await page.locator('html.publication-dialog-open').count(), 0, 'Closing restores page scrolling');
    await page.setViewportSize({width: 1440, height: 1000});
    await page.getByRole('button', {name: 'List view', exact: true}).click();
    assert.equal(await longPublication.locator('.garden-publication-authors').isVisible(), true, 'List view keeps full authors');
    assert.equal(await longPublication.locator('.garden-publication-abstract').isVisible(), true, 'List view keeps inline abstracts');
    await visit('/projects/?label=therapeutics&category=research');
    const filtered = await page.locator('[data-garden-item]:visible').evaluateAll(nodes => nodes.map(n => [n.dataset.category, n.dataset.areas]));
    assert.ok(filtered.length >= 4);
    assert.ok(filtered.every(([category, labels]) => category === 'research' && labels.split(',').includes('therapeutics')));
    assert.equal(await page.locator('.garden-archive.is-gallery').count(), 0);
    assert.ok((await page.locator('.garden-label-description').innerText()).includes('physiology') || (await page.locator('.garden-label-description').innerText()).includes('body'));
    await visit('/projects/?label=sensing');
    assert.ok(await page.locator('.garden-also:visible a[href*="health-tracking-privacy"]').count());
    await visit('/projects/brainbraille/');
    assert.ok(await page.getByRole('heading', {name: 'Everything in this project', exact: true}).count());
    assert.ok(await page.locator('.garden-hub a[href*="Transitional-Gestures"]').count());
    assert.equal(await page.locator('.garden-series-nav').count(), 1);

    const data = await (await context.request.get(base + '/garden.json')).json();
    assert.equal(data.items.length, 42);
    assert.equal(data.items.filter(item => item.collection === 'posts').length, 1);
    for (const item of data.items) {
      const response = await context.request.get(base + item.url);
      assert.equal(response.status(), 200, item.url);
    }
    for (const width of [1440, 375]) {
      await page.setViewportSize({width, height: 900});
      for (const path of ['/projects/', '/publications/', '/timeline/', '/map/']) {
        await visit(path);
        if (path === '/timeline/') {
          await page.locator('#garden-timeline svg').waitFor();
          assert.equal(await page.locator('#garden-timeline svg a').count(), data.items.length + new Set(data.items.map(item => item.track)).size, 'All items and primary label links');
          assert.ok(!(await page.locator('#garden-timeline').textContent()).includes('EARLIER WORK'));
        }
        assert.equal(await page.locator('.garden-earlier, [data-l="__earlier"]').count(), 0, 'Labels have no earlier split');
        if (path === '/timeline/' || path === '/map/') {
          assert.equal(await page.getByText('Browse all items by label', {exact: true}).count(), 0);
        }
        if (path === '/map/') {
          await page.waitForFunction(() => !!window.gardenMap);
          assert.equal(await page.locator('.sm-chips button').count(), data.tracks.length, 'Every map label is available directly');
          const geometry = await page.evaluate(() => {
            const map = document.querySelector('.smap').getBoundingClientRect();
            const nav = document.querySelector('.masthead').getBoundingClientRect();
            return {left: map.left, right: map.right, top: map.top, bottom: map.bottom, navBottom: nav.bottom, width: innerWidth, height: innerHeight, scrollHeight: document.documentElement.scrollHeight};
          });
          assert.ok(Math.abs(geometry.left) < 1 && Math.abs(geometry.right - geometry.width) < 1, 'Map spans the full viewport width');
          assert.ok(Math.abs(geometry.top - geometry.navBottom) < 1 && Math.abs(geometry.bottom - geometry.height) < 1, 'Map fills remaining height below navigation');
          assert.ok(geometry.scrollHeight <= geometry.height + 1, 'No page scroll around the map');
          assert.equal(await page.locator('.page__footer').count(), 0);
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} overflows at ${width}px`);
        if (process.env.GARDEN_SHOTS) await page.screenshot({path: `${process.env.GARDEN_SHOTS}/${path.replaceAll('/', '')}-${width}.png`, animations: 'disabled', fullPage: path !== '/projects/' && path !== '/publications/'});
        if (path === '/projects/' || path === '/publications/') {
          await page.getByRole('button', {name: 'Gallery view', exact: true}).click();
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} gallery overflows at ${width}px`);
          if (process.env.GARDEN_SHOTS) await page.screenshot({path: `${process.env.GARDEN_SHOTS}/${path.replaceAll('/', '')}-gallery-${width}.png`, animations: 'disabled'});
          await page.getByRole('button', {name: 'List view', exact: true}).click();
        }
      }
    }

    const before = await page.evaluate(() => ({...window.gardenMap.cam}));
    const canvas = page.locator('.smap canvas');
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 20, {steps: 5}); await page.mouse.up();
    const after = await page.evaluate(() => ({...window.gardenMap.cam}));
    assert.notEqual(before.x, after.x, 'Map pans');
    await page.getByRole('button', {name: 'Zoom in', exact: true}).click();
    assert.ok(await page.evaluate(s => window.gardenMap.cam.s > s, after.s), 'Map zooms');
    await page.getByRole('searchbox', {name: 'Search map titles'}).fill('wardian');
    assert.equal(await page.evaluate(() => window.gardenMap.items.filter((_, k) => window.gardenMap.lit(k)).length), 1);
    await page.getByRole('searchbox', {name: 'Search map titles'}).fill('');
    await page.evaluate(() => window.gardenMap.open(window.gardenMap.idx.get('wardian')));
    assert.ok((await page.locator('.sm-card .go').getAttribute('href')).endsWith('/projects/wardian/'));
    await page.getByRole('button', {name: 'Close item details'}).click();

    const touch = await browser.newContext({viewport: {width: 375, height: 850}, hasTouch: true, isMobile: true});
    const mobile = await touch.newPage();
    await mobile.goto(base + '/map/', {waitUntil: 'domcontentloaded'});
    await mobile.waitForFunction(() => !!window.gardenMap);
    await mobile.locator('canvas').scrollIntoViewIfNeeded();
    const bounds = await mobile.locator('canvas').boundingBox();
    const cdp = await touch.newCDPSession(mobile);
    const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
    const startScale = await mobile.evaluate(() => window.gardenMap.cam.s);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x - 35, y, id: 1}, {x: x + 35, y, id: 2}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x - 70, y, id: 1}, {x: x + 70, y, id: 2}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    assert.ok(await mobile.evaluate(s => window.gardenMap.cam.s > s * 1.5, startScale), 'Touch pinch zooms');
    const touchX = await mobile.evaluate(() => window.gardenMap.cam.x);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 3}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + 40, y: y + 10, id: 3}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    assert.notEqual(await mobile.evaluate(() => window.gardenMap.cam.x), touchX, 'Touch drag pans');
    const originalView = await mobile.evaluate(() => ({x: window.gardenMap.cam.x, y: window.gardenMap.cam.y, zoom: window.gardenMap.z()}));
    await mobile.setViewportSize({width: 850, height: 375});
    await mobile.waitForFunction(() => window.gardenMap.width === 850);
    const rotated = await mobile.evaluate(() => ({x: window.gardenMap.cam.x, y: window.gardenMap.cam.y, zoom: window.gardenMap.z(), bottom: document.querySelector('.smap').getBoundingClientRect().bottom}));
    assert.equal(rotated.x, originalView.x);
    assert.equal(rotated.y, originalView.y);
    assert.ok(Math.abs(rotated.zoom - originalView.zoom) < .0001);
    assert.ok(Math.abs(rotated.bottom - 375) < 1, 'Landscape map fits viewport');
    assert.deepEqual(errors, []);
    console.log(`PASS: archives, co-first author credits, filters, shared preference, relations, ${data.items.length} URLs, mobile widths, map search, pan, zoom and touch gestures.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
