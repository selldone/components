# Shared vendor money flow

`BVendorPayoutPods` is the single instructional money-flow diagram for Marketplace wallets, payouts and wallet details, plus Vendor payments and dashboard transactions. The host keeps its native disclosure; the component owns the complete explanation, responsive nodes/connectors, localized help and section emphasis. It performs no requests, navigation, payment, verification or accounting mutation.

```vue
<b-vendor-payout-pods :shop="shop" :vendor="vendor" active-stage="wallet" />
<b-vendor-payout-pods :shop="shop" active-stage="payout" />
```

`shop` is required; `vendor` optionally supplies readable identity. `activeStage` accepts `order`, `fulfillment`, `collection`, `wallet`, `stripe`, `bank`, `manual`, `payout` or `transactions`. It highlights the current UI section with a 3px blue inset border and `aria-current="location"`; it never reports actual transfer/connection/settlement status. The default highlights nothing. The original `modern`, `highlightWallet`, `highlightPayout` and `highlightTransactions` props remain compatible; explicit `activeStage` takes precedence, otherwise the original flags map to the corresponding concepts. All callers get the same diagram, including old callers without `modern`.

## Financial meaning

- The order is divided into vendor fulfillments. When a fulfillment enters Selldone's paid accounting flow, its share credits the vendor's currency-specific virtual wallet. Order creation alone does not credit it, and a paid status is not proof of capture/settlement.
- The wallet records what is owed; real bank/provider funds are separate. Dotted connections describe order routing, solid connections real funds and dashed connections accounting entries.
- Eligible Stripe Connect payments can transfer the share to the connected Stripe account. Matching enabled gateway/Connect/live-test context, the connected account and provider rules affect success. A failed attempt retains the order credit. A connected-service transfer can also be initiated through Pay vendor where available.
- Stripe's subsequent bank payout is separate. A Selldone payment record or acknowledgment does not prove bank arrival.
- For an external bank payment, the owner transfers first and then records it. Recording makes no bank transfer or Stripe request.
- Both successful connected transfers and recorded bank payments create Selldone payment history and a negative wallet payout entry. Only the recorded amount is deducted; the remaining balance need not be zero. Refunds/reversals retain their separate accounting and provider effects.

Source references: `Backend/app/Storefront/Vendors/VendorOrder.php` (fulfillment grouping/paid flow), `VendorAccount.php` (credit, Connect eligibility, payment record/debit, refunds and reversals), and `Backend/app/Gateway/Stripe/service/traits/shops/StripeServiceShopPayoutTrait.php` (connected-account transfers, separate from bank payouts). This change does not alter those implementations.

## Presentation and verification

The application font is retained: node titles 14px/22px medium, captions/help 13px/20px and introduction 14px/22px. Neutral opaque nodes use 14px corners. Container queries adapt to the component's actual width, including nested dialogs: four main nodes on wide layouts, a two-row route below 760px, and a readable vertical route below 460px. Settlement branches stack on narrow containers. Help on every node and connection uses the shared top tooltip with hover, focus, tap and Escape behavior. Canonical shop/Stripe images stay intact.

The compact layout uses short visible guidance and content-driven cards. Longer introductory, route-caption and remaining-balance explanations are in the existing tooltips. Bank-transfer ordering and the fact that recording sends no funds remain visible. Desktop insets and minimum heights are reduced; mobile keeps 64px connector gaps around the 44px help targets and preserves the order/RTL routing. At the same 1040px diagram width, the English desktop figure is about 658px high, including both the wallet-to-settlement branch and the accounting return, compared with the original 819px.

A dashed rail starts at the wallet's bottom center and splits into independent arrows entering both settlement panels. When the panels stack, the rail becomes a logical-start side spine with a separate arrow into each panel; Stripe never flows into the bank-payment branch. Native grid geometry, logical insets and fixed-size arrowheads keep the connections aligned in the four-column, two-row and mobile layouts, including RTL. The shared branch tooltip explains that these lines relate wallet debt to settlement alternatives; real funds do not leave the virtual wallet.

A separate dashed accounting return leaves the bottom center of Payment history, follows a reserved 32px logical-end gutter, and points upward into the wallet 24px beyond its outgoing stem. Bottom anchors stay aligned as card heights change, without DOM measurement or timers. The result caption and tooltip explain that a successful connected transfer or recorded bank payment posts a wallet debit and reduces the amount owed; the arrow never represents money returning to the virtual wallet.

Connector motion runs once, finishes within 2.7 seconds and leaves the complete static diagram. Reduced motion disables it; no timers, playback controls or live financial simulation are used. English/Persian copy lives exclusively under `vendor_money_flow`.

Run isolated checks from the application repository:

```powershell
node --test '@selldone/components-vue/backoffice/vendor/payout/pods/BVendorPayoutPods.test.mjs'
```

Related changes: the shared component/test and this README; `dashboard/en.ts`/`fa.ts`; the Wallets and Payouts pages with their tests/READMEs; `BVendorAccountTransactionsList.vue` with its test/README; Vendor `VPageVendorPayments.vue` and README; `VAccountTransactions.vue`; and the canonical UI guide's shared money-flow decision. Hosts retain all existing list, disclosure, permission and financial-operation behavior.
