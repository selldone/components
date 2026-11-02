# Language override workspace

The modern store-language dialog uses this browser instead of mounting a recursive table and editor for every category. It keeps one native table page (25 or 50 rows) and one lazily mounted text editor. Top-level categories carry counts, while full key paths preserve access to nested strings and indexed array entries. Search is debounced and matches keys, defaults and current custom text within the selected category; All categories searches the complete package.

The default and sparse override trees remain raw in the parent. The workspace retains only the current page’s row objects; it does not create an eager flattened row index or empty mirror of the default package. Counts are cached when the source changes. Without a search, scanning stops at the end of the visible page; a search scans the selected subtree to obtain the genuine match count. Only string leaves are translation records. The browser leaves other configuration values and unrelated overrides untouched; the parent retains its own import/export/save purification rules.

Editing writes a complete token path into the sparse override tree and emits `update:modelValue` plus `changed`. Dots in actual keys are never split, array positions are preserved, inherited properties are ignored, and own data-property writes prevent prototype mutation. Empty custom values fall back to defaults. Required placeholders must remain present before Apply; the existing positional Auto fix is available when placeholder counts match.

Read-only users can open a full-text viewer. Apply/Auto fix recheck `readOnly` and `disabled`, and revocation or package replacement closes and discards a local draft. The parent owns all authenticated fetch/save/import/export operations.

## Layout and verification

The toolbar uses the shared flat list treatment with a virtualized native category autocomplete, followed by 14px body text, 13px support text, shared captions, neutral surfaces and native pagination. Values show two-line previews; the single editor exposes the complete values. Desktop scrolling stays inside the table. On mobile and short viewports, the dialog body scrolls with sticky search/category and pagination controls so the rows retain usable space. At 650px the rows reflow into labeled cells with a separate 44px action column. Logical spacing and the language metadata preserve RTL.

The parent saves only nonempty strings. Sparse array overrides are sent as numeric-key objects so JSON null gaps cannot erase untouched default entries during the storefront merge. An explicitly empty package is a valid save for clearing the last override; the endpoint still requires the package field and the existing token/Settings authorization.

From the repository root:

```powershell
node --test @selldone/components-vue/backoffice/language/override/workspace/BLanguageOverrideWorkspace.test.mjs
```

The test mounts the actual template and native Vuetify table, checks 100,000 strings with bounded DOM, and exercises category/search/page changes, sparse edits, placeholders, read-only scope, dotted/array/prototype-safe paths and replacement/empty states. No network, Laravel, database or production build is involved.
