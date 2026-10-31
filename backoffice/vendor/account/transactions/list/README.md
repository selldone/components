# Vendor wallet transactions

`BVendorAccountTransactionsList` keeps the native Vuetify server table and accepts the existing `shop` and `account` props. The opt-in `modern` prop defaults to `false`; Marketplace Wallets enables its Refined presentation without changing other callers.

Each ledger row retains its signed amount and native currency, ORDER fee/refund or PAYOUT payout/reversal, transfer direction, officer/System, full note, and relative/exact creation date. Search remains a server query over note/metadata. All five sort fields (`amount`, `source`, `officer_id`, `note`, `created_at`), both directions and ten-row pagination remain available. Modern and legacy presentations use the same shared `BVendorPayoutPods` explanation with `active-stage="wallet"` and the account's vendor when available. The native disclosure remains in modern mode; actual signed transaction labels still describe each ledger row independently.

Reads use `GET_SHOP_VENDOR_ACCOUNT_TRANSACTIONS(shop.id, account.id)` with offset, limit, sortBy, sortDesc and search. Initial loading is explicit; changing accounts clears stale rows, and late responses cannot replace the active wallet. Errors preserve existing rows and offer retry. Backend permissions and accounting behavior are unchanged; this component does not initiate payments or refunds.

Marketplace Wallets opens the approved Refined fullscreen dialog. Its native Vuetify scrollable card keeps a 96px identity header and 72px read-only/Close footer outside the scrolling gray body; below 620px the header uses an 88px minimum. The header retains the actual vendor logo/name and currency. Native Escape, focus trapping and both Close controls remain in the owning dialog.

The ledger uses 1040px centered content with 28px/24px/32px outer insets, a white 16px-radius transaction widget with 20px horizontal inset, a 16px/24px medium ledger heading and a 26px/34px balance. The balance uses the native currency flag and price formatter with accounting-scope help. Rows use 14px/22px body text, 13px/20px notes/directions/dates, shared 10px column captions and 16px/12px internal cell padding. Search, count and sort share the native modern toolbar; record counts and pagination remain in its footer.

Below 760px, native mobile records reflow into two columns, with the note spanning the full final row and at least 12px internal logical row insets. Below 620px the overview and toolbar stack. Every field and all five sort choices remain available. Notes up to 80 characters remain fully visible; longer notes use a native keyboard-accessible disclosure with a two-line preview and Show note/Hide note labels. Expanding reveals the original complete multiline text without altering or shortening its value. The shared diagram owns its complete order/fulfillment, collection, wallet and payment-path explanation and geometry; this host does not repeat its captions or override its nodes. Its wallet highlight identifies ledger context, not real settlement progress. Empty searches can clear the query through the original throttled server search; loading, error/retry and retained-record behavior are unchanged.

Run from the repository root:

```powershell
node --test "@selldone/components-vue/backoffice/vendor/account/transactions/list/BVendorAccountTransactionsList.test.mjs"
```

The isolated tests compile the SFC/template/SCSS, exercise real source/direction, query, retry and stale-response behavior with mocked HTTP, and render the actual template with local component stubs, including short and long multiline notes. They do not bootstrap Laravel or access a database/provider. Browser QA remains part of the owning Wallets page handoff.
