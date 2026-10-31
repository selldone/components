# Listing form builder

The builder edits an array of Listing submission steps. It retains each step's original schema, official/custom input types, images, option lists, itemized information, FAQs and the selected-step storefront preview. Changes emit cloned arrays; the settings page owns Apply/Cancel and final persistence.

Pass `modern` to opt into the approved Refined workspace. It uses the shared `sd-modern-*` primitives, a 154px desktop step rail and a single Edit/Preview panel. The rail reflows above the panel on narrow screens. Existing callers remain on their original layout unless they opt in. English and Persian builder labels live under `shop_listing.form_builder`.

Step selection keys the editor by the step ID so an old step's in-flight image upload cannot update a different selected step. The step rail also refreshes when an edited slide object is replaced, even when its ID/order stays unchanged. Uploaded files still use the existing authorized Listing image endpoint and native uploader.

Validation: run `node --test @selldone/components-vue/backoffice/listing/form-builder/BListingFormBuilder.test.mjs` from the main workspace. The isolated tests exercise actual schema operations and compile the builder templates/styles; they make no application, database or upload requests.
