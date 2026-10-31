# Add products from Selldone wholesalers

The approved Unified flow lives in the existing fullscreen product-type dialog. `BProductAddDropshipping` switches between supplier discovery and the selected supplier's product catalog. Closing the dialog unmounts this flow and preserves native dialog focus, scrolling and Escape behavior.

## Discovery and explanation

`shops/BProductAddDropshippingShops.vue` keeps the authorized supplier-list GET and reseller-access POST endpoints. Country, search, accepted-only/all suppliers, native column sorting, toolbar sorting and server pagination retain their existing payloads. The initial country is selected before the first request. Changed filters reset the page; stale or unmounted requests cannot replace current results. Loading, failed requests with Retry, and successful empty filters remain distinct.

Shop logos and full inline `v-copy` handles identify each supplier. Current shop, accepted, pending, rejected and unrequested access remain separate states. Current-shop and pending/accepted rows cannot send new access requests; in-flight duplicate requests are blocked. Rejected requests retain the existing endpoint outcome and guidance to contact the supplier. Browsing products remains available independently of access approval; the existing server checks remain authoritative for importing products.

`shops/BProductAddDropshippingWorkflow.vue` explains six stages using English/Persian copy under `product_add_dropshipping_shops.modern.workflow`: supplier setup and platform activation, supplier-specific reseller acceptance, products and markup, customer payment to the reseller store, separate supplier/currency settlement through virtual reseller accounts, and supplier delivery. It never implies an automatic payment split at checkout. Multiple suppliers can feed one storefront.

The external step buttons support hover, keyboard focus and tap. The artwork contains only fictional actors and inert HTML/local SVG. `dropshippingWorkflowRoutes.ts` joins measured node ports through reserved gutters with continuous rounded orthogonal corners and directional arrows. Desktop and stacked layouts deliberately mirror for RTL; connectors do not run through node interiors. Each changed stage has at most 2.4 seconds of motion, then a complete static explanation. Reduced motion is static. Hidden-page/unmount cleanup stops motion and disposes observers/listeners.

## Supplier product catalog

`products/BProductAddDropshippingProducts.vue` uses the same compact list composition and retains actual product images, titles, secondary names, variants, brand, full inline-copy SKU, native currency price, quantity, supplier-store preview and added-product admin navigation. Back returns to supplier discovery. Rows and the explicit Review action open the approved Unified product review sheet.

The returned total populates `total_products`, which drives both pagination and the record count. Failed/empty/loading catalog states are distinct, and late responses cannot replace a newer search or update an unmounted catalog. Search throttles belong to each component instance and are canceled on exit.

## Product review and import

The native bottom sheet groups the editable markup beside a live item-price breakdown, followed by destination shipping. `UPriceInput`, `UPrice`, `ProductMixin` and the checked-in price helpers retain their currency units, precision, zero and discount-schedule semantics. The supplier item price before discount is `net_price_without_commission + discount`; after discount it is `net_price_without_commission`. Customer item price is supplier item price after discount plus markup and excludes shipping. Each country row separately displays its shipping cost and supplier item price after discount plus that shipping cost. No checkout total or net-profit estimate is invented, and no destination is added when absent from the native shipping object.

The keyboard-accessible native `VSelect` retains `VariantItemMini` identities and returns the original variant object. Separately priced variants edit their own commission; other variants share the main product commission. Switching variants retains their independent edits. `UPriceInput` remounts only when the pricing owner changes, preventing focused text from carrying over to another pricing owner. Discount timing remains available through the modern native `UTimeProgressBar` tooltip.

Close hides the sheet and keeps the existing in-memory edits. Add imports the whole product with its main commission and all separately priced variant commissions, including zero; selection is a pricing review, not a selected-variant-only import. Duplicate in-flight imports remain blocked. Server denial or transport failure keeps the sheet open and releases loading; only success closes it. No API, authorization or payload contract changed.

The sheet and clipping wrapper have 20px top corners and square bottom corners. Width is capped at 760px with native viewport-safe docking, a separately scrolling body and an available footer for long destination lists. Header insets are 20px/24px; body 24px; footer 16px/24px. Product title is 18px/25px at weight 500, section titles 15px/23px, guidance 14px or 13px/21px, markup input 23px/32px, and the retail amount 32px/42px. Reference amounts and their decimals remain readable at 13px/14px. Below 540px the price groups stack, country rows become unboxed labeled fields, insets reduce to 16px and footer actions retain touch targets. All copy is localized in English/Persian under `product_add_dropshipping_products.modern.review`; native appearance and RTL follow the surrounding import flow.

## Measured design and validation

- Centered content: shared 1040px cap; 28px top / 34px bottom desktop inset and 22px narrow inset. Dialog chrome retains the canonical shop identity, a 32px desktop close control and native dark appearance outside Shuttle's Smart invert window.
- Main title: 20px / 26px, weight 500. Subtitle: 13px / 21px. Routine table values: 13px / 20px. Content inherits the selected application font with zero incidental letter spacing; shared column captions keep their own tracking.
- List surfaces: 16px corners, toolbar 16px / 20px inset, 12px control gaps, row values 17px vertical inset, separated trailing actions and the shared compact pagination. Rows reflow into labeled, unboxed cells below 800px for suppliers and 960px for the richer product catalog. Native currencies are neither combined nor converted.
- Illustration: 17px / 24px heading, compact six-step selectors, neutral opaque nodes, independent shared illustration accent, measured gutter routes and a localized static caption. The feature's diagram geometry is intentionally local rather than a general graph framework.
- Dark mode keeps native filled-primary colors while raising the contrast of text actions and illustration ink through feature-local tokens. The fullscreen dialog follows the user's real appearance preference; temporary preview overrides are not retained.

Run the focused source-isolated suites from the workspace root:

```powershell
node --test @selldone/components-vue/backoffice/product/add/drop-shipping/shops/BProductAddDropshippingShops.test.mjs @selldone/components-vue/backoffice/product/add/drop-shipping/shops/dropshippingWorkflowRoutes.test.mjs @selldone/components-vue/backoffice/product/add/drop-shipping/products/BProductAddDropshippingProducts.test.mjs
```

Use the existing HMR application at `http://localhost:9000/shuttle/shop/1/product` for read-only visual checks. Do not submit access requests or import real products merely to verify styling. No production build, Laravel cache command, backend endpoint, authentication or storage change is required.

The product suite includes a compiled-sheet interaction check that drives native select/input/Close/Add bindings with isolated UI stubs and the real price helpers. It verifies the displayed price expressions, zero shipping, shared/independent variant drafts, and exact import payload. The three isolated suites now contain 19 tests. Source checks compile the changed Vue script/template/scoped styles and verify English/Persian key and placeholder parity. Existing rendered workflow checks cover all six routes against measured desktop/mobile node bounds. Runtime product-review checks use the existing local HMR session; no real access request or product import is submitted.
