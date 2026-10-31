# Extra products engine

The modern `BCategoryEngineEditor` keeps settings and its explanation in one reading column. The native category selector, tag combobox and Auto-add retain their existing draft, request and permission contracts. Standalone callers keep the Save/Cancel action bar; `embedded` category-edit callers instead place a single Save with localized scope guidance inside the settings card. Embedded mode has no Cancel or fixed footer and does not close its parent. Legacy callers and the compact `BCategoryEnginePreview` tool tile keep their existing presentation.

## Actual storefront rule

Normal storefront category browsing includes products matching this grouped predicate:

`current category or its shortcuts OR any selected primary category OR all selected tags`

Categories use OR within the category list. Tags use AND within the tag list. The two source groups use OR between them. Existing products remain eligible; a product matching several branches still appears once. The engine does not create folders, copy/move products, recursively inherit a selected category's descendants/shortcuts/engine or control the final product order. Storefront visibility, filters and sorting still apply. Admin catalog reads, search and all-level browsing do not apply this engine branch.

The behavior is defined in `Backend/app/Http/Controllers/Shop/Product/ProductController.php` in the directory/Engine predicate. Ordinary request-tag filtering has different ANY-tag semantics; it must not be used as the engine reference.

Auto-add fetches the current destination's descendants once (all shop categories for root), merges them with the draft, removes duplicate IDs and keeps the first 32. It is not a persistent subtree rule. Save uses the original category-engine PUT with only category and tag sources, then emits both the returned engine and regenerated filters. Pending saves cannot submit twice. The catalog's root/category dialog updates its target and closes on success; both result events are applied before native dialog teardown. Embedded category-edit hosts stay open and save independently of the category's routine settings and template. Standalone Cancel resets the local modern draft and lets its host close. Pending or failed saves keep the catalog dialog open, and errors retain the draft in both contexts. Backend category-write access, authorized-shop category resolution and 32-category/32-tag limits remain unchanged.

## Explanation boundary

`preview/BCategoryEngineExplanation.vue` is an inert, labeled illustration. Its real location identity sits outside the decorative stage. Bounded canonical Material folder/note silhouettes, circular thumbnail placeholders, curved SVG braces and ellipses explain the two inclusion groups. Only product-file silhouettes appear in the engine-added group; no folders are added. Empty source selections show no added product samples.

The samples are not a fetched result page, matching-product count or ordering promise. The component performs no product/API requests, navigation, selection or uploads; its real location avatar retains the existing image-delivery helper. The surrounding category/tag inputs remain the real controls. The complete explanation is static, stacks at 600px and mirrors with logical RTL geometry.

## Verification

Run `node --test "@selldone/components-vue/backoffice/category/engine/BCategoryEngineEditor.test.mjs"` from the main repository root. The isolated actual-SFC tests use synthetic data and deferred request stubs for drafts, rule copy, illustration semantics, Save/Cancel/errors, Auto-add, vendor guards, localization and compilation. Embedded checks verify inline action placement, localized save scope, absence of Cancel/fixed actions, exact request payloads, duplicate-submit prevention and retained failure drafts. The catalog-host checks use its actual dialog handlers to verify successful root/category saves close after both results are applied, while pending/error saves and embedded editors stay open. Use the existing HMR session for isolated native layout checks; do not save a real shop's engine, build production assets or mutate Laravel caches to verify presentation.

Focused engine/editor and catalog context-menu checks pass. An isolated native Vuetify preview checked English desktop/root, 320px Persian category with 32 category selections and 32 long tags, and 390px Persian native dark. It verified all four rule messages, empty/added illustration states, single-column order with a 19px card gap, 48px file/folder glyphs and 20px thumbnail circles, with no page/chip/group overflow or unexpected requests. Real saves and the legacy Smart Invert shell were not exercised.
