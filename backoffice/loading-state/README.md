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

## Rollout inventory

### Verification

The final combined run passes **254 tests across 23 focused files**, with no Vue warnings or unhandled rejections. The separate shared-owner suite also passes 114 cases. All 115 consuming SFC scripts/templates and 99 local style blocks compile. The tests exercise the real native table and iterator APIs, pending/refresh/successful-empty/unavailable boundaries, null/reset arrays, retained rows, EN/FA copy, subject fallback, visibility cleanup and reduced motion.

Browser QA compares the actual compiled component with the approved geometry at 1280px, 390px and 320px, including Persian/RTL, a dark token surface and retained-row refresh. The title measures 17px/25px/500, supporting text 13px/22px and full artwork 320px in a 300px region. The existing local Products and Discount Codes pages render through HMR; the native Discount table exposes Pipeline during its real pending read without a current console error. The dark preview is a controlled token surface, not a complete live Smart invert audit. Every owner was source-checked; all pages were not visually inspected. No production build, cache mutation or resource creation ran.

A broader 52-file run also exposed two contracts outside this task's changes: `src/Applications/Backoffice/pages/shop/dashboard/BShopAiAgentPeriod.test.mjs:139` expects `has_connection`, and `src/Applications/Backoffice/pages/shop/logistic/BPageShopLogistic.test.mjs:56` expects the exporter's `export_url`. Those unrelated sources/tests were left intact. All eight loading-rollout failures in that broader run were repaired and pass focused reruns.

### Production consumers

