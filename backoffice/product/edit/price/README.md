# Product pricing editor

`BProductEditPrice` is shared by Edit Product, Guided Add and Inventory. All
use the native currency/price/date inputs and existing save endpoints.
`modern && !instanceMode` selects the approved product workspace below;
`modern && instanceMode` retains the Inventory Unified layout. Legacy callers
retain their defaults.

## Edit Product and Guided Add

The selling-price widget keeps the currency, base price and unboxed calculation
visible. Discount & schedule, Additional price details and Quantity pricing
start collapsed with digests of the actual draft amounts, dates, label and
saved tiers. Opening or closing a section changes presentation only. The
schedule toggle retains native behavior: switching it off clears both dates;
a zero discount merely hides the schedule controls.

The receipt and tier list show base plus commission minus configured discount,
independently of dates, with an explicit schedule status and explanation. The
tier editor's native calculator still respects its discount dates. Commission
and discount remain monetary amounts, with a derived percentage for reference.
Currency selection never converts amounts. Saved tiers keep the saved product
currency until the main price save succeeds.

The ordinary price tuple has a local saved snapshot. Discard restores that
tuple only, including currency and schedule; independently saved tiers remain
intact. A successful existing owner/vendor product PUT refreshes the snapshot
from the canonical response and then advances Save & Continue. Failures retain
the draft and active section. A successful ordinary save from another section
also refreshes a visited Price editor. Hidden Price editors have no local
shortcut, and main/tier pending operations and open tier dialogs block duplicate
submission. Invalid main totals or reversed dates block Save while Discard
remains available for recovery. No new rule is added to Inventory's save.
The native date picker's unconfirmed selection also blocks main Ctrl+S until
the picker closes. Tier Cancel returns focus to its own Add/Edit launcher.

Service keeps FIX, AGREEMENT and ESTIMATION and its native illustrations.
Subscription listing-price guidance links to the actual plan inventory;
Marketplace guidance links to native vendor management. Physical and Virtual
products retain their product/variant/vendor-scoped quantity prices. Each tier
keeps native Add/Edit/confirmed Delete and independent requests, minimum integer
two, unique thresholds and ten-tier limit. A negative tier remains a warning,
not a new API prohibition. The child `workspace` opt-in preserves Inventory and
legacy dialogs, rows and charts.

The approved workspace is capped at 760px, with 23px widget padding, 16px corners,
16px/500/24px headings and 12px/19px supporting text. Closed disclosure headers
are at least 84px and open headers 69px. The desktop receipt uses a 207px column,
27px gap and 29px/38px amount, including its decimals. Fields use 14px desktop
and 16px narrow text. At 720px padding becomes 19px; at 360px it becomes 15px.
Below 600px the receipt, fields and tier rows reflow without hiding data.
Actions retain 32px desktop/44px touch targets; tier dialogs cap at 610px with
18px corners and 23px/16px insets. Fonts inherit the application selection,
alignment is logical for RTL, and shared tokens preserve Light/Smart invert.

This change touches this editor, `BProductEditPrice.workspace.test.mjs`,
`../../add/full/BProductAddFull.vue`, `../../add/README.md`, the three shared
tier components listed below, `../info/BProductEditInfoIcon.vue`, this README
and dashboard `en.ts`/`fa.ts` under `@selldone/translate`. No backend endpoint,
authentication, permission or pricing payload changes are required.

## Inventory Unified layout

- The form is centered at a maximum of 760px. White/theme-aware panels have
  18px corners and 20px padding. Variant pricing scope appears first.
- The desktop form and receipt use `1.6fr / .9fr` columns with a 24px gap;
  related input pairs use two columns with a 20px gap. At 600px and below,
  the receipt stacks above the input fields and pairs become single-column.
- Section headings are 16px/24px medium; body copy is 14px/22px and supporting
  copy is 12px/19px. The receipt amount uses 28px/36px. The selected application
  font, native focus and touch-target rules remain in force.
- Existing commission, label and discount dates stay visible when populated;
  empty optional fields retain their Add/disclosure actions. The price receipt
  remains visible while editing, with neutral explanatory validation.

## Inventory native behavior

`setProductPrice()` keeps its existing name and returns the native request
promise. The Inventory caller owns the external Save/Close buttons. The
payload includes price, currency, commission, discount, discount boundaries,
price label and pricing mode. Success refreshes inventory; failures retain
the local tuple and release loading for retry. Server authorization and
ownership remain at the existing endpoint.

Physical variant mode is Boolean. Shared mode copies the complete parent
tuple and a shared save can update the parent price used by other shared
variants. Product-level service modes retain FIX, AGREEMENT and ESTIMATION;
subscription prices remain listing prices with native plan navigation.
Marketplace/vendor guidance and destinations remain separate.

The receipt shows native-currency base price plus fixed commission minus
monetary discount. The preview uses the editor's amount tuple, independently
of the scheduled activation period. A negative derived total is explained;
modernization does not introduce a new Save prohibition. Price labels retain
their 32-character limit. Date inputs use the native UTC conversion and
end-on-or-after-start relationship; disabling scheduling clears both dates.
The shared date input forwards native `disabled` state and blocks opening or
clearing while disabled; the legacy `disable` contract is preserved.

