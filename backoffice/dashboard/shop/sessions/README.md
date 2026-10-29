# Shop session reports

`BDashboardShopSessions` keeps the existing dashboard summary and full session
views. CRM Report opts into its approved audience layout with `modern`,
`full-details`, and `report`; other callers keep their current presentation.

The report retains the authorized Sessions endpoint and its own selectable
calendar period, including bounded custom dates within the last 90 days. Country
and device totals are independent counters. Country rows, shares, and sparklines
always use the full session period; the playback slider changes only the map and
its inspected-country value. The service-area toggle continues to use the shop's
configured countries.

Map clicks and native country-list buttons inspect a country without changing
the report period. Device composition uses the existing device counters and a
report-only donut chart. A failed report read retains previous observations and
offers a retry. No synthetic history or API writes are introduced.

Focused checks, run from the main repository root:

```sh
node --test @selldone/components-vue/backoffice/session/map/BSessionsMap.test.mjs
node @selldone/components-vue/backoffice/dashboard/shop/aquisition/BDashboardShopAcquisition.test.mjs
```
