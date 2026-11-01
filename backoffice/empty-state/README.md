# Dashboard list empty states

`BListEmptyState.vue` carries the approved Products empty-list treatment to other dashboard collections: one small subject-specific SVG, a concise localized title and guidance, and the owning list's existing actions. It is presentation only. It does not read data, infer permissions, navigate, start timers or perform the depicted operation.

## Interface

- `kind`: `product`, `category`, `order`, `customer`, `content`, `discount`, `campaign`, `affiliate`, `shipping`, `domain`, `location`, `payment`, `automation`, `team`, `app`, `log` or `records`. Unknown values fall back to `records`.
- `title` / `description`: optional text overrides for the actual collection, query or date range. An empty string intentionally suppresses that text. Defaults live in dashboard EN/FA dictionaries under `dashboard_empty_state.{kind}`.
- Default slot: existing native actions with the owner's original capability, loading, route and handler guards. No action is created implicitly.

Import and register the component locally. Replace the original empty presentation rather than nesting it inside an unchanged `sd-modern-empty-state` padding wrapper. Retain relevant feature classes and table slots. Each owner must distinguish a successful empty response from initial/loading, failed, denied and unavailable data. Search/filter no-results use `dashboard_empty_state.no_results`; an empty reporting period can use `dashboard_empty_state.empty_period`. Keep useful existing resource-specific guidance and recovery controls.

This component is for resource lists, not a replacement for selection dialogs, form options, chart zero states or error notices. A historical order/payment/event list should explain when records appear; it must not invite the user to manufacture a record or imply that a failed request succeeded. Specialized summaries and existing informative empty states retain their own semantics.

## Artwork and behavior

Ten scoped inline-SVG compositions represent catalog items, parcels, people, promotion tickets, campaign mail, delivery, connections, locations, finance and records. They contain no live values, remote assets, functional controls or focus stops. The independent illustration accent follows the shared UI kit; real actions keep their native blue primary styling. The automatic sequence ends within 2.6 seconds, while reduced motion shows the complete static composition immediately.

The compact layout uses an 18px/26px medium heading, 14px/23px supporting text, 180px artwork (160px on phones), wrapped action slots and theme-aware surfaces/ink. The selected application font remains unchanged. Existing native table, list, query, pagination and permission behavior remains owned by each caller.

## Verification

Run `node --test @selldone/components-vue/backoffice/empty-state/BListEmptyState.test.mjs` from the repository root. It renders the real component with English/Persian copy, all subject families, overrides and native action slots, and checks inert artwork, fallback behavior, scoped geometry and finite/reduced motion. Ordinary HMR/source verification requires no production build, cache mutation or real resource creation.

The product workspace retains its approved specialized placeholder and data-readiness/last-row confirmation behavior in `product/window/BProductsWindow.vue`. This shared addition does not replace that workflow.

Final verification: all **635 cases across 55 affected regression files pass** together, including the 35 new page-readiness and 19 shared-list readiness cases. Source checks compile 120 Vue owners (118 consumers, the shared component and the supervision parent), verify local component registration and resolve every new literal EN/FA key; the consumers contain 128 empty-state presentations. Deferred fixtures cover initial/reset/null, successful empty data, malformed arrays/counts, failure/retry, cached and stale responses, permission boundaries, filtered results and positive-total empty pages. Consumer render tests load the actual shared SFC rather than replacing its copy/artwork/action slot with a stub.

Representative local Light browser checks cover coupons, campaigns and customers at desktop widths of 1280px/1447px and a 390px mobile layout: readable 18px/14px hierarchy, 180px/160px artwork and no document-level horizontal overflow. English/Persian text, kind families, finite/reduced-motion CSS and native action slots are tested with real component rendering. Visual Dark/Smart invert and RTL inspection was not performed, and the remaining resource pages were checked through source and isolated behavior tests. No real resource creation, provider changes, permission grants, cache mutation, extra Laravel server or production build was used.

## Rollout inventory

118 owning Vue lists use the shared component (128 state presentations). This inventory records task-related production consumers; it does not change their route or permission contracts.

