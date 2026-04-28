# Pre-Launch Checklist — Maui's Deli Website

The site is code-complete. Before it goes live at **mauisdeli.com**, these real-world items still need to be handled. Each is a small task — none require developer work.

---

## Must-do before going live

### 1. Confirm Netlify Identity is wired (Irwin / dev)
The admin area at `/admin/` (Maui's Office) is powered by Netlify Identity + Git Gateway. Before handing login to the owner, confirm in the Netlify dashboard:

- [ ] **Site configuration → Identity** is **enabled**
- [ ] Registration is set to **Invite only**
- [ ] **Services → Git Gateway** is **enabled** (this is what lets Decap CMS commit edits back to GitHub)
- [ ] The owner has been invited via **Identity → Invite users** and has confirmed the invite
- [ ] Only owner/admin emails are listed under **Identity → Users**

`admin/config.yml` already uses `backend: git-gateway` and does not need any GitHub OAuth App, Cloudflare Worker, or `decap-proxy` URL. If you see references to those in older docs or backups, ignore them — they were from a previous draft of the setup.

Full step-by-step is in **DEPLOY.md**.

### 2. Verify Chicken Tenders with the owner
The featured-food poster shows Chicken Tenders, but none of the menu boards list a price. The site currently shows tenders with the note *"Ask about today's price."* Before launch, confirm with the owner:

- [ ] Is Chicken Tenders actually on the menu today?
- [ ] If yes, what's the price? (Then update it in Maui's Office → Menu Items → Chicken Tenders)
- [ ] If no, set its **Status** to Hidden in Menu Items — that removes it from the menu page, Neighborhood Favorites, and everywhere else automatically.

---

## Nice-to-do before going live (or soon after)

### 3. Source more food photos
The homepage Neighborhood Favorites section currently features 4 items (Club Sandwich, Philly Cheesesteak, Loaded Fries, Chicken Tenders). Only Club Sandwich has a real photo (turkey-club.jpg). The other 3 display a branded flame placeholder.

The placeholder is intentional and looks fine — but the homepage will convert harder with real photos. The owner can snap a quick phone photo of each dish and upload them through Maui's Office at **mauisdeli.com/admin/** → Menu Items → pick the item → upload a photo.

Priority order (most impact first):
- [ ] Loaded Fries
- [ ] Philly Cheesesteak
- [ ] Chicken Tenders
- [ ] Other dishes the owner wants to feature (toggle "Show in Neighborhood Favorites" on each one)

### 4. Confirm hours are accurate
The site currently shows:
- Mon–Fri: 7:00 AM – 7:00 PM
- Sat: 8:00 AM – 6:00 PM
- Sun: Closed

Verify with the owner. If anything's different, edit at `/admin/` → Hours.

### 5. Update the community announcement
The current top banner says *"Now Open in Wrentham! Stop in and say hi — we're at 305 Shears St."*

That's fine for launch. After a few weeks, the owner should rotate it to something fresher — "Thanks for the warm welcome, Wrentham!" or a weekly promo. Edit at `/admin/` → Community Note.

### 6. Do one end-to-end admin test
Before handing login credentials to the owner, log in yourself at `/admin/` (Maui's Office) and confirm each of these works:
- [ ] Edit a menu item price and publish → see it update on `menu.html`
- [ ] Toggle "Show in Neighborhood Favorites" on a menu item → see it appear/disappear from the homepage
- [ ] Set a menu item's "Weekly Special days" to Monday → see it show on the homepage Specials and the Specials page
- [ ] Set a menu item's Status to Hidden → confirm it disappears from menu, favorites, specials, and Sub of the Week
- [ ] Pick a different Sub of the Week (relation widget) → see it update on the homepage
- [ ] Toggle the Store News announcement off and on → banner disappears/reappears
- [ ] Change Saturday hours → see update on `/contact.html`

If all seven work, the owner is safe to edit freely.

---

## After launch

### 7. Submit to Google Business Profile
The website is set up with correct local-business schema markup, but the owner (or Irwin) should also claim the Google Business Profile for "Maui's Deli & Shop, 305 Shears St, Wrentham MA 02093." This is what gets the deli into Google Maps results and the "local pack" on search results for *"deli near me"* / *"sandwich shop wrentham."*

### 8. Point the domain
When ready to go live, point `mauisdeli.com` to Netlify:

1. In the Netlify dashboard → your site → **Domain management → Add a domain** → enter `mauisdeli.com`.
2. Netlify shows you the DNS records you need.
3. Add those records wherever your DNS is hosted (Cloudflare can still be your DNS provider; it just isn't hosting the site).
4. Wait for DNS to propagate. Netlify auto-provisions HTTPS.

If `mauisdeli.com` was previously pointed at a Cloudflare Pages project, disconnect that so it doesn't conflict with the Netlify deployment.

---

**That's the whole list.** Everything else is already done.
