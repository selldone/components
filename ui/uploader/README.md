# Image upload presentations

`SImageUploader` keeps FilePond as its transport, validation and processing owner.
Existing callers keep their existing presentation. Opt into `compact-queue` for
a small drop area and one keyed row per file, with a local preview, native upload
progress, completion/error state, retry and dismissal. The modern main-product
and variant galleries enable this presentation; generic galleries and existing
thumbnail uploaders remain on their native modes.

The same `server`, `param-name`, headers, extra parameters, accepted types,
size/count limits, resize/transform options and immediate/deferred behavior apply.
Choose and drop go through FilePond's own input/API. Retry uses the same native
file ID and current processing state. Only a valid response containing uploaded
file metadata emits the existing immediate `response`, `new-path` and `new-url`
events. Deferred callers still consume `processPendingFile()` themselves.

Dismissal removes a local queue entry with `revert: false`; it never deletes a
saved gallery image. Local preview URLs are released on removal and unmount.
Unknown progress stays indeterminate. Native validation errors remain visible
and do not offer processing retry.

Run the focused checks from the repository root:

```sh
node @selldone/components-vue/ui/uploader/SImageUploader.test.mjs
node --test @selldone/components-vue/backoffice/product/edit/images/BProductEditImages.test.mjs
```
