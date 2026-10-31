# Product Shipping details

Edit Product and Guided Add opt the existing `BProductEditExtra` and
`BProductExtraInput` into the approved design with `modern`. Other callers keep
their legacy defaults. Package measurements remain visible; Preparation time,
Order quantity limits and Apply to variants start collapsed with actual draft
digests. The parent supplies the order-limits slot between the two shared input
disclosures, so the form does not duplicate shipping state or controls.

## Native fields and save

Weight and width/length/height use the existing numeric input and store units,
with three decimals and nonnegative values. Weight keeps the native 10,000 cap.
Units are never converted here. The actual warehouse unit-settings route stays
available to the shop owner and hidden in vendor mode. Preparation keeps integer
hours, `-1` for dynamic, `0` for ready now and the existing 8/24/72/168 presets.
Ready now refers to preparation, not courier delivery. Order limits remain
whole numbers; zero/null means unlimited and a finite maximum cannot be below
the minimum. Stock below the minimum remains a warning, not a new Save ban.

Shipping has its own local draft and saved snapshot. Discard restores the owned
four measurements, preparation and limits while retaining current canonical
extra metadata. The per-save bulk flag is separate: it copies package and
preparation settings to every variant on this save, leaves limits at product
level and does not configure future synchronization. A successful save resets
the flag. Failure keeps the draft and flag available for retry.

The existing owner/vendor extra endpoint and four-key `extra` request allow-list
remain unchanged. Success consumes the authoritative full extra/lead/limit
response, updates native variant state only when the response confirms bulk,
marks the draft saved and then advances to Description. Late responses cannot
update another product or advance a hidden section. Pending operations, inactive
editors and an open native service dialog reject duplicate/shortcut submission.
Inherited supplier settings are read-only and Continue advances without a PUT.

Visited Shipping stays mounted in modern Edit and Add, with no inactive Save
shortcut. Ordinary saves in other sections do not save this separate local
draft. If canonical shipping values refresh, a clean draft follows them; a dirty
draft remains intact and Discard targets the refreshed canonical baseline.
Unknown extra metadata is preserved through the server's existing merge policy;
the client does not re-add keys removed from an authoritative response.

## Shared presentation

`TransportationsEligibleView` gains an opt-in modern list and native scrollable
service dialog. It preserves actual provider identities, disabled service state
and the original comparisons against each service's weight and three dimension
limits. Details reuse the complete existing modern `BTransportationOverview`,
including real limits, schedules, fees and delivery resources. Matching size and
weight does not promise destination coverage, checkout availability or delivery.
No sample carrier constraints from the design prototype enter application code.

`UCube` gains an opt-in responsive outline data preview with localized dimension
labels and an accessible measurement summary. It uses theme tokens, has no
recurring animation and leaves the existing canvas behavior unchanged for
legacy callers. The component keeps native numeric controls and the standard
Smart Toggle; informational decimal badges are hidden only in the modern
shipping measurement fields.

## Geometry and verification

Content is capped at 760px. Widgets use 23px insets and 16px corners, headings
16px/500/24px and supporting copy 12px/19px. Closed disclosure headers are at
least 84px including padding; open headers are 69px. Native fields are 60px on
desktop with 14px text and 72px on narrow/touch displays with 16px text. The
desktop measurement/preview columns have a 27px gap and 190px preview column.
Insets become 19px below 720px and 15px at 360px. Narrow fields, service rows and
footer actions reflow without hiding data. Service dialogs cap at 540px with
18px corners and 23px/16px insets. Operational controls use 32px desktop/44px
touch targets; buttons are 42px/44px. All typography inherits the selected app
font and logical alignment supports RTL and native Light/Smart invert.

Run from the main workspace:

```powershell
node --test @selldone/components-vue/backoffice/product/edit/extra/BProductEditExtra.test.mjs @selldone/components-vue/backoffice/product/add/full/BProductAddFull.test.mjs
```

Shipping adds 18 tests covering native helpers/inputs, initialization, snapshots,
validation, stock warnings, independent PUTs, failures/retry, canonical metadata,
bulk scope, inherited mode, service-dialog guards and mounted draft retention.
Shipping plus Full pass 33 tests; the broader approved-tab and Inventory/bulk
run passes 205. Six changed SFC scripts/templates/scoped styles compile and
70 English/Persian keys and placeholders match. Actual local Edit was checked
read-only on desktop and at 390px/320px, including native service details,
Cancel/focus return, field sizing and responsive actions. A disposable actual
Vue/Vuetify fixture checks ten cases: desktop/736px, 390px/320px, Persian native
dark/Smart invert, vendor, supplier, Add and low stock. Native service-dialog
Ctrl+S/Escape/focus, local Ready now/Discard and unchanged canonical product
state pass without HTTP or writes. Isolated tests cover successful and failed
saves separately from real shop data.
No real shipping save, bulk update, product creation, production build, extra
Laravel server or cache mutation is used for QA.

## Changed files

- `BProductEditExtra.vue`, the new `BProductEditExtra.test.mjs` and this README.
- `../../extra/input/BProductExtraInput.vue`.
- `../../../transportation/transportation/TransportationsEligibleView.vue`.
- `../../../../ui/cube/UCube.vue`.
- `../../add/full/BProductAddFull.vue`, its existing test and `../../add/README.md`.
- The licensed `../info/BProductEditInfoIcon.vue` local outline-icon subset.
- Dashboard `en.ts` / `fa.ts` in sibling `@selldone/translate`, under
  `add_product.shipping_modern` and the Shipping flow subtitle.

No backend endpoint, authentication, permission or application-wide style change
is required. Existing tracked edits remain unstaged; only new task files are
staged for the local Git list, without commits or remote publishing.
