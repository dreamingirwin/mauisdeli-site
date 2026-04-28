# Maui's Deli & Shop — Security & Cleanup Pass (v5)

**This is a focused security/cleanup pass — not a feature change.** Layered on top
of the working v4 build. All admin-published content (menu items, prices,
Neighborhood Favorites toggles, Sub of the Week, Weekly Specials, Community
Board posts, Gallery, Hours, Settings, uploaded images) is preserved exactly
as-is. Public design and layout are unchanged.

The goals: add Netlify security headers, pin the Decap CMS version, ensure the
Netlify Identity widget is loaded, harden one admin-controlled link field, and
align all documentation with the actual current stack (Netlify + GitHub +
Netlify Identity + Git Gateway + Decap CMS).

---

## What changed

### 1. `_headers` (NEW, root)
Created a root-level Netlify `_headers` file with:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `Content-Security-Policy-Report-Only: …` (kept in **report-only** mode for
  this pass, not enforced — gives time to monitor for false positives before
  switching to enforced CSP)

CSP allowlist is scoped to what the site actually loads:
- Scripts: self, inline, `identity.netlify.com`, `unpkg.com` (Decap)
- Styles: self, inline, `fonts.googleapis.com`
- Fonts: self, `fonts.gstatic.com`
- Images: self, `data:`, any https
- Connect: self, `identity.netlify.com`, `api.netlify.com` (Git Gateway)
- Frames: `www.google.com` (contact-page Maps embed), `identity.netlify.com`
- `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`,
  `form-action 'self' https://identity.netlify.com`

### 2. `admin/index.html` (EDIT)
Four small, related changes — each a single-line edit:

- Page `<title>` changed from `"Maui's Deli — Admin"` to `"Maui's Office"`.
- Decap CMS pinned: `decap-cms@^3.1.10` → `decap-cms@3.11.0` (the exact version
  unpkg was already serving via the caret range — locks the admin to that exact
  build instead of silently picking up future 3.x releases).
- Netlify Identity widget script tag added — the widget is what powers the login
  experience and was previously missing from this file.
- Comment updated from `Works on Cloudflare Pages.` to
  `Decap CMS powered by Netlify Identity + Git Gateway.`

### 3. `assets/site.js` (EDIT)
Two surgical changes:

- Added a small `safeURL()` helper next to the existing `escapeHTML()` and
  `hasImage()` helpers. It validates admin-controlled URL strings against an
  allowlist: relative paths (`specials.html#community`), local absolute paths
  (`/contact.html`), and explicit `https://` only. Anything else (including
  `javascript:`, `data:`, `vbscript:`, `file:`, `http://`, `mailto:`, `tel:`,
  protocol-relative `//evil.com`, non-strings, and empties) returns `''`,
  signalling the caller to skip rendering the link.
- Applied `safeURL()` to `post.buttonLink` in `renderCommunityBoard`. The
  `<a class="community-card-cta" …>` tag is only emitted when both the button
  text and a safe URL are present, otherwise no link is rendered. Also tightened
  the cross-tab link relationship from `rel="noopener"` to
  `rel="noopener noreferrer"`.

No other rendering function was changed. Menu, Neighborhood Favorites, Sub of
the Week, Weekly Specials, Gallery, Hero Backdrop, Hours, Announcement, and
Settings logic is byte-identical to v4.

### 4. `README.md` (EDIT)
- Host changed from "Cloudflare Pages (free tier)" to "Netlify (free tier)".
- CMS line changed from "logs in via GitHub" to "logs in via **Netlify Identity**;
  Decap publishes through **Git Gateway**".
- Added `_headers` to the project structure tree.
- Refreshed the "What's editable via the CMS" table to match the current 8
  admin collections (was listing legacy "Featured Dishes" as a separate row).
- Added a short "Security headers" section pointing at `_headers`.

### 5. `OWNER-GUIDE.md` (EDIT)
- Login flow: replaced "Click **Login with GitHub**" with the Netlify Identity
  flow ("Click **Log In** … Enter the email and password from your invite").
- Branded the admin area as **Maui's Office** throughout.
- Refreshed the section list from 7 → 8 to match the current admin (removed the
  legacy "Featured Dishes" section, added Settings, updated Sub of the Week to
  describe the menu-item picker rather than free-form fields, replaced
  "Available today?" — which no longer exists — with the current Status field).
- Public brand "Maui's Deli & Shop" preserved on the public-facing site.

### 6. `OWNER-CHECKLIST.md` (EDIT)
- Section 1 ("Admin CMS login wiring") rewritten: removed all references to
  GitHub OAuth Apps, the `decap-proxy` Cloudflare Worker, `repo:`/`base_url:`
  fields in `admin/config.yml`, and replaced with the four real Netlify
  Identity + Git Gateway checks.
- Chicken Tenders section (Section 2) updated to use current Status / Show in
  Neighborhood Favorites toggles instead of the old "Featured Dishes" admin.
- Photo upload guidance (Section 3) updated to point at Menu Items (the actual
  source of truth) instead of the now-removed Featured Dishes collection.
