# Maui's Deli & Shop — Website

A lightweight, CMS-powered static website for Maui's Deli & Shop in Wrentham, MA.

- **Stack:** Static HTML + CSS + vanilla JS + JSON. No frameworks.
- **Host:** Cloudflare Pages (free tier).
- **CMS:** Decap CMS (free, open source) — logs in via GitHub.
- **Domain:** mauisdeli.com

## Project structure

```
mauisdeli/
├── index.html              Homepage
├── menu.html               Full menu (dynamic)
├── specials.html           Weekly specials + sub of the week
├── gallery.html            Food photo gallery with lightbox
├── contact.html            Hours, address, map
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
│   ├── menu.json
│   ├── specials.json
│   ├── sub-of-week.json
│   ├── featured.json
│   ├── gallery.json
│   ├── announcement.json
│   └── hours.json
│
├── admin/
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

| Section | File | What it controls |
|---|---|---|
| Menu Items | `data/menu.json` | Every item on the menu page |
| Sub of the Week | `data/sub-of-week.json` | Homepage + specials page spotlight |
| Weekly Specials | `data/specials.json` | $9.99 daily specials list |
| Community Note | `data/announcement.json` | Top banner on every page |
| Featured Dishes | `data/featured.json` | Homepage "House Favorites" grid |
| Gallery Photos | `data/gallery.json` | Gallery page photo grid |
| Hours | `data/hours.json` | Open hours on the Visit page |

Everything else (layout, colors, phone number, address) is hard-coded — intentionally, so the owner can't accidentally break the site.
