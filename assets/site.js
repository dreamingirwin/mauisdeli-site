/* ============================================================
   MAUI'S DELI — site.js
   Vanilla JS. Loads JSON from /data/ and renders into the DOM.
   ============================================================ */

// ---------- Mobile nav ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Mark active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
});

// ---------- Data loader ----------
async function loadJSON(url) {
  try {
    const res = await fetch(url + '?v=' + Date.now());
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Could not load', url, err);
    return null;
  }
}

// ---------- Formatters ----------
function fmtPrice(p) {
  if (p === null || p === undefined || p === '') return '';
  const n = typeof p === 'number' ? p : parseFloat(String(p).replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return '';
  return '$' + n.toFixed(2).replace(/\.00$/, '');
}

function escapeHTML(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function hasImage(url) {
  return typeof url === 'string' && url.trim().length > 0;
}

// ---------- Renderers ----------

// Community announcement strip
async function renderAnnouncement(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/announcement.json');
  if (!data || !data.active || !data.headline) {
    el.style.display = 'none';
    return;
  }
  el.innerHTML = `<strong>${escapeHTML(data.headline)}</strong> ${escapeHTML(data.message || '')}`;
}

// Sub of the week
async function renderSubOfWeek(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/sub-of-week.json');
  if (!data || !data.name) { el.style.display = 'none'; return; }

  const hasImg = hasImage(data.image);
  const imgBlock = hasImg
    ? `<div class="sub-feature-image" style="background-image:url('${escapeHTML(data.image)}')"></div>`
    : '';
  const promo = data.promo
    ? `<span class="promo">${escapeHTML(data.promo)}</span>`
    : `<span class="promo">Sub of the Week</span>`;
  const price = data.price ? `<div class="price">${escapeHTML(fmtPrice(data.price))}</div>` : '';

  // When no image: stretch the body to full width so there's no empty slot
  if (!hasImg) el.classList.add('no-image');

  el.innerHTML = `
    <div class="sub-feature-body">
      ${promo}
      <h3>${escapeHTML(data.name)}</h3>
      <p class="section-lede" style="margin:0">${escapeHTML(data.description || '')}</p>
      ${price}
    </div>
    ${imgBlock}
  `;
}

// Featured dishes
async function renderFeatured(targetId, limit) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/featured.json');
  if (!data || !data.items) {
    el.innerHTML = '<p class="empty">Featured dishes coming soon.</p>';
    return;
  }

  const items = data.items
    .filter(i => i.featured !== false)
    .filter(i => (i.status || 'Active') !== 'Hidden')
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));

  const toShow = limit ? items.slice(0, limit) : items;
  if (!toShow.length) {
    el.innerHTML = '<p class="empty">Featured dishes coming soon.</p>';
    return;
  }

  el.innerHTML = toShow.map(item => {
    const comingSoon = item.status === 'Coming Soon';
    const imageBlock = hasImage(item.image)
      ? `<div class="dish-card-image" style="background-image:url('${escapeHTML(item.image)}')"></div>`
      : `<div class="dish-card-image dish-card-image--placeholder" aria-hidden="true">
           <svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
             <path d="M32 4c3 7 8 10 9 17 1 6-3 10-3 13 3-2 7-3 9-8 2 7-1 17-8 22-4 3-9 4-14 3-8-1-14-8-14-17 0-7 4-11 8-16 3-3 4-6 4-10 3 2 6 4 7 8 1-4 2-8 2-12z" fill="currentColor"/>
           </svg>
         </div>`;

    return `
      <article class="dish-card">
        ${imageBlock}
        <div class="dish-card-body">
          <h4>${escapeHTML(item.name)}${comingSoon ? '<span class="coming-soon-badge">Coming Soon</span>' : ''}</h4>
          <p>${escapeHTML(item.description || '')}</p>
          ${(item.price && !comingSoon) ? `<span class="price">${escapeHTML(fmtPrice(item.price))}</span>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

// Weekly specials
async function renderSpecials(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/specials.json');
  if (!data || !data.items || !data.items.length) {
    el.innerHTML = '<p class="empty">New specials coming this week.</p>';
    return;
  }

  el.innerHTML = data.items.map(s => `
    <article class="special-day">
      ${s.label ? `<div class="day">${escapeHTML(s.label)}</div>` : ''}
      <div class="dish">${escapeHTML(s.title)}</div>
      ${s.description ? `<p class="desc">${escapeHTML(s.description)}</p>` : ''}
      ${s.price ? `<span class="price">${escapeHTML(fmtPrice(s.price))}</span>` : ''}
    </article>
  `).join('');
}

// Full menu
async function renderMenu(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/menu.json');
  if (!data || !data.items) { el.innerHTML = '<p class="empty">Menu loading…</p>'; return; }

  // Filter: Hidden -> skip entirely. Active and Coming Soon both show (with badge for CS).
  // Also support legacy `available: false` flag as equivalent to Hidden.
  const visible = data.items.filter(i => {
    const status = i.status || (i.available === false ? 'Hidden' : 'Active');
    return status !== 'Hidden';
  });

  // Sort by sort number, then name
  visible.sort((a, b) => (a.sort || 0) - (b.sort || 0) || String(a.name).localeCompare(String(b.name)));

  const bySlug = new Map();
  visible.forEach(item => {
    const cat = item.category || 'Other';
    if (!bySlug.has(cat)) bySlug.set(cat, []);
    bySlug.get(cat).push(item);
  });

  // Category chips (includes "All")
  const chipsEl = document.getElementById('menu-chips');
  const cats = [...bySlug.keys()];
  if (chipsEl) {
    chipsEl.innerHTML = `
      <button class="cat-chip active" data-cat="all">All</button>
      ${cats.map(c => `<button class="cat-chip" data-cat="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('')}
    `;
  }

  // Sections
  el.innerHTML = cats.map(cat => {
    const items = bySlug.get(cat);
    return `
      <section class="menu-section" data-cat="${escapeHTML(cat)}">
        <h2>${escapeHTML(cat)}</h2>
        <div class="menu-grid">
          ${items.map(it => {
            const status = it.status || (it.available === false ? 'Hidden' : 'Active');
            const comingSoon = status === 'Coming Soon';
            return `
              <article class="menu-item ${comingSoon ? 'menu-item-unavailable' : ''}">
                ${hasImage(it.image) ? `<div class="menu-item-thumb" style="background-image:url('${escapeHTML(it.image)}')"></div>` : ''}
                <div class="menu-item-body">
                  <div class="menu-item-head">
                    <span class="menu-item-name">${escapeHTML(it.name)}${comingSoon ? '<span class="coming-soon-badge">Coming Soon</span>' : ''}</span>
                    ${(it.price && !comingSoon) ? `<span class="menu-item-price">${escapeHTML(fmtPrice(it.price))}</span>` : ''}
                  </div>
                  ${it.description ? `<p class="menu-item-desc">${escapeHTML(it.description)}</p>` : ''}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }).join('');

  // Chip filter
  if (chipsEl) {
    chipsEl.addEventListener('click', e => {
      const btn = e.target.closest('.cat-chip');
      if (!btn) return;
      chipsEl.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.cat;
      el.querySelectorAll('.menu-section').forEach(sec => {
        sec.style.display = (target === 'all' || sec.dataset.cat === target) ? '' : 'none';
      });
    });
  }
}

// Gallery
async function renderGallery(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/gallery.json');
  const items = (data && data.items)
    ? data.items.filter(i => hasImage(i.image)).sort((a, b) => (a.sort || 0) - (b.sort || 0))
    : [];

  if (!items.length) {
    el.innerHTML = '<p class="empty">Gallery coming soon — food pics on the way.</p>';
    return;
  }

  el.innerHTML = items.map(item => `
    <figure class="gallery-item" data-full="${escapeHTML(item.image)}">
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title || 'Dish photo')}" loading="lazy">
      ${(item.title || item.caption) ? `
        <figcaption class="gallery-caption">
          ${item.title ? escapeHTML(item.title) : ''}
          ${item.caption ? `<small>${escapeHTML(item.caption)}</small>` : ''}
        </figcaption>
      ` : ''}
    </figure>
  `).join('');

  // Lightbox
  const lb = document.getElementById('lightbox');
  if (lb) {
    el.addEventListener('click', e => {
      const fig = e.target.closest('.gallery-item');
      if (!fig) return;
      const img = fig.dataset.full;
      if (!img) return;
      lb.querySelector('img').src = img;
      lb.classList.add('open');
    });
    lb.addEventListener('click', () => {
      lb.classList.remove('open');
      lb.querySelector('img').src = '';
    });
  }
}

// Hours (contact page)
async function renderHours(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/hours.json');
  if (!data || !data.days) {
    el.innerHTML = '<li><span class="day">Hours</span><span class="time">Call for today\'s hours</span></li>';
    return;
  }

  el.innerHTML = data.days.map(d => `
    <li>
      <span class="day">${escapeHTML(d.day)}</span>
      <span class="time">${escapeHTML(d.hours)}</span>
    </li>
  `).join('');

  const noteEl = document.getElementById('hours-note');
  if (noteEl && data.note) noteEl.textContent = data.note;
}

// Hero backdrop (homepage) — uses first featured dish image with a photo
async function renderHeroBackdrop(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const data = await loadJSON('data/featured.json');
  if (!data || !data.items || !data.items.length) return;
  const first = data.items.find(i => hasImage(i.image));
  if (first) {
    el.style.backgroundImage = `linear-gradient(180deg, rgba(13,13,13,0.78), rgba(13,13,13,0.92)), url('${first.image}')`;
    el.classList.add('hero-with-image');
  }
}

// ============================================================
// COMMUNITY BOARD
// ============================================================
async function renderCommunityBoard(targetId, options) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const opts = options || {};
  const limit = opts.limit || null;
  const layout = opts.layout || 'grid'; // 'grid' for homepage, 'list' for What's New

  const data = await loadJSON('data/community.json');
  if (!data || !data.items || !data.items.length) {
    el.innerHTML = '<p class="community-empty">No community posts right now — check back soon.</p>';
    return;
  }

  // Filter: active, not archived
  const visible = data.items.filter(p => p.active !== false && p.archived !== true);

  // Sort: pinned first, then by sortOrder (ascending), then by date (newest first)
  visible.sort((a, b) => {
    if ((b.pinned ? 1 : 0) !== (a.pinned ? 1 : 0)) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if ((a.sortOrder || 0) !== (b.sortOrder || 0)) return (a.sortOrder || 0) - (b.sortOrder || 0);
    return String(b.date || '').localeCompare(String(a.date || ''));
  });

  const toShow = limit ? visible.slice(0, limit) : visible;

  if (!toShow.length) {
    el.innerHTML = '<p class="community-empty">No community posts right now — check back soon.</p>';
    return;
  }

  // Apply layout class to container
  el.className = (layout === 'list' ? 'community-list' : 'community-grid');

  el.innerHTML = toShow.map(post => {
    const imageBlock = hasImage(post.image)
      ? `<div class="community-card-image"><img src="${escapeHTML(post.image)}" alt="${escapeHTML(post.title)}" loading="lazy"></div>`
      : '';
    const dateStr = post.date ? formatPostDate(post.date) : '';
    const cta = (post.buttonText && post.buttonLink)
      ? `<a class="community-card-cta" href="${escapeHTML(post.buttonLink)}" target="_blank" rel="noopener">${escapeHTML(post.buttonText)} →</a>`
      : '';

    if (layout === 'list') {
      return `
        <article class="community-card">
          ${imageBlock}
          <div class="community-card-body">
            <div class="community-card-head">
              ${post.pinned ? '<span class="community-card-pin">📌 Pinned</span>' : ''}
              <span class="community-card-tag">${escapeHTML(post.category || 'Community')}</span>
              ${dateStr ? `<span class="community-card-date">${escapeHTML(dateStr)}</span>` : ''}
            </div>
            <h3>${escapeHTML(post.title)}</h3>
            <p>${escapeHTML(post.description || '')}</p>
            ${cta}
          </div>
        </article>
      `;
    }

    return `
      <article class="community-card">
        <div class="community-card-head">
          ${post.pinned ? '<span class="community-card-pin">📌</span>' : ''}
          <span class="community-card-tag">${escapeHTML(post.category || 'Community')}</span>
          ${dateStr ? `<span class="community-card-date">${escapeHTML(dateStr)}</span>` : ''}
        </div>
        ${imageBlock}
        <h3>${escapeHTML(post.title)}</h3>
        <p>${escapeHTML(post.description || '')}</p>
        ${cta}
      </article>
    `;
  }).join('');
}

function formatPostDate(iso) {
  // Parse YYYY-MM-DD gracefully; if invalid, just return as-is
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mi = parseInt(m[2], 10) - 1;
  return `${months[mi] || m[2]} ${parseInt(m[3], 10)}, ${m[1]}`;
}

// ============================================================
// SETTINGS — apply homepage section visibility toggles
// Each toggleable section should have data-section="<key>" on its
// container. If settings.sections[key] === false, the section is hidden.
// ============================================================
async function applySettings() {
  const data = await loadJSON('data/settings.json');
  if (!data || !data.sections) return;
  document.querySelectorAll('[data-section]').forEach(el => {
    const key = el.getAttribute('data-section');
    if (data.sections[key] === false) {
      el.style.display = 'none';
    }
  });
}