### src/Applications/Backoffice (88)

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
- `src/Applications/Backoffice/pages/transportation/pickups/BPageTransportationPickups.vue`
- `src/Applications/Backoffice/pages/transportation/services/BPageTransportationServices.vue`
- `src/Applications/Backoffice/pages/wholesaler/requests/BPageWholesalerRequests.vue`
- `src/Applications/Backoffice/pages/wholesaler/shops/BPageWholesalerShops.vue`

### @selldone/components-vue/backoffice (28)

- `@selldone/components-vue/backoffice/account/charge/list/BAccountChargesList.vue`
- `@selldone/components-vue/backoffice/app/shop/store/BAppShopStore.vue`
- `@selldone/components-vue/backoffice/blog/category/list/BBlogCategoriesList.vue`
- `@selldone/components-vue/backoffice/blog/list/BBlogsList.vue`
- `@selldone/components-vue/backoffice/box/list/BBoxesList.vue`
- `@selldone/components-vue/backoffice/campaign/link/list/BCampaignLinkList.vue`
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
- `@selldone/components-vue/backoffice/ribbon/list/BRibbonList.vue`
- `@selldone/components-vue/backoffice/role/panel/orders/list/BRolePanelOrdersList.vue`
- `@selldone/components-vue/backoffice/shop/sms/template/list/BShopSmsTemplateList.vue`
- `@selldone/components-vue/backoffice/shop/theme/typography/BShopThemeCustomFonts.vue`
- `@selldone/components-vue/backoffice/subscription/ShopSubscriptionList.vue`
- `@selldone/components-vue/backoffice/transportation/service/orders/BTransportationServiceOrders.vue`
- `@selldone/components-vue/backoffice/user/security/login-devices/BUserSecurityLoginDevices.vue`
- `@selldone/components-vue/backoffice/vendor/account/transactions/list/BVendorAccountTransactionsList.vue`
- `@selldone/components-vue/backoffice/vendor/documents/list/BVendorDocumentsList.vue`

### src/Applications/Selldone/components (2)

- `src/Applications/Selldone/components/auth/shop-client/BAuthShopClients.vue`
- `src/Applications/Selldone/components/faq/FaqRequestsList.vue`

Other task-related files: the shared component/test/test-helper and this README; the new page/shared-list readiness suites; the existing consumer regression tests updated to render the real child; dashboard EN/FA dictionaries; `.ai-agent/guides/selldone-product-ui-design.md`; and the feature-local parent `src/Applications/Backoffice/pages/shop/listing/supervision/BShopListingSupervision.vue`, which passes successful-read readiness to its existing child. No global provider or middleware is changed.

### Task-related regression files

- `@selldone/components-vue/backoffice/empty-state.shared-lists.test.mjs`
- `@selldone/components-vue/backoffice/empty-state/BListEmptyState.test.mjs`
- `@selldone/components-vue/backoffice/logistic/profile/list/BLogisticProfilesList.test.mjs`
- `@selldone/components-vue/backoffice/process-center/list/BProcessCenterList.test.mjs`
- `@selldone/components-vue/backoffice/subscription/ShopSubscriptionList.test.mjs`
- `src/Applications/Backoffice/pages/account/history/BPageAccountHistory.test.mjs`
- `src/Applications/Backoffice/pages/dashboard-empty-state.readiness.test.mjs`
- `src/Applications/Backoffice/pages/marketplace/payouts/BPageMarketplacePayouts.test.mjs`
- `src/Applications/Backoffice/pages/marketplace/pricing/BPageMarketplacePricings.test.mjs`
- `src/Applications/Backoffice/pages/marketplace/requests/BPageMarketplaceRequests.test.mjs`
- `src/Applications/Backoffice/pages/shop/automation/notifications/BShopAutomationNotifications.test.mjs`
- `src/Applications/Backoffice/pages/shop/blogs/workspace/BShopArticleComments.test.mjs`
- `src/Applications/Backoffice/pages/shop/classification/clusters/BPageShopClassificationClusters.test.mjs`
- `src/Applications/Backoffice/pages/shop/crm/faq/BPageShopCrmFaq.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/affiliate/BPageShuttleAffiliate.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/expert/BPageShuttleExpert.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/roles/BPageShuttleRoles.test.mjs`
- `src/Applications/Backoffice/pages/shuttle/shops/BPageShuttleShops.test.mjs`
- `src/Applications/Selldone/components/auth/shop-client/BAuthShopClients.test.mjs`