115 production owners use the common presentation. Pickers, charts, save-only busy states and lists without a read signal keep their existing lifecycle. This task also updates `style/selldone/table-loading.scss`, Backoffice `style/modern-design.scss` and `style/table-loading.test.mjs`, dashboard EN/FA `dashboard_loading_state` copy, the Products README and the product UI guide.

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
- `src/Applications/Backoffice/pages/account/shops/BPageAccountShops.vue`
- `src/Applications/Backoffice/pages/account/transactions/BPageAccountTransactions.vue`
- `src/Applications/Backoffice/pages/affiliate/orders/BPageAffiliateOrders.vue`
- `src/Applications/Backoffice/pages/affiliate/payments/BPageAffiliatePayments.vue`
- `src/Applications/Backoffice/pages/affiliator/orders/BPageAffiliatorOrders.vue`
- `src/Applications/Backoffice/pages/affiliator/payments/BPageAffiliatorPayouts.vue`
- `src/Applications/Backoffice/pages/cashback/orders/BPageCashbackOrders.vue`
- `src/Applications/Backoffice/pages/club/customers/BPageClubCustomers.vue`
- `src/Applications/Backoffice/pages/club/orders/BPageClubOrders.vue`
- `src/Applications/Backoffice/pages/connect/logs/ShopConnectPage_Logs.vue`
- `src/Applications/Backoffice/pages/connect/products/BPageConnectProducts.vue`
- `src/Applications/Backoffice/pages/coupon/orders/BPageCouponOrders.vue`
- `src/Applications/Backoffice/pages/customer/wallet/BCustomerWalletTransactions.vue`
- `src/Applications/Backoffice/pages/discount-code/orders/BPageDiscountCodeOrders.vue`
- `src/Applications/Backoffice/pages/gateway/transactions/BPageGatewayTransactions.vue`
- `src/Applications/Backoffice/pages/giftcard/cards/AdminGiftCardManagementPage.vue`
- `src/Applications/Backoffice/pages/giftcard/orders/AdminGiftcardPage_Orders.vue`
- `src/Applications/Backoffice/pages/marketplace/accounts/BPageMarketplaceWallets.vue`
- `src/Applications/Backoffice/pages/marketplace/payouts/BPageMarketplacePayouts.vue`
- `src/Applications/Backoffice/pages/marketplace/pricing/BPageMarketplacePricings.vue`
- `src/Applications/Backoffice/pages/marketplace/products/BPageMarketplaceProducts.vue`
- `src/Applications/Backoffice/pages/marketplace/requests/BPageMarketplaceRequests.vue`
- `src/Applications/Backoffice/pages/marketplace/vendors/BPageMarketplaceVendors.vue`
- `src/Applications/Backoffice/pages/offer/orders/BPageOfferOrders.vue`
- `src/Applications/Backoffice/pages/product/cross-selling/BPageProductCrossSelling.vue`
- `src/Applications/Backoffice/pages/product/membership/BPageProductMembership.vue`
- `src/Applications/Backoffice/pages/product/vendors/BPageProductVendors.vue`
- `src/Applications/Backoffice/pages/review/dashboard/BShopReviewsList.vue`
- `src/Applications/Backoffice/pages/shop/applications/metaverse/BPageShopApplicationsMetaverse.vue`
- `src/Applications/Backoffice/pages/shop/automation/ai-agents/BPageShopAutomationAiAgentLogs.vue`
- `src/Applications/Backoffice/pages/shop/automation/ai-agents/BPageShopAutomationAiAgents.vue`
- `src/Applications/Backoffice/pages/shop/automation/logging/BShopAutomationLogging.vue`
- `src/Applications/Backoffice/pages/shop/automation/notifications/BShopAutomationNotifications.vue`
- `src/Applications/Backoffice/pages/shop/blogs/workspace/BShopArticleComments.vue`
- `src/Applications/Backoffice/pages/shop/channels/connect/BPageShopChannelConnect.vue`
- `src/Applications/Backoffice/pages/shop/classification/categories/BPageShopClassificationCategories.vue`
- `src/Applications/Backoffice/pages/shop/classification/clusters/BPageShopClassificationClusters.vue`
- `src/Applications/Backoffice/pages/shop/community/categories/BPageShopCommunityCategories.vue`
- `src/Applications/Backoffice/pages/shop/community/comments/BPageShopCommunityComments.vue`
- `src/Applications/Backoffice/pages/shop/community/posts/BPageShopCommunityPosts.vue`
- `src/Applications/Backoffice/pages/shop/community/topics/BPageShopCommunityTopics.vue`
- `src/Applications/Backoffice/pages/shop/crm/comments/BPageShopCrmComments.vue`
- `src/Applications/Backoffice/pages/shop/crm/customers/BPageShopCrmCustomers.vue`
- `src/Applications/Backoffice/pages/shop/crm/reviews/BPageShopCrmReviews.vue`
- `src/Applications/Backoffice/pages/shop/dashboard/components/BShopDashboardAiAgents.vue`
- `src/Applications/Backoffice/pages/shop/finance/customer-wallets/BPageShopFinanceCustomerWallets.vue`
- `src/Applications/Backoffice/pages/shop/finance/gateway/BPageShopFinanceGateways.vue`
- `src/Applications/Backoffice/pages/shop/finance/reseller-fulfillment/BPageShopFinanceResellerFulfillment.vue`
- `src/Applications/Backoffice/pages/shop/finance/reseller-wallets/BPageShopFinanceResellerWallets.vue`
- `src/Applications/Backoffice/pages/shop/finance/valuations/BPageShopFinanceValuations.vue`
- `src/Applications/Backoffice/pages/shop/incentives/cashback/BPageShopIncentivesCashback.vue`
- `src/Applications/Backoffice/pages/shop/incentives/coupon/BPageShopIncentivesCoupon.vue`
- `src/Applications/Backoffice/pages/shop/incentives/discount-code/BPageShopIncentivesDiscountCode.vue`
- `src/Applications/Backoffice/pages/shop/incentives/gift-card/BPageShopIncentivesGiftcard.vue`
- `src/Applications/Backoffice/pages/shop/incentives/lottery/BPageShopIncentivesLottery.vue`
- `src/Applications/Backoffice/pages/shop/incentives/offer/BPageShopIncentivesOffer.vue`
- `src/Applications/Backoffice/pages/shop/listing/badges/BShopListingBadgesList.vue`
- `src/Applications/Backoffice/pages/shop/listing/categories/BShopListingCategoriesList.vue`
- `src/Applications/Backoffice/pages/shop/listing/companies/BShopListingCompaniesList.vue`
- `src/Applications/Backoffice/pages/shop/listing/designs/BShopListingDesignsList.vue`
- `src/Applications/Backoffice/pages/shop/listing/items/BShopListingItemsList.vue`
- `src/Applications/Backoffice/pages/shop/listing/messages/BShopListingMessagesList.vue`
- `src/Applications/Backoffice/pages/shop/listing/supervision/BShopListingSupervisionList.vue`
- `src/Applications/Backoffice/pages/shop/logistic/includes/BPageShopLogisticIncludes.vue`
- `src/Applications/Backoffice/pages/shop/logistic/print/BPageShopLogisticPrint.vue`
- `src/Applications/Backoffice/pages/shop/logistic/property-set/BPageShopLogisticPropertySets.vue`
- `src/Applications/Backoffice/pages/shop/logistic/shipping/BPageShopLogisticShipping.vue`
- `src/Applications/Backoffice/pages/shop/marketing/affiliate/BPageShopMarketingAffiliate.vue`
- `src/Applications/Backoffice/pages/shop/marketing/campaign/BPageShopMarketingCampaign.vue`
- `src/Applications/Backoffice/pages/shop/marketing/email/BPageShopMarketingEmail.vue`
- `src/Applications/Backoffice/pages/shop/pages/landings/BPageShopPagesLandings.vue`
- `src/Applications/Backoffice/pages/shop/pages/popups/BPageShopPagesPopups.vue`
- `src/Applications/Backoffice/pages/shop/permission/personnel/BPageShopPermissionStaff.vue`
- `src/Applications/Backoffice/pages/shop/permission/role/BPageShopPermissionRoles.vue`
- `src/Applications/Backoffice/pages/shop/setting/advance/verifications/BShopSettingAdvanceVerifications.vue`
- `src/Applications/Backoffice/pages/shuttle/affiliate/BPageShuttleAffiliate.vue`
- `src/Applications/Backoffice/pages/shuttle/companies/BPageShuttleCompanies.vue`
- `src/Applications/Backoffice/pages/shuttle/deals/BPageShuttleDeals.vue`
- `src/Applications/Backoffice/pages/shuttle/expert/BPageShuttleExpert.vue`
- `src/Applications/Backoffice/pages/shuttle/roles/BPageShuttleRoles.vue`
- `src/Applications/Backoffice/pages/shuttle/shops/BPageShuttleShops.vue`
- `src/Applications/Backoffice/pages/shuttle/wallet/accounts/BPageShuttleWalletAccounts.vue`
- `src/Applications/Backoffice/pages/shuttle/wallet/components/BShuttleWalletGiftsHistory.vue`
- `src/Applications/Backoffice/pages/transportation/couriers/BPageTransportationCouriers.vue`
- `src/Applications/Backoffice/pages/transportation/services/BPageTransportationServices.vue`
- `src/Applications/Backoffice/pages/wholesaler/requests/BPageWholesalerRequests.vue`
- `src/Applications/Backoffice/pages/wholesaler/shops/BPageWholesalerShops.vue`

