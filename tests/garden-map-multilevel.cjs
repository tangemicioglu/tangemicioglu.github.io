/* GARDEN_URL=http://127.0.0.1:8779 PLAYWRIGHT_MODULE=<path> node tests/garden-map-multilevel.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.GARDEN_URL || 'http://127.0.0.1:8779';
const expected = JSON.parse(fs.readFileSync(process.env.GARDEN_DATA || '_data/garden.json', 'utf8'));
const mapPath = process.env.GARDEN_PATH || '/map/';
const variant = process.env.GARDEN_VARIANT || 'published-layout';
const primaryOnly = (expected.meta.preview_layout ?? expected.meta.layout)?.primary_only === true;
const belongs = (item, label) => item.areas.includes(label);

(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    for (const width of [1440, 375]) {
      const page = await browser.newPage({viewport: {width, height: width === 375 ? 812 : 1000}, reducedMotion: 'reduce'});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base + mapPath, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.gardenMap?.n === 43);
      await page.evaluate(() => document.fonts.ready);
      const overview = await page.evaluate(() => {
        const m = window.gardenMap;
        return {
          coordinates: m.items.map(i => [i.id, i.x, i.y]),
          hiddenMemberRule: typeof m.shown === 'function',
          papers: m.items.filter(i => i.kind === 'paper').length,
          allInBounds: m.items.every(i => { const [x, y] = m.toScreen(i.x, i.y); return x >= 0 && y >= 0 && x <= m.width && y <= m.height; }),
          territoryCounts: Object.fromEntries(m.terr.map(t => [t.t.id, t.n])),
          overflow: document.documentElement.scrollWidth > innerWidth
        };
      });
      assert.deepEqual(overview.coordinates, expected.items.map(i => [i.id, i.x, i.y]));
      assert.equal(overview.hiddenMemberRule, false);
      assert.equal(overview.papers, 17);
      assert.ok(overview.allInBounds);
      assert.equal(overview.overflow, false);
      assert.equal(new Set(overview.coordinates.map(i => `${i[1]},${i[2]}`)).size, 43);
      for (const track of expected.tracks) {
        const count = expected.items.filter(i => primaryOnly ? i.track === track.id : belongs(i, track.id)).length;
        assert.equal(overview.territoryCounts[track.id] || 0, count);
        assert.equal(await page.locator(`.sm-chips [data-l="${track.id}"]`).count(), 1, 'Secondary-only labels remain available as filters');
      }
      if (process.env.GARDEN_SCREENSHOTS) {
        await page.waitForTimeout(900);
        await page.screenshot({path: `${process.env.GARDEN_SCREENSHOTS}/multilevel-${variant}-${width}.png`});
      }
      const relations = await page.evaluate(() => {
        const m = window.gardenMap, stove = m.idx.get('assistive-interface-smart-stove');
        m.open(stove);
        const strong = m.items.find(i => i.related_items?.length);
        return {
          stoveEdge: m.nb[stove].includes(m.idx.get('silentspeller')),
          stoveRelated: [...m.el.querySelectorAll('.sm-card h4')].some(h => h.textContent === 'Related'),
          strongEdge: m.nb[m.idx.get(strong.id)].includes(m.idx.get(strong.related_items[0])),
          papersLinked: m.items.filter(i => i.members.length).every(i => i.members.every(id => m.nb[m.idx.get(i.id)].includes(m.idx.get(id))))
        };
      });
      assert.equal(relations.stoveEdge, false);
      assert.equal(relations.stoveRelated, false);
      assert.ok(relations.strongEdge && relations.papersLinked, 'Strong auto links and project-paper links remain');
      await page.getByRole('button', {name: 'Close item details'}).click();
      const labels = ['agents', 'therapeutics', 'augmentation', 'wearables', 'haptics', 'neural-stimulation'];
      for (const label of labels) {
        if (width < 600) await page.getByRole('combobox', {name: 'Filter map by label'}).selectOption(label);
        else await page.locator(`.sm-chips [data-l="${label}"]`).click();
        const matching = await page.evaluate(() => window.gardenMap.items.filter((i, k) => window.gardenMap.lit(k)).map(i => i.id));
        assert.deepEqual(matching, expected.items.filter(i => belongs(i, label)).map(i => i.id));
        assert.ok(await page.evaluate(() => {
          const m = window.gardenMap;
          return m.items.every((i, k) => {
            if (!m.lit(k)) return true;
            const [x, y] = m.toScreen(i.x, i.y);
            return x >= 0 && y >= 0 && x <= m.width && y <= m.height;
          });
        }), 'The camera includes secondary members as well as primary members');
      }
      if (width < 600) await page.getByRole('combobox', {name: 'Filter map by label'}).selectOption('');
      else await page.locator(`.sm-chips [data-l="${labels.at(-1)}"]`).click();
      await page.getByRole('button', {name: 'Show everything'}).click();
      const paper = expected.items.find(i => i.kind === 'paper' && i.project);
      await page.getByRole('searchbox', {name: 'Search map titles'}).fill(paper.title);
      const point = await page.evaluate(id => {
        const m = window.gardenMap, k = m.idx.get(id), i = m.items[k];
        const [x, y] = m.toScreen(i.x, i.y), rect = m.cv.getBoundingClientRect();
        return {x: rect.x + x, y: rect.y + y, nearest: m.nearest(x, y) === k};
      }, paper.id);
      assert.ok(point.nearest, 'A linked paper has an independent selectable position');
      await page.mouse.click(point.x, point.y);
      await page.locator(`.sm-card a.go[href="${paper.url}"]`).waitFor();
      assert.deepEqual(errors, []);
      console.log(`${variant} ${width}px: 43 independent points, 17 papers, correct headings/filters and paper selection pass`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
