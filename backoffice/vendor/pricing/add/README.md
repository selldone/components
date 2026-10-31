# Marketplace pricing editor

`BVendorPricingAdd` retains the native create/edit/remove endpoints and `add`, `update`, `remove` and `close` events. The opt-in `modern` prop defaults to `false`, keeping legacy callers unchanged. Its owning Marketplace page supplies a fullscreen dialog at every viewport size.

The Refined form preserves the three native inputs: title, commission (0–1000%) and optional description. `UNumberInput` keeps its default whole-percentage behavior; all title suggestions and their native More menu remain available. Existing plans retain both translation buttons, configured-language editing and the shared premium auto-translation flow; translations save separately from the ordinary plan. The wrapper and shared translation implementation are unchanged.

The modern dialog has a quiet gray scrolling body within the shared `sd-modern-content` limiter (up to 1040px). A compact introduction explains reusable plan assignment and commission updates. White Plan details and Pricing rule widgets share two equal columns from 900px upward, stacking below that width; a separate critical disclosure follows for existing plans. The white header and native `VCardActions` footer stay fixed within the square-cornered `100dvh` card. The card overrides Vuetify's percentage flex basis locally so opening critical controls cannot grow the dialog. Close and Save/Add remain visible while the body scrolls. The primary action remains a native submit button associated with the input form through a unique `useId` identifier, preserving Enter submission and native validation. Critical controls remain outside that input form in the scrolling body. Legacy footer behavior is unchanged.

The editor focuses on creating and editing a plan. Assigned products are opened from the owning pricing list's row action beside Edit, in a separate fullscreen list dialog. This editor has no products launcher or product lookup.

Commission is markup on the vendor raw price: `price = raw × (1 + commission / 100)`. The live unitless example labels vendor price 100 and the resulting product price, so 25% yields 125. Separate offer fixed commissions, discounts, currency and quantity tiers are not added as plan settings. Changing an existing commission recalculates linked vendor offers and tiers; title/description edits do not reprice. Backend precision and assignment semantics remain unchanged.

Removal lives in a separate critical disclosure outside the routine form. It retains native `USmartVerify`, with keyboard checkbox semantics, and the authenticated removal request. The method requires an assigned current record/shop, an open disclosure, verified intent and no request in progress. Intent resets on collapse, Close, reassignment, shop change and unmount. The warning retains the instruction to reassign linked products; deletion does not delete product records. No automatic cleanup of vendor-default assignments is claimed.

Modern writes validate a trimmed nonempty title of at most 255 characters and a finite percentage from 0 through 1000; duplicate-title validation remains on the server. Request callbacks belong to the submitting record/shop/context. Stale success/errors cannot close a new dialog, emit into a new context or clear its pending request, including synchronous event-listener reentry. Submitted server operations are not canceled. The owning page remounts on every opening and destroys the closed editor after leave.

Scoped geometry uses 24px header/footer and widget insets, a 30px/24px/34px canvas inset, 24px desktop widget gaps and 16px widget corners. The title is 21px/29px medium; body and input text use the shared 14px token, with readable 13px/21px guidance. Suggestions and existing translation operations stay with the title and optional description. Footer actions retain 10px gaps and 13px/22px text. Narrow layouts use 16px horizontal insets, 16px widget gaps, 16px/24px input text and at least 44px action targets. Shared native field, suggestion, operational-button, tooltip and danger primitives preserve application font, keyboard, RTL and touch behavior. No global styles change.

Run from the application repository root:

```powershell
node --test '@selldone/components-vue/backoffice/vendor/pricing/add/BVendorPricingAdd.test.mjs'
```

All 14 tests pass. The test compiles the actual Vue script/template/scoped Sass, renders native control leaves in isolation and exercises form grouping, native fields, retained plan guidance without an editor products launcher, payloads, events, validation, critical guards, retries and deferred responses across context changes. All requests are inert doubles. No Laravel bootstrap, database, provider, live mutation or production build runs.
