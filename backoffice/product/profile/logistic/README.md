# Product logistic profiles

`BProductProfileLogistic` selects reusable Warranty, Return policy, Guide and
Shipping profiles from the product's General settings. Its `modern` option uses
the Refined dialog; other callers retain the existing presentation.

Edit Product (`modernGeneral`) and Add Product (`modern`) both enter the same
`BProductAddFull.modernWorkspace` General editor, which passes `modern` through
`BProductEditInfo` to this shared picker. No second dialog implementation is used.

| Profile type | Product field |
| --- | --- |
| Warranty | `warranty_id` |
| Return policy | `return_policy_id` |
| Guide | `guide_id` |
| Shipping | `shipping_id` |

The native profile selector keeps the current authorized shop/vendor context.
Opening the dialog, including reopening the same profile, loads its current
profile and articles through the existing SDK. Selection changes, clearing,
closing, context changes and unmounting invalidate earlier responses. Loading
and failed reads cannot confirm an incomplete selection; failed reads offer a
retry. Clearing the selection can be confirmed deliberately.

**Confirm selection updates only the matching field in the local product
draft.** The product's General settings Save persists that assignment. Cancel
leaves the product assignment unchanged.

Assigned rows use the product response's `warranty_profile`,
`return_policy_profile`, `guide_profile` and `shipping_profile` summaries. A name
is shown only for a matching profile ID/type; older or unavailable metadata
falls back to “Assigned”. A green check beside Change means an ID is assigned,
not that the profile has an enabled/health state. The existing Smart-invert
hook keeps the check green, and native action end margins are removed to retain
the 12px row inset.

Modern row tooltips use an outline purpose icon, a short explanation and a
quiet inset showing the selected profile name and assignment check. Unassigned
profiles keep a plain status. The compact page-location preview preserves the
actual preceding/following sections from the shop's theme order. Both shared
product editors use this same tooltip; it performs no extra fetch. Width and
placement stay with `sd-modern-tooltip`, with theme-aware surfaces and native
hover, keyboard focus and Escape behavior.

Tooltip refinement touches `BProductProfileLogistic.vue`,
`../location-preview/BProductProfileLocationPreview.vue`, translation
`dashboard/en.ts` / `dashboard/fa.ts` and this README. The parent suite passes
18 checks; both SFCs and translations compile. Isolated actual Vue/Vuetify QA
passes all four profile tooltips across six desktop/mobile, EN/FA and
Light/Dark/Smart cases, including long names, focus/ARIA, Escape with focus
retained and the existing row-click dialog action. No live shop request was
submitted.

Confirm updates the local ID and bounded summary together; General Discard
restores both through its existing snapshot. Product create/update requests
still send only the four assignment IDs. The shared backend
`ProductController::GetProductInfoFull()` supplies `id`, `type`, `name`, `info`
from each attached profile, constrained to the permitted shop and expected
profile type. Existing product lists and article endpoints stay unchanged.
Articles and private profile metadata are not loaded in the product response.

`BLogisticProfileEditor` manages the selected profile's shared multilingual
content with the existing rich-text editor, language tools, translation and
deletion flows. Saving content persists the shared article separately and affects
every product using that profile; it does not save the product assignment.
Vendors can select and read profiles but cannot edit their content or create a
profile here. Unsaved or busy content blocks selection and dismissal until the
merchant saves or cancels the edit.

The existing profile-manager route creates profiles outside this dialog.
Language creation uses the first unused configured shop language; translation
and confirmed deletion retain their native shared-article persistence flows.
The rich editor, image-upload endpoint and Word/Auto-fit workspace stay native.
Pending image previews and Word operations block premature content saving.

Refined geometry uses an 820px desktop dialog, 20px/28px medium header,
16px/24px section headings, 21px widget insets, 14px widget corners and
21px/30px article titles with 14px/25px reading text. Mobile uses fullscreen
scrollable content, 18px top/square bottom corners, 18px widget insets and
16px editable text. Action labels are 13px/20px; shared buttons keep their
42px desktop/44px touch height and icon actions use 32px/44px targets.

English and Persian Refined copy lives in `product_logistic_profile.refined` and
`logistic_profile_editor.refined`. Focused local checks:

```powershell
node --test @selldone/components-vue/backoffice/product/profile/logistic/BProductProfileLogistic.test.mjs
node --test @selldone/components-vue/backoffice/product/profile/logistic/BLogisticProfileEditor.test.mjs
node --test @selldone/components-vue/backoffice/logistic/profile/input/BLogisticProfileInput.test.mjs
```

The three focused suites and neighboring General-information suite pass 49
checks. Isolated actual Vue/Vuetify verification covers 31 runtime states,
22 selection/editor interactions and six final typography/contrast checks:
desktop/mobile, English/Persian, Light/native Dark/Smart invert, owner/vendor,
empty/loading/error and legacy rendering. The native rich editor/core was used;
insertion add-ons, uploads and HTTP were isolated. No authenticated shop save,
upload, translation or deletion was submitted. No production build, server
restart or cache operation was run.

The summary refinement adds isolated SQLite coverage in
`Backend/tests/Unit/Storefront/Product/ProductLogisticProfileSummaryTest.php`:
13 tests / 86 assertions cover all four relations, shop/vendor reads,
unassigned/orphan IDs, foreign-shop and wrong-type rejection, bounded columns
and unchanged plain product queries. Run from `Backend` without Laravel boot:

```powershell
php vendor/phpunit/phpunit/phpunit --no-configuration tests/Unit/Storefront/Product/ProductLogisticProfileSummaryTest.php
```

Refinement files: `Backend/app/Http/Controllers/Shop/Product/ProductController.php`
and the new test above; `BProductProfileLogistic.vue` and its existing test;
`backoffice/product/edit/info/BProductEditInfo.vue` and its existing test;
translation `dashboard/en.ts` / `dashboard/fa.ts`; and this README.

Task files: this README; `BProductProfileLogistic.vue` and its test;
`BLogisticProfileEditor.vue` and its test;
`backoffice/logistic/profile/input/BLogisticProfileInput.vue` and its test;
`backoffice/product/edit/info/BProductEditInfoIcon.vue` (canonical FileText,
with duplicate existing icon entries consolidated); and translation
`dashboard/en.ts` / `dashboard/fa.ts`.
