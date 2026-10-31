# Vendor payout form

`BVendorPayoutAdd` keeps the existing provider-backed create and payment-view/reversal flows. The opt-in `modern` prop applies the approved Refined creation workspace; existing callers retain the legacy presentation by default. Marketplace Wallets and Payout History open creation fullscreen. Existing-payment details keep their bounded 680px dialog and original guarded reversal flow.

The fullscreen creation card keeps its native header and footer outside the scrolling gray body. Content is bounded to 1040px inside a 1088px padded workspace: the native form and 280px live summary are separated by 24px, with 22px white-widget insets and 16px corners. Header title is 20px/28px, section titles are 14px/22px, guidance is 13px/20px and the summary amount is 26px/34px. Below 760px the summary follows the form; below 520px fields stack and footer actions wrap while retaining touch targets. Selected application font, neutral notices, theme-aware surfaces and RTL logical spacing remain in use.

Creation is still one step. The summary reads the same vendor, currency, method and finite amount used by the form; it adds no new lookup, currency conversion, wallet projection or payment limit. Its negative wallet-entry preview describes the existing accounting debit. The title and entry labels now say Vendor payment/Pay vendor. Bank mode's Record bank transfer action describes an external transfer already made; connected-provider mode names the service and its connected vendor account. Both affect the vendor ledger, while only the connected-provider operation sends funds. The final submit handler, request payload and emitted events remain unchanged.

The form fetches the selected vendor’s real payment options with the existing With Balance setting. Bank mode records a payment made outside Selldone; connected modes submit the existing provider operation. Currency choices, bank details, provider available/pending/reserved balances, metadata, notes, suggestions, history and emitted account/payment updates remain native. Notes can appear in vendor payout history.

The modern selector retains the server option objects and uses the shared accessible, clearable radio group with all choices visible. Localized plain-text method titles are escaped at the shared selector's HTML-title boundary; the selected provider's original description and canonical identity remain available. The native balance-lookup preference is a checkbox; unchecked hides previously returned service balances without treating missing values as zero. Current lookup errors offer retry and preserve draft amount/currency/note. Bank/business reference information and both original fund-flow diagrams remain available; bank data is read-only and missing bank reference text does not prevent recording. Provider metadata remains read-only and copyable.

Modern create requires a current vendor/payment option and a finite positive amount. It does not cap the amount to the wallet ledger. Modern provider lookups ignore stale responses after vendor changes, clearing, reassignment or unmount. Payment reversal retains explicit verification and rejects duplicate requests.

Modern existing-payment mode is a read-only view of the passed record: vendor identity, original/reversed/remaining amounts, officer, confirmation and creation/deletion dates, full note, actual reversal entries and metadata. It performs no provider/bank lookup. Confirmation is separate from provider settlement. Notes and reversal reasons can be visible to the vendor.

Refund/remove has its own critical disclosure and the native intent toggle. Closing the disclosure/dialog or reassigning the payment resets intent. The method rechecks disclosure, intent, active record and request state; deleted records expose no removal UI, while a nondeleted fully reversed record may still be removed with zero remaining amount. The original authenticated removal endpoint and events remain unchanged.

Modern removal callbacks belong to the submitting payment, shop and request. Reassignment, shop changes or unmount invalidate them; late success/errors cannot close a newer dialog or release its pending action. Duplicate submissions remain blocked, including during an overlapping context switch. Current-operation success retains the native `remove` and `close` events.

Run the isolated form tests from the application repository:

```powershell
node --test '@selldone/components-vue/backoffice/vendor/payout/add/BVendorPayoutAdd.test.mjs'
```

The tests compile the real template and scoped SCSS, render with isolated native UI leaves and use inert request doubles. They never contact a provider or run Laravel.