- Section 8 ("Point the domain") rewritten for Netlify (Domain management,
  Netlify DNS / CNAME or A records, Let's Encrypt) instead of Cloudflare Pages
  custom domains.

### 7. `DEPLOY.md` (EDIT — full rewrite)
The previous DEPLOY.md was end-to-end Cloudflare Pages + GitHub OAuth + a
hand-rolled `decap-proxy` Cloudflare Worker. None of that matches the actual
running stack. The rewrite covers:

- Step 1: Push to GitHub (unchanged in spirit)
- Step 2: Deploy to **Netlify** (replaces Cloudflare Pages)
- Step 3: Enable **Netlify Identity** + **Git Gateway** (replaces the GitHub
  OAuth App + Cloudflare Worker steps entirely)
- Step 4: Point the custom domain via Netlify
- Local testing, "what happens when owner saves," and troubleshooting all
  rewritten to reflect Netlify-side reality.

### 8. `CHANGES-v5.md` (NEW)
This file.

---

## What did NOT change (intentional preservation)

- `data/menu.json` — every menu item, price, status, slug, sort, and image
  reference left exactly as the admin published them.
- `data/community.json` — both Community Board posts preserved verbatim.
- `data/featured.json` — preserved as legacy backup (still not read by the site).
- `data/sub-of-week.json`, `data/specials.json`, `data/announcement.json`,
  `data/gallery.json`, `data/hours.json`, `data/settings.json` — all unchanged.
- `assets/uploads/` — every CMS-uploaded photo preserved.
- `assets/images/` — brand assets and baked-in food photos preserved.
- `assets/styles.css` — unchanged.
- `index.html`, `menu.html`, `specials.html`, `gallery.html`, `contact.html` —
  unchanged.
- `admin/config.yml` — unchanged. Collections, fields, hints, and labels all
  preserved as Irwin set them up.
- Netlify Identity setup, Git Gateway setup, Decap collections — preserved.
- Public brand name on every public page — still "Maui's Deli & Shop".

---

## Stale repo artifact noticed (not modified in this pass)

- `wrangler.jsonc` at the repo root is a Cloudflare Workers config file from
  the prior Cloudflare Pages plan. Netlify ignores it, so it's not breaking
  anything, but it has no use on the current stack. Recommend deleting it from
  the GitHub repo as a one-line follow-up:

  ```
  git rm wrangler.jsonc && git commit -m "remove obsolete cloudflare config"
  ```

  Not deleted in this pass per the spec ("return only the specific files that
  need to be added or edited").

---

## Files changed in this pass

| File | What |
|---|---|
| `_headers` | NEW — Netlify security headers (root) |
| `admin/index.html` | Title → "Maui's Office", pin Decap to 3.11.0, add Netlify Identity widget, fix Cloudflare comment |
| `assets/site.js` | Add `safeURL()` helper; apply to community `buttonLink`; tighten `rel` on cross-tab link |
| `README.md` | Stack references corrected to Netlify + Identity + Git Gateway; section list refreshed |
| `OWNER-GUIDE.md` | Login flow for Netlify Identity; "Maui's Office" branding; current section list |
| `OWNER-CHECKLIST.md` | Section 1 (login wiring) and Section 8 (domain) rewritten for Netlify |
| `DEPLOY.md` | Full rewrite for Netlify + Identity + Git Gateway |
| `CHANGES-v5.md` | This file |

## Files NOT changed in this pass

| File | Status |
|---|---|
| All `data/*.json` | Preserved exactly as the admin published them |
| All `assets/uploads/*` | Preserved |
| All `assets/images/*` | Preserved |
| `assets/styles.css` | Preserved |
| `admin/config.yml` | Preserved |
| `index.html`, `menu.html`, `specials.html`, `gallery.html`, `contact.html` | Preserved |
| `CHANGES-v2.md`, `CHANGES-v3.md`, `CHANGES-v4.md` | Preserved (already accurate) |
| `wrangler.jsonc` | Not modified (recommend deleting separately — see above) |

---

## Rollback

Every change is in Git. To roll back this pass:
1. Revert the commit in your GitHub repo, OR
2. Restore the previous versions of the files listed in "Files changed."

Because no `data/*.json` and no `assets/uploads` files were touched, partial
rollback of just the documentation or just the code changes is safe.

---

## Verification suggestions for after deploy

1. Open the live site. DevTools → Network → click any HTML response → confirm
   the security response headers show up (X-Frame-Options, etc.) and the CSP
   is present as `Content-Security-Policy-Report-Only`.
2. Open the browser console on each page. CSP report-only mode prints any
   would-be violations as warnings — read those, decide if they're false
   positives, then either add the source to the CSP or fix the page. Once a
   week of clean console logs passes, switch the header name from
   `Content-Security-Policy-Report-Only` to `Content-Security-Policy` to
   enforce.
3. Open `/admin/` → confirm it says "Maui's Office" in the browser tab, the
   Netlify Identity login appears, login works, and Publish on a small test
   edit (e.g. toggle and untoggle a Status) commits through Git Gateway.
4. Open the Community Board admin entry, paste `javascript:alert(1)` into the
   Button link field on a test post, save, and confirm the live site does not
   render a clickable button (the safe URL filter should drop it).
