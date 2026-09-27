// Zoomable map of the site's work, after the LessWrong prototype's GardenMap (viz/common.js), sized for a
// personal site: every item is drawn (no point budget), areas show as soft coloured territories, projects as
// image medallions once you zoom in, and a project's papers and writing hang off it. Wheel or pinch to zoom,
// drag to pan, hover to see connections, click for a card.
"use strict";
class SiteMap {
  constructor(host, G, { onOpen } = {}) {
    this.G = G; this.onOpen = onOpen;
    host.innerHTML = `<div class="smap"><canvas aria-label="Map of projects, papers, and writing. A text index is available below." tabindex="0"></canvas>
      <div class="sm-top"><input type="search" placeholder="Search titles…" aria-label="Search map titles"><div class="sm-chips"></div><select class="sm-label-select" aria-label="Filter map by label"><option value="">All labels</option>${G.tracks.map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></div>
      <div class="sm-zoom"><button data-z="in" title="Zoom in" aria-label="Zoom in">+</button><button data-z="out" title="Zoom out" aria-label="Zoom out">−</button><button data-z="fit" title="Show everything" aria-label="Show everything">⤢</button></div>
      <div class="sm-key"><span><i class="k-proj"></i>project</span><span><i class="k-paper"></i>paper</span><span><i class="k-writ"></i>writing</span></div>
      <div class="sm-tip"></div><div class="sm-card" aria-label="Selected item"></div><p class="sr-only" role="status"></p></div>`;
    this.el = host.querySelector(".smap"); this.cv = this.el.querySelector("canvas"); this.ctx = this.cv.getContext("2d");
    this.items = G.items; this.n = this.items.length;
    this.idx = new Map(this.items.map((it, k) => [it.id, k]));
    const css = getComputedStyle(document.documentElement);
    this.col = Object.fromEntries(G.tracks.map(t => [t.id, css.getPropertyValue(`--t-${t.id}`).trim() || "#888"]));
    this.ink = css.getPropertyValue("--ink").trim(); this.bg = css.getPropertyValue("--bg").trim(); this.gray = css.getPropertyValue("--gray").trim();
    // neighbours shown on hover: project <-> members, series order, explicit links, strong similarity
    this.nb = this.items.map(it => {
      const s = new Set([...(it.members || []), ...(it.project ? [it.project] : []), ...(it.links || []), ...(it.backlinks || [])]);
      (it.similar || []).forEach((j, k) => { if (it.similar_s[k] >= .66) s.add(j); });
      return [...s].filter(j => this.idx.has(j)).map(j => this.idx.get(j));
    });
    this.imgs = new Map();
    for (const it of this.items) if (it.kind === "project" && it.teaser) { const im = new Image(); im.onload = () => this.request(); im.src = it.teaser; this.imgs.set(it.id, im); }
    // territories: centroid of each area's home items
    this.terr = G.tracks.map(t => { const m = this.items.filter(i => i.track === t.id); return m.length ? { t, x: m.reduce((a, i) => a + i.x, 0) / m.length, y: m.reduce((a, i) => a + i.y, 0) / m.length, n: m.length } : null; }).filter(Boolean);
    this.hover = -1; this.focus = -1; this.label = null; this.q = "";
    this.chips(); this.bind();
    new ResizeObserver(() => this.resize()).observe(this.cv); this.resize();
  }
  chips() {
    const box = this.el.querySelector(".sm-chips");
    box.innerHTML = this.G.tracks.filter(t => t.era !== "earlier").map(t => `<button data-l="${t.id}"><i style="background:${this.col[t.id]}"></i>${t.title}</button>`).join("")
      + `<button data-l="__earlier" class="more">earlier…</button>`;
    box.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.l === "__earlier") { box.innerHTML = box.innerHTML.replace(/<button data-l="__earlier"[^>]*>earlier…<\/button>/, this.G.tracks.filter(t => t.era === "earlier").map(t => `<button data-l="${t.id}"><i style="background:${this.col[t.id]}"></i>${t.title}</button>`).join("")); return; }
      this.label = this.label === b.dataset.l ? null : b.dataset.l;
      box.querySelectorAll("button").forEach(x => { x.classList.toggle("on", x.dataset.l === this.label); x.setAttribute('aria-pressed', String(x.dataset.l === this.label)); });
      this.el.querySelector('select').value = this.label || '';
      if (this.label) this.fitTo(this.items.map((it, k) => it.areas.includes(this.label) ? k : -1).filter(k => k >= 0)); else this.request();
    });
    this.el.querySelector("input").addEventListener("input", e => { this.q = e.target.value.trim().toLowerCase(); this.request(); this.el.querySelector('[role=status]').textContent = this.items.filter((_, k) => this.lit(k)).length + ' matching items'; });
    this.el.querySelector('select').addEventListener('change', e => {
      this.label = e.target.value || null;
      box.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x.dataset.l === this.label); x.setAttribute('aria-pressed', String(x.dataset.l === this.label)); });
      if (this.label) this.fitTo(this.items.map((_, k) => this.lit(k) ? k : -1).filter(k => k >= 0)); else this.request();
    });
  }
  lit(k) { // passes the label filter and search
    const it = this.items[k];
    return (!this.label || it.areas.includes(this.label)) && (!this.q || it.title.toLowerCase().includes(this.q) || (it.short || "").toLowerCase().includes(this.q));
  }
  // ---- camera
  fit() {
    const xs = this.items.map(i => i.x), ys = this.items.map(i => i.y), w = this.cv.clientWidth, h = this.cv.clientHeight;
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    this.s0 = 0.84 * Math.min(w / (x1 - x0), h / (y1 - y0));
    this.cam = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: this.s0 }; this.request();
  }
  fitTo(ks) {
    if (!ks.length) return; const w = this.cv.clientWidth, h = this.cv.clientHeight;
    const xs = ks.map(k => this.items[k].x), ys = ks.map(k => this.items[k].y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    this.animate({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: Math.min(this.s0 * 5, 0.7 * Math.min(w / Math.max(1e-6, x1 - x0), h / Math.max(1e-6, y1 - y0))) });
  }
  animate(to) { // short ease so zooming to a label or item keeps you oriented
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.cam = to; this.request(); return; }
    const from = { ...this.cam }, t0 = performance.now(), D = 380;
    const step = t => { const u = Math.min(1, (t - t0) / D), e = 1 - (1 - u) ** 3;
      this.cam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: from.s * (to.s / from.s) ** e }; this.draw(); if (u < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  zoomBy(f, px = this.cv.clientWidth / 2, py = this.cv.clientHeight / 2) {
    const [wx, wy] = this.toWorld(px, py); this.cam.s = Math.max(this.s0 * 0.6, Math.min(this.s0 * 12, this.cam.s * f));
    const [nx, ny] = this.toWorld(px, py); this.cam.x += wx - nx; this.cam.y += wy - ny; this.request();
  }
  z() { return this.cam.s / this.s0; }
  toScreen(x, y) { return [(x - this.cam.x) * this.cam.s + this.cv.clientWidth / 2, (y - this.cam.y) * this.cam.s + this.cv.clientHeight / 2]; }
  toWorld(px, py) { return [(px - this.cv.clientWidth / 2) / this.cam.s + this.cam.x, (py - this.cv.clientHeight / 2) / this.cam.s + this.cam.y]; }
  resize() { const d = devicePixelRatio || 1; this.cv.width = this.cv.clientWidth * d; this.cv.height = this.cv.clientHeight * d; this.dpr = d; if (!this.cam) this.fit(); this.request(); }
  request() { if (!this.pending) { this.pending = true; requestAnimationFrame(() => { this.pending = false; this.draw(); }); } }
  radius(k) { const it = this.items[k], z = Math.sqrt(this.z()); return it.kind === "project" ? Math.min(30, 8 * z + (this.z() > 1.7 ? 6 : 0)) : it.kind === "paper" ? 4.2 * Math.min(1.8, z) : 5 * Math.min(1.8, z); }
  nearest(px, py) {
    let best = -1, bd = Infinity;
    for (let k = 0; k < this.n; k++) { if (!this.lit(k)) continue; const [sx, sy] = this.toScreen(this.items[k].x, this.items[k].y), r = this.radius(k) + 5, d = (sx - px) ** 2 + (sy - py) ** 2; if (d < r * r && d < bd) { bd = d; best = k; } }
    return best;
  }
  bind() {
    const cv = this.cv, pts = new Map(); let drag = null, moved = false, pinch = null;
    cv.addEventListener("wheel", e => { e.preventDefault(); this.zoomBy(Math.exp(-e.deltaY * 0.0016), e.offsetX, e.offsetY); }, { passive: false });
    cv.addEventListener("dblclick", e => this.zoomBy(1.8, e.offsetX, e.offsetY));
    cv.addEventListener("pointerdown", e => { pts.set(e.pointerId, [e.offsetX, e.offsetY]); cv.setPointerCapture(e.pointerId); moved = false;
      if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y };
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: this.cam.s }; drag = null; } });
    cv.addEventListener("pointermove", e => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.offsetX, e.offsetY]);
      if (pinch && pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); const f = pinch.s * d / pinch.d / this.cam.s; this.zoomBy(f, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); moved = true; return; }
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (moved) { this.cam.x = drag.cx - dx / this.cam.s; this.cam.y = drag.cy - dy / this.cam.s; this.request(); cv.style.cursor = "grabbing"; return; } }
      const h = this.nearest(e.offsetX, e.offsetY); cv.style.cursor = h >= 0 ? "pointer" : "grab";
      if (h !== this.hover) { this.hover = h; this.request(); }
      this.tip(h, e);
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
      if (drag && !moved) { const k = this.nearest(e.offsetX, e.offsetY); this.open(k); } if (!pts.size) drag = null; cv.style.cursor = "grab"; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", e => { moved = true; up(e); });
    cv.addEventListener("pointerleave", () => { this.hover = -1; this.tip(-1); this.request(); });
    this.el.querySelector(".sm-zoom").addEventListener("click", e => { const z = e.target.dataset.z; if (z === "in") this.zoomBy(1.6); if (z === "out") this.zoomBy(1 / 1.6); if (z === "fit") { this.open(-1); const s = { ...this.cam }; this.fit(); const t = { ...this.cam }; this.cam = s; this.animate(t); } });
    this.el.querySelector(".sm-card").addEventListener("click", e => { if (e.target.closest('.sm-close')) { this.open(-1); this.cv.focus(); return; } const a = e.target.closest("[data-k]"); if (a) { e.preventDefault(); this.open(+a.dataset.k, true); } });
    cv.addEventListener('keydown', e => {
      if (e.key === '+' || e.key === '=') this.zoomBy(1.6);
      else if (e.key === '-') this.zoomBy(1 / 1.6);
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        this.cam.x += (e.key === 'ArrowRight' ? 40 : e.key === 'ArrowLeft' ? -40 : 0) / this.cam.s;
        this.cam.y += (e.key === 'ArrowDown' ? 40 : e.key === 'ArrowUp' ? -40 : 0) / this.cam.s;
        this.request();
      }
    });
    addEventListener("keydown", e => { if (e.key === "Escape") this.open(-1); });
  }
  tip(k, e) {
    const tp = this.el.querySelector(".sm-tip");
    if (k < 0 || k === this.focus) { tp.style.display = "none"; return; }
    const it = this.items[k];
    tp.innerHTML = `<b>${esc(clean(it.title))}</b><div class="meta">${KIND[it.kind]} · ${it.kind === "project" ? span(it) : fmt(it.date)} · ${esc(this.G.track[it.track].title)}</div>`;
    tp.style.left = Math.max(4, Math.min(e.offsetX + 14, this.cv.clientWidth - 300)) + "px"; tp.style.top = Math.min(e.offsetY + 16, this.cv.clientHeight - 90) + "px"; tp.style.display = "block";
  }
  open(k, fly) {
    this.focus = k; const card = this.el.querySelector(".sm-card");
    if (k < 0) { card.style.display = "none"; this.request(); return; }
    const it = this.items[k], G = this.G, row = j => { const m = G.by[j]; return m ? `<li><a href="${esc(m.url)}" data-k="${this.idx.get(j)}">${esc(nm(m))}</a> <span class="meta">${m.kind} · ${m.date.slice(0, 4)}</span></li>` : ""; };
    const sec = (t, ids) => ids.length ? `<h4>${t}</h4><ul>${ids.map(row).join("")}</ul>` : "";
    const ser = it.series.map(s => G.ser[s.id]).map(S => sec(`${esc(S.title)} · in order`, S.items)).join("");
    const rel = it.related_items.slice(0, 4);
    card.innerHTML = `<button class="sm-close" aria-label="Close item details">×</button>${it.teaser ? `<img src="${esc(it.teaser)}" alt="">` : ""}<div class="meta">${KIND[it.kind]} · ${it.kind === "project" ? span(it) : fmt(it.date)}</div>
      <h3>${esc(clean(it.title))}</h3><div class="meta">${areaDots(it)}</div><p>${esc(plain(it.excerpt).slice(0, 260))}${plain(it.excerpt).length > 260 ? "…" : ""}</p>
      <a class="go" href="${esc(it.url)}">Open page →</a>${it.project ? sec("Part of", [it.project]) : ""}${sec("In this project", it.members)}${ser}${sec("See also", it.links)}${sec("Linked from", it.backlinks)}${sec("Related", rel)}`;
    card.style.display = "block";
    if (fly) { const ts = Math.max(this.cam.s, this.s0 * 2.2); this.animate({ x: it.x + 175 / ts, y: it.y, s: ts }); } // keep the item clear of the card
    this.request();
  }
  // ---- drawing
  draw() {
    const ctx = this.ctx, w = this.cv.clientWidth, h = this.cv.clientHeight, z = this.z(), I = this.items;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const act = this.focus >= 0 ? this.focus : this.hover, near = new Set(act >= 0 ? [act, ...this.nb[act]] : []);
    const filtering = !!(this.label || this.q), on = k => (act < 0 || near.has(k)) && this.lit(k);
    // 1. territories: soft colour pools around each area's items
    ctx.globalCompositeOperation = "multiply";
    for (let k = 0; k < this.n; k++) { const it = I[k], [sx, sy] = this.toScreen(it.x, it.y), R = (it.kind === "project" ? 95 : 60) * Math.sqrt(z);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R), c = this.col[it.track];
      const a = filtering && !this.lit(k) ? 0.03 : 0.16; g.addColorStop(0, hexA(c, a)); g.addColorStop(1, hexA(c, 0));
      ctx.fillStyle = g; ctx.fillRect(sx - R, sy - R, 2 * R, 2 * R); }
    ctx.globalCompositeOperation = "source-over";
    // 2. structure: each project's papers and writing hang off it; series drawn as a path when active
    for (let k = 0; k < this.n; k++) { const it = I[k]; if (it.kind !== "project") continue;
      const [ax, ay] = this.toScreen(it.x, it.y);
      for (const m of it.members) { const j = this.idx.get(m); if (j === undefined) continue; const [bx, by] = this.toScreen(I[j].x, I[j].y);
        const hi = act >= 0 && (act === k || act === j);
        ctx.strokeStyle = hexA(this.col[it.track], hi ? 0.9 : (on(k) && on(j) ? 0.35 : 0.08)); ctx.lineWidth = hi ? 2 : 1.2;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + bx) / 2 - (by - ay) * .12, (ay + by) / 2 + (bx - ax) * .12, bx, by); ctx.stroke(); } }
    if (act >= 0) {
      for (const s of I[act].series) { const S = this.G.ser[s.id], P = S.items.map(id => this.idx.get(id)).filter(x => x !== undefined);
        ctx.strokeStyle = this.ink; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath();
        P.forEach((j, q) => { const [sx, sy] = this.toScreen(I[j].x, I[j].y); q ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }); ctx.stroke(); ctx.setLineDash([]); P.forEach(j => near.add(j)); }
      const [ax, ay] = this.toScreen(I[act].x, I[act].y);
      for (const j of this.nb[act]) { if (I[act].members.includes(I[j].id) || I[act].project === I[j].id) continue; const [bx, by] = this.toScreen(I[j].x, I[j].y);
        ctx.strokeStyle = hexA(this.gray, .8); ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]); }
    }
    // 3. nodes: projects as medallions (image once zoomed in), papers as rings, writing as diamonds
    const order = [...I.keys()].sort((a, b) => (I[a].kind === "project") - (I[b].kind === "project"));
    for (const k of order) { const it = I[k], [sx, sy] = this.toScreen(it.x, it.y), r = this.radius(k), c = this.col[it.track];
      if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue;
      ctx.globalAlpha = on(k) || near.has(k) ? 1 : 0.18;
      if (it.kind === "project") {
        const im = this.imgs.get(it.id);
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.2832); ctx.fillStyle = c; ctx.fill();
        if (im && im.complete && im.naturalWidth && r > 12) { ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, r - 2.5, 0, 6.2832); ctx.clip();
          const s = Math.max((2 * r) / im.naturalWidth, (2 * r) / im.naturalHeight); ctx.drawImage(im, sx - im.naturalWidth * s / 2, sy - im.naturalHeight * s / 2, im.naturalWidth * s, im.naturalHeight * s); ctx.restore(); }
        if (it.status === "active") { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, r + 4, 0, 6.2832); ctx.stroke(); }
      } else if (it.kind === "paper") { ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.2832); ctx.fillStyle = this.bg; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(sx, sy - r * 1.2); ctx.lineTo(sx + r, sy); ctx.lineTo(sx, sy + r * 1.2); ctx.lineTo(sx - r, sy); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }
      if (k === act) { ctx.strokeStyle = this.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sx, sy, r + (it.kind === "project" ? 7 : 5), 0, 6.2832); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // 4. labels, by level of detail: area names far out; project names; papers and writing once zoomed in
    const placed = [], put = (text, x, y, font, color, force, align = "center") => {
      ctx.font = font; const tw = ctx.measureText(text).width, fh = parseInt(font.match(/(\d+)px/)[1], 10);
      if (x < -60 || x > w + 60 || y < 0 || y > h) return;
      x = align === "center" ? Math.max(tw / 2 + 6, Math.min(w - tw / 2 - 6, x)) : Math.max(6, Math.min(w - tw - 6, x));
      const x0 = align === "center" ? x - tw / 2 : x, box = [x0 - 3, y - fh, x0 + tw + 3, y + 4];
      if (!force && placed.some(b => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) return;
      placed.push(box); ctx.textAlign = align; ctx.lineJoin = "round"; ctx.strokeStyle = this.bg; ctx.lineWidth = 4; ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y); };
    const F = "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
    if (act >= 0) { const it = I[act], [sx, sy] = this.toScreen(it.x, it.y); put(nm(it), sx, sy - this.radius(act) - 10, `600 14px ${F}`, this.ink, true); }
    for (const k of near) if (k !== act) { const it = I[k], [sx, sy] = this.toScreen(it.x, it.y); put(nm(it), sx, sy - this.radius(k) - 7, `12.5px ${F}`, this.ink); }
    const fade = Math.max(0, Math.min(1, (2.3 - z) / 0.8));
    if (fade > 0 && act < 0) for (const T of this.terr) { const [sx, sy] = this.toScreen(T.x, T.y);
      put(T.t.title.toUpperCase(), sx, sy + 4, `700 ${T.t.era === "earlier" ? 11 : 13}px ${F}`, hexA(this.col[T.t.id], (filtering && T.t.id !== this.label ? .25 : .95) * fade)); }
    const labs = [...I.keys()].filter(k => on(k) && !near.has(k) && (I[k].kind === "project" ? z > 0.85 : z > 2.1)).sort((a, b) => (I[b].kind === "project") - (I[a].kind === "project") || (I[b].status === "active") - (I[a].status === "active"));
    for (const k of labs) { const it = I[k], [sx, sy] = this.toScreen(it.x, it.y), r = this.radius(k);
      put(nm(it), sx, sy + r + 14, `${it.kind === "project" ? "600 12.5px" : (it.kind === "paper" ? "11.5px" : "italic 11.5px")} ${F}`, it.kind === "project" ? this.ink : this.gray); }
  }
}
function hexA(c, a) { // "#rrggbb" or "rgb(...)" -> rgba with alpha
  if (c.startsWith("#")) { const v = c.length === 4 ? c.slice(1).split("").map(x => x + x).join("") : c.slice(1, 7); const n = parseInt(v, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
  const m = c.match(/[\d.]+/g) || [0, 0, 0]; return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
}
