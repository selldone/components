# Product 3D / AR

The shop Product Edit workspace hosts 3D / AR after Urgency messages at `edit#ar`.
The leading icon reuses the canonical `assets/icons/3d.svg`; the presence marker
checks actual GLB/legacy GLTF or USDZ references on the main product and variants.
The old named shop `/3d` route redirects here with its product/shop parameters and
query intact. Creation and the unsupported Vendor AR navigation stay unchanged.

## Files and save boundaries

`BProductArTable` owns the main model and the variant list. Modern rows expose
each format's native uploader directly, with saved filename/size, replacement,
download, confirmed removal and the existing GLB viewer. The variant disclosure
keeps those actions in the current product context. The compact list can reveal
every variant; collapsing it must not unmount a busy row.

New uploads remain GLB for web/Android and USDZ for iOS, up to 20 MB per file.
Existing GLTF files remain readable. The existing native uploader and server own
validation and persistence; no file bytes are written through the product form.
Upload, replacement and removal save immediately, independently of product Save
or Ctrl+S. Concurrent formats on one model stay locked because each response
replaces that model's whole AR object. Active requests block Edit-section navigation.

Keep the existing paid-license and source-product ownership checks. Imported
products expose their readable files without upload/removal controls. A variant
inherits the complete main AR object only when its own AR object is absent; a
missing format in an existing variant object never inherits separately. USDZ
alone can be downloaded but cannot open the current browser GLB preview.

## Preview dialog

The modern preview has one header and a viewport-filling model stage: at most
1180px wide on desktop, fullscreen on tablets and phones, with safe-area spacing
and a 44px mobile close target. The iframe mounts only while the preview is open
and access is enabled, releasing its WebGL viewer when closed. Legacy callers
retain their original fullscreen shell.

Only the modern editor appends `preview=modern` and bounded `lang=en|fa` to the
existing model-view URL. The iframe's modern branch provides native camera
controls, reset, rotation, loading/error recovery and supported-device AR access.
Its touch toolbar stays within safe areas and respects reduced-motion preferences.
Default storefront and official-demo iframe presentation is unchanged. The flag
selects presentation only; existing model lookup and storage delivery still own
access and URLs. No file, product or shop preference is changed by previewing.

## Approved presentation and verification

The approved inline-file design uses a 23px page title, 15px/23px widget headings,
21px widget insets, 16px widget corners, compact file rows and logical RTL spacing.
The main files and 220px preview sit beside each other on wide screens and stack
when space is limited. The compact preview button stays within its pane and keeps
the native touch target. Keep the application's font, modern theme tokens and native
32px desktop / 44px touch icon targets.

Run the existing `table/BProductArTable.test.mjs` and
`../add/full/BProductAddFull.test.mjs` with `node --test` for isolated file,
ownership, inheritance, save/navigation and upload-lifecycle checks. Shop product
route tests cover the legacy redirect. Browser review uses the existing local
HMR application without uploading or deleting shop files.
