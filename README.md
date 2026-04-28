# Maui's Deli & Shop — Website

A lightweight, CMS-powered static website for Maui's Deli & Shop in Wrentham, MA.

- **Stack:** Static HTML + CSS + vanilla JS + JSON. No frameworks.
- **Host:** Netlify (free tier) — auto-deploys from GitHub.
- **Source control:** GitHub repo holds all site files.
- **Owner login:** Netlify Identity handles authentication for `/admin/`.
- **Publishing:** Git Gateway lets Decap CMS commit edits back to GitHub, which triggers a Netlify rebuild.
- **CMS:** Decap CMS (free, open source) — admin area at `/admin/` is called **Maui's Office**.
- **Domain:** mauisdeli.com

## Project structure

```
mauisdeli/
├── index.html              Homepage
├── menu.html               Full menu (dynamic)
├── specials.html           Weekly specials + sub of the week
├── gallery.html            Food photo gallery with lightbox
├── contact.html            Hours, address, map
├── _headers                Netlify response headers (security policy)
│
├── assets/
│   ├── styles.css          All site styles
│   ├── site.js             Data loading + rendering
│   ├── images/             Brand assets + baked-in food photos
│   │   ├── flame.svg
│   │   ├── turkey-club-plate.jpg
│   │   └── turkey-club.jpg
│   └── uploads/            CMS-uploaded photos land here
│
├── data/                   ← Everything the owner edits
│   ├── menu.json           Source of truth for menu, favorites, specials
│   ├── sub-of-week.json    Sub of the Week pointer (selectedSlug)
│   ├── community.json      Community Board posts
│   ├── announcement.json   Top banner
│   ├── gallery.json        Gallery photos
│   ├── hours.json          Open hours
│   ├── settings.json       Homepage section toggles
│   ├── specials.json       Legacy fallback (off-menu specials)
│   └── featured.json       Legacy backup (no longer read by site)
│
├── admin/                  ← "Maui's Office"
│   ├── index.html          Decap CMS entry point
│   └── config.yml          CMS collections & fields
│
├── DEPLOY.md               Full deploy guide
├── OWNER-GUIDE.md          Simple guide for the owner
└── README.md               This file
```

## Quickstart (local preview)

```bash
cd mauisdeli
python3 -m http.server 8000
# Visit http://localhost:8000
```

For local CMS testing:
```bash
npx decap-server
# In another terminal, run the static server above.
# Then visit http://localhost:8000/admin/
```

## Deployment

See **DEPLOY.md** for the full guide.

## What's editable via the CMS

The admin area at `/admin/` is called **Maui's Office**. Login is via Netlify Identity (Invite-only — only the owner and admins should be added).

| Section | File | What it controls |
|---|---|---|
| Menu Items | `data/menu.json` | Every item on the menu page. Also controls Neighborhood Favorites (via the "Show in Neighborhood Favorites" toggle) and Weekly Specials (via the "Weekly Special days" picker) on each item. |
| Sub of the Week | `data/sub-of-week.json` | Picks one menu item by slug to spotlight on the homepage and specials page. |
| Weekly Specials (legacy) | `data/specials.json` | Fallback for daily specials that aren't on the regular menu (e.g. Wednesday Cheese Burger). Days where a menu item is assigned override this file. |
| Community Board | `data/community.json` | Posts shown on the homepage and What's New page. |
| Store News / Announcement | `data/announcement.json` | Top banner on every page. |
| Gallery Photos | `data/gallery.json` | Gallery page photo grid. |
| Hours | `data/hours.json` | Open hours on the Visit page. |
| Settings | `data/settings.json` | Homepage section visibility toggles + coming-soon flags. |

`data/featured.json` is kept in the repo as a backup file but is no longer
fetched by the public site or editable in Maui's Office. Neighborhood Favorites
are now controlled exclusively through Menu Items.

Everything else (layout, colors, phone number, address) is hard-coded — intentionally, so the owner can't accidentally break the site.
