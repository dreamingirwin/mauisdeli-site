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
  // Blank cases: no price displayed at all
  if (p === null || p === undefined) return '';
  if (typeof p === 'string' && p.trim() === '') return '';

  // Pure number: format as money
  if (typeof p === 'number') {
    if (isNaN(p)) return '';
    return '$' + p.toFixed(2).replace(/\.00$/, '');
  }

  // String: try to parse as money. Accept "12", "12.50", "$12", "$12.50",
  // optionally with whitespace. Anything else (e.g. "Market price",
  // "Ask about today's price") is passed through unchanged so the owner can
  // type custom price text.
  const s = String(p).trim();
  const moneyMatch = s.match(/^\$?\s*(\d+(?:\.\d+)?)\s*$/);
  if (moneyMatch) {
    const n = parseFloat(moneyMatch[1]);
    if (!isNaN(n)) return '$' + n.toFixed(2).replace(/\.00$/, '');
  }
  // Custom text — show as the owner typed it.
  return s;
}

function escapeHTML(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

// Validates and returns a URL safe to use in href attributes.
// Allowed: http://, https://, mailto:, tel:, root-relative ("/foo"), relative ("foo.html#bar"), fragments ("#x").
// Rejected (returns ''): javascript:, data:, file:, vbscript:, blob:, anything else with a protocol.
function safeLink(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Reject things that try to hide a protocol with whitespace/control chars before the colon
  const stripped = trimmed.replace(/[\u0000-\u001F\u007F]/g, '');
  // If there's a colon before any '/', '?', '#', it's an absolute-scheme URL — only allow safe schemes
  const schemeMatch = stripped.match(/^([a-zA-Z][a-zA-Z0-9+.\-]*):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https' && scheme !== 'mailto' && scheme !== 'tel') return '';
  }
  return stripped;
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

// Sub of the week — selectedSlug authoritatively selects a menu item when it matches.
//   - Match found, Active: show that menu item.
//   - Match found, Hidden or Coming Soon: hide the Sub of the Week section.
//   - selectedSlug empty OR no matching menu item: fall back to manual fields in sub-of-week.json.
async function renderSubOfWeek(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const data = await loadJSON('data/sub-of-week.json');
  if (!data) { el.style.display = 'none'; return; }

  let item = null;

  if (data.selectedSlug) {
    const menu = await loadJSON('data/menu.json');
    const items = (menu && menu.items) || [];
    const found = items.find(i => i.slug === data.selectedSlug);

    if (found) {
      // Slug matches a real menu item: that menu item is authoritative.
      // Do NOT fall back to legacy manual fields when slug points to an existing item.
      const status = found.status || (found.available === false ? 'Hidden' : 'Active');
      if (status === 'Active') {
        item = {
          name: found.name,
          description: found.description,
          price: found.price,
          image: found.image,
          promo: data.promo
        };
      } else {
        // Hidden or Coming Soon menu item: hide the section, no fallback.
        el.style.display = 'none';
        return;
      }
    }
    // If slug set but no matching menu item, fall through to legacy fallback below.
  }

  // Legacy fallback: only used when selectedSlug is empty OR doesn't match any menu item.
  if (!item && data.name) {
    item = {
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      promo: data.promo
    };
  }

  if (!item) { el.style.display = 'none'; return; }

  const hasImg = hasImage(item.image);
  const imgBlock = hasImg
    ? `<div class="sub-feature-image" style="background-image:url('${escapeHTML(item.image)}')"></div>`
    : '';
  const promo = item.promo
    ? `<span class="promo">${escapeHTML(item.promo)}</span>`
    : `<span class="promo">Sub of the Week</span>`;
  const price = item.price ? `<div class="price">${escapeHTML(fmtPrice(item.price))}</div>` : '';

  if (!hasImg) el.classList.add('no-image');

  el.innerHTML = `
    <div class="sub-feature-body">
      ${promo}
      <h3>${escapeHTML(item.name)}</h3>
      <p class="section-lede" style="margin:0">${escapeHTML(item.description || '')}</p>
      ${price}
    </div>
    ${imgBlock}
  `;
}

// Neighborhood Favorites — menu.json is the only source.
// Items are controlled by the showInNeighborhoodFavorites toggle on each menu item.
// data/featured.json is retained as a legacy backup but no longer mixed in here.
async function renderFeatured(targetId, limit) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const menu = await loadJSON('data/menu.json');

  const items = ((menu && menu.items) || [])
    .filter(i => i.showInNeighborhoodFavorites === true)
    .filter(i => {
      const status = i.status || (i.available === false ? 'Hidden' : 'Active');
      return status !== 'Hidden';
    })
    .map(i => ({
      slug: i.slug,
      name: i.name,
      description: i.description,
      price: i.price,
      image: i.image,
      sort: (i.sortOrder !== undefined ? i.sortOrder : (i.sort || 0)),
      status: i.status || 'Active',
    }))
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

// Weekly specials — menu.json weeklySpecialDays is the authoritative source for which days
// are "owned" by the menu system. specials.json is only used for days NOT claimed by any menu item.
// Hidden menu items still claim their assigned days (they just don't render) — preventing the
// legacy specials.json fallback from resurrecting a day that the owner has hidden.
async function renderSpecials(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const [menu, legacy] = await Promise.all([
    loadJSON('data/menu.json'),
    loadJSON('data/specials.json')
  ]);

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Build a quick lookup: legacy day → price (so we can use the special price even when item comes from menu.json)
  const legacyDayPrice = {};
  ((legacy && legacy.items) || []).forEach(s => {
    const label = (s.label || '').trim();
    if (label && s.price !== undefined) legacyDayPrice[label] = s.price;
  });

  // PASS 1: collect every day claimed by ANY menu item (regardless of status),
  // so a Hidden item's day can't be filled in by legacy specials.json.
  const daysClaimedByMenu = new Set();
  ((menu && menu.items) || []).forEach(i => {
    if (!Array.isArray(i.weeklySpecialDays)) return;
    i.weeklySpecialDays.forEach(day => {
      if (day) daysClaimedByMenu.add(String(day).toLowerCase());
    });
  });

  // PASS 2: build display rows from menu items that are NOT Hidden.
  // Hidden items contribute nothing visible but their day is already claimed (above).
  const fromMenu = [];
  ((menu && menu.items) || []).forEach(i => {
    const status = i.status || (i.available === false ? 'Hidden' : 'Active');
    if (status === 'Hidden') return;
    if (!Array.isArray(i.weeklySpecialDays) || !i.weeklySpecialDays.length) return;
    i.weeklySpecialDays.forEach(day => {
      const specialPrice = (legacyDayPrice[day] !== undefined) ? legacyDayPrice[day] : i.price;
      fromMenu.push({
        label: day,
        title: i.name,
        description: i.description,
        price: specialPrice,
        comingSoon: status === 'Coming Soon',
      });
    });
  });

  // Legacy fallback: only days that NO menu item has claimed.
  const fromLegacy = ((legacy && legacy.items) || [])
    .filter(s => {
      const label = (s.label || '').toLowerCase();
      return !daysClaimedByMenu.has(label);
    })
    .map(s => ({
      label: s.label,
      title: s.title,
      description: s.description,
      price: s.price,
      comingSoon: false,
    }));

  const all = [...fromMenu, ...fromLegacy];

  // Sort by weekday order; non-weekday labels (e.g. "Weekend Special") sort last
  all.sort((a, b) => {
    const ai = dayOrder.indexOf(a.label);
    const bi = dayOrder.indexOf(b.label);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  if (!all.length) {
    el.innerHTML = '<p class="empty">New specials coming this week.</p>';
    return;
  }

  el.innerHTML = all.map(s => `
    <article class="special-day">
      ${s.label ? `<div class="day">${escapeHTML(s.label)}</div>` : ''}
      <div class="dish">${escapeHTML(s.title)}${s.comingSoon ? '<span class="coming-soon-badge">Coming Soon</span>' : ''}</div>
      ${s.description ? `<p class="desc">${escapeHTML(s.description)}</p>` : ''}
      ${(s.price && !s.comingSoon) ? `<span class="price">${escapeHTML(fmtPrice(s.price))}</span>` : ''}
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
  visible.sort((a, b) => {
    const sa = (a.sortOrder ?? a.sort) || 0;
    const sb = (b.sortOrder ?? b.sort) || 0;
    return sa - sb || String(a.name).localeCompare(String(b.name));
  });

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

// Hero backdrop (homepage) — uses first menu Neighborhood Favorite with a photo
async function renderHeroBackdrop(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const menu = await loadJSON('data/menu.json');
  const candidates = ((menu && menu.items) || [])
    .filter(i => i.showInNeighborhoodFavorites && (i.status || 'Active') === 'Active');
  const first = candidates.find(i => hasImage(i.image));
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
    const safeBtnUrl = safeLink(post.buttonLink);
    const cta = (post.buttonText && safeBtnUrl)
      ? `<a class="community-card-cta" href="${escapeHTML(safeBtnUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(post.buttonText)} →</a>`
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
  if (!data) return;

  // Whole-section visibility (settings.sections)
  if (data.sections) {
    document.querySelectorAll('[data-section]').forEach(el => {
      const key = el.getAttribute('data-section');
      if (data.sections[key] === false) {
        el.style.display = 'none';
      }
    });
  }

  // Small "Coming Soon" notes (settings.comingSoon)
  // Element shows only when its corresponding flag is explicitly true.
  // Anything else (false, missing, null) = hidden.
  document.querySelectorAll('[data-coming-soon]').forEach(el => {
    const key = el.getAttribute('data-coming-soon');
    const flag = data.comingSoon && data.comingSoon[key];
    if (flag !== true) {
      el.style.display = 'none';
    }
  });
}
