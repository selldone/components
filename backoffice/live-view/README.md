# Shop Live View

`GeoMap` presents the approved Refined Live View in the shop dashboard and existing CRM report. It accepts an optional `shop`; CRM callers without it use `route.params.shop_id`. `windowMinutes` selects 5 or 15 minutes, and `windowControl=false` lets the dashboard own that selector.

Four headline metrics separate recorded sessions/customers active in the last 60 seconds from selected-window cart additions and successfully placed orders. Product views, cart removals and purchase attempts remain distinct secondary counters. Recent rows are minute/country/activity aggregates, not individual orders or second-by-second activity. Initial unknown values are dashes; real server zeroes remain zero. Presence mini-trends contain snapshots received by this mounted view; event trends use returned minute buckets, including the current partial minute.

Server snapshots with `simulated=true` show an explicit Sample data label and generated-activity explanation. Only the canonical backend sample-shop allow-list selects that mode; the component never generates data or chooses simulation from a client/query flag. Ordinary snapshots retain their real values and omit the sample disclosure.

The map uses local SVG/D3 geometry without Mapbox, map-network requests, canvas or WebGL. `world-countries.geo.json` contains the 176 non-Antarctic Natural Earth 1:110m country features published in `@d3-maps/atlas@1.0.0`, converted to GeoJSON. Natural Earth geography is public-domain reference data. Pan/zoom/fit and explicit browser geolocation remain available. That device location stays local and never becomes a visitor marker or API payload. Nearby real geo cells share a keyboard-accessible 44px button with a compact 36px circle and country subtotals. Missing or capped geo details do not replace aggregate totals; country selection uses the server country total, separately from mapped-cluster sums.

## Updates and authorization

HTTP URLs derive from SDK `GET_SHOP_REALTIME_DATA(id)` by replacing `/real-time` with `/live-view`. Initial `POST /watch` creates a UUID viewer lease and returns the snapshot. One 10-second timer renews it every 20 seconds while visible, online and unpaused; a non-subscribed or stale socket falls back to GET. Snapshot/watch requests do not run in parallel. Renewal responses recover missed data and rotate to the server-returned current topic.

An owned Pusher 8 client and Echo instance subscribe only to that returned private topic. The custom authorization handler retains native Axios session/CSRF behavior and uses SDK `/live-view/auth`; the returned API-relative endpoint must match the current shop. Global `/broadcasting/auth` is not used. Echo global interceptors are disabled, and neither `window.Echo` nor another feature's connection is changed. “Live” requires the current private subscription acknowledgement; disabled broadcasting is labeled “Snapshot updates”.

Pause, page hiding, going offline, changing shops and unmounting abort requests, invalidate late callbacks, stop the timer, disconnect the owned connection and release the old viewer best-effort. The server lease expires after 40 seconds if a page disappears. Shop/sequence guards reject cross-shop or stale snapshots. Transient errors retain real values with retry; revoked authentication/report access clears the view and stops reads.

Only newly increased located cart/order counts create finite pulses. Initial data, unchanged values and range selection do not; reduced motion suppresses them. Typography inherits the app font and UI spacing is logical for RTL. Geographic SVG coordinates retain their physical orientation and do not depend on device pixel ratio. Map/trend dimensions follow observed content width. Narrow screens stack side/bottom panels and retain 44px controls and table actions.

Resize notifications share one owned animation frame. Unchanged map dimensions and trend-only changes preserve zoom; unmount cancels the frame and invalidates queued layout callbacks. At 320px paired metric values retain aligned baselines, and empty-map copy reserves space beside the controls.

## Validation

From the workspace root:

```sh
node --test @selldone/components-vue/backoffice/live-view/geoMap.test.mjs
```

Tests isolate HTTP, private transport, clocks and Vue controls while exercising real source/state/D3 geometry. They cover leases/coalescing, SDK prefixes/scoped auth, topic rotation, stale callbacks, cleanup, transient/permission errors, real 5/15-minute values, zeros, clusters, finite pulses, initial placeholders and rendered panels. Compiler checks cover Vue template/script/scoped Sass. Native socket authorization, browser geolocation permission and final responsive/dark/RTL rendering remain integration/browser checks.
