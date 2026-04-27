# Maui's Deli & Shop — Revision Notes (Menu as Source of Truth + Copy Cleanup)

This revision is a **non-destructive migration** layered on top of the working
v2 site. Netlify deployment, GitHub workflow, Decap CMS login, public design,
and existing data files all continue to work. No site rebuild.

---

## PART 1 — Homepage copy cleanup (3 targeted text edits)

In `index.html` only, three specific strings updated:

| Where | Was | Now |
|---|---|---|
| Intro paragraph | `Wrentham fresh-made food, coffee, shop essentials,` | `Wrentham delicious food, coffee, shop essentials,` |
| Feature card | `Fresh-Made Food` / `Breakfast, lunch & dinner made with care.` | `House-made flavor` / `Breakfast, lunch & dinner — built on our own recipes` |
| Pillar card (egg icon) | `<h3>Fresh-made food</h3>` | `<h3>Hot off the grill favorites</h3>` |

The hero headline `"Fresh-made food. Neighborhood convenience. Glad to be here."`
was **deliberately left alone** per spec. Other "fresh-made food" mentions
elsewhere on the homepage and across other pages were also left alone — only the
three specified strings were changed.

---

## PART 2 — Menu Items as the source of truth

### What changed

`data/menu.json` is now the canonical source for which items appear in
**Neighborhood Favorites**, **Weekly Specials**, **Sub of the Week**, and
the **Menu page**. Each menu item now has these fields:

```jsonc
{
  "slug": "club-sandwich",                    // stable ID
  "name": "Club Sandwich",
  "category": "Sandwiches",
  "description": "...",
  "price": 14,
  "image": "assets/images/turkey-club.jpg",
  "status": "Active",                         // Active | Hidden | Coming Soon
  "showInNeighborhoodFavorites": true,        // ← controls homepage Favorites
  "weeklySpecialDays": ["Monday", "Friday"],  // ← controls Weekly Specials placement
  "sortOrder": 0
}
```

### Sub of the Week now picks a menu item

`data/sub-of-week.json` has a new `selectedSlug` field that points at one menu
item by slug. The site fetches the item's name, description, price, and photo
from `menu.json` at render time — so editing the menu item updates the homepage
spotlight automatically.

```json
{
  "selectedSlug": "club-sandwich",
  "promo": "Sub of the Week",
  "name": "Turkey Club",          // legacy fallback, used only if selectedSlug is empty
  "description": "...",            // (or doesn't match a menu item)
  "price": 14,
  "image": "assets/images/turkey-club.jpg"
}
```

### Backward compatibility (the careful part)

The old `data/featured.json` and `data/specials.json` files are **kept as
legacy fallbacks**, not deleted. The reason: some entries don't map cleanly
to a single menu item.

- **`featured.json` legacy items kept:** Tacos, Quesadilla, Taco Bowl, Burrito,
  Empanadas — these are *category* entries that represent the whole group
  (e.g. "Tacos" with three meat choices). Forcing them onto a single menu item
  would lose meaning. They render on the homepage *only if* no menu item
  with the same name exists.
- **`specials.json` legacy items kept:** Wednesday "Cheese Burger" and
  Friday "Tuna Salad" — these don't exist on the menu boards as menu items.
  They render on those days *only if* no menu item is assigned to that weekday.

The render order is: **menu.json first, then legacy fallback for what menu doesn't cover.**

### Public site rendering rules (now enforced)

| Section | What it shows |
|---|---|
| Menu page | Menu items where `status` is Active or Coming Soon |
| Neighborhood Favorites (homepage) | Menu items where `showInNeighborhoodFavorites: true` AND not Hidden, plus legacy `featured.json` items not duplicated by name |
| Weekly Specials | Menu items where `weeklySpecialDays` includes a weekday AND not Hidden, plus legacy `specials.json` for days not covered |
| Sub of the Week | The menu item matching `selectedSlug` (if Active), else legacy fallback fields |
| Hidden items | Do not appear anywhere |
| Coming Soon items | Show with orange badge, no price |

