# Vendor offer editor

`BProductVendorAdd.vue` assigns a vendor to a product or edits an existing vendor offer. Product → Vendors, Marketplace → Products and Vendor → Inventory share this editor and keep their existing fullscreen dialog and parent events.

- Vendor keeps the vendor, available variant and enabled state together. Editing locks the vendor and an already assigned variant; an offer without a variant may select one. The variant lookup excludes variants already assigned to that vendor and preserves cached SDK responses.
- Pricing keeps the vendor price, marketplace price, currency, automatic pricing rule, fixed commission, discount and optional UTC discount boundaries. Calculations use the existing currency precision helper. Quantity price tiers remain available for saved physical and virtual offers and save independently of the main offer.
- Inventory keeps stock for non-file products and lead time, including dynamic (`-1`) and instant (`0`) preparation.
- Critical actions require an existing offer, a product without vendor ownership, the active critical section, expanded controls, verification and an explicit confirmation. Changing sections clears the verification; confirmation checks the conditions again before removal.

Closing with unsaved offer fields asks for confirmation. Section changes and independently saved tiers do not mark the main offer as changed. Successful add, save and removal still close immediately and update the product and variant data returned by the API.

## Refined layout

The native fullscreen shell keeps its header and footer outside the scrolling body, with minimum heights of 96px and 80px. The desktop workspace is capped at 1280px, with a 170px navigation rail, a 30px gap and a centered 760px content column. Widgets have 22px insets and 16px corners; section titles are 19px/27px, body text is 14px and supporting text is 13px. At 760px the same four sections become a two-column navigation grid; at 600px fields stack. The enabled state remains visible on mobile. Touch actions keep at least 44px targets, with logical spacing for RTL.

Preparation presets keep six equal 44px options in a neutral 14px group with 6px insets/gaps and 8px option corners. Selection uses the theme surface and a quiet shadow without a persistent active overlay. Options reflow to three columns at 600px and two at 360px; custom hour values remain valid without selecting a preset.

## API and events

The existing POST/PUT body has 13 fields: `vendor_id`, `variant_id`, `pricing_id`, `enable`, `raw_price`, `price`, `currency`, `commission`, `discount`, `dis_start`, `dis_end`, `quantity` and `lead`.

Shop operations use the existing shop/product-scoped API factories. Editing and removal from the vendor panel use the existing vendor inventory factories, selected by both the matched vendor route and its vendor ID. Adding from the vendor panel remains unsupported. Server authentication, authorization and ownership validation remain authoritative.

Adding emits `add`, `add-vendor` and `close`; saving emits `update` and `close`; removing emits `remove` with the removed offer ID and `close`. API and transport errors retain the open editor and release its loading state.

## Focused checks

From the application repository root:

```sh
node --test @selldone/components-vue/backoffice/product/vendor/add/BProductVendorAdd.test.mjs
```

The test loads the real SFC script and existing date/price helpers with in-memory HTTP and SDK responses. It does not start the application, call live APIs or verify backend permissions.
