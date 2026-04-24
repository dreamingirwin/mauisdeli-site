# Maui's Deli & Shop — Revision Notes (Community Board + Settings + Status)

This revision extends the existing Netlify + GitHub + Decap CMS site with the
new owner-editable sections we scoped. It does **not** rebuild anything — the
live site, admin login, GitHub workflow, and JSON data files all continue to
work exactly as before. All changes are additive or backward-compatible.

---

## Files changed

- `admin/config.yml` — rewritten for Netlify Git Gateway backend, with 9 collections instead of 7 (added Community Board, Settings) and extended Menu Items to use the new category list + `status` field
- `assets/site.js` — added `renderCommunityBoard()`, added `applySettings()`, updated `renderMenu()` and `renderFeatured()` to respect the new `status` field (Active / Hidden / Coming Soon), fixed a pre-existing apostrophe-escape bug in `renderHours()` that was silently breaking the entire file
- `assets/styles.css` — appended Community Board + Coming Soon badge styles with mobile responsive rules
- `index.html` — added Community Board section after "In the Shop" and before "Breakfast Coming Soon"; added `data-section` attributes to all toggleable homepage blocks; added `renderCommunityBoard()` and `applySettings()` calls; added Netlify identity widget script
- `specials.html` — added Community Board in list layout between Sub of the Week and the Stop-by-Maui's CTA; added identity widget
- `menu.html`, `gallery.html`, `contact.html` — added Netlify identity widget script for consistency

## New files

- `data/community.json` — seeded with one welcome post so the section doesn't look empty on first load
- `data/settings.json` — homepage section visibility toggles + coming-soon flags

## What the owner can now edit from the admin

The admin sidebar now shows 9 collections:

1. 🍽️ **Menu Items** — add/edit/hide items. New category list: Tacos, Burritos, Quesadillas, Taco Bowls, Empanadas, Loaded Fries, Sandwiches, Breakfast, Salads, Wraps, Coffee, Sides, Ice Cream, Desserts, Drinks, Specialties, Other. New Status dropdown: **Active / Hidden / Coming Soon**. Featured toggle to surface items in "Neighborhood Favorites" on the homepage.
2. ⭐ **Neighborhood Favorites** — the "currently loved" homepage cards
3. 🥪 **Sub of the Week**
4. 💸 **Weekly Specials**
5. 📋 **Community Board** (new) — title, description, category (Community / Shop Update / Local Event / Fundraiser / School / Sports / Announcement / Coming Soon), date, optional image, Pinned / Active / Archived toggles, optional button text + link, sort order
6. 📣 **Store News / Announcement** — the top banner on every page
7. 📷 **Gallery**
8. 🕐 **Hours**
9. ⚙️ **Settings** (new) — flip homepage sections on or off; control the Coming Soon labels for Breakfast, Ice Cream, and Beer & Wine

## Menu item status behavior

| Status | Public site behavior |
|---|---|
| Active | Item shows normally on the menu page with price |
| Hidden | Item does not render at all |
| Coming Soon | Item shows with an orange "Coming Soon" badge next to the name, price hidden |

The old `available: false` flag on existing menu items still works — it's treated as `Hidden`. So existing data doesn't need to be migrated.

## Community Board sort rules

1. Pinned posts first
2. Then by sort order (lower number = earlier)
3. Then by date (newer first)

Homepage shows up to 3 posts in a grid. What's New page shows all active posts in a list layout with more detail.

## Settings toggles

Each homepage section has a `data-section="<key>"` attribute. When `data/settings.json` has `sections.<key>: false`, the section is hidden via `display: none`. Keys: `featured`, `subOfWeek`, `specials`, `shop`, `community`, `breakfastComingSoon`.

## Test checklist

### Public site

- [ ] Homepage loads
- [ ] Community Board appears between "In the Shop" and "Breakfast Coming Soon"
- [ ] Only active, non-archived posts show on homepage (max 3)
- [ ] Pinned posts appear first
- [ ] Menu page still loads all categories
- [ ] Menu items marked "Hidden" in admin don't appear on the menu page
- [ ] Menu items marked "Coming Soon" in admin show with an orange badge
- [ ] Sub of the Week still works
- [ ] Weekly Specials still works
- [ ] Gallery still works
- [ ] Mobile layout still works (hero stacks, community cards stack to 1 column)
- [ ] What's New page shows the full Community Board in list layout

### Admin

- [ ] `yoursite.netlify.app/admin/` loads the Decap login
- [ ] Login with Netlify Identity still works
- [ ] All 9 collections visible in the sidebar (Menu Items, Neighborhood Favorites, Sub of the Week, Weekly Specials, Community Board, Store News, Gallery, Hours, Settings)
- [ ] Can add a menu item and see it appear on the public menu page after publish
- [ ] Can change a price and see it update
- [ ] Can set a menu item status to "Hidden" and confirm it disappears from the public site
- [ ] Can set a menu item status to "Coming Soon" and confirm it shows with badge
- [ ] Can add a Community Board post, pin it, and see it appear on the homepage
- [ ] Can upload an image via the admin and attach it to a menu item
- [ ] Can toggle the Community Board off in Settings and confirm it disappears from the homepage
- [ ] Can toggle the Community Board back on

## Deploy steps

1. Download `mauisdeli.zip` from Claude
2. Extract it on your computer
3. Go to your GitHub repo (`dreamingirwin/mauisdeli-site`)
4. For each changed file, upload the new version (GitHub will offer "Replace existing file" on upload)
5. For the two new files in `data/` (`community.json` and `settings.json`), upload them the same way
6. Commit the changes
7. Netlify auto-deploys within ~30 seconds
8. Visit `yoursite.netlify.app/admin/` and log in — you should see the 9 collections with emoji labels

## Known limitations / things the owner should know

- **Alert bell** — your prompt mentioned a dashboard bell icon with alerts ("Sub of the Week older than 7 days," etc). Decap CMS doesn't support custom dashboard widgets, so this piece is not wired. The collections themselves all work; it's just the notification-on-the-dashboard UI that isn't there. The owner will see what's active vs hidden in the collection summaries.
- **Dashboard stat cards** (the "68 Active Menu Items" / "6 Hidden Items" cards from the mockup) — same reason. Not a Decap feature. If you ever want this, it'd be a separate custom-admin build.
- **Image library reuse** — Decap doesn't have a built-in "attach the same uploaded image to 5 places" feature. The owner uploads an image for a menu item, then to reuse it elsewhere, they select "Choose from uploads" when adding the next item's image. Same image, no re-upload. This is the standard Decap workflow.

## Publishing from admin — how it actually works

When the owner hits "Publish" in the admin:

1. Decap commits the change to GitHub via Git Gateway (using their Netlify Identity credentials)
2. Netlify sees the new commit and automatically rebuilds the site
3. Within ~30 seconds, the public site reflects the change

No build command, no server, no database. Static files all the way through.
