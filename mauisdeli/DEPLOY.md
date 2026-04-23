# Deployment Guide — Maui's Deli Website

This site is static HTML + JSON + Decap CMS. Hosts on Cloudflare Pages for free.

## What you're deploying

```
mauisdeli/
├── index.html, menu.html, specials.html, gallery.html, contact.html
├── assets/styles.css, assets/site.js, assets/images/, assets/uploads/
├── data/*.json                  ← CMS writes here
└── admin/index.html, admin/config.yml
```

---

## Step 1 — Put the code on GitHub

1. Create a new GitHub repo, e.g. `mauisdeli` (private is fine).
2. Upload every file in this folder to the repo root.
3. Note the repo name format: `YOUR-GITHUB-USER/mauisdeli`.

---

## Step 2 — Deploy to Cloudflare Pages

1. Go to **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and pick the `mauisdeli` repo.
3. Build settings:
   - **Framework preset**: None
   - **Build command**: *(leave empty)*
   - **Build output directory**: `/` (root)
4. Deploy.
5. Once it's live, go to **Custom Domains** and add `mauisdeli.com`.

---

## Step 3 — Set up the CMS login (Decap + GitHub OAuth)

Decap CMS logs the owner in with their GitHub account. That requires a tiny OAuth proxy. The easiest free path is a **Cloudflare Worker**.

### 3a. Create a GitHub OAuth App

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: `Maui's Deli CMS`
   - **Homepage URL**: `https://mauisdeli.com`
   - **Authorization callback URL**: `https://decap-proxy.YOURNAME.workers.dev/callback`
     *(You'll get this URL in 3b — come back and update.)*
3. Save. Copy the **Client ID** and generate a **Client Secret**.

### 3b. Deploy the OAuth proxy (Cloudflare Worker)

Use the open-source `decap-proxy` Worker. Takes about 3 minutes:

1. Go to Cloudflare → **Workers & Pages → Create Worker**.
2. Name it `decap-proxy`, hit Deploy to get a starter, then **Edit Code**.
3. Replace the default code with the template from:
   https://github.com/sterlingwes/decap-proxy
   *(Or search "decap cms cloudflare worker oauth" — any of the published
   single-file Workers work. The proxy is <100 lines of JS.)*
4. In the Worker's **Settings → Variables**, add:
   - `GITHUB_CLIENT_ID` = *(from 3a)*
   - `GITHUB_CLIENT_SECRET` = *(from 3a)*
5. Deploy. Copy the Worker URL (e.g. `https://decap-proxy.yourname.workers.dev`).
6. Go back to your GitHub OAuth App and paste that URL + `/callback` into the callback URL field.

### 3c. Update the CMS config

Open `admin/config.yml` in your repo and change these two lines:

```yaml
backend:
  name: github
  repo: YOUR-GITHUB-USER/mauisdeli          # ← your repo
  branch: main
  base_url: https://decap-proxy.YOURNAME.workers.dev   # ← your Worker URL
  auth_endpoint: auth
```

Commit and push. Cloudflare Pages will auto-deploy.

---

## Step 4 — Give the owner access

1. In GitHub, go to the repo → **Settings → Collaborators → Add people**.
2. Invite the owner's GitHub username (have them sign up for a free account if needed).
3. Accept the invite on their side.
4. Send them this link: `https://mauisdeli.com/admin/`
5. They click **Login with GitHub**, and they're in.

---

## Local Testing (without GitHub, for you)

Want to preview CMS edits locally before pushing?

```bash
# In the project root:
npx decap-server
# Then open index.html via any local server, and visit /admin/
```

Decap auto-detects local mode (because `local_backend: true` is set) and writes to the local `/data/` files directly. No GitHub needed.

For basic static preview (no CMS edits):

```bash
cd mauisdeli
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## What happens when the owner saves

1. Owner edits something in `/admin/`.
2. Decap commits the change to the GitHub repo (as the owner's GitHub user).
3. Cloudflare Pages sees the new commit and auto-redeploys in ~30 seconds.
4. The public site is updated.

Every edit is tracked in Git history, so nothing's ever lost — you can always roll back.

---

## Troubleshooting

- **"Config Error" on /admin/** → Check `admin/config.yml` YAML indentation. Two spaces, no tabs.
- **Login redirects but doesn't finish** → OAuth callback URL mismatch. Double-check it's exactly `https://your-worker.workers.dev/callback`.
- **Images don't appear after upload** → Make sure `media_folder: "assets/uploads"` and the folder exists (even if empty) in the repo.
- **Changes don't show on live site** → Check the Cloudflare Pages build log. Each CMS save should trigger a new deploy.
