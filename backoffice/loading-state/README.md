# Dashboard list loading

`BListLoadingState.vue` presents the approved Pipeline while an authorized list read is pending. Its owner starts/stops the request, mounts/removes the loader, distinguishes failure from successful empty data, and retains existing retry, permissions and stale-response guards. The component makes no requests and has no actions or simulated completion.

- `kind`: the same 17 subjects as `BListEmptyState` (`product`, `category`, `order`, `customer`, `content`, `discount`, `campaign`, `affiliate`, `shipping`, `location`, `domain`, `payment`, `automation`, `team`, `app`, `log`, `records`). Unknown values use `records`.
- `title`, `description`: optional localized text overrides. An empty string hides that text. Full defaults use `dashboard_loading_state.{kind}` and `.description`.
- `compact`: an inline 44px pipeline and `.refreshing` label, without description, padding or minimum height. Position it within the owner's existing overlay during a same-scope refresh and retain loaded rows. The owner must keep the indicator from adding layout height.

For initial loading, use the native table loading slot only while there are no rows. Keep native `loading` / busy and action guards. Register the custom loading slot conditionally: some Vuetify tables render an existing custom slot during refresh even with rows. Replace duplicate native/custom bars rather than stacking indicators. Clear records immediately when authorization scope changes.

The full composition reserves a 300px region, a responsive 320×160 artwork and inherited application font with 17px/25px medium title and 13px/22px description. Neutral Vuetify theme colors and the independent illustration accent preserve appearance modes. The pipeline mirrors in RTL. Decorative nodes are hidden from assistive technology; one polite status announces only the real loading copy.

Two small packets loop only while mounted for a pending request. This is genuine indeterminate operational activity, rather than the finite decorative story described in the illustration kit. Motion pauses offscreen and while the document is hidden; the observer and listener are disposed on unmount. Reduced motion shows all nodes, all connectors and stationary packets together. No success, progress percentage or result timing is invented.

Run `node --test @selldone/components-vue/backoffice/loading-state/BListLoadingState.test.mjs`. Tests compile/render the actual SFC, validate EN/FA text and overrides, and mount it with isolated visibility boundaries to exercise observer/listener cleanup. No production build, cache changes or live requests are required.

## Native integration

Loading must not blur the list, its SVG/empty state, retained records or any workspace ancestor. Keep native busy/disabled guards and use `disabled-no-filter` for an existing CSS pointer lock; do not reuse `blurred`, `blur-animate` or the Shop shell's former `-blur` class as a busy state. The standard progress indicator remains absolute in the existing local relative container, with one indicator for the same request and no layout movement. Authentication/privacy overlays and decorative/media effects are separate from loading feedback.

Vuetify `VDataTableRows` replaces populated rows whenever a custom loading slot is registered. Use `<template v-if="!rows?.length" #loading>` on tables and keep their actual `:loading="busy"`. `VDataIterator` uses `#loader` instead; bind its native loading to `busy && !items?.length`, keep actual `aria-busy="busy"`, and display compact refresh separately over retained cards. Preserve disabled/inert operations during the same waiting period.

Shared `table-loading.scss` suppresses a duplicate native progress row only when the same table displays Pipeline; `sd-modern-list-refresh` remains absolute. Modern row padding excludes native loading rows. The catalog keeps its existing successful-empty confirmation and request ownership.

## Verification

The final combined run passes **254 tests across 23 focused files**, with no Vue warnings or unhandled rejections. The separate shared-owner suite also passes 114 cases. All 115 consuming SFC scripts/templates and 99 local style blocks compile. The tests exercise the real native table and iterator APIs, pending/refresh/successful-empty/unavailable boundaries, null/reset arrays, retained rows, EN/FA copy, subject fallback, visibility cleanup and reduced motion.

Browser QA compares the actual compiled component with the approved geometry at 1280px, 390px and 320px, including Persian/RTL, a dark token surface and retained-row refresh. The title measures 17px/25px/500, supporting text 13px/22px and full artwork 320px in a 300px region. The existing local Products and Discount Codes pages render through HMR; the native Discount table exposes Pipeline during its real pending read without a current console error. The dark preview is a controlled token surface, not a complete live Smart invert audit. Every owner was source-checked; all pages were not visually inspected. No production build, cache mutation or resource creation ran.

## Components-vue consumers

Pickers, charts, save-only busy states and lists without a read signal keep their existing lifecycle.

