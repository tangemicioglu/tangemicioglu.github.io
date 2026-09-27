/* Shared presentation helpers from Website-Garden's approved mock. */
"use strict";
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const clean = text => text;
const plain = text => String(text ?? '');
const KIND = {project: 'Project', paper: 'Paper', essay: 'Essay', note: 'Note'};
const nm = item => item.short || (item.title.split(/:\s/)[0].length > 44 ? item.title.split(/:\s/)[0].slice(0, 42) + '…' : item.title.split(/:\s/)[0]);
const fmt = date => new Date(date + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
const span = item => `${item.start.slice(0, 4)}${item.status === 'active' ? '–now' : item.end.slice(0, 4) !== item.start.slice(0, 4) ? '–' + item.end.slice(0, 4) : ''}`;
let G;
const areaDots = item => item.areas.map(id => `<a href="${G.base}/projects/?label=${id}"><span class="garden-dot" style="background:var(--t-${id})" aria-hidden="true"></span>${esc(G.track[id].title)}</a>`).join(', ');

async function loadGarden(host) {
  const response = await fetch(host.dataset.gardenUrl);
  if (!response.ok) throw new Error('Garden data unavailable');
  G = await response.json();
  G.base = host.dataset.gardenUrl.replace(/\/garden\.json$/, '');
  G.items.forEach(item => { item.url = G.base + item.url; if (item.teaser && item.teaser.startsWith('/')) item.teaser = G.base + item.teaser; });
  G.by = Object.fromEntries(G.items.map(item => [item.id, item]));
  G.track = Object.fromEntries(G.tracks.map(track => [track.id, track]));
  G.ser = Object.fromEntries(G.series.map(series => [series.id, series]));
  return G;
}

function gardenUnavailable(host) {
  const message = document.createElement('p');
  message.textContent = 'This view could not load. Browse the complete collection by label below.';
  host.replaceChildren(message);
}
