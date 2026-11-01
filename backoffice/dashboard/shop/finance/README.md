# Finance dashboard

The opt-in modern `BDashboardShopFinance` keeps the existing snapshot, native-currency summaries, monetary histories and six product-type count series. The Finance tree and outline controls follow the approved 2026-11-01 mockup. Legacy callers retain the original table and chart presentation.

Payment services are grouped by their real gateway currency, sorted by code and shown in two independent desktop columns. At 650px of widget content or less the same groups stack in one column. Native, initially open `details` keep keyboard disclosure and retain their state during unrelated measure updates. Each service uses its canonical provider asset and original `BPageGatewayDashboard` route with `gateway_code`; Manage methods and currency management keep their native destinations. Shop activation, Live/Debug and global provider availability remain separate states. No gateway list is truncated and grouping never mutates its source.

The approved dense refinement uses currency headings of at least 44px with 6px vertical and 12px horizontal insets. Currency code and country share a wrapping line. Service rows are at least 48px with 4px vertical and 12px horizontal insets; currency groups have a 12px gap. Typography stays readable: 14px currency identities, 13px provider names and 12px metadata. Multiline content grows naturally. Connected, rounded branches follow variable row heights, and metadata dots retain a fixed 4px square flex basis. The root follows Vuetify's actual locale direction; logical connectors and directional chevrons mirror in RTL. Measure options retain native multiple selection, persistent 17px purpose icons, a separate 12px check, 12px labels and raised neutral selection. They wrap to two columns on narrow screens and retain 44px coarse-pointer targets. Icons are a small local Lucide subset; existing shell and provider assets stay unchanged.

Each monetary history opts into `SChartFunnelFinance`'s existing modern path: an independent display currency and included-source selection, real recorded-period labels, current-rate estimated totals and canonical currency identities. Missing rates/data stay distinct from observed zero; signed amounts retain the existing signed chart. Chart construction, exact-value details, resize handling and the report's date scope remain native. English and Persian copy lives in the dashboard translation dictionaries.

Focused checks:

```powershell
node --test '@selldone/components-vue/backoffice/dashboard/shop/finance/BDashboardShopFinance.test.mjs' '@selldone/components-vue/backoffice/chart/funnel/finance/SChartFunnelFinance.test.mjs' 'src/Applications/Backoffice/pages/shop/dashboard/BPageShopDashboard.test.mjs'
```

These cover component/template/scoped-style compilation, more than 100 services, immutable grouping, statuses/types/routes, multiple measures, independent currency selections, six count series, empty recovery, legacy behavior, readiness and monetary edge cases. Use the user's existing HMR session for visual verification; no production build or backend/cache operation is required.

Local HMR verification covered 1353px desktop, 390px mobile and 320px narrow layouts, no page overflow or console errors, native Enter/click disclosure and independent live chart selectors. The two legacy template branches were compared with the original source. No store settings or payment configuration were changed.

Task files: `BDashboardShopFinance.vue`, new `BDashboardShopFinanceIcon.vue`, new `BDashboardShopFinance.test.mjs` and this new `README.md`; `backoffice/chart/funnel/finance/SChartFunnelFinance.vue` and its new `SChartFunnelFinance.test.mjs`; the Finance keys in `@selldone/translate/dashboard/en.ts` and `fa.ts`.
