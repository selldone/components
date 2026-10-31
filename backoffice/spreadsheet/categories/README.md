# Category spreadsheet preview

`BSpreadsheetCategories` reads category CSV or Excel files into the existing
editable `BSpreadsheet`. `modern` is opt-in and defaults to false. The native file picker
keeps its accessible label, clear control, file-size display, `canSelectFile` guard
and CSV/XLS/XLSX accept list; modern presentation uses a compact neutral file area
and localized status text. Parsing a file does not import categories.

The modern picker uses Vuetify's native single-line label and the existing
`assets/file/excel.svg` spreadsheet icon. The empty label stays inline while
focused. Selecting a file hides it in favor of a single-line filename and the
native selection slot's readable size.
The icon, filename, size and clear control align vertically within the row.
Long names ellipsize without displacing the size or clear action; the title and
accessible name retain the full filename. Clearing restores the empty label.
The legacy outlined picker retains its native label and spreadsheet icon.

CSV text from conversion or temporary route data is normalized locally to a real
CSV `File` before parsing and picker binding. This supplies an accurate byte size
and visible filename: the selected workbook's name becomes `.csv` when available,
otherwise the generated CSV uses `categories.csv`. Existing named files keep
their identity. The shared converter and TemporaryData contract stay unchanged.
Excel selection uses the original backend converter before the same editable CSV
preview and batch generator. Selection invalidates previous rows immediately;
late conversion responses after replacement, clearing or unmounting are ignored.
Conversion failures keep the preview invalid and use the existing upload error
notice, so an old dataset cannot be submitted as the newly selected workbook.

The shared modern data preview keeps ten-row pagination and edits the original
CSV rows through the existing typed cell editor. Row numbers and the visible
range reflect the current page. Click a cell, or focus it and press Enter/Space,
to edit it; invalid values stay readable while being corrected. “Show all
columns” reveals extra CSV columns without rendering every row at once. Legacy
spreadsheet callers keep their existing grid and controls.

New files and clearing immediately invalidate the old preview. Blank records are
ignored; missing headers, parser failures and header-only files cannot become
valid imports. Category-local reset handles the shared TemporaryData lifecycle
without changing the TemporaryData contract. Parse versions ignore a previous file's late
completion/error callbacks, including after clearing or unmounting.

Product CSV files keep their original product-import destination and pass the
same local file through TemporaryData. The local handoff guard prevents the
reactive temporary-data watcher from repeatedly routing before unmount.

`generateCategoriesJson(callback, chunk_size = 100, delay = 3000, onError)` retains
its public signature and sequential batch order. Each batch starts with the
original CSV headers and contains the current edited row values. Progress and
final-batch flags remain unchanged. Invalid/empty previews call `onError` instead
of generating a batch. No conversion provider, upload endpoint or storage policy
is changed here.

Run the isolated Vue-renderer/Papa Parse checks from the main workspace root:

```sh
node --test "@selldone/components-vue/backoffice/spreadsheet/categories/BSpreadsheetCategories.test.mjs"
```

Tests use synthetic CSV data and the real format validators/parser, defer reads
to check races, and verify edited sequential batches without live uploads/imports.
