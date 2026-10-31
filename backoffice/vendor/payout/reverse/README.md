# Vendor payout reversal

`BVendorPayoutReverse` keeps the native authenticated reversal endpoint and opts into the approved Refined dialog through `modern` (default `false`). The modern view shows the passed vendor/payment, original and reversed amounts, remaining amount, existing reversal history and payment metadata. It does not fetch new provider state.

Currency remains locked to the original payment. Reason is optional and may be visible to the vendor. Modern submission requires a finite positive amount no greater than `amount - reversal`, an active payment and no request in flight; these checks run again at the request boundary. Deleted and fully reversed records cannot initiate another reversal. Changing payments clears the local amount/reason draft. Success updates the existing payment object and emits the native `update` and `close` events; errors preserve the record and permit retry.

Modern callbacks are bound to the submitting payment, shop and request. Payment/shop changes clear the draft and release only the old context; unmount invalidates the request. Late success/errors cannot overwrite a newer payment, close its dialog or clear its busy state. A synchronous `update` listener replacing the record also keeps the new dialog open. Duplicate submissions remain blocked; legacy callback behavior is unchanged.

Bank mode records a reversal handled outside Selldone. Supported provider modes may reverse the transfer through the existing backend. A payout reversal credits the vendor wallet; it is separate from an order refund, which uses the order's existing refund flow. Backend permissions, currency/remaining checks and transaction behavior are unchanged.

The owning page provides a 570px dialog. Scoped modern geometry uses 24px inset, 18px corners, 21px/29px medium title and 13px/20px body. Summary labels use regular 12px/19px text and values use medium 14px/21px text; narrow layouts use 15px horizontal inset and stack the fields/totals. Native controls and shared action/tooltip primitives retain keyboard, RTL and touch behavior.

Run from the main repository root:

```powershell
node --test '@selldone/components-vue/backoffice/vendor/payout/reverse/BVendorPayoutReverse.test.mjs'
```

Tests compile script/template/scoped Sass, render the real template with native UI leaves isolated, and exercise guards, optional reason, request scope, events, identity, failure recovery and deferred success/error races across record/shop switches, unmount and event reentry. All requests are inert doubles; no Laravel bootstrap, database or provider access runs.
