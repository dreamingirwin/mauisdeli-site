# Pre-Launch Checklist — Maui's Deli Website

The site is code-complete. Before it goes live at **mauisdeli.com**, these real-world items still need to be handled. Each is a small task — none require developer work.

---

## Must-do before going live

### 1. Admin CMS login wiring (Irwin / dev)
The admin login page (`/admin/`) won't work until three values are filled in inside `admin/config.yml`:

- `repo: YOUR-GITHUB-USER/mauisdeli` → change to the real GitHub repo path
- `base_url: https://decap-proxy.YOURNAME.workers.dev` → change to the real Cloudflare Worker URL after the OAuth proxy is deployed
- A GitHub OAuth App needs to exist (Client ID + Secret set on the Worker)

Full step-by-step is in **DEPLOY.md** under "Step 3 — Set up the CMS login."

### 2. Verify Chicken Tenders with the owner
The featured-food poster shows Chicken Tenders, but none of the menu boards list a price. The site currently shows tenders with the note *"Ask about today's price."* Before launch, confirm with the owner:

- [ ] Is Chicken Tenders actually on the menu today?
- [ ] If yes, what's the price? (Then update it in the admin under Menu Items AND Featured Dishes)
- [ ] If no, remove it from both Menu Items and Featured Dishes in the admin

---

## Nice-to-do before going live (or soon after)

### 3. Source more food photos
The homepage's Featured Dishes section has 9 items, but only Turkey Club has a real photo right now. The other 8 (Loaded Fries, Tacos, Quesadilla, Cheesesteak, Taco Bowl, Burrito, Empanadas, Chicken Tenders) display a branded flame placeholder instead.

The placeholder is intentional and looks fine — but the homepage will convert harder with real photos. The owner can snap a quick phone photo of each dish and upload them through the admin at **mauisdeli.com/admin/** → Featured Dishes.

Priority order (most impact first):
- [ ] Loaded Fries
- [ ] Tacos (the trio plate)
- [ ] Cheesesteak
- [ ] Burrito
- [ ] Quesadilla
- [ ] Taco Bowl
- [ ] Empanadas
- [ ] Chicken Tenders

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
Before handing login credentials to the owner, log in yourself at `/admin/` and confirm each of these works:
- [ ] Edit a menu item price and publish → see it update on `menu.html`
- [ ] Change a weekly special and publish → see it update on the homepage specials section
- [ ] Upload a new photo to Featured Dishes → see it appear on the homepage
- [ ] Toggle the Community Note off and on → banner disappears/reappears
- [ ] Change Saturday hours → see update on `/contact.html`

If all five work, the owner is safe to edit freely.

---

## After launch

### 7. Submit to Google Business Profile
The website is set up with correct local-business schema markup, but the owner (or Irwin) should also claim the Google Business Profile for "Maui's Deli & Shop, 305 Shears St, Wrentham MA 02093." This is what gets the deli into Google Maps results and the "local pack" on search results for *"deli near me"* / *"sandwich shop wrentham."*

### 8. Point the domain
When ready to go live, point `mauisdeli.com` to the Cloudflare Pages project in Cloudflare Dashboard → the Pages project → Custom domains → Set up a custom domain.

---

**That's the whole list.** Everything else is already done.
