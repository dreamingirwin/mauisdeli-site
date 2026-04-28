# Deployment Guide — Maui's Deli Website

This site is static HTML + JSON + Decap CMS. Hosts on **Netlify** for free, with **Netlify Identity + Git Gateway** powering the owner's admin area at `/admin/` (Maui's Office).

## What you're deploying

```
mauisdeli/
├── index.html, menu.html, specials.html, gallery.html, contact.html
├── _headers                        ← Netlify security headers
├── assets/styles.css, assets/site.js, assets/images/, assets/uploads/
├── data/*.json                     ← Owner edits these via Decap CMS
└── admin/index.html, admin/config.yml
```

---

## Step 1 — Put the code on GitHub

1. Create a new GitHub repo, e.g. `mauisdeli` (private is fine).
2. Push every file in this folder to the repo root.
3. Note the repo path: `YOUR-GITHUB-USER/mauisdeli`.

---

## Step 2 — Deploy to Netlify

1. Go to **Netlify Dashboard → Add new site → Import an existing project → GitHub**.
2. Authorize GitHub and pick the `mauisdeli` repo.
3. Build settings:
   - **Branch to deploy**: `main`
   - **Build command**: *(leave empty — this is a plain static site)*
   - **Publish directory**: `/` (root) or leave blank
4. Deploy. Netlify will give you a temporary URL like `https://lighthearted-babka-70d564.netlify.app`.
5. Open that URL and confirm the public site loads correctly.

The `_headers` file at the repo root is picked up automatically — Netlify serves the security headers it defines on every response.

---

## Step 3 — Enable Netlify Identity (owner login)

The admin area at `/admin/` uses **Netlify Identity** to authenticate the owner, and **Git Gateway** to let the CMS publish edits back to the GitHub repo. No GitHub OAuth app or Cloudflare Worker is needed — both pieces live inside Netlify.

### 3a. Turn on Identity

1. In the Netlify dashboard → your site → **Integrations → Identity → Enable Identity**.
2. Under **Registration preferences**, set it to **Invite only**. (This keeps the public from creating accounts.)
3. *(Optional but recommended)* Under **External providers**, leave Google/GitHub providers off unless you specifically need them. Email + password is enough.

### 3b. Turn on Git Gateway

1. Same Identity page → scroll to **Services → Git Gateway → Enable Git Gateway**.
2. Netlify will request a GitHub access token on your behalf the first time. Approve it for the repo.

That's it for the admin login wiring. There's nothing to paste into `admin/config.yml` — the `backend: name: git-gateway` line is already set, and Netlify Identity injects the auth automatically.

### 3c. Invite the owner

1. Identity → **Invite users** → enter the owner's email → send invite.
2. Owner gets an email with a link to set a password. Once accepted, they're a registered Identity user with admin access.
3. Send them this link: `https://mauisdeli.com/admin/`

To revoke access later: Identity → Users → click the user → **Delete**.

---

## Step 4 — Point the custom domain

When ready to go live:

1. Netlify Dashboard → your site → **Domain management → Add custom domain** → `mauisdeli.com`.
2. At the domain registrar, either switch nameservers to Netlify DNS, **or** add the CNAME / A records Netlify shows you.
3. Netlify auto-provisions a free Let's Encrypt SSL cert once DNS resolves (usually a few minutes).

---

## Local Testing (without Netlify, for you)

Want to preview CMS edits locally before pushing?

```bash
# In the project root:
npx decap-server
# Then in another terminal:
python3 -m http.server 8000
# Open http://localhost:8000/admin/
```

Decap auto-detects local mode (because `local_backend: true` is set) and writes to the local `/data/` files directly. No Netlify Identity needed for local testing.

For basic static preview (no CMS edits):

```bash
cd mauisdeli
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## What happens when the owner saves

1. Owner edits something in Maui's Office (`/admin/`).
2. Decap CMS authenticates the owner via Netlify Identity, then publishes through Git Gateway — which commits the change to the GitHub repo.
3. Netlify sees the new commit and auto-redeploys in ~30 seconds.
4. The public site is updated.

Every edit is tracked in Git history, so nothing's ever lost — you can always roll back in GitHub.

---

## Troubleshooting

- **"Config Error" on /admin/** → Check `admin/config.yml` YAML indentation. Two spaces, no tabs.
- **"You must be authorized" loop on login** → Confirm Identity is **Enabled**, registration is **Invite only**, the user has been invited and accepted the invite, and **Git Gateway** is enabled in the Identity settings.
- **Login works but Publish fails** → Almost always a Git Gateway issue. Toggle Git Gateway off and on again under Identity → Services. If that fails, re-authorize the GitHub connection.
- **Images don't appear after upload** → Make sure `media_folder: "assets/uploads"` is set in `admin/config.yml` and the folder exists in the repo (even if empty).
- **Changes don't show on live site** → Check the Netlify deploy log for the latest commit. Each CMS save should trigger a new deploy. If the commit landed but Netlify didn't deploy, check **Site configuration → Build & deploy → Continuous deployment** is on.
- **Security headers not showing up** → Confirm `_headers` is at the repo root (not inside `assets/` or `admin/`) and was included in the latest deploy. Netlify only serves it from the publish root.
