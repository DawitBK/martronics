# ADR 0005: the storefront keeps sessions on the server, guests keep a browser cart, pages are built for search

Status: accepted

## Decision

- **Tokens never reach page JavaScript.** Both live in `httpOnly` cookies set by the web server.
  Server components call the API with them; browser code calls one route handler, `/bff`, which adds
  the token. `proxy.ts` renews the short-lived access token before a page renders; concurrent
  requests that carry the same refresh token share one refresh, because the API treats a reused,
  already-rotated token as theft and revokes the family. Prefetches never refresh.
- **The shop is public, the rest is not.** Browsing, search and product pages need no account. Only
  `/checkout`, `/orders`, `/account` and `/admin` redirect to sign-in (with a same-site `next`).
  Guests may read the catalogue through `/bff`; every other call needs the cookie.
- **A guest's cart is ids and quantities in the browser, never prices.** Prices, names and stock are
  always fetched from the API. When the guest signs in the cart is poured into the server cart once.
  A signed-in cart lives on the server, so it follows the person between devices.
- **Checkout sends no prices and no totals.** It creates the order from the server cart under one
  idempotency key per attempt (a double click or a dropped connection places one order), then pays;
  the order page is the truth about whether payment worked, so a failed payment leaves a saved order
  with a "try again" button rather than a lost cart.
- **Built to be found.** Server-rendered product pages with `Product` and `BreadcrumbList` JSON-LD,
  canonical URLs, an XML sitemap generated from the live catalogue, `robots.txt` that keeps carts,
  checkout, accounts and the admin out of the index, and `noindex` on filtered and paged listings so
  one product is not indexed under many URLs. Product text is rendered as text, never as markup, and
  JSON-LD escapes `<`.
- **Cached public reads refresh on change.** Catalogue reads are cached for 30 seconds and tagged;
  any successful write to products, categories or orders through the app expires the tag at once, so
  an administrator sees a new product, and a shopper sees stock fall, immediately.
- **Roles hide, the API refuses.** The admin links follow the role; every rule is enforced again by
  the API.

## Consequences

- Refresh de-duplication is per web-server process; several instances behind a balancer need sticky
  sessions or a shared cache. One instance (the target) is exact.
- A change made directly against the API (not through the app) shows in cached pages within 30
  seconds, not at once.