- `@selldone/components-vue/backoffice/account/charge/list/BAccountChargesList.vue`
- `@selldone/components-vue/backoffice/app/shop/store/BAppShopStore.vue`
- `@selldone/components-vue/backoffice/blog/category/list/BBlogCategoriesList.vue`
- `@selldone/components-vue/backoffice/blog/list/BBlogsList.vue`
- `@selldone/components-vue/backoffice/box/list/BBoxesList.vue`
- `@selldone/components-vue/backoffice/contact/list/BContactsList.vue`
- `@selldone/components-vue/backoffice/domain/list/BDomainsList.vue`
- `@selldone/components-vue/backoffice/drop-shipping/DropShippingAccountCharges.vue`
- `@selldone/components-vue/backoffice/inventory/list/BInventoryList.vue`
- `@selldone/components-vue/backoffice/listing/review/BShopListingReviewsList.vue`
- `@selldone/components-vue/backoffice/logistic/profile/list/BLogisticProfilesList.vue`
- `@selldone/components-vue/backoffice/map/tag/list/BMapTagsList.vue`
- `@selldone/components-vue/backoffice/map/tag/products/BMapTagProducts.vue`
- `@selldone/components-vue/backoffice/order/bill/list/BOrderBillsList.vue`
- `@selldone/components-vue/backoffice/order/return-request/SBackofficeReturnRequestsList.vue`
- `@selldone/components-vue/backoffice/process-center/list/BProcessCenterList.vue`
- `@selldone/components-vue/backoffice/product/inventory/management/virtual/BProductInventoryManagementVirtual.vue`
- `@selldone/components-vue/backoffice/product/list/BProductsList.vue`
- `@selldone/components-vue/backoffice/product/window/BProductsWindow.vue`
- `@selldone/components-vue/backoffice/ribbon/list/BRibbonList.vue`
- `@selldone/components-vue/backoffice/role/panel/orders/list/BRolePanelOrdersList.vue`
- `@selldone/components-vue/backoffice/shop/sms/template/list/BShopSmsTemplateList.vue`
- `@selldone/components-vue/backoffice/shop/theme/typography/BShopThemeCustomFonts.vue`
- `@selldone/components-vue/backoffice/subscription/ShopSubscriptionList.vue`
- `@selldone/components-vue/backoffice/transportation/service/orders/BTransportationServiceOrders.vue`
- `@selldone/components-vue/backoffice/user/security/login-devices/BUserSecurityLoginDevices.vue`
- `@selldone/components-vue/backoffice/vendor/account/transactions/list/BVendorAccountTransactionsList.vue`
- `@selldone/components-vue/backoffice/vendor/documents/list/BVendorDocumentsList.vue`

## Components-vue regression tests

- `@selldone/components-vue/backoffice/product/window/BProductsWindow.empty-state.test.mjs`
- `@selldone/components-vue/backoffice/loading-state/BListLoadingState.table.test.mjs`
- `@selldone/components-vue/backoffice/loading-state/BListLoadingState.test.mjs`
- `@selldone/components-vue/backoffice/logistic/profile/list/BLogisticProfilesList.test.mjs`
- `@selldone/components-vue/backoffice/vendor/account/transactions/list/BVendorAccountTransactionsList.test.mjs`

## Clear loading content (2026-11-01)

Removed pending blur from the Orders tables, file-inventory list, Shop workspace refresh, tax summaries, SEO previews, FAQs, basket, country-support cards and pricing tables/cards. Orders retain their original highlight-aware pointer lock through `disabled-no-filter`; other native blocking/busy behavior remains. FAQ and pricing use one shared absolute progress indicator per operation. Intentional authentication/privacy, modal-backdrop and decorative/media blur remains outside the loading rule.

All 15 source SFCs and 12 local style blocks compile. The four focused Orders/style/Shop-readiness/VAT-deposit suites pass 57 cases. Regression coverage renders real pending Pipeline and retained-row refresh for all five product/order types, verifies the CSS lock without blur/grayscale/dimming, and retains one absolute indicator. Browser verification of the actual local Physical Orders pending read observes `aria-busy=true`, visible Pipeline and no CSS filter/backdrop filter on the table or any ancestor; its console has no current errors. No production build or application writes were used.

Task-related source changes:

- `@selldone/components-vue/backoffice/process-center/list/BProcessCenterList.vue`
- `@selldone/components-vue/backoffice/product/inventory/management/file/BProductInventoryManagementFile.vue`
- `@selldone/components-vue/backoffice/account/tax/BAccountTax.vue`
- `@selldone/components-vue/backoffice/tax/profile/report/BTaxProfileReport.vue`
- `@selldone/components-vue/backoffice/shop/add/BShopAdd.vue`
- `@selldone/components-vue/backoffice/product/add/full/BProductAddFull.vue`
- `src/Applications/Storefront/components/orders/list/SOrdersList.vue`
- `src/Applications/Storefront/pages/faq/StorefrontPageFaq.vue`
- `src/Applications/Storefront/pages/basket/cart/StorefrontPageBasketCart.vue`

The focused Process Center check lives in `backoffice/process-center/list/BProcessCenterList.test.mjs`.
