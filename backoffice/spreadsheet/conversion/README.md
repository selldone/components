# Spreadsheet conversion status

Mount `BSpreadsheetConversionProgress` only while the existing Excel-to-CSV
request is active. Its optional `filename` string is escaped as text, visually
ellipsized and retained in full in the title. The importer owns conversion,
failure handling, preview validation and disabling Continue; this component
does not emit events, issue requests or infer progress.

The canonical Excel/CSV assets and one continuous connector explain the intended
conversion. The inert artwork is explicitly labeled as an illustration, finishes
its single 1.6-second reveal in a static composition and honors reduced motion.
It does not claim completion. A separate native indeterminate progress indicator
continues while the component remains mounted. No percentage or playback
controls are shown.

Layout and theme fallbacks are local and scoped so legacy and vendor importers
can use the same status without importing Backoffice-only styles. English and
Persian copy lives in `importer.conversion`.

`SpreadsheetMixin` keeps conversion pending until the existing upload promise
settles, invalidates the previous preview immediately and emits
`update:converting` to the importer. Replacing/clearing a file, changing the
shop/vendor or unmounting discards late responses. Continue and submission also
require the existing preview validation; conversion success alone never imports
rows. The converter and upload helper retain their existing endpoints, multipart
fields, credentials, error notifications and upload-keeper cleanup.

The six picker consumers are products, categories, inventory, customers,
vendors and virtual items. Their parent importers gate progression and sending.
Direct Excel drops on the product catalog and the product, inventory, customer
and vendor importers use the same status while retaining their native handoff.
The catalog uses a compact dialog so waiting stays visible after scrolling.

`../mixins/SpreadsheetMixin.test.mjs` exercises the real mixin, converter and
upload-helper chain with synthetic deferred requests. Category and product
importer tests cover preview replacement, failed conversion and direct drops.
These tests do not upload files or import live records.
