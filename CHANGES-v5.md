# Maui's Deli & Shop — Security & Documentation Cleanup Pass

This is a focused security hardening + documentation cleanup pass on top of the
working v4 site (the version downloaded from GitHub after recent admin edits).
No public design changes, no logic changes, no data changes. The Netlify
deployment, GitHub repo, Netlify Identity, Git Gateway, Decap CMS, and all
JSON content files continue to work exactly as before.

---

## Files added (1)

### `_headers` (new, at repo root)
Netlify reads this file automatically and applies the listed headers to every
response. Contents match the spec exactly:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `Content-Security-Policy-Report-Only: ...` (kept in **report-only mode** per
  spec — observe the Netlify deploy/console logs for a few weeks before
  flipping to enforced)

The CSP allows the resources the site genuinely needs:
- `script-src` includes `identity.netlify.com` (Identity widget) and
  `unpkg.com` (Decap CMS bundle)
- `style-src` and `font-src` include `fonts.googleapis.com` /
  `fonts.gstatic.com`
- `frame-src` includes `www.google.com` (embedded map) and
  `identity.netlify.com`
- `connect-src` includes `identity.netlify.com` and `api.netlify.com`

---

## Files changed (6)

### `admin/index.html`
- `<title>` changed from "Maui's Deli — Admin" → **"Maui's Office"**
- Outdated comment "Works on Cloudflare Pages" replaced with **"Decap CMS
  powered by Netlify Identity + Git Gateway."**
- **Added** `<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>`
  before the Decap CMS script, so the widget can handle Identity events
  inside the admin window itself (e.g. token refresh, post-login redirect).
- **Pinned Decap CMS to exact version `3.1.10`** (was `^3.1.10` which would
  silently auto-upgrade on patch releases). The site has been working with
  3.1.10; pinning prevents an unexpected dependency change from breaking the
  admin without warning.

### `assets/site.js`
Two surgical changes — no rendering logic changed, no design changes.

1. **Added a `safeLink()` helper function** next to the existing
   `escapeHTML()`. It validates URL strings against an allowlist of safe
   schemes:
   - **Allowed:** `http://`, `https://`, `mailto:`, `tel:`, root-relative
     (`/foo`), relative (`foo.html#bar`), fragments (`#foo`)
   - **Rejected (returns empty string):** `javascript:`, `data:`, `vbscript:`,
     `file:`, `blob:`, anything with a non-allowlisted protocol, and
     obfuscation attempts using whitespace or control characters inside the
     scheme.

2. **Applied `safeLink()` to `post.buttonLink` in `renderCommunityBoard()`** —
   the only place in the codebase where a JSON-controlled URL is rendered
   into an `href` attribute. If the URL is unsafe, the CTA button silently
   omits rather than rendering with a dangerous link. Also added
   `noreferrer` alongside the existing `noopener` (minor hardening — prevents
   Referer leakage to the destination site).

   Before:
   ```js
   const cta = (post.buttonText && post.buttonLink)
     ? `<a class="..." href="${escapeHTML(post.buttonLink)}" target="_blank" rel="noopener">...`
     : '';
   ```

   After:
   ```js
   const safeBtnUrl = safeLink(post.buttonLink);
   const cta = (post.buttonText && safeBtnUrl)
     ? `<a class="..." href="${escapeHTML(safeBtnUrl)}" target="_blank" rel="noopener noreferrer">...`
     : '';
   ```

   `escapeHTML()` alone would not have stopped `javascript:alert(1)` from
   firing, because the colon character isn't HTML-special. This was the only
   real injection surface in the whole site; the rest of the rendering
   pipeline already escapes properly and `<img src="...">` / CSS
   `background-image: url(...)` don't execute scripts.

### `README.md`
- Header rewritten to describe the actual stack: Netlify hosting, GitHub
  repo, Netlify Identity login, Git Gateway publishing, "Maui's Office"
  admin name.
- File tree updated to list current data files (`community.json`,
  `settings.json` were missing) and to include `_headers`.
- "What's editable via the CMS" table updated to reflect the 8 current
  collections, the Menu Items source-of-truth model, and `featured.json`
  as a kept-but-unused backup.

### `DEPLOY.md`
- Full rewrite. The previous version walked through Cloudflare Pages
  deployment + a Cloudflare Worker OAuth proxy + a separate GitHub OAuth
  App, none of which match the actual stack.
- New version documents the real flow: GitHub → Netlify → Netlify Identity
  → Git Gateway → Decap CMS. Includes how to enable Identity, enable Git
  Gateway, invite users, and point a custom domain.
- Includes a **"Critical: Invite-only registration and Git Gateway must
  remain enabled"** callout per spec.
