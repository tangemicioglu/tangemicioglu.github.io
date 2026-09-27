/* Shared archive controls; the articles remain readable without JavaScript. */
(() => {
  "use strict";
  const root = document.querySelector('.garden-archive');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-garden-item]')];
  const categories = [...root.querySelectorAll('button[data-category]')];
  const kinds = [...root.querySelectorAll('button[data-kind]')];
  const labels = [...root.querySelectorAll('button[data-label]')];
  const views = [...root.querySelectorAll('button[data-view]')];
  const selected = new Set();
  let category = '', kind = '', legacyTags = [];
  const storageKey = 'garden-archive-view';

  // A full-width reading surface keeps long abstracts out of narrow gallery cards.
  const dialog = document.querySelector('.garden-publication-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    let opener;
    root.classList.add('has-publication-dialog');
    root.querySelectorAll('[data-read-publication]').forEach(link => link.setAttribute('aria-haspopup', 'dialog'));
    root.addEventListener('click', event => {
      const link = event.target.closest('[data-read-publication]');
      if (!link || !root.classList.contains('is-gallery')) return;
      event.preventDefault();
      opener = link;
      const card = link.closest('[data-garden-item]');
      const title = document.createElement('h2');
      title.id = 'garden-publication-dialog-title';
      title.textContent = card.dataset.title;
      const venue = card.querySelector('.garden-publication-venue').cloneNode(true);
      venue.className = 'garden-dialog-venue';
      const abstractTitle = document.createElement('h3');
      abstractTitle.textContent = 'Abstract';
      const abstract = card.querySelector('.garden-publication-abstract p').cloneNode(true);
      const authorsTitle = document.createElement('h3');
      authorsTitle.textContent = 'Authors';
      const authors = card.querySelector('.garden-publication-authors').cloneNode(true);
      authors.className = 'garden-dialog-authors';
      const links = document.createElement('div');
      links.className = 'garden-dialog-links';
      const paper = card.querySelector('.archive__item-title > a').cloneNode(false);
      paper.textContent = 'Read paper';
      const page = card.querySelector('.garden-permalink').cloneNode(false);
      page.removeAttribute('aria-label');
      page.textContent = 'Publication page';
      links.append(paper, page);
      dialog.querySelector('.garden-dialog-content').replaceChildren(title, venue, abstractTitle, abstract, authorsTitle, authors, links);
      dialog.showModal();
      dialog.scrollTop = 0;
      document.documentElement.classList.add('publication-dialog-open');
    });
    dialog.querySelector('[data-close-publication]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('publication-dialog-open');
      if (opener?.isConnected) opener.focus({preventScroll: true});
    });
  }

  function view(mode, remember = false) {
    const gallery = mode === 'gallery';
    root.classList.toggle('is-gallery', gallery);
    cards.forEach(card => {
      card.classList.toggle('grid__item', gallery);
      card.classList.toggle('list__item', !gallery);
    });
    views.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === (gallery ? 'gallery' : 'list'))));
    if (remember) { try { localStorage.setItem(storageKey, mode); } catch (_) { /* Private browsing can disable storage. */ } }
  }

  function update(writeURL = true) {
    let count = 0;
    cards.forEach(card => {
      const areas = card.dataset.areas.split(',');
      card.hidden = !!((category && category !== card.dataset.category)
        || (kind && kind !== card.dataset.kind)
        || (selected.size && !areas.some(id => selected.has(id)))
        || (legacyTags.length && !card.dataset.tags.split(',').some(tag => legacyTags.includes(tag))));
      if (!card.hidden) count++;
    });
    root.querySelectorAll('.garden-year').forEach(year => { year.hidden = !year.querySelector('[data-garden-item]:not([hidden])'); });
    root.querySelector('.garden-empty').hidden = count > 0;
    categories.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    kinds.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.kind === kind)));
    labels.forEach(button => button.setAttribute('aria-pressed', String(selected.has(button.dataset.label))));
    const descriptions = root.querySelector('.garden-label-description');
    descriptions.replaceChildren(...labels.filter(button => selected.has(button.dataset.label)).map(button => {
      const p = document.createElement('p'); p.textContent = button.dataset.blurb; return p;
    }));
    const also = root.querySelector('.garden-also');
    if (also) {
      let matches = 0;
      also.querySelectorAll('li').forEach(li => {
        li.hidden = !li.dataset.alsoAreas.split(',').some(id => selected.has(id));
        if (!li.hidden) matches++;
      });
      also.hidden = !selected.size || !matches;
      also.querySelector('h2 span').textContent = labels.filter(b => selected.has(b.dataset.label)).map(b => b.dataset.title).join(' / ');
    }
    if (writeURL) {
      const url = new URL(location.href);
      ['category', 'kind', 'label', 'tags'].forEach(key => url.searchParams.delete(key));
      if (category) url.searchParams.set('category', category);
      if (kind) url.searchParams.set('kind', kind);
      if (selected.size) url.searchParams.set('label', [...selected].join(','));
      if (legacyTags.length) url.searchParams.set('tags', legacyTags.join(','));
      history.replaceState(null, '', url);
    }
  }

  function fromURL() {
    const params = new URL(location.href).searchParams;
    category = params.get('category') || '';
    kind = kinds.some(button => button.dataset.kind === params.get('kind')) ? params.get('kind') : '';
    selected.clear();
    (params.get('label') || '').split(',').forEach(id => { if (labels.some(b => b.dataset.label === id)) selected.add(id); });
    legacyTags = (params.get('tags') || '').split(',').filter(Boolean);
    if (selected.size) root.querySelector('.garden-label-filter').open = true;
    update(false);
  }
  categories.forEach(button => button.addEventListener('click', () => { category = category === button.dataset.category ? '' : button.dataset.category; update(); }));
  kinds.forEach(button => button.addEventListener('click', () => { kind = button.dataset.kind; update(); }));
  labels.forEach(button => button.addEventListener('click', () => { const id = button.dataset.label; selected.has(id) ? selected.delete(id) : selected.add(id); legacyTags = []; update(); }));
  views.forEach(button => button.addEventListener('click', () => view(button.dataset.view, true)));
  root.querySelector('[data-clear]').addEventListener('click', () => { category = ''; kind = ''; legacyTags = []; selected.clear(); update(); });
  addEventListener('popstate', fromURL);
  addEventListener('storage', event => { if (event.key === storageKey) view(event.newValue); });
  try { view(localStorage.getItem(storageKey)); } catch (_) { view('list'); }
  fromURL();
})();