### Focused test files updated

- `@selldone/components-vue/backoffice/product/window/BProductsWindow.empty-state.test.mjs`
- `src/Applications/Backoffice/style/table-loading.test.mjs`

- `@selldone/components-vue/backoffice/loading-state/BListLoadingState.table.test.mjs`
- `@selldone/components-vue/backoffice/loading-state/BListLoadingState.test.mjs`
- `@selldone/components-vue/backoffice/logistic/profile/list/BLogisticProfilesList.test.mjs`
- `@selldone/components-vue/backoffice/vendor/account/transactions/list/BVendorAccountTransactionsList.test.mjs`
- `src/Applications/Backoffice/pages/affiliator/orders/BPageAffiliatorLists.test.mjs`
- `src/Applications/Backoffice/pages/marketplace/payouts/BPageMarketplacePayouts.test.mjs`
- `src/Applications/Backoffice/pages/marketplace/pricing/BPageMarketplacePricings.test.mjs`
- `src/Applications/Backoffice/pages/marketplace/requests/BPageMarketplaceRequests.test.mjs`
- `src/Applications/Backoffice/pages/shop/automation/notifications/BShopAutomationNotifications.test.mjs`
- `src/Applications/Backoffice/pages/shop/blogs/workspace/BShopArticleComments.test.mjs`
- `src/Applications/Backoffice/pages/shop/classification/clusters/BPageShopClassificationClusters.test.mjs`
- `src/Applications/Backoffice/pages/shop/dashboard/BShopDashboardAiAgents.test.mjs`
- `src/Applications/Backoffice/pages/shop/incentives/lottery/lotteryWorkspace.test.mjs`
- `src/Applications/Backoffice/pages/shop/incentives/orders/incentiveOrders.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/affiliate/BPageShuttleAffiliate.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/expert/BPageShuttleExpert.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/roles/BPageShuttleRoles.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/shops/BPageShuttleShops.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/wallet/gifts-received/BPageShuttleWalletGifts.test.mjs`

