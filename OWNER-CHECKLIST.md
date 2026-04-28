# Pre-Launch Checklist — Maui's Deli Website

The site is code-complete. Before it goes live at **mauisdeli.com**, these real-world items still need to be handled. Each is a small task — none require developer work.

---

## Must-do before going live

### 1. Confirm Maui's Office (admin) login is wired (Irwin / dev)
The admin login page (`/admin/`) — branded **Maui's Office** — uses Netlify Identity + Git Gateway. Verify all four:

- [ ] In the Netlify dashboard for the site, **Identity** is enabled.
- [ ] Under **Identity → Registration preferences**, registration is set to **Invite only**.
- [ ] Under **Identity → Services → Git Gateway**, Git Gateway is **enabled**.
- [ ] At least one owner/admin user has been **invited via email** (Identity → Invite users), and that invite has been accepted with a password set.

After those four, opening `/admin/` will show the Netlify Identity login box, and publishing from Decap will commit straight to the GitHub repo through Git Gateway.

### 2. Verify Chicken Tenders with the owner
The featured-food poster shows Chicken Tenders, but none of the menu boards list a price. The site currently shows tenders with the note *"Ask about today's price."* Before launch, confirm with the owner:

- [ ] Is Chicken Tenders actually on the menu today?
- [ ] If yes, what's the price? (Then update the price in **Menu Items** in Maui's Office.)
- [ ] If no, set Status to **Hidden** in Menu Items, and toggle off **Show in Neighborhood Favorites**.

---

## Nice-to-do before going live (or soon after)

### 3. Source more food photos
The homepage's Neighborhood Favorites section pulls items toggled "Show in Neighborhood Favorites" from Menu Items. Items without a real photo display a branded flame placeholder instead.

The placeholder is intentional and looks fine — but the homepage will convert harder with real photos. The owner can snap a quick phone photo of each dish and upload them through Maui's Office at **mauisdeli.com/admin/** → Menu Items → click the item → upload a photo.

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
Verify the live hours with the owner. If anything's different, edit at `/admin/` → Hours.

### 5. Update the community announcement
The current top banner is fine for launch. After a few weeks, the owner should rotate it to something fresher — "Thanks for the warm welcome, Wrentham!" or a weekly promo. Edit at `/admin/` → Store News / Announcement.

### 6. Do one end-to-end admin test
Before handing login credentials to the owner, log in yourself at `/admin/` and confirm each of these works:
- [ ] Edit a menu item price and publish → see it update on `menu.html`
- [ ] Toggle a menu item's "Show in Neighborhood Favorites" on/off → see homepage update
- [ ] Add a Community Board post → see it appear on the homepage
- [ ] Toggle the Store News announcement off and on → banner disappears/reappears
- [ ] Change Saturday hours → see update on `/contact.html`

If all five work, the owner is safe to edit freely.

---

## After launch

### 7. Submit to Google Business Profile
The website is set up with correct local-business schema markup, but the owner (or Irwin) should also claim the Google Business Profile for "Maui's Deli & Shop, 305 Shears St, Wrentham MA 02093." This is what gets the deli into Google Maps results and the "local pack" on search results for *"deli near me"* / *"sandwich shop wrentham."*

### 8. Point the domain
When ready to go live, point `mauisdeli.com` to Netlify:
1. Netlify Dashboard → the site → **Domain management → Add custom domain**.
2. Add `mauisdeli.com`.
3. Update DNS at the domain registrar to use Netlify's DNS, **or** add the CNAME / A records Netlify shows you.
4. Wait for the SSL cert to provision (usually a few minutes).

---

**That's the whole list.** Everything else is already done.
