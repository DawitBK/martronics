# Martronics legacy API: recovery spec

What the original (`legacy-v1`) backend does, written down so the rebuild can reproduce the behaviour that matters and drop the defects. Source: `backend/` at tag `legacy-v1` (Express 5, Sequelize 6, PostgreSQL, JWT, argon2).

## Surface

All routes are mounted under `/api`. Auth column: **none** means the route has no middleware at all.

| Method and path | Auth | Behaviour |
|---|---|---|
| `POST /user` | none | create user; `role` is taken from the request body (default `customer`) |
| `POST /user/login` | none | email + password; returns `accessToken` (1 h) and `refreshToken` (7 d); wrong email and wrong password both answer 404 with different messages |
| `POST /user/refresh` | refresh token as bearer | returns a new token pair (`access_token`, `refresh_token`) |
| `GET /user` | admin | all users with their products |
| `PUT /user/:id` | any signed-in user | updates `firstName`, `lastName` of **any** user id |
| `GET /product`, `GET /product/:id`, `GET /product/:id/images` | none | list, detail, images |
| `POST/PUT/DELETE /product[/:id]`, `POST /product/:id/images` | admin, manager | catalog management |
| `GET/POST/PUT/DELETE /category`, `/subcategory` | reads none; writes admin, manager | two-level taxonomy; sub-category names are globally unique |
| `GET /cart`, `GET /cart/user/:userId`, `POST /cart`, `DELETE /cart/:id`, `GET/POST /cart/items`, `PUT/DELETE /cart/items/:id` | none | one cart per user; items hold `product_id` and `quantity` |
| `GET/POST/PUT/DELETE /order[/:id]`, `POST /order/items`, `PUT/DELETE /order/items/:id` | none | see "Order creation" |
| `GET/POST /payment` | none | a payment row per order: `amount`, `method`, `status` |

## Data model (10 tables)

`Users` (firstName, lastName, unique email, argon2 hash, role `customer|admin|manager`), `Categories`, `SubCategories` (unique name, category), `Products` (name, description, `DECIMAL(10,2)` price, integer stock, owner user, category, sub-category), `ProductImages` (url), `Carts` (one per user), `CartItems`, `Orders` (user, `DECIMAL(10,2)` total, status string default `pending`), `OrderItems` (quantity, `price_at_purchase`), `Payments` (order, user, amount, method, status default `pending`).

## Order creation (the one real business rule)

Body `{ user_id, items: [{ product_id, quantity }] }`. In one transaction: reject an empty item list; require the user and every product to exist; reject when `stock < quantity`; snapshot each product's current price into `price_at_purchase`; decrement stock; set `total_amount` to the sum of `price x quantity`; status starts `pending`. The response is the order with items, products and user.

## Defects the rebuild must not carry over

1. **Open endpoints.** Cart, order and payment routes need no sign-in: anyone can read every order (with the customer record) and delete or edit any of them.
2. **Privilege escalation.** `POST /user` accepts `role: "admin"` from the caller.
3. **Client-controlled money.** `PUT /order/:id` lets the caller set `status` (including a paid state) and `total_amount`; `POST /payment` takes the amount from the body.
4. **Identity from the body.** `user_id` on orders and payments is trusted from the request, not taken from the token.
5. **Overselling.** Stock is read, compared and written back without a row lock or a conditional update, so two simultaneous orders can both pass the check.
6. **Any user edits any user** (`PUT /user/:id` has no ownership check).
7. **Credential logging.** Login and registration `console.log` password hashes.
8. **Information leaks.** Login distinguishes unknown email from wrong password; error responses carry `error.message` from the database layer; list endpoints return whole user rows.
9. **Refresh tokens are not typed or rotated:** an access token and a refresh token differ only by secret, with no revocation.
10. **Floating point money** in JavaScript arithmetic over `DECIMAL` values.
11. **No pagination, filtering or search** on any list; N+1 style eager loading on order lists.
12. **Hygiene:** both `bcrypt` and `argon2` installed, ten loose `test-*.js` / `fix_*.js` scripts and `error.log` in `backend/`, Railway and Vercel configs side by side, a hard-coded `rejectUnauthorized: false` TLS setting.

## Parity target

Reproduce: the route families above (under `/api/v1`, with the same resource names), the role set, the two-level taxonomy, price snapshots on order items, the stock check inside the order transaction. Replace: everything in the defect list, as explicit requirements with tests.
