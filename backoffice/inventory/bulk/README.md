# Inventory bulk price and discount updates

The approved Refined layout makes the existing bulk operations easier to understand: configure a rule and scope, verify them, review server-proposed values, then apply. `BInventoryList` opts modern Inventory pages into both dialogs; default presentations remain available to legacy callers. Both dialogs use the same `b-inventory-bulk-dialog` anatomy and scoped `bulk-dialog.scss`, while their controls and request paths remain feature-owned.

## Existing operation contracts

- Percentage changes accept −90% to +90%, with one decimal place and a 0.5 step. They apply across shop currencies using the server's currency rounding rules.
- Fixed amounts add a signed amount in the selected currency. Negative results are not silently clamped by the UI.
- Price endings replace trailing digits in the selected currency and can raise or lower a price. Zero is valid; currency precision is applied before the illustrative calculation.
- Marketplace listing recalculation retains its minimum/maximum vendor-offer strategy, including that offer's discount, discount period and commission. A vendor selection limits eligible products; the strategy still compares their vendor offers.
- Category scope includes descendants, or the whole shop when no category is selected. Inventory search, list filters and the dropshipping-only view do not limit the operation. Counts describe records in scope, including records whose prices may stay unchanged.

Ordinary methods change base prices while preserving discounts, commissions, discount dates and stock. Request URLs, payloads, category/vendor parameters and server authorization remain unchanged. Opening the preview does not save anything. Its display-currency selector changes the read only; it does not narrow a percentage update's application scope. Successful Apply closes both dialogs and emits the existing update event; failures retain the preview and draft for retry. Confirmation and pending-request guards protect preview/submission.

## Discount operation

Discount percentages replace the existing discount amount with a currency-rounded percentage of the current base price. The native 0–90% range, one decimal place, 0.5 step and zero-to-remove behavior remain unchanged. Base prices, commissions and stock stay unchanged. Products and variants across shop currencies are included; category scope includes descendants, and inventory filters do not narrow it.

The native date inputs retain UTC output, independent clearing, start/end bounds and the disabled end input without a start. Both date keys are always submitted: blank boundaries clear the corresponding existing dates. Start-only and end-only values remain expressible, including clearing a start while an end is still selected. `formatDiscountPeriod.ts` gives configuration, illustration and preview consistent localized summaries without falsely marking an open-ended period expired. The native timeline stays available for its progress and contextual help.

A preselected category remains visible and submitted after reopening; the category ID is restored after the existing reset. Verify and pending-submission guards protect both immediate and queued preview opening and Apply. Preview and mutation URLs, parameters, success events and failure retention remain unchanged.

## Presentation and help

The configuration uses a 1040px content width, a 1.2:0.95 desktop grid with a 24px gap, 22px widget padding, 20px dialog titles and 13px inline help. It stacks on narrow screens, retaining native inputs, tabs, category/vendor selectors and the Smart Verify shape. Modern verification supports Space/Enter and visible focus. Actions use shared modern styling and 44px touch targets.

`BInventoryBulkPriceIllustration` is an inert, fictional before/rule/after example. Percentage examples use USD 100 rather than pretending to reproduce other currencies' server rounding. Fixed/ending examples use the selected currency's precision. The actual server preview remains authoritative. The curved SVG connection animates once for 2.2 seconds and displays its finished state under reduced motion. Artwork has no API calls or editable controls.

`BInventoryBulkDiscountIllustration` uses a fictional USD 100 base and an existing USD 10 discount. The proposed percentage replaces that discount; the illustrated price after discount excludes commission and reflects the selected period. Its connection follows the same finite/reduced-motion rules as Pricing.

The modern preview keeps current/proposed columns, native discount/date details, sorting and pagination, error/retry and empty states. A single absolutely positioned `ULoadingProgress` uses the shared `s-table-loading` pattern; loaded rows stay in place during refresh. A request identifier ignores stale responses and unmounted completions. Proposed zero prices remain visible.

`discountUpdate` selects the modern Discount columns: base price, current discount and proposed discount with their separate date boundaries. Zero discounts and explicit null dates are preserved. The default Price preview and legacy presentations retain their columns; the display-currency control still affects only preview reads.

English/Persian help lives under `bulk_price_dialog.modern` and `inventory_list.bulk_discount_dialog.modern`. Feature geometry stays scoped to these components; shared controls and the product-wide design guide remain the source for reusable styling.

## Implementation files

- `price/BInventoryBulkPrice.vue`, `discount/BInventoryBulkDiscount.vue` and `bulk-dialog.scss`: common Refined anatomy and scoped geometry, with native feature controls.
- `discount/BInventoryBulkDiscountIllustration.vue` and `formatDiscountPeriod.ts`: fictional before/after example and consistent date-boundary descriptions.
- `preview/BInventoryBulkPreview.vue`: Price/Discount columns, periods, currency display and stable loading.
- `../list/BInventoryList.vue`: modern Inventory opts both operations into the shared presentation.
- `BInventoryBulkDialogs.test.mjs` and `../list/BInventoryList.test.mjs`: isolated behavior, rendering and caller checks.
- `../../../../translate/dashboard/en.ts` and `../../../../translate/dashboard/fa.ts`: matching help and state copy.
- `../../../../../.ai-agent/guides/selldone-product-ui-design.md`: durable shared Inventory bulk-update decision; this README records the feature-specific behavior and measurements.

## Local verification

From `@selldone/components-vue`:

```sh
node --test backoffice/inventory/bulk/BInventoryBulkDialogs.test.mjs backoffice/inventory/list/BInventoryList.test.mjs
```

The suite compiles the actual Vue/TypeScript/shared Sass, checks native controls and all Price/Discount payloads, pinned-category reopening, confirmation/pending guards, success/failure recovery, preview races/zero values and date clearing, and illustration precision/boundaries. It uses isolated API mocks and performs no live price or discount updates.
