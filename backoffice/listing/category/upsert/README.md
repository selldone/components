# Listing category editor

`BShopListingCategoryUpsert` creates and edits categories through the existing shop endpoints. Backoffice enables the opt-in `modern` presentation; its default remains `false` for existing callers.

The Refined editor has four native keyboard-accessible sections: General, Description, Category form fields and Media. All sections remain mounted while navigating, retaining input values, builder changes and file selections. Content uses the shared modern primitives: a 1040px canvas, 164px desktop section rail, 24px layout gap and form width up to 760px. Below 960px the rail becomes a horizontal tab row. The title is 20px/500/28px; supporting text is 13px/21px. The top Close control and one primary Create category/Save changes footer follow the item editor. English/Persian copy and explicit light/dark dialog themes are retained.

Every original field remains: title, optional slug, parent category, sort order, active state, price format, optional design ID, description, category form builder, icon upload and cover upload with previews. The original file inputs and builder are reused. Schema drafts are copied from the category so cancellation cannot mutate the list's record. Stored object schemas remain unchanged in modern mode until an explicit local Clear custom fields action; clearing submits an empty array. Legacy callers retain their original array-only multipart conversion.

Saving keeps the original multipart field names and Boolean/number/string values. Empty parent/design relations are explicitly sent when editing; optional files use `photo` and `icon_photo`. No endpoint or storage mechanism is added. Modern writes require current Categories write permission and exclude vendor routes; access is checked again at the write boundary. Duplicate submissions and closing during a write are blocked.

`requestClose()` closes clean or reverted forms directly and shows Keep editing/Discard & close for unsaved fields, schema or file choices. Parents control their dialog model and route native dismissal through this method so Escape cannot bypass confirmation. Failed saves retain the draft. Only a successful save updates the submitted baseline; newer changes remain open and emit `saved`. Completed saves emit `add` or `edit` as before. The editor retains the latest saved category locally, keeping a newly created ID for subsequent edits and current uploaded-image previews when newer changes keep the form open. Blob preview URLs are released when replaced, reset or unmounted.

Focused tests live beside the editor in `BShopListingCategoryUpsert.test.mjs`. Visual review uses the existing authenticated local application, opening and cancelling the editor without creating categories or uploading files. Do not start another Laravel server or run a production build for these ordinary HMR source changes.

## Inline creation from an item

The General tab of the Refined item editor supplies a standard 32px desktop / 44px touch action in the category selector's `append-inner` slot. It opens this same editor in a nested dialog, retaining the item draft. The action requires current Backoffice Categories write permission, excludes vendor routes and is disabled while the item is saving. A saved response is accepted only for the shop that opened the dialog.

`BListingCategoryInput.selectCategory` upserts the returned full record before selecting it, retaining category-specific form fields. Pending autocomplete requests are invalidated, and later reads apply only to their current request and endpoint context. Closing or discarding category creation returns to the item without resetting its inputs. The selector itself does not import the editor, avoiding a recursive dependency.

Verified: 65 focused Listing tests pass, five changed Vue components and their styles compile, and category-editor keys resolve in English/Persian. Browser review covered all four sections, desktop, narrow/mobile layout, RTL, the inline button and nested cancellation retaining the item draft. The action is 44px square on mobile, with one 44px-high footer action and no horizontal overflow. No category or item was saved and no image was uploaded during browser review.

## Files changed for this update

- Shared category input and editor: `../input/BListingCategoryInput.vue`, `BShopListingCategoryUpsert.vue`, `BShopListingCategoryUpsert.test.mjs` and this README.
- Shared item editor: `../../item/upsert/BShopListingItemUpsert.vue`, `../../item/upsert/tabs/BShopListingItemTabGeneral.vue`, `../../item/upsert/BShopListingItemUpsert.test.mjs` and `../../item/upsert/README.md`.
- Main workspace: `src/Applications/Backoffice/pages/shop/listing/categories/BShopListingCategoriesList.vue` and `src/Applications/Backoffice/pages/shop/listing/README.md`.
- Dashboard dictionaries: `@selldone/translate/dashboard/en.ts` and `fa.ts`.
