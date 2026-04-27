# Maui's Deli & Shop — Fix Pass Notes (Neighborhood Favorites cleanup)

**This is a focused fix pass — not a rebuild.** Layered on top of the working v3
build. Netlify deployment, GitHub workflow, Decap CMS login, public design,
Sandwiches/menu page behavior, and all v3 architecture remain intact.

The single goal: make Menu Items the **only** source of truth for the
homepage Neighborhood Favorites section, and stop `data/featured.json` from
secretly competing with it.

---

## What changed

### `assets/site.js` — 4 render functions tightened

1. **`renderFeatured`** (Neighborhood Favorites)
   - Before: read both `data/menu.json` AND `data/featured.json`, then merged.
   - After: reads `data/menu.json` only. `featured.json` is no longer fetched.
   - Items shown = those with `showInNeighborhoodFavorites: true` AND status
     not Hidden, sorted by `sortOrder`.

2. **`renderSubOfWeek`** (homepage spotlight)
   - Before: if `selectedSlug` matched a Hidden menu item, the function
     silently fell through to the legacy manual fields in `sub-of-week.json`.
   - After: if `selectedSlug` matches an existing menu item, that match is
     authoritative. Active = render. Hidden or Coming Soon = hide the section
     entirely (no fallback to manual fields). Manual fallback only fires when
     `selectedSlug` is empty OR doesn't match any menu item slug at all.

3. **`renderSpecials`** (Weekly Specials list)
   - Before: a Hidden menu item didn't render its day, so legacy
     `specials.json` could resurrect that day from the fallback path.
   - After: every menu item with `weeklySpecialDays` claims those days even
     when the item is Hidden. The legacy fallback only fills days that no
     menu item has claimed at all. Hidden items still don't render — but the
     day stays empty rather than being "filled in" from specials.json.

4. **`renderHeroBackdrop`** (homepage hero image source)
   - Before: read both menu.json and featured.json.
   - After: reads menu.json only. Aligned with renderFeatured for consistency.

### `admin/config.yml` — Neighborhood Favorites collection removed

The `featured` collection (labeled "⭐ Neighborhood Favorites (legacy)") is
gone from the admin sidebar. The Decap admin now shows **8 collections**
instead of 9:

1. 🍽️ Menu Items
2. 🥪 Sub of the Week
3. 💸 Weekly Specials (legacy)
4. 📋 Community Board
5. 📣 Store News / Announcement
6. 📷 Gallery Photos
7. 🕐 Hours
8. ⚙️ Settings

There are no fake controls for Neighborhood Favorites. The owner manages all
of them by toggling **Show in Neighborhood Favorites** on each menu item.

### `data/menu.json` — Club Sandwich image updated

Set `image` field on the `club-sandwich` item to
`assets/images/turkey-club.jpg`. Both Sub of the Week (which selects this
slug) and Neighborhood Favorites (which features this item) now display the
real food image.

---

## What did NOT change (preserved intentionally)

- `data/featured.json` is **kept in the repo as a backup file** but is no
  longer fetched by the public site or editable in the admin. Per spec:
  "Do not delete it." If a future need calls for it, the data is still there.
- Menu page layout, Sandwiches category, Community Board, Store News,
  Gallery, Hours, Settings — untouched.
- Public homepage design — untouched.
- Netlify Identity + Git Gateway login flow — untouched.
- All v3 schema fields on menu items (`slug`, `status`,
  `showInNeighborhoodFavorites`, `weeklySpecialDays`, `sortOrder`) — kept.
- `data/sub-of-week.json` schema — kept (legacy manual fallback fields still
  there for the empty-slug case).
- `data/specials.json` — kept (still used for days no menu item has claimed,
  e.g. Wednesday Cheese Burger and Friday Tuna Salad).

---

## Verification — all 8 spec test cases pass

| # | Spec test | Result |
|---|---|---|
| 1 | Editing menu item NAME updates Favorites | ✓ |
| 2 | Editing menu item PRICE updates Favorites | ✓ |
| 3 | Toggling showInNeighborhoodFavorites ON → item appears | ✓ |
| 4 | Toggling showInNeighborhoodFavorites OFF → item disappears | ✓ |
| 5 | Setting Hidden removes from Menu / Favorites / Specials / Sub | ✓ |
| 6 | Club Sandwich / Sub of the Week shows turkey-club image | ✓ |
| 7 | featured.json no longer controls homepage favorites | ✓ |
| 8 | Specials cannot resurrect hidden items via specials.json | ✓ |

**Plus:**
- All 9 JSON files valid
- YAML config valid (8 collections, was 9)
- All 25 site endpoints return 200
- JS syntax valid

---

## Files changed in this pass

| File | What |
|---|---|
| `assets/site.js` | 4 render functions tightened (Featured, SubOfWeek, Specials, HeroBackdrop) |
| `admin/config.yml` | Neighborhood Favorites collection removed |
| `data/menu.json` | Club Sandwich now points at `assets/images/turkey-club.jpg` |
| `CHANGES-v4.md` | This file |

---

## Files NOT changed in this pass

| File | Status |
|---|---|
| `data/featured.json` | Preserved as backup (unused by site) |
| `data/sub-of-week.json` | Unchanged |
| `data/specials.json` | Unchanged |
| `data/menu.json` (other items) | Unchanged |
| `data/community.json`, `announcement.json`, `gallery.json`, `hours.json`, `settings.json` | Unchanged |
| `index.html`, `menu.html`, `specials.html`, `gallery.html`, `contact.html` | Unchanged |
| `assets/styles.css` | Unchanged |
| `admin/index.html` | Unchanged |

---

## Observable result on the homepage

Neighborhood Favorites now renders exactly 4 cards, all sourced from menu.json:

- Club Sandwich · $14 · turkey-club.jpg
- Philly Cheesesteak · $12 (placeholder image)
- Loaded Fries · $15 (placeholder image)
- Chicken Tenders · "Ask about today's price." (placeholder image)

The 7 group entries that were previously rendering from featured.json fallback
(Tacos, Quesadilla, Cheesesteak, Taco Bowl, Burrito, Empanadas, Turkey Club)
no longer appear on the homepage. The owner can re-feature any of them by
going to Menu Items, finding the corresponding item (e.g. "Steak Tacos" or
"Steak Quesadilla"), and toggling "Show in Neighborhood Favorites" ON.

---

## Rollback

Every change is in Git. To roll back this fix pass:
1. Revert the commit in your GitHub repo, OR
2. Restore the previous versions of `assets/site.js`, `admin/config.yml`,
   and `data/menu.json` from the previous commit.

`data/featured.json` and `data/sub-of-week.json` are unchanged in this pass,
so partial rollback is safe.
