# Order session report

The approved Refined report presents the session saved with an order: operating
system, canonical browser identity, device/category, IP address, country and an
interactive estimate of the IP location. It does not imply a live connection,
GPS verification or a delivery address.

`BOrderSession` opts in through `modern` (default `false`) and accepts optional
`orderCode` context. The eight native Track pages enable it; reused vendor pages
retain the existing layout. Campaign overview and campaign-link content keep
their original conditions and actions. No server contract or authorization
changes are involved.

The content is centered at 960px maximum. Device/network details and the map sit
side by side, then stack below 650px. Shared modern surfaces, tooltip and action
primitives retain application fonts, theme colors, logical alignment and touch
targets. English and Persian copy explains saved-session and IP-estimate scope.

Missing session data and missing/invalid coordinates have explicit empty states;
unknown fields are labeled as not recorded. Valid zero coordinates remain valid.
Changing the order replaces the map and copy target without retaining the prior
session. Copy IP uses the existing clipboard helper and never truncates IPv6.
The existing UMapView retains provider mapping, viewer geolocation, desktop
zoom/rotation/fullscreen and mobile map gestures. The viewer-location button is
not automatically activated. Its shared marker guard now accepts numeric zero
and rejects absent, blank, nonnumeric and nonfinite coordinates.

## Verification

Run from the application root:

```powershell
node @selldone/components-vue/backoffice/order/session/BOrderSession.test.mjs
```

The isolated test runs the actual component/watchers with synthetic sessions and
covers preserved fields, null/sparse/unknown data, coordinate boundaries and zero,
prop changes, current full IPv6 copying, escaped text, legacy opt-in behavior,
the native marker method and English/Persian key parity. It makes no network or
geolocation requests. All 16 Track/parent SFCs, templates and scoped styles were
checked; native/vendor route gates and seven campaign blocks were verified.

Browser QA used the existing authenticated local Physical order report. The
desktop, 736px and 320px layouts fit without horizontal page overflow; measured
desktop type is 22px/29px for the title, 16px/23px for subsection headings and
12px/20px for details, with a 258px map (260px on narrow layouts). Copy/help touch
targets measure 44px. The IP-location tooltip, Escape dismissal, native desktop
zoom and fullscreen were checked. Missing-data cases and clipboard contents were
verified with synthetic tests rather than modifying order data. No production
build, real geolocation permission request or server mutation was performed.

## Files changed for this implementation

Paths below are relative to the application repository root. Existing tracked
edits remain unstaged; only this new README and the new test are staged.

- `@selldone/components-vue/backoffice/order/session/BOrderSession.vue`
- `@selldone/components-vue/backoffice/order/session/BOrderSession.test.mjs` (new)
- `@selldone/components-vue/backoffice/order/session/README.md` (new)
- `@selldone/components-vue/ui/map/view/UMapView.vue`
- `@selldone/translate/dashboard/en.ts`
- `@selldone/translate/dashboard/fa.ts`
- `src/Applications/Backoffice/pages/order-physical/BPageOrderPhysical.vue`
- `src/Applications/Backoffice/pages/order-physical/track/BPageOrderPhysicalTrack.vue`
- `src/Applications/Backoffice/pages/order-virtual/BPageOrderVirtual.vue`
- `src/Applications/Backoffice/pages/order-virtual/track/BPageOrderVirtualTrack.vue`
- `src/Applications/Backoffice/pages/order-file/BPageOrderFile.vue`
- `src/Applications/Backoffice/pages/order-file/track/ShopProcessCenterFileOrderPage_Track.vue`
- `src/Applications/Backoffice/pages/order-service/BPageOrderService.vue`
- `src/Applications/Backoffice/pages/order-service/track/BPageOrderServiceTrack.vue`
- `src/Applications/Backoffice/pages/order-subscription/BPageOrderSubscription.vue`
- `src/Applications/Backoffice/pages/order-subscription/track/BPageOrderSubscriptionTrack.vue`
- `src/Applications/Backoffice/pages/order-avocado/BPageOrderAvocado.vue`
- `src/Applications/Backoffice/pages/order-avocado/track/BPageOrderAvocadoTrack.vue`
- `src/Applications/Backoffice/pages/order-hyper/BPageOrderHyper.vue`
- `src/Applications/Backoffice/pages/order-hyper/track/BPageOrderHyperTrack.vue`
- `src/Applications/Backoffice/pages/order-fulfillment/BPageOrderFulfillment.vue`
- `src/Applications/Backoffice/pages/order-fulfillment/track/BPageOrderFulfillmentTrack.vue`
