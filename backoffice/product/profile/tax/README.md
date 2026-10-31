# Product tax-profile selection

`BProductProfileTax` selects an existing tax profile for a product. Its opt-in
`modern` presentation follows the approved Refined dialog; legacy callers keep
their fullscreen selector and native inclusion preview.

Edit Product (`BPageProductEdit`, `modern-general`) and the Add Product dialog
(`BProductsPanelAddProduct`, `modern`) both use `BProductAddFull.modernWorkspace`,
which passes `modern` through `BProductEditInfo` to this shared component.
The tax selector uses the authorized shop's existing `tax_profiles`; opening,
previewing and confirming perform no network request.

Opening copies `product.tax_id` into a local selection. Confirm changes only
that field in the product draft and closes the dialog. General information Save
persists it; General Discard restores the existing snapshot. Cancel or native
dismissal leaves the assignment unchanged. A null selection inherits the shop's
default tax rule; it does not mean tax is disabled. Product/shop context changes
discard the old pending selection, and refreshed assignments/profiles update
the applied row summary.

The preview describes existing rules, never edits rates or tax configuration.
It preserves fixed goods/shipping rates, location-based rules, external-provider
calculation, included/excluded prices, disabled rules and non-taxable shipping.
Missing default configuration is shown as unavailable, without inventing a
rate. An unavailable dedicated profile blocks Confirm until another profile or
the shop default is selected. Manage tax retains the existing
`BPageShopFinanceTax` new-tab route. Subscription guidance retains the provider
tax-behavior limitation and the need to re-save Inventory pricing plans.

Refined geometry: 820px desktop dialog; 20px/28px medium (500) header;
16px/24px section headings; 13px/21px body; 21px widget insets and 14px widget
corners. Standard footer buttons are 42px desktop and at least 44px on touch.
Mobile uses an 18px/27px header, readable 16px input text and native fullscreen
scrolling. The quiet gray canvas, white/theme-aware widgets, primary blue
Confirm action and outline icons follow the shared modern primitives.

Focused source and isolated behavior checks:

```powershell
node --test @selldone/components-vue/backoffice/product/profile/tax/BProductProfileTax.test.mjs
```

The 18-check suite compiles the actual Vue template/scoped styles and mounts its actual
logic with native component stubs. It verifies draft-only selection, Confirm,
Cancel/native dismissal, inherited defaults, financial preview modes, context
changes, applied-row refresh, legacy rendering, subscription guidance and
English/Persian copy. Fixed percentages retain the configured fractional digits,
including 7.125% goods, 9.975% shipping and an enabled 0% shipping rate, in both
facts and rule details. Nested tooltip help consumes the first Escape while
retaining the dialog; with no active help, native Escape dismissal remains
available. Context changes clear both the pending selection and help.

The parent, input and adjacent General/logistic suites pass 55 checks. Actual
Vue/Vuetify browser QA passes 27 baseline cases across desktop/mobile, EN/FA,
Light/native Dark/Smart, Add, unavailable defaults and legacy presentation.
Focused follow-up checks cover native menu contrast, long names, pointer/touch
help, accessible descriptions, and two-step Escape with focus retained, including
when the overlay wrapper initially owns focus. Visible selection text matches
14px/22px desktop and 16px/22px touch; native shared field geometry is retained.
Confirm/Cancel, context changes and actual General Discard were exercised with
synthetic data. HTTP is blocked; no live shop save or real tax calculation ran.

Task files: `BProductProfileTax.vue`, its test and this README;
`backoffice/tax/profile/input/BTaxProfileInput.vue` and its test;
`backoffice/product/edit/info/BProductEditInfoIcon.vue` (canonical Calculator,
ShoppingCart and CircleSlash in the existing licensed subset); and translation
`dashboard/en.ts` / `dashboard/fa.ts`. The existing shared Edit/Add caller path
requires no duplicate dialog or caller changes.
