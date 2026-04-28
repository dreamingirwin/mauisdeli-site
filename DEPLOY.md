# Deploying Maui's Deli & Shop

This site is static HTML + JSON + Decap CMS. It runs on Netlify's free tier and
auto-deploys from a GitHub repo. Owner login uses Netlify Identity, and Decap
CMS publishes edits back to GitHub through Git Gateway.

The site is already deployed. This guide documents how the pieces fit together
so you can troubleshoot, redeploy, or replicate the setup for a similar site.

---

## How the stack works

```
Owner edits content in Maui's Office (the admin area at /admin/)
        │
        ▼
Decap CMS commits the change through Git Gateway
        │
        ▼
GitHub repo receives the new commit
        │
        ▼
Netlify detects the commit and rebuilds the site (~30 seconds)
        │
        ▼
Public site at mauisdeli.com reflects the change
```

No build command, no server, no database. The whole pipeline is static files.

---

## Step 1 — Push the site to GitHub

1. Create a GitHub repo (private or public, either works).
2. Upload the entire site folder contents to the root of the repo.
3. Make sure `index.html`, `_headers`, `admin/`, `assets/`, and `data/` are all
   at the top level of the repo (not nested inside another folder).

---

## Step 2 — Connect the repo to Netlify

1. Go to **app.netlify.com** and sign in.
2. Click **Add new site → Import an existing project**.
3. Connect to GitHub and pick the `mauisdeli` repo.
4. Build settings:
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.` (the repo root)
5. Click **Deploy site**.

Netlify will give you a temporary URL like `lighthearted-babka-70d564.netlify.app`.
Visit it — the public site should be live.

---

## Step 3 — Enable Netlify Identity

This is what lets the owner log in to `/admin/`.

1. In Netlify, go to your site → **Site configuration → Identity**.
2. Click **Enable Identity**.
3. Under **Registration preferences**, set it to **Invite only** (so random
   people can't sign themselves up).
4. Under **External providers**, you can leave Google/GitHub off — email + password
   is fine for the owner.
5. Scroll down to **Services → Git Gateway** and click **Enable Git Gateway**.
   This is what lets Decap CMS commit edits back to the GitHub repo on the
   owner's behalf.

> **Critical:** Registration must stay set to **Invite only** and **Git
> Gateway must remain enabled**. Without Git Gateway, Decap can't publish.
> Without Invite-only registration, anyone could sign up to edit the site.

---

## Step 4 — Invite the owner

1. In Netlify → **Identity → Invite users**.
2. Enter the owner's email address. Only invite people who actually need to
   edit the site (the owner and any admins).
3. Netlify emails them a link. They click it, set a password, and they're in.
4. They go to `https://mauisdeli.com/admin/` (or the temporary Netlify URL +
   `/admin/`), log in with their email + password, and Maui's Office opens up.

---

## Step 5 — Point the custom domain

The site currently lives at the temporary Netlify URL. To put it on `mauisdeli.com`:

1. In Netlify → **Domain management → Add a domain**.
2. Enter `mauisdeli.com`.
3. Netlify shows you the DNS records you need (typically a CNAME and an A record).
4. Cloudflare (or wherever your DNS is hosted) → add those records.
5. Wait a few minutes for DNS to propagate.
6. Netlify auto-provisions an HTTPS certificate.

> **Note on Cloudflare:** Cloudflare can still be your DNS provider for the
> domain — it just isn't hosting the site. The site is served from Netlify.
> If you previously had `mauisdeli.com` pointed at a Cloudflare Pages project,
> remove that and point at Netlify instead.

---

## How edits get published

When the owner clicks **Publish** in Maui's Office:

1. Decap CMS commits the JSON change to the GitHub repo using the owner's
   Netlify Identity credentials (via Git Gateway).
2. GitHub stores the new commit.
3. Netlify sees the new commit and rebuilds the site automatically.
4. Within ~30 seconds, the public site at `mauisdeli.com` shows the change.

---

## Security headers

The repo includes a `_headers` file at the root that Netlify reads
automatically. It applies these to every response:

- `X-Frame-Options: DENY` — prevents the site from being framed
- `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — denies camera/microphone/geolocation/payment/USB
- `Content-Security-Policy-Report-Only` — currently in report-only mode for
  observation. It allows scripts/styles needed for Decap CMS, Netlify
  Identity, Google Fonts, and the embedded map. Once we've watched the
  Netlify deploy logs for a few weeks and confirmed nothing legitimate is
  being blocked, this can be flipped to enforced (`Content-Security-Policy:`
  instead of `Content-Security-Policy-Report-Only:`).

---

## Troubleshooting

- **Owner can't log in to `/admin/`** → Check Netlify → Identity → make sure
  the user is listed and confirmed. If they never confirmed the invite, resend it.
- **Owner can log in but Publish gives an error** → Make sure Git Gateway is
  enabled (Netlify → Site configuration → Identity → Services → Git Gateway).
  Without Git Gateway, Decap can't commit to the repo.
- **Login redirects but doesn't finish** → Make sure Netlify Identity is
  enabled on the site, not just on a different site in your account. Make
  sure `admin/index.html` includes the Netlify Identity widget script tag.
- **Changes don't show on the live site** → Check the Netlify deploy log.
  Each save from Maui's Office should trigger a new deploy. If a deploy
  failed, the log will say why.
- **Old Cloudflare Pages deploy is still running** → If you previously had
  this site on Cloudflare Pages, disconnect that project so it doesn't
  conflict with the Netlify deployment.

---

## What is NOT used in this setup

If you see references to any of these in older notes or backups, ignore them —
they're not part of the current stack:

- Cloudflare Pages (replaced by Netlify)
- Cloudflare Workers / `decap-proxy` (not needed; Git Gateway handles it)
- A separate GitHub OAuth App (not needed; Netlify Identity handles auth)
- "Login with GitHub" button on the admin (the admin uses Netlify Identity
  email + password instead)
