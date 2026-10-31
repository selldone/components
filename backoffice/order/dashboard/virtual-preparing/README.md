# Virtual order preparation

The approved Refined view reuses the shared Modern Order Processing structure,
header, status, help and action primitives. The `modern` prop defaults to `false`,
so existing callers and vendor preparation retain their original widget and event
contract.

Digital preparation lists real basket products, purchased units and the allocated
`virtual_items` record IDs. More than three IDs use an inline disclosure. Output
values and private attributes stay in the existing Form view; Open Form uses its
existing named route and the current route params.

The existing `confirm-preparing` event and completion callback update preparation.
The modern action additionally requires a paid, unrejected order at confirmation
or preparation and prevents duplicate clicks while busy. Only an enabled current
confirmation step uses the 52px primary action; completed updates and unavailable
actions use the standard outlined treatment. Delivered orders are read only and
show `delivery_at` only when supplied.

`SOrderDeliveryAutoComplete` supplies the existing slot with a quiet modern
schedule only for paid, unrejected orders in preparation that have the server's
`auto_complete_at`. The existing countdown consumes that exact timestamp; the UI
does not invent a delivery duration or email behavior.

Feature geometry: 20px card inset, 16px corners, 18px/24px medium title, 12px/18px
body and 34px product images. Colors, buttons and tooltips use shared theme-aware
modern primitives. Rows wrap on mobile without hiding IDs or Form access.

Files:

- `BOrderDashboardVirtualPreparing.vue`: digital records, existing Form navigation
  and guarded preparation action.
- `storefront/order/auto-complete/SOrderDeliveryAutoComplete.vue`: opt-in modern
  projected countdown; legacy display remains unchanged.
- `BOrderDashboardVirtualPreparing.test.mjs`: synthetic handler, event, privacy,
  route, stage, timestamp and rendered-state checks, plus SFC/template/SCSS checks.
  It resolves the real enum module and renders through the existing DateMixin.

The complete native Virtual dashboard integration also reaches:

- `src/Applications/Backoffice/pages/order-virtual/BPageOrderVirtual.vue` and
  `dashboard/BPageOrderVirtualDashboard.vue`: explicit native route opt-in and the
  existing wrapper event flow. `BPageOrderVirtualDashboard.test.mjs` verifies the
  native integration and its request/event boundary.
- Shared components `backoffice/order/dashboard/BOrderDashboard.vue`,
  `storefront/order/delivery-state/SOrderDeliveryState.vue`,
  `backoffice/order/cart/BOrderCart.vue` and
  `backoffice/order/dashboard/payment/BOrderDashboardPayment.vue`: the same
  overview, stages, basket and payment structure used by Physical, with digital
  wording and existing Form access.
- `@selldone/translate/dashboard/en.ts` and `fa.ts`: localized digital labels and
  guidance.
- `.ai-agent/guides/selldone-product-ui-design.md`: the user-approved shared
  structure across order types, with each type reviewed separately.

Unqualified preparation filenames are local; other component paths are relative
to `@selldone/components-vue`. Application and translation paths are relative to
the main repository.

Run from the repository root:

```powershell
node @selldone/components-vue/backoffice/order/dashboard/virtual-preparing/BOrderDashboardVirtualPreparing.test.mjs
node src/Applications/Backoffice/pages/order-virtual/dashboard/BPageOrderVirtualDashboard.test.mjs
```

The focused check makes no requests and does not change order data. Live stage
transitions and notification delivery require separate authorized application
verification; visual review uses the existing local HMR application.

Local verification (2026-10-29): both focused checks pass, including native/vendor
isolation, single refresh forwarding, four Virtual stages versus five Physical
stages, real module exports and the delivery-date mixin. The 21 English/Persian
Virtual keys compile with matching interpolation names.

The authenticated local Virtual order was reviewed on desktop and at 736px and
320px. Payment/card/risk/channel details, the four-stage strip, digital record
identity, actual delivered date, existing Form route, disabled 42px outlined
action and Refined/Workspace switching were checked. Touch controls remain at
least 44px. The shared stage strip uses one column below 400px to keep stage
titles intact; the digital unit/record summary balances its wrapped lines.

Active transitions and scheduled completion use synthetic state fixtures only;
no real payment, output, notification or order-state mutation was performed. No
production build was run. Persian RTL and dark mode were not exercised in the
live browser during this change.

After the rendered desktop/mobile review, the browser preview stopped loading
while collecting the final proof image. No usable final capture was saved; the
temporary preview was closed and the viewport override reset. The local servers
were not restarted.
