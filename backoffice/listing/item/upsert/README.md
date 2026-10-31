# Listing item editor

This shared editor creates and updates Listing items. Backoffice opts into the approved Refined form with `modern`; its default is `false`, so Vendor and other existing callers retain their native presentation. The same tab components, models, validation, API/VAPI selection and save payload serve both modes.

The editor retains category, title/slug, company, badges, publication status and featured state; subtitle/description; currency, price range and unit; telephone, email, website and multiple links; address, country, city and coordinates; and seven-day opening hours with presets. Shared Listing fields and category-specific fields appear only when their existing schemas provide them. Category fields override shared keys, unknown metadata survives, and notes, text, selects, switches, key/value rows and defaults keep their native behavior.

Media is always the last section. New items must first be created before uploads are available. The media section retains multiple-image upload, URL links/videos/files, library filters and counts, per-type Main selection, alt text, URL/sort editing, optional image replacement and confirmed deletion. Files continue through the existing authorized media endpoints and native controls; the visual treatment adds no storage mechanism.

## Save and navigation

The Refined editor is a sectioned form, not a wizard. Native tabs switch between sections without saving; there is no step counter, Back, Next or duplicate footer Close. The single footer action is **Add item** for new records and **Save changes** for existing records; successful saves emit `add` or `edit` so the caller closes the dialog when no newer edits remain.

Before an item exists, the Media section changes that same footer action to **Create & add media**. It uses the existing `goMediaAfterCreate` / `silentEmit` save path, retains the created item and keeps Media open. A modern-only `saved` event refreshes the parent list/count without closing. Invalid required details return the user to General. Media uploads/edits continue to persist immediately through their own existing endpoints. Busy/error handling and fixed-action behavior are preserved. Legacy callers retain Back, Next autosave, footer Close and the inline Media-create action.

## Unsaved changes on close

Top Close and native dialog dismissal (including Escape) share `requestClose`. Unchanged or reverted forms close immediately; unsaved item details or pending media drafts show **Keep editing** / **Discard & close**. Cancelling preserves all inputs. Closing is blocked while item/media writes are running. Already persisted media and merely visiting sections do not trigger confirmation.

The baseline compares the existing save payload, with category IDs, schema defaults, stable metadata keys and seven-day Hours normalization for comparison only. Saves retain their original payload contract. Only successful saves replace the baseline, using the submitted values plus generated slug/status; changes entered during a request remain unsaved and keep the editor open. Media reports pending drafts and write activity through reactive `dirty-change` / `saving-change` events. The parent controls its dialog model so Escape cannot bypass the guard. This protection is opt-in with the Refined editor; legacy callers retain their prior close behavior.

The Refined view uses native `VTabs` keyboard behavior: a vertical section rail from 960px and horizontal navigation below it. Content is capped at 1040px, with a 164px rail, 24px layout gap and forms capped at 760px. The heading is 20px/500/28px, body and supporting copy use the shared 14px/13px hierarchy, and primary actions retain the standard 42px size (44px on mobile). The teleported dialog explicitly follows the user's light/dark preference. Scoped styles and shared `sd-modern-*` primitives preserve RTL and native controls. English/Persian copy lives under `shop_listing.item_editor`.

The editor and its eight existing tab files opt into modern styling together. The Contact and Hours tabs pass the same flag to their existing Links and Opening Hours inputs; the General tab does so for its badge picker. The shop Items caller enables the flag, the shared Backoffice modern stylesheet supplies native-tab styling, and English/Persian dashboard dictionaries provide the copy. Other callers retain their existing mode. No endpoint, storage mechanism or schema format is added.

The General Category field also opens the shared [category editor](../../category/upsert/README.md) through its inline Create category action. It requires current Backoffice Categories write access and is disabled while the item is saving. Successful creation selects the returned full category, including its custom-field schema, without closing or resetting the item. Cancelling category creation preserves the item draft.

## Badge presentation and management

The modern badge picker is one native underlined `VAutocomplete` with multiple selection, removable chips, local title/description search and native Clear. Selected badges appear once inside the field; options appear only in its dropdown. General gives the field its own standard 24px form-group separation after Company. Artwork fits complete 18px chip and 24px option frames with `object-fit: contain`. Labels wrap on narrow screens, option rows retain 12px side insets and at least 44px height, and the native control handles keyboard selection and focus. Legacy callers keep their original card picker.

