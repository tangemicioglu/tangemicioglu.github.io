/* Timeline ported from Website-Garden: home-label bands, project spans, and member marks. */
"use strict";
const timelineHost = document.getElementById('garden-timeline');

function drawTimeline(data) {
  const W = Math.max(980, timelineHost.clientWidth), left = 190, right = 40;
  const dates = data.items.flatMap(item => [item.start || item.date, item.end || item.date]);
  const y0 = Math.min(...dates.map(date => Number(date.slice(0, 4))));
  const y1 = Math.max(new Date().getFullYear(), ...dates.map(date => Number(date.slice(0, 4)))) + 1;
  const X = date => left + (Number(date.slice(0, 4)) + (Number(date.slice(5, 7)) - 1) / 12 - y0) / (y1 - y0) * (W - left - right);
  const link = (item, shape) => `<a href="${esc(item.url)}" aria-label="${esc(item.title)}"><title>${esc(item.title)} · ${item.kind === 'project' ? span(item) : fmt(item.date)}</title>${shape}</a>`;
  const mark = (item, y, color) => {
    const x = X(item.date);
    return link(item, item.kind === 'paper'
      ? `<circle cx="${x}" cy="${y}" r="5" fill="var(--bg)" stroke="${color}" stroke-width="1.8"/>`
      : `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" ${item.kind === 'exploration' ? '' : `transform="rotate(45 ${x} ${y})"`} fill="${color}"/>`);
  };
  let svg = '', y = 34;
  for (const track of data.tracks) {
    const color = `var(--t-${track.id})`;
    const projects = data.items.filter(item => item.track === track.id && item.kind === 'project').sort((a, b) => a.start.localeCompare(b.start));
    const loose = data.items.filter(item => item.track === track.id && item.kind !== 'project' && !item.project);
    if (!projects.length && !loose.length) continue;
    const rows = [];
    const spans = projects.map(item => {
      const a = X(item.start), b = Math.max(X(item.end), a + 4);
      let row = rows.findIndex(end => end < a - 6);
      if (row < 0) { row = rows.length; rows.push(0); }
      rows[row] = Math.max(b, a + nm(item).length * 6.4 + 8);
      return {item, a, b, row};
    });
    const height = Math.max(2, Math.max(1, rows.length) + (loose.length ? 1 : 0)) * 32 + 8;
    svg += `<rect x="0" y="${y - 6}" width="${W}" height="${height}" fill="${data.tracks.indexOf(track) % 2 ? 'transparent' : 'var(--tint)'}"/>`;
    const words = track.title.split(' '), lines = [''];
    words.forEach(word => { if ((lines[lines.length - 1] + word).length > 23) lines.push(''); lines[lines.length - 1] += (lines[lines.length - 1] ? ' ' : '') + word; });
    svg += `<a href="${data.base}/projects/?label=${track.id}"><title>${esc(track.blurb)}</title><text x="6" y="${y + 12}" font-size="13" font-weight="600" fill="var(--ink)">${lines.map((line, k) => `<tspan x="6" dy="${k ? 17 : 0}">${k ? '' : '● '}${esc(line)}</tspan>`).join('')}</text></a>`;
    for (const {item, a, b, row} of spans) {
      const yy = y + 14 + row * 32, over = a + nm(item).length * 6.2 > W - 4;
      svg += link(item, `<line x1="${a}" x2="${b}" y1="${yy}" y2="${yy}" stroke="${color}" stroke-width="7" stroke-linecap="round" opacity="${item.status === 'archived' ? .7 : .9}"/>${item.status === 'active' ? `<path d="M${b + 4},${yy - 5} l7,5 l-7,5" fill="${color}"/>` : ''}<text x="${over ? W - 4 : a}" y="${yy - 7}" ${over ? 'text-anchor="end"' : ''} font-size="11.5" fill="var(--text)">${esc(nm(item))}</text>`);
      item.members.forEach(id => { svg += mark(data.by[id], yy, 'var(--ink)'); });
    }
    loose.forEach(item => { svg += mark(item, y + 14 + rows.length * 32, color); });
    y += height + 6;
  }
  let axis = '';
  for (let year = y0; year < y1; year++) {
    const x = X(`${year}-01`);
    axis += `<line x1="${x}" x2="${x}" y1="24" y2="${y}" stroke="var(--rule)"/><text x="${x + 3}" y="16" font-size="12" fill="var(--gray)">${year}</text>`;
  }
  timelineHost.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${y + 10}" width="${W}" height="${y + 10}" role="group" aria-label="Projects, explorations, publications, and writing across time">${axis}${svg}</svg>`;
}
loadGarden(timelineHost).then(drawTimeline).catch(() => gardenUnavailable(timelineHost));
