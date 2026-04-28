# Maui's Deli & Shop — Website

A lightweight, CMS-powered static website for Maui's Deli & Shop in Wrentham, MA.

- **Stack:** Static HTML + CSS + vanilla JS + JSON. No frameworks.
- **Host:** Netlify (free tier).
- **Repo:** GitHub (source of truth for all files and CMS-published changes).
- **CMS:** Decap CMS (free, open source) at `/admin/` — owner logs in via **Netlify Identity**; Decap publishes through **Git Gateway**.
- **Domain:** mauisdeli.com

## Project structure

```
mauisdeli/
├── index.html              Homepage
├── menu.html               Full menu (dynamic)
├── specials.html           Weekly specials + sub of the week + community board
├── gallery.html            Food photo gallery with lightbox
├── contact.html            Hours, address, map
│
├── _headers                Netlify security headers (root-level)
│
├── assets/
│   ├── styles.css          All site styles
│   ├── site.js             Data loading + rendering
│   ├── images/             Brand assets + baked-in food photos
│   └── uploads/            CMS-uploaded photos land here
│
├── data/                   ← Everything the owner edits
│   ├── menu.json
│   ├── specials.json
│   ├── sub-of-week.json
│   ├── featured.json       (legacy backup; not read by site)
│   ├── community.json
│   ├── gallery.json
│   ├── announcement.json
│   ├── hours.json
│   └── settings.json
│
├── admin/                  ← "Maui's Office" (private)
│   ├── index.html          Decap CMS entry point + Netlify Identity widget
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

See **DEPLOY.md** for the full guide. Short version: push to GitHub, Netlify auto-deploys, Decap CMS publishes back through Git Gateway as Netlify Identity users.

## What's editable via the CMS

| Section | File | What it controls |
|---|---|---|
| 🍽️ Menu Items | `data/menu.json` | Every item on the menu page. Also the source of truth for Neighborhood Favorites (per-item toggle) and Weekly Specials (per-item day picker). |
| 🥪 Sub of the Week | `data/sub-of-week.json` | Picks one menu item to spotlight, with manual fallback fields. |
| 💸 Weekly Specials (legacy) | `data/specials.json` | Off-menu daily specials. Only fills days no menu item has claimed. |
| 📋 Community Board | `data/community.json` | Neighborhood posts, shop updates, local events. |
| 📣 Store News / Announcement | `data/announcement.json` | Top banner on every page. |
| 📷 Gallery Photos | `data/gallery.json` | Gallery page photo grid. |
| 🕐 Hours | `data/hours.json` | Open hours on the contact page. |
| ⚙️ Settings | `data/settings.json` | Homepage section toggles + coming-soon labels. |

Everything else (layout, colors, phone number, address) is hard-coded — intentionally, so the owner can't accidentally break the site.

## Security headers

Live security headers are defined in the root `_headers` file and served by Netlify. Content-Security-Policy is currently in **report-only** mode while the site is being verified end-to-end; switch to enforced CSP after monitoring shows no false positives.
