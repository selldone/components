# Product property-set assignment

`BPropertySetProductDialog.vue` assigns an existing property set to the injected product. Inventory / variants uses this same dialog in Edit Product and Guided Add. `modern` opts into the approved dialog design; other callers retain the original presentation.

The modern dialog has a short expandable Help explanation, a searchable native selector, and a preview of actual variant names, canonical icons and display order. The six native axis codes remain fixed. Configured valid axes appear first in their stored order, followed by native fallbacks; no example sets or product illustrations become real application choices. Clearing uses the native default fallback. Creating a set opens the existing management route in a separate tab and remains unavailable to vendors.

Selecting, searching, clearing and previewing change only the local draft. Cancel restores the current product assignment. Save keeps the existing shop/vendor PUT with only `property_set_id`; success merges the canonical product/property-set response and closes. Failure retains the draft. Pending saves block duplicate submission and dismissal. Product/session/unmount guards prevent late responses from overwriting another active draft. Modern selector reads preserve an explicit selection and ignore stale responses, while legacy combobox hydration remains unchanged.

The desktop dialog is capped at 640px with 18px corners, a 20px/500/28px title and 26px content insets. Narrow layouts use the native bottom sheet with square bottom corners, 19px/15px insets, 44px touch actions and 16px editable text. Help uses 14px/23px copy; routine guidance uses 13px/21px. Preview rows have native icons and 13px labels, arranged in two columns or one at 360px. Styles remain component-scoped and use the shared modern theme tokens.

## Changed files

- This README and `BPropertySetProductDialog.vue` / `BPropertySetProductDialog.test.mjs`.
- `../input/BPropertySetInput.vue` / `../input/BPropertySetControls.test.mjs`.
- `../preview/BProductPropertySetPreview.vue`.
- `../../product/edit/info/BProductEditInfoIcon.vue`: licensed Lucide Shirt icon for the Help example.
- `@selldone/translate/dashboard/en.ts` and `fa.ts`: `product_property_set.modern` copy.

Focused tests cover actual preview ordering/defaults, bounded native reads, legacy behavior, selection retention, stale responses, default assignment, owner/vendor payloads, Cancel, errors, pending state and lifecycle guards. Runtime verification uses isolated Vue/Vuetify fixtures with stubbed reads/writes and the existing local browser for read-only inspection. Real shop saves, property-set creation and preference changes are not invoked. No production build, additional server or Laravel cache operation is required.
