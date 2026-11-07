# Online shop: setup and go-live

The shop is switched by **Shop > Shop Settings > Mode** in the admin. It starts on `off`, so deploying this code changes nothing for customers.

| Mode | Who sees the shop | Payments | Orders |
|---|---|---|---|
| `off` | Nobody. The site takes WhatsApp orders as before | None | None |
| `test` | Only a browser that opened the preview link | PayHere sandbox | Flagged as test orders |
| `live` | Everyone | Real PayHere | Real |

The admin refuses `live` until the PayHere live credentials and the mail server are set.

## 1. Server settings (Coolify)

Add these to the CMS resource, and paste `deploy/docker-compose.prod.yml` into its Compose editor again, because the file now lists them. Nothing new goes on Vercel.

| Variable | Value |
|---|---|
| `SITE_URL` | `https://www.ceylonaromavitae.lk` |
| `SHOP_PREVIEW_KEY` | A long random string (`openssl rand -hex 32`) |
| `PAYHERE_SANDBOX_MERCHANT_ID`, `PAYHERE_SANDBOX_MERCHANT_SECRET` | From a PayHere sandbox account |
| `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET` | From the live account, once PayHere approves it |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | From the developer setting up email |
| `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` | The sender customers see |

PayHere's merchant secret belongs to a domain. Add `www.ceylonaromavitae.lk` under Integrations in PayHere, in both the sandbox and live accounts, and use the secret it shows there.

**Email:** any SMTP service works, including Resend and SendGrid. SPF and DKIM must be set up on the sending domain, and the VPS must be able to reach the SMTP port. Check it with **Send test email** in **Shop > Email Settings**.

## 2. Fill in the admin

- **Site > Policy pages:** Terms, Returns and Privacy. PayHere requires these on the live site before it approves the business.
- **Shop > Shop Settings:** exchange rates, leaving a margin because PayHere pays out in LKR at the bank's rate and adds a fee. A currency with no rate isn't offered. Set **Largest order** to the PayHere plan's per-payment limit.
- **Shop > Shipping zones:** one for Sri Lanka, plus the rest of the world. A country with no zone can't check out.
- **Shop > Email Settings:** staff alert addresses and reply-to address.
- **Products:** stock and shipping weight. Empty stock means not tracked. Mark anything that can't leave the country **Sri Lanka only**.
- **Range-priced products:** replace "Price up to" with an exact price or sizes. Until then they keep the WhatsApp button and can't go in the cart.

## 3. Test

1. Set the mode to `test`. Allow up to a minute for the site to notice.
2. In one browser, open `https://www.ceylonaromavitae.lk/shop-preview?key=<SHOP_PREVIEW_KEY>`. Everyone else keeps seeing the normal site. `/shop-preview?off` ends the preview.
3. Run through the checks below with PayHere's sandbox test cards.

- [ ] Add to cart, change the quantity, reload: the cart is still there.
- [ ] Shipping is right for Sri Lanka and one other country.
- [ ] Pay in LKR, USD, EUR and GBP. Each order turns "Paid, being prepared" by itself, and PayHere charged what the site showed.
- [ ] Decline a payment: the cart stays and **Try again** works. The 4th attempt shows contact details.
- [ ] Leave an order unpaid for an hour: it's cancelled and its stock returns.
- [ ] Buy as a guest with a new email: the set-password email arrives and the link works.
- [ ] Mark an order shipped with tracking: the email arrives and the order page shows it.
- [ ] Take stock below the low-stock level: the dashboard and alert email both show it.
- [ ] Confirm the customer's email arrives in a real inbox, not spam.

Test orders move real stock numbers. That's harmless before launch, but cancel test orders first to return their stock, then check the counts.

## 4. Go live

- [ ] PayHere has approved the business on Plus or Premium (Lite can't charge EUR or GBP, and its limit is below some prices). Live credentials are set.
- [ ] Pay for small real orders with a local card and a foreign card, then refund them in the PayHere dashboard and mark them refunded in the admin. PayHere publishes nothing on how often foreign cards are declined, so this is the only real check.
- [ ] Cancel, then delete, all test orders (**Shop > Orders**), and delete test customers. Real orders can't be deleted.
- [ ] Check every product's stock count.
- [ ] Set the mode to `live`.

## 5. After go-live

**Daily work:** the **Shop** box on the admin dashboard shows orders to ship, anything needing attention, and low stock. Move orders along in **Shop > Orders**. Each step emails the customer.

**Refunds** are made in the PayHere dashboard, then the order is marked Refunded in the admin. A refund before shipping returns the stock. After shipping it doesn't, so add returned items back by hand.

**"Needs attention"** on an order means a person should look at it: a chargeback, a payment that doesn't match the order, or a late payment for something that has since sold out.

**Tidying up the code**, once the shop has been live for a while and every range-priced product has an exact price: remove the WhatsApp order buttons (`components/ui/WhatsAppOrderButton.tsx`, `lib/whatsapp.ts`, the fallback in `components/features/shop/BuyButton.tsx`) and hide "Price up to" in the admin. They're kept until then because the site depends on them while the shop is `off`. Keep `whatsappNumber` for the contact link on the failed-payment page. Dropping the `price_max` column deletes data, so do that as its own decision.

## Good to know

- Orders are created through `/api/shop/checkout`, and only PayHere's signed callback to `/api/shop/payhere/notify` marks one paid.
- Scheduled work (expiring unpaid orders, sending email) only runs on the CMS server, where `SITE_URL` is set. `next dev` never runs it, so local work against the production database can't send real email. Emails can take up to a minute to go out.
- If `SITE_URL` is missing from the CMS, **orders stop expiring and emails stop sending**.