### Special pricing on weekday specials

When a menu item is rendered as a weekly special, the JS uses the price from
`specials.json` (typically $9.99) for that day if available, falling back to
the menu item's regular price otherwise. This preserves the existing $9.99
chalkboard behavior without expanding the schema with a separate
"specialPrice" field.

---

## Files changed

- `index.html` — three copy strings updated (Part 1)
- `data/menu.json` — schema extended; all 38 items migrated with new fields
- `data/sub-of-week.json` — added `selectedSlug` (legacy fields kept as fallback)
- `admin/config.yml` — Menu Items collection extended with new fields; Sub of
  the Week converted to a `relation` widget pointing at menu slugs;
  Neighborhood Favorites and Weekly Specials collections relabeled
  "(legacy)" with descriptions explaining the new model
- `assets/site.js` — `renderFeatured`, `renderSpecials`, `renderSubOfWeek`,
  `renderHeroBackdrop`, `renderMenu` updated to read menu.json as primary,
  legacy files as fallback. Special-day price override added.

## Files NOT changed

- `data/featured.json`, `data/specials.json` — kept for legacy fallback
- `data/community.json`, `data/announcement.json`, `data/gallery.json`,
  `data/hours.json`, `data/settings.json` — untouched
- `menu.html`, `specials.html`, `gallery.html`, `contact.html` — untouched
- `assets/styles.css` — untouched
- `OWNER-GUIDE.md` — kept as-is (older but still functional reference)

---

## Migration result for current data

**4 menu items now flagged as Neighborhood Favorites:**
- Club Sandwich, Philly Cheesesteak, Loaded Fries, Chicken Tenders

**3 menu items now have weekday assignments:**
- Meatball Sub → Monday
- Chicken Tacos → Tuesday
- Chicken Quesadilla → Thursday

**Sub of the Week:** points at `club-sandwich` slug.

**Items that remain in legacy files** (rendered as fallback for entries that
don't correspond to a single menu item):
- `featured.json`: Turkey Club, Tacos, Quesadilla, Cheesesteak, Taco Bowl,
  Burrito, Empanadas (category-level entries)
- `specials.json`: Wednesday Cheese Burger, Friday Tuna Salad (off-menu specials)

---

## What the owner does going forward

For most edits, the owner now goes to **🍽️ Menu Items** and:

- Toggles **Show in Neighborhood Favorites** to add/remove items from the homepage
- Picks **Weekly Special days** to assign daily specials
- Sets **Status** to Hidden or Coming Soon as needed
- For Sub of the Week, opens **🥪 Sub of the Week** and picks an item from the dropdown

The legacy collections (Neighborhood Favorites, Weekly Specials) are still in
the admin sidebar, but their descriptions now say "(legacy)" and explain that
they're for fallback entries only.

---

## Testing the migration

After deploy, verify in the public site:
- [ ] Homepage Neighborhood Favorites shows Turkey Club image (Club Sandwich) plus the legacy group entries
- [ ] Homepage Weekly Specials shows all 5 days at $9.99
- [ ] Homepage Sub of the Week shows Turkey Club (sourced from Club Sandwich menu item)
- [ ] Menu page renders all 38 active items including Chicken Tenders
- [ ] Hidden items don't appear

In the admin, verify:
- [ ] Menu Items collection has the new fields visible
- [ ] Sub of the Week shows a dropdown of menu items (the relation widget)
- [ ] Legacy collections show "(legacy)" in their label
- [ ] Marking a menu item Hidden makes it disappear from public site within 30s of publish

---

## Rollback (if needed)

Every change is in Git. To roll back to v2:
1. Find the commit before this migration in the GitHub repo
2. Click "Browse files" on that commit
3. Use GitHub's "Revert" feature, OR
4. Restore the previous menu.json, sub-of-week.json, admin/config.yml, and
   assets/site.js from that commit

The old data files (`featured.json`, `specials.json`) are still in place and
fully functional, so even partial rollback is safe.