The picker exposes an `append-inner` slot. General supplies a compact, accessibly named **Manage badges** icon link inside the field for the current shop, with `target="_blank"`, `rel="noopener noreferrer"`, the standard new-tab arrow and localized help. It requires Backoffice Categories write access and is hidden for vendors. Opening it retains the item editor and its draft in the original tab.

This compact-picker refinement changes `backoffice/listing/badge/input/BListingBadgeInput.vue`, this editor's `tabs/BShopListingItemTabGeneral.vue`, `BShopListingItemUpsert.test.mjs`, this README and the main workspace's `src/Applications/Backoffice/style/modern-design.scss`. The shared underlined-field wrapping rule now includes multiple autocompletes, and the picker reuses the existing `v-input-auto-height` hook so wrapped chip labels grow without overlapping. The existing localized labels and management tooltip are reused. Focused checks cover ID/object output, deduplication, clear/disabled behavior, local filtering, current-shop management routing, permissions and vendor/legacy exclusions. Selected labels resolve from the fetched badge collection even while native filtering hides options. Browser review uses the existing shop's badges without saving an item or editing a badge.

## Verification

The compact-tab refinement bounds modern Contact URL chips to one line with ellipsis, keeps native removal visible and reveals the complete stored URL on hover/focus/tap only when clipped. Multiple chip rows use the existing auto-height hook rather than covering the next field. Custom-form multiple selections have the same bounded presentation; schema labels/keys/hints wrap, and key/value groups have one Add another action instead of two duplicate Add controls.

Modern Opening Hours uses 48px time fields/toggle targets and 4px vertical desktop row insets (about 56px per weekday), with a two-column touch layout on mobile. Presets, time values and export behavior are unchanged. Media places its existing image-upload panel, URL-media panel and library in three independent neutral cards with 16px gaps; native expansion, upload, type selection, filters and record actions remain intact. Filenames are bounded and media identities can shrink around trailing actions.

This refinement changes `links/input/BListingLinksInput.vue`, `opening-hours/input/BListingOpeningHoursInput.vue`, `item/upsert/tabs/BShopListingItemTabForm.vue`, `item/upsert/tabs/BShopListingItemTabMedia.vue`, `item/upsert/BShopListingItemUpsert.test.mjs`, this README and the main workspace's `.ai-agent/guides/selldone-product-ui-design.md`. Paths before `item/`, `links/` and `opening-hours/` share the `backoffice/listing/` prefix. The design guide records the user-approved default review of long chip values; no route, API, storage, model or translation contract changes.

From the main workspace:

```text
node --test @selldone/components-vue/backoffice/listing/item/upsert/BShopListingItemUpsert.test.mjs
```

The isolated tests cover the editor's data and save/navigation contracts and compile its Vue template/styles. Runtime review uses the existing local authenticated session: inspect desktop/narrow layouts, RTL and keyboard access by opening and cancelling the editor. Do not save items, upload media or modify live data as part of visual verification.

Verification covers editor save/navigation contracts plus the existing Items/Options tests, Vue template/styles and English/Persian translation paths. Browser review covers desktop, 390px mobile and keyboard section navigation; the original form modernization also covered Persian RTL and dark mode. No item is saved and no file is uploaded during visual review. A production build is not required for this source-only change.

## Changed files for the editor update

- `BShopListingItemUpsert.vue`, this README and `BShopListingItemUpsert.test.mjs`.
- `tabs/BShopListingItemTabGeneral.vue`, `BShopListingItemTabDescription.vue`, `BShopListingItemTabPricing.vue`, `BShopListingItemTabContact.vue`, `BShopListingItemTabLocation.vue`, `BShopListingItemTabHours.vue`, `BShopListingItemTabForm.vue` and `BShopListingItemTabMedia.vue`.
- Shared Listing inputs: `links/input/BListingLinksInput.vue`, `opening-hours/input/BListingOpeningHoursInput.vue` and `badge/input/BListingBadgeInput.vue`.
- Main workspace: `src/Applications/Backoffice/pages/shop/listing/items/BShopListingItemsList.vue`, `src/Applications/Backoffice/pages/shop/listing/README.md` and `src/Applications/Backoffice/style/modern-design.scss`.
- Dashboard dictionaries: `@selldone/translate/dashboard/en.ts` and `fa.ts`.
