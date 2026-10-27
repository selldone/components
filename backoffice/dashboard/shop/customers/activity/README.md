# Customer activity summary

`BDashboardShopCustomerActivity` extends the approved Customers dashboard with three compact lists of up to five records. Pass the authorized `shop` and mount it only in Customers. The optional `active` prop defaults to `true` and prevents reads when a kept-alive tab is inactive. Its data is independent of the dashboard report date range.

The component reads native `API.GET_SHOP_CUSTOMERS(shop.id) + '/activity-summary'` once when active and visible, with an explicit refresh/retry action and no polling. The endpoint requires the native customer-read token scope and shop Customers read permission. HTTP 401/403/404 and native logical denial codes 1/201 clear every loaded identity. Transient failures retain the previous real report and its timestamp. Shop changes, hidden pages, inactive tabs and unmount abort requests; generation/shop checks reject late responses.

The response contains `shop_id`, `as_of`, `joined`, `active`, `purchasers` and `active_scope`. Each list contains only `{id,user_id,name,at}` records, newest first. An empty array is a real empty list; a missing group is unavailable, not an invented zero result. The UI preserves server order and caps each group at five.

- **Joined this shop** uses shop-customer membership creation time, including manual/imported profiles. It does not represent global Selldone account creation.
- **Recently active** uses native shop-customer `login_at` in the last 24 hours: recorded shop login or first daily observed activity. Later same-day activity may not update it. It is not continuous last-seen or live presence.
- **Latest purchasers** uses the most recent successful recorded purchase, including completed free/gift orders. Purchasers are distinct customer identities, not an order feed; a later refund does not erase the recorded timestamp.

Rows reuse the native `getUserAvatar(user_id)` / `UAvatarText` identity pattern and route to `BPageCustomerDashboard` with the shop customer ID. Only the name and localized exact timestamp/time zone are shown. No email, phone, amounts or order details are displayed. All profile links retain visible keyboard focus, modern top tooltips and at least 44px targets. Three unboxed desktop columns stack on narrow screens; feature styles remain scoped and use logical spacing and shared theme tokens.

The parent owns `admin_shop.dashboard.customer_activity` translations and integration. No existing legacy caller or shared customer component is modified.

## Validation

From the workspace root:

```sh
node --test @selldone/components-vue/backoffice/dashboard/shop/customers/activity/BDashboardShopCustomerActivity.test.mjs
```

Tests exercise the actual SFC methods/template with isolated native HTTP responses and Vue SSR control stubs: visible activation/coalescing, abort/stale cleanup, transient and permission errors, tenant scope, five-row limits, native profile IDs/avatar fallback, exact/unknown times, no contact PII, and distinct loading/empty/unavailable states. They do not replace backend authorization tests or final browser layout/tooltip checks.