## Clear loading content (2026-11-01)

Removed pending blur from the Orders tables, file-inventory list, Shop workspace refresh, tax summaries, SEO previews, FAQs, basket, country-support cards and pricing tables/cards. Orders retain their original highlight-aware pointer lock through `disabled-no-filter`; other native blocking/busy behavior remains. FAQ and pricing use one shared absolute progress indicator per operation. Intentional authentication/privacy, modal-backdrop and decorative/media blur remains outside the loading rule.

All 15 source SFCs and 12 local style blocks compile. The four focused Orders/style/Shop-readiness/VAT-deposit suites pass 57 cases. Regression coverage renders real pending Pipeline and retained-row refresh for all five product/order types, verifies the CSS lock without blur/grayscale/dimming, and retains one absolute indicator. Browser verification of the actual local Physical Orders pending read observes `aria-busy=true`, visible Pipeline and no CSS filter/backdrop filter on the table or any ancestor; its console has no current errors. No production build or application writes were used.

Task-related source changes:

- `@selldone/components-vue/backoffice/process-center/list/BProcessCenterList.vue`
- `@selldone/components-vue/backoffice/product/inventory/management/file/BProductInventoryManagementFile.vue`
- `@selldone/components-vue/backoffice/account/tax/BAccountTax.vue`
- `@selldone/components-vue/backoffice/tax/profile/report/BTaxProfileReport.vue`
- `src/Applications/Backoffice/layouts/backoffice-shop/BLayoutBackofficeShop.vue`
- `@selldone/components-vue/backoffice/shop/add/BShopAdd.vue`
- `@selldone/components-vue/backoffice/product/add/full/BProductAddFull.vue`
- `src/Applications/Selldone/pages/faq/FAQ.vue`
- `src/Applications/Selldone/home/sections/country-support/CountrySupportBox.vue`
- `src/Applications/Selldone/components/plan/calculator/OPlanCalculator.vue`
- `src/Applications/Selldone/components/plan/features/card/OPlanFeaturesCard.vue`
- `src/Applications/Selldone/pages/price/OPagePrice.vue`
- `src/Applications/Storefront/components/orders/list/SOrdersList.vue`
- `src/Applications/Storefront/pages/faq/StorefrontPageFaq.vue`
- `src/Applications/Storefront/pages/basket/cart/StorefrontPageBasketCart.vue`

Also updated `@selldone/components-vue/backoffice/process-center/list/BProcessCenterList.test.mjs`, `src/Applications/Backoffice/style/table-loading.test.mjs`, this README and `.ai-agent/guides/selldone-product-ui-design.md`. Existing tracked changes remain unstaged; no new files, commits or publishing are part of this follow-up.
