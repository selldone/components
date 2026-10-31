# Inventory list

`BInventoryList` reuses the product inventory query, quantity endpoint, native
pricing editor, search/scanner and bulk tools. The approved Unified wholesale
layout is selected by `modern` together with `onlyDropshipping`; legacy and
other modern inventory callers retain their existing presentation.

- Server pagination counts products, with ten products per page. Products are
  expanded into variant inventory rows after the read. Product and variant
  codes, images, identifiers, disabled variants, product status and authenticity
  remain distinct. Search and sorting retain the product endpoint's semantics.
- Modern grouped headers show the main product's SKU/MPN, not a variant's
  overrides. Full identifiers remain available through the native header's
  hover/focus tooltip. The exact stock count uses all returned variants and
  saved quantities above zero, including disabled variants; publication status
  remains separate. A thin static bar illustrates this count's percentage and
  does not represent loading, stock capacity or sale eligibility. Missing or
  unknown quantities suppress the ratio. Products without variants show their
  own stock state; file/service/subscription types retain untracked/infinite
  stock semantics. The existing full-variant query supplies these values with
  no extra request or change to grouping, expansion, filters or pagination.
- Wholesale price sorting groups native product currencies before base-price
  ordering and server pagination. It does not rank converted variant amounts.
  Ordinary text searches retain the endpoint's relevance ordering.
- `only_dropshipping` restricts the list to reselling-enabled products. It does
  not redefine the scope of the separate bulk tools.
- Physical stock uses per-row Add/Set drafts and an explicit Save. Add adjusts
  the recorded quantity; Set replaces it. The requested quantity is absolute,
  whole and nonnegative. A failed save retains the draft for Retry; a pending
  save keeps its submitted target stable. Virtual stock is displayed but cannot
  be edited through this control; other product types retain their native stock
  semantics. Server-side product ownership and stock restrictions still apply.
- Reads and post-save refreshes use one absolute progress overlay anchored to
  the inventory list on desktop and mobile. The native table retains its loading
  state and empty-loading message, with its duplicate progress row suppressed
  so refreshing cannot move the table or toolbar.
- The price cell uses the selected display currency. Editing keeps the native
  product/variant currency and reuses the complete pricing workspace, including
  independent/shared variant pricing, commission, discounts, dates, price label
  and quantity tiers. Actual product and variant objects are forwarded to the
  editor so tier actions retain their existing ownership and routes.
- Changing the single-edit base price, currency, commission or pricing mode
  closes reseller child listings. Discount, schedule and label-only changes do
  not have that consequence. This warning does not describe bulk price updates.
- The wholesale pricing editor keeps its native fullscreen dialog with the real
  product image, title, product/variant code and variant identity. The Unified
  wrapper uses a gray body with 24px insets, a centered 760px editor and an unboxed
  consequence below the complete editor/tier section. White header/footer bars
  retain compact modern Cancel/Save controls. Pending saves prevent dismissal
  and duplicate submission; a failure keeps the draft available for retry.
  Legacy and other modern inventory dialogs retain their existing wrapper.
- Bulk price/discount dialogs keep their own authorized shop/category scope,
  report, verification, preview and apply flow. They do not inherit the inventory
  search, filters, page or dropshipping-only restriction. Native currency and
  existing access checks remain owned by those dialogs and their endpoints.

From the repository root, run:

```powershell
node --test @selldone/components-vue/backoffice/inventory/list/BInventoryList.test.mjs
```

The isolated suite compiles the real Vue template, TypeScript and scoped Sass.
It exercises real component methods and rendered slots using local axios,
router and UI stubs, including grouped-header stock counts, parent identifiers,
unknown data, non-stock types and the unchanged disclosure action. It does not call live APIs, write stock/prices, bootstrap
Laravel or access a database. Use the ordinary authenticated browser to compare
the final desktop, mobile, RTL and dark appearance with the approved mockup.
