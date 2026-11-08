# Shop session reports

`BDashboardShopSessions` keeps the existing dashboard summary and full session
views. CRM Report opts into its approved audience layout with `modern`,
`full-details`, and `report`; other callers keep their current presentation.

The report retains the authorized Sessions endpoint and its own selectable
calendar period: the compact period menu (Today to Last 90 days) whose Custom
choice opens the shared `ui/time/span/custom` date dialog. Country and device
totals are independent counters. Country rows, shares, and sparklines always use
the full session period; the strip of daily sessions under the map previews or
selects one day on the map only. The service-area toggle continues to use the
shop's configured countries.

Map clicks and native country-list buttons inspect a country without changing
the report period. Device composition uses the existing device counters and the
leader-line donut. A failed report read retains previous observations and offers
a retry. No synthetic history or API writes are introduced.

## Shop dashboard (2026-11-08)

Without `report`, `audience` or an activity label the map uses the dashboard layout
(`dashboard` in `BSessionsMap`):

- Overview card (`summary`): a period menu (Today to Last 90 days, or Custom up to 90
  days) instead of the range slider, reading the same exact calendar days as the full
  view; the color-mapped map with its fewer/more key, a hover card per country
  (sessions, share, rank among countries, daily trend), the top three countries and the
  device bars.
- Acquisition card (`full-details`): the same hover card, a strip of daily sessions under
  the map instead of playback (point at a day to preview it on the map, select it to keep
  it; arrow keys, Home/End and Escape work), and the leader-line device donut
  (`ui/chart/donut-leader`) instead of the polar area.

CRM Report (`report`, 2026-11-08) shares the hover card, the daily strip and the device
donut; only audience and activity maps keep playback and the polar area.

A day's row also carries device counters, so the map is given its countries only.

Focused checks, run from the main repository root:

```sh
node --test @selldone/components-vue/backoffice/session/map/BSessionsMap.test.mjs
node @selldone/components-vue/backoffice/dashboard/shop/aquisition/BDashboardShopAcquisition.test.mjs
```
