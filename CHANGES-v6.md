# Maui's Deli & Shop — Final Pre-Launch Pass

This is the **launch-ready build**. After this commit, the site is intended to
be pointed at `mauisdeli.com` and made public. No further code changes are
expected before launch.

---

## What changed

### 1. Google Analytics 4 added to all 5 public pages

The exact GA4 snippet (Measurement ID `G-K6WXFZK0RD`) was inserted right before
`</head>` on each of:

- `index.html`
- `menu.html`
- `specials.html`
- `gallery.html`
- `contact.html`

`admin/index.html` was deliberately **not** instrumented — admin sessions are
private and shouldn't show up in the owner's analytics.

### 2. CSP allowlist updated for GA4 (`_headers`)

The Content-Security-Policy-Report-Only directive was extended so GA4 won't
generate violation reports:

- `script-src` → added `https://www.googletagmanager.com`
- `connect-src` → added `https://www.google-analytics.com`,
  `https://*.analytics.google.com`, `https://*.google-analytics.com`

The CSP is still in **report-only mode** (per the original v5 plan — observe
deploy logs for a few weeks before flipping to enforced). With this update, the
report-only logs will be quiet on launch day instead of full of GA4 violations.

### 3. `admin/config.yml` — `site_url` and `display_url` updated

Was: `https://lighthearted-babka-70d564.netlify.app` (the temporary Netlify URL)
Now: `https://mauisdeli.com`

This affects two visible owner-facing surfaces:
- The **"View Site"** link inside the Decap CMS admin
- The **success message** Decap shows after publishing an edit ("Visit your site
  at mauisdeli.com")

If the domain isn't pointed yet at the moment the owner first logs in,
those links will 404 until DNS propagates — which is fine and expected.

### 4. Per-page Open Graph URLs

Previously all 5 pages had `og:url` set to the homepage URL
(`https://mauisdeli.com/`). That meant Facebook/LinkedIn link previews for
shared menu/specials/gallery/contact pages would show the homepage URL
instead of the actual page being shared.

Now each page has its own URL:

| Page | og:url |
|---|---|
| `index.html` | `https://mauisdeli.com/` |
| `menu.html` | `https://mauisdeli.com/menu.html` |
| `specials.html` | `https://mauisdeli.com/specials.html` |
| `gallery.html` | `https://mauisdeli.com/gallery.html` |
| `contact.html` | `https://mauisdeli.com/contact.html` |

### 5. Canonical link tags added to all 5 public pages

Every page now has `<link rel="canonical" href="...">` pointing at its own URL.
This tells Google "this is the official URL for this page," preventing duplicate
content issues if anyone ever links to the site via `www.mauisdeli.com`,
URL-parameter variants, or anything else that looks similar but isn't canonical.

### 6. `wrangler.jsonc` deleted

Cloudflare Workers config left over from an older deployment plan.
Not used by Netlify, not referenced by anything in the repo, just dead weight.
Removed for a clean repo.

---

## Files changed (8) + deleted (1)

**Changed:**
- `index.html` — GA4 + canonical added (og:url unchanged — it's already the homepage URL)
- `menu.html` — GA4 + canonical added + per-page og:url
- `specials.html` — GA4 + canonical added + per-page og:url
- `gallery.html` — GA4 + canonical added + per-page og:url
- `contact.html` — GA4 + canonical added + per-page og:url
- `_headers` — CSP allowlist extended for GA4 endpoints
- `admin/config.yml` — `site_url` and `display_url` → production domain

**Added:**
- `CHANGES-v6.md` — this file (launch-prep changelog)

**Deleted:**
- `wrangler.jsonc` (dead Cloudflare config)

---

## Files explicitly NOT changed

- `admin/index.html` — kept clean (no GA4 in admin)
- All 9 `data/*.json` files — preserved byte-for-byte
- All 7 owner-uploaded images in `assets/uploads/` — preserved
- All baked-in images in `assets/images/` — preserved
- `assets/site.js` — unchanged (rendering logic untouched)
- `assets/styles.css` — unchanged
- All other documentation files (`README.md`, `DEPLOY.md`, `OWNER-GUIDE.md`,
  `OWNER-CHECKLIST.md`, `CHANGES-v2/v3/v4.md`) — unchanged
- `.gitignore` — unchanged

---

## Final verification

| Check | Result |
|---|---|
| GA4 ID `G-K6WXFZK0RD` present on all 5 public pages | ✓ (2 mentions each) |
| GA4 ID NOT present in admin/index.html | ✓ |
| Canonical link tags on all 5 public pages | ✓ |
| Per-page og:url on all 5 public pages | ✓ |
| CSP allowlist includes googletagmanager + google-analytics | ✓ |
| `admin/config.yml` points at production domain | ✓ |
| `wrangler.jsonc` removed | ✓ |
| `admin/config.yml` still has 8 collections, valid YAML | ✓ |
| All 9 JSON data files valid | ✓ |
| `assets/site.js` syntax valid | ✓ |
| All 32 site endpoints return 200 | ✓ |
| `data/` count: 9 (unchanged) | ✓ |
| `assets/uploads/` count: 7 (unchanged) | ✓ |

---

## Launch-day sequence (after uploading this build)

1. **Upload to GitHub** — Netlify auto-deploys in ~30 seconds
2. **Verify on the test URL one last time:**
   - Open the test URL in a browser
   - Open Google Analytics → Reports → Realtime → confirm you see yourself
   - Test admin login at `/admin/` — confirm Decap loads, you can edit, publish works
3. **Build sitemap.xml** (small static XML — say the word and I'll generate it)
4. **Point `mauisdeli.com` to Netlify:**
   - Netlify → Domain management → Add domain → enter `mauisdeli.com`
   - Add the DNS records Netlify provides at Cloudflare DNS
   - **Important:** turn off Cloudflare's orange proxy cloud icon (DNS only) so
     Netlify can issue the SSL cert
   - Wait 5–30 min for DNS + cert
5. **Smoke test on real domain:**
   - `https://mauisdeli.com` loads with valid HTTPS lock
   - `/admin/` loads, Maui's Office login works
   - GA4 Realtime still shows visits
6. **Search Console:** request indexing for each page, submit sitemap.xml
7. **Hand off to the owner**

---

## Future cleanup item (not urgent)

Once the site has been live for a few weeks and the Netlify deploy logs are
clean of CSP violation reports, flip `_headers` from
`Content-Security-Policy-Report-Only:` to `Content-Security-Policy:` to
actually enforce the policy. That's a one-character change once we're confident
nothing legitimate is being flagged. Not pre-launch.