- Includes a "What is NOT used" callout listing the deprecated bits
  (Cloudflare Pages, Workers, decap-proxy, GitHub OAuth App, "Login with
  GitHub") so old notes don't confuse future readers.
- Documents the `_headers` security policy and the report-only CSP plan.

### `OWNER-CHECKLIST.md`
- Section 1 ("Admin CMS login wiring") rewritten — was Cloudflare Worker /
  GitHub OAuth setup; now Netlify Identity + Git Gateway verification with
  invite-only confirmation.
- Section 2 (Chicken Tenders) updated to reference Maui's Office → Menu
  Items → Status field.
- Section 3 (food photos) updated for the current 4-favorite homepage state.
- Section 6 (end-to-end test) updated to test the actual current admin
  features (Status, Show in Neighborhood Favorites, Weekly Special days,
  relation widget for Sub of the Week).
- Section 8 (point the domain) rewritten for Netlify domain management.

### `OWNER-GUIDE.md`
- Header introduces "Maui's Office" and clarifies the public site still
  says "Maui's Deli & Shop."
- "Logging in" section updated: was "Click Login with GitHub"; now "Enter
  the email and password you set up when you got your invite."
- Sections list expanded from 7 to 8, matching actual collections in the
  admin sidebar. Removed the deprecated "Featured Dishes" section.
  Added Community Board and Settings.
- Footer updated to "Maui's Office (admin)" naming.

---

## Files explicitly NOT changed (preserved verbatim)

### Critical — preserved per spec
- `admin/config.yml` — already correctly says
  `Backend: Netlify Identity + Git Gateway`. Untouched.
- `data/menu.json`, `data/community.json`, `data/gallery.json`,
  `data/hours.json`, `data/settings.json`, `data/specials.json`,
  `data/sub-of-week.json`, `data/announcement.json`, `data/featured.json` —
  all 9 data files preserved byte-for-byte. JSON validates.
- `assets/uploads/` — all 7 owner-uploaded images preserved
  (img_20260424_164456.jpg, meatball-grinder.png, roast-beef.jpeg,
  screenshot-2026-04-27-175948.png,
  screenshot_2026-04-24-16-44-08-74_6012fa4d4ddec268fc5c7112cbb265e7.jpg,
  tacos.jpeg, unnamed.webp)
- All baked-in images in `assets/images/` (turkey-club, maui-wrentham,
  shop photos, storefront-hero, flame.svg) preserved.

### Other
- All 5 public HTML pages (`index.html`, `menu.html`, `specials.html`,
  `gallery.html`, `contact.html`) — no design changes, no copy changes.
- `assets/styles.css` — unchanged.
- `CHANGES-v2.md`, `CHANGES-v3.md`, `CHANGES-v4.md` — historical revision
  notes, preserved as-is.
- `.gitignore` — preserved.
- `wrangler.jsonc` — **left in place but worth flagging** (see below).

---

## One thing worth your attention: `wrangler.jsonc`

The repo contains `wrangler.jsonc` at the root, which is a **Cloudflare
Workers configuration file**. It's leftover from an earlier deployment plan
and isn't used by the current Netlify setup. Netlify doesn't read it, so it
doesn't break anything — but it could confuse future contributors.

I left it in place because the spec said "do not remove files unless
specifically requested." If you'd like to delete it, just delete
`wrangler.jsonc` from the repo root in your next commit. Nothing depends on it.

---

## Confirmation against final-output checklist

| Requirement | Status |
|---|---|
| `admin/config.yml` exists at `admin/config.yml` | ✓ preserved (untouched, 14194 bytes) |
| `admin/index.html` exists at `admin/index.html` | ✓ updated — "Maui's Office" title, Identity widget added, Decap pinned to 3.1.10 |
| `_headers` exists at root next to `index.html` | ✓ added |
| `index.html` exists at root | ✓ |
| `assets/site.js` exists at `assets/site.js` | ✓ updated with safeLink helper |
| `data/` folder preserved | ✓ all 9 JSON files unchanged |
| `assets/uploads/` preserved | ✓ all 7 owner-uploaded images preserved |
| Site is not nested inside an extra folder | ✓ root contents are flat |
| Decap CMS still loads at `/admin/` | ✓ HTTP 200, title "Maui's Office", widget loads |
| Netlify Identity setup intact | ✓ widget present in admin/index.html and all 5 public pages |
| Git Gateway not affected | ✓ admin/config.yml untouched |
| Public branding "Maui's Deli & Shop" preserved | ✓ 39 mentions across public HTML, all preserved |
| All 33 site endpoints return 200 | ✓ |
| All 22 safeLink security tests pass | ✓ |

---

## Security cleanup performed

1. Added comprehensive HTTP response headers via `_headers`
   (X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
   Permissions-Policy, CSP-Report-Only).
2. Closed the `javascript:`-URL injection vector in community board
   buttons via the new `safeLink()` validator. Verified with 22 attack-
   vector tests including obfuscated/case-mixed/whitespace-injected variants.
3. Added `noreferrer` to user-supplied external links to prevent Referer
   leakage to third parties.
4. Pinned Decap CMS to an exact version (3.1.10) so an upstream change
   can't silently alter admin behavior.
5. Removed the outdated "Works on Cloudflare Pages" comment from the
   admin entry point.
6. Updated all owner-facing and dev-facing documentation to accurately
   describe the current Netlify Identity + Git Gateway setup, removing
   confusion vectors that could lead to misconfiguration.

No `data/*.json` security issues were found, so no data files were modified.