Quantity prices keep their existing product/variant/vendor scope and native
Add/Edit/confirmed-Delete dialogs. Those operations save independently of the
main pricing form. Their saved currency belongs to the saved product; changing
the main currency draft does not convert or relabel saved tiers before Save.
The server retains whole minimum quantities of at least two, unique minimums
within a tier set and the ten-tier cap.

## Verification

From the repository root:

```powershell
node --test @selldone/components-vue/backoffice/product/edit/price/BProductEditPrice.workspace.test.mjs @selldone/components-vue/backoffice/product/add/full/BProductAddFull.test.mjs
node --test @selldone/components-vue/backoffice/product/edit/price/BProductEditPrice.unified.test.mjs @selldone/components-vue/backoffice/inventory/bulk/BInventoryBulkDialogs.test.mjs @selldone/components-vue/backoffice/inventory/list/BInventoryList.test.mjs
```

The workspace adds 18 isolated/mounted regressions for native money precision
and localized digits, saved snapshots/Discard, invalid-date recovery, complete
owner/vendor PUTs, failure/retry, inactive editors, staged date-picker shortcuts
and independently saved tiers. The combined workspace, Unified and Add flow
run passes 50 tests. The broader Price/General/Survey/Spec/Pictures/Inputs/Add/
Inventory/bulk run passes 186 tests. Six changed SFC scripts/templates/scoped
styles compile; 80 English/Persian workspace keys and placeholders match.

Actual Edit was checked read-only in the existing local application on desktop
and at 390px/320px, including native tier dialogs, field geometry and inactive
tab behavior. A disposable actual Vue/Vuetify fixture covers nine contexts:
desktop, both narrow widths, Persian native dark and Smart invert, Service,
Subscription, Marketplace and the shared Add editor. It checks collapsed and
expanded layouts, tier confirmation/Cancel, keyboard guards and native date
staging without HTTP or data writes. Product saves, tier saves/deletion and
product creation were not submitted against shop data. No production build,
Laravel server or cache mutation was used.

The focused test compiles the actual Vue template, TypeScript and scoped Sass,
then exercises rendered native-child props and real component methods with
isolated HTTP/notification stubs. It covers pricing ownership, complete
payloads/retry, native currency, optional fields, dates, type-specific branches
and separate tier collection updates. It also renders the actual date input,
tier row and quantity chart to check disabled behavior, confirmed actions,
native chart math/units and opt-in tooltip/count behavior. Browser QA remains responsible for
actual pixel geometry, narrow screens, RTL and Light/Smart invert appearance.
No live price writes or application bootstrap are needed for these tests.

## Inventory integration and local handoff

Task-related changes are confined to these shared components, their focused
checks and EN/FA copy:

- `backoffice/inventory/list/BInventoryList.vue`, its `BInventoryList.test.mjs`
  and `README.md`: fullscreen identity/header, compact footer, consequence
  placement, pending-save guards and preserved default callers.
- `backoffice/product/edit/price/BProductEditPrice.vue`,
  `BProductEditPrice.unified.test.mjs` and this README: Unified form/receipt,
  scope help, optional fields, saved-parent schedule disclosure and native
  tuple coverage.
- `backoffice/product/extra-pricings/add/BProductExtraPricingAdd.vue` and
  `row/BProductExtraPricingRow.vue`: opt-in tier editor, responsive native rows,
  localized actions and preserved immediate tier operations.
- `backoffice/extra-pricing/ExtraPricingLevels.vue`: opt-in, keyboard-accessible
  tier detail tooltips and localized count; native chart values stay intact.
- `ui/date/input/UDateInput.vue`: native disabled forwarding and disabled
  open/clear guards.
- `backoffice/inventory/bulk/BInventoryBulkDialogs.test.mjs`: updated modern
  copy expectation and tooltip stub; existing bulk behavior checks retained.
- Sibling `@selldone/translate/dashboard/en.ts` and `fa.ts`: modern pricing copy.

The combined inventory wrapper, wholesale parent, inventory list, bulk and
Unified editor command passed **62/62 tests**. The final footer typography
adjustment also passed the inventory suite again (**22/22**).

Actual local-browser review covered the default 1467px viewport, 1024px, 800px,
the 599/600px reflow boundary, 390px and 320px. It checked the 760px content cap,
20px panel insets, 18px corners, 16px field text, aligned 60px native input
shells, 28px receipt, 13px footer labels and 42px/44px actions. English/Persian,
RTL, optional fields, shared pricing help, native disabled dates, quantity
rows/editor/tooltips and the existing Light/Smart invert context were inspected.
Native teleported dialogs retain their own theme outside the inverted canvas.
No actual stock, main-price, tier-save or delete operation was submitted.

Existing source modifications remain unstaged. Only the new focused editor
test and this new README are staged; unrelated concurrent work is preserved.
