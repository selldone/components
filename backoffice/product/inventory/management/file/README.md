# Product file inventory

`BProductInventoryManagementFile` keeps the protected shop/vendor endpoints and
subscription-content ownership. The approved Refined
layout is opt-in through `modern`; the Backoffice product Inventory route enables
it for FILE products. Full/Studio editors, vendor inventory and membership content
retain their existing presentation.

The Refined view shows upload and shop-wide storage in adjacent widgets, then a
full-width file list. Each row retains the canonical file icon, name, creation and
last-download dates, download count, size, paid/sample access and native download
and confirmed deletion. Rename keeps the original extension. Drag ordering and
the keyboard-accessible Move up/down menu persist the same ordered file IDs.
Legacy contexts retain FilePond and the original staff-only transport options.
The modern view uses `BProductFileUploader` and its feature-local
`ProductFileUploadQueue`: native multiple selection/drop, two concurrent transfers,
compact progress rows, observed byte speed/volume/ETA, inline errors, real abort,
retry and expandable per-file attempt charts. All active and actionable records
remain visible; confirmed uploads have compact pagination with three per page,
starting with the latest uploads. Clearing
completed uploads removes client history only. File objects and signed descriptors
stay private in memory and are released on completion, dismissal or scope disposal.
Each of the last five attempts retains at most 120 weighted samples spanning the
whole attempt, with no full-file reads, image decoding or binary persistence.

Column and mobile sorting by filename, access, downloads or size changes only the
local view; Manual order restores saved ordering and enables drag/keyboard reordering.

The existing authorization response controls method, URL, headers, form fields,
raw-File versus form upload and credentials. Signed direct PUTs retain their exact
headers; form fields precede the File. Cookie-authenticated same-origin uploads
also retain the application CSRF header, which is never forwarded to remote signed
storage. Descriptor creation has a 60-second network timeout; large binary requests
have no artificial time limit. HTTP success is followed by a fresh authorized list
read; only a confirmed stored file turns green. Confirmation retry never resends
bytes. Upload IDs/progress still feed the existing global keeper and mutation locks.

Every failed row has a labeled Retry action. Before retrying an accepted File, a
fresh protected list read checks its existing reservation: completed files need
confirmation only, a valid pending descriptor can resend bytes, and a missing
reservation can be authorized again. Expired or unsupported pending reservations
offer Remove incomplete file through the native deletion confirmation. A second
fresh read after confirmation protects files completed in the meantime; successful
removal retries the retained original File. Validation failures instead reopen the
picker for reselection. The current backend has no chunk/resume/renewal contract,
so transfer retry starts from zero. The 120-minute signing contract is retried
conservatively for 110 minutes. These checks prevent duplicate reservations.
Cancelling during authorization prevents any transfer but allows the metadata
response to settle so its reservation can be retried or removed. Scope disposal
aborts requests and ignores late callbacks. Active records cannot be deleted; a
deleted inactive reservation cannot be retried through a stale descriptor.
Deletion locks uploader actions until its response settles; only a successful
same-scope response can release the lock and continue the requested retry.

Storage usage is shop-wide. The license supplies upload/capacity limits; the
existing product limit is 20 files and free samples may not exceed 50 MB.
Subscription content continues to use `content.files` and `content_id`, without
paid/sample controls or guest-checkout guidance. No storage/API contract changes
are introduced by this presentation.

The storage widget also shows this product's completed file bytes, grouped by
case-insensitive filename extension. Files without an extension remain in Unknown
format. Up to six format groups keep their own identity regardless of size;
larger mixtures show the five largest and Other formats through the existing
leader-line donut. All displayed portions have callouts. The 140px chart has no
visible repeated heading or filename legend, but retains an accessible scope
caption and exact totals. Hover, keyboard focus and tap reveal at most five file
names/sizes per portion plus the remaining count, inside the shared bounded
tooltip. These totals use the same `size * 1000` byte convention as the file rows;
they do not use the shop-wide capacity as their denominator. Invalid, zero-sized
and uploading entries are excluded without changing the source file list.

Reference geometry: 1040px shared content width, 24px widget insets, 20px widget
corners, 23/32px page title, 15/24px section titles, 13/22px file names, 11/18px
date text, 56px minimum desktop rows, and 8px between operational actions. At
950px the list uses labeled rows; at 700px upload/storage stack; at 440px and on
coarse pointers the file details and 44px actions share wrapping rows beneath the
identity instead of occupying a separate row each. Desktop dates stay on one
ellipsized line with exact timestamp titles; mobile dates can wrap for readability.
Logical placement supports RTL; the application owns the font and appearance conversion.
Uploader actions remain inline in cards up to 600px wide, with an accessible icon
Retry replacing its wider text button. Expanded attempt histories use a full-width
64px vector plot and separate, unscaled HTML axis labels.
Adjacent desktop widgets stretch to equal height; an empty queue fills the upload
widget with a compact illustration and guidance. Completed-page changes reserve
three row slots and queue height changes animate from their current rendered size.
Reduced-motion preferences disable the illustration and queue transitions.

Verification: `node --test @selldone/components-vue/backoffice/product/inventory/management/file/BProductInventoryManagementFile.test.mjs`
and `node --test @selldone/components-vue/backoffice/product/inventory/management/file/BProductFileStorageChart.test.mjs`,
plus `node --test @selldone/components-vue/backoffice/product/inventory/management/file/ProductFileUploadQueue.test.mjs`,
`node --test @selldone/components-vue/backoffice/product/inventory/management/file/BProductFileUploader.test.mjs`
and `node --test src/Applications/Backoffice/pages/product/inventory/BPageProductInventory.test.mjs`.
These use isolated requests and real Vue/SFC/style compilation, without uploading
or deleting application files. GB tests pass native File bodies without allocating
GB buffers. Real multi-GB cloud transfer must be checked by a human in a named test
environment; localhost's upload handler separately enforces 25 MiB. No backend
changes or live storage writes are part of this implementation.
