# App details

`BAppDetail.vue` presents real app metadata, installation, configuration and reviews in the approved Mosaic layout. It is shared by the dashboard's native `BAppConfigDialog` and the public app page. Scoped feature tokens reproduce the mockup's exact light/dark palette, typography, spacing, Lucide icons and button geometry without changing the application theme or requiring Backoffice styles.

`gallery/BAppDetailGallery.vue` shows up to four compact screenshot tiles. A native fullscreen Vuetify dialog provides every actual screenshot, previous/next controls, RTL-aware arrow keys and native activator focus restoration. Apps without screenshots reserve no gallery space.

## Behavior and access

- Existing POST configuration/install, DELETE uninstall and PUT review endpoints and event payloads are preserved. A native local danger-confirmation dialog matches the mockup and remains mandatory for uninstall, including the captured shop/app and current edit-access checks.
- The existing `app.edit_access` gate controls installation, saving, uninstalling and private settings. Reviews retain their independent shop read permission. Laravel remains responsible for current shop authorization; the public view cannot issue protected writes without a shop.
- Public/private schema fields, the native status checkbox and production variables retain their actual values. Private fields are masked. Draft maps are copied locally and reset when the app/shop changes or installation is removed. Failed requests keep the draft for retry. The native rating selector retains the existing numeric rate (including a stored fractional score) and nullable message payload; new message input follows the mockup's 640-character limit.
- Scope changes invalidate pending responses and old uninstall confirmations. Losing edit access clears private drafts and invalidates pending configuration writes.
- The public `AppStore_App.vue` caller renders details only after the selected shop/app scope has loaded. Old responses are discarded, with loading, error and retry states; same-scope refreshes retain loaded content.
- Actual permissions, company data, all original external links, dates, installs, aggregate ratings and public paginated comments remain available. Written comment totals remain accessible and drive pagination independently of aggregate rating counts. Mockup example app names, analytics copy, permissions and screenshots are never substituted for real app content.
- Native review pagination ignores superseded/unmounted responses. A failed page request retains the last successful rows and page so retrying never labels old comments as a new page.

## Focused checks

Run from the repository root:

```sh
node --test @selldone/components-vue/backoffice/app/detail/BAppDetail.test.mjs @selldone/components-vue/backoffice/app/detail/gallery/BAppDetailGallery.test.mjs
```

The tests compile the actual Vue templates and exercise synthetic request contracts, permission gates, draft/reset/error handling, the actual public caller's readiness boundary, scope races, pagination and the gallery. Native Vuetify rendering is also checked in an isolated local fixture; it does not install or modify a live shop app.

The exact-fidelity pass also compares the approved mockup and real source at equal 736px/320px widths. With the same inherited font, Open app / Save changes / Uninstall measure 111.19 / 132.23 / 65.64px, matching the reference. Form groups, paired colors, 42px/44px actions, 430px/284px dialogs with 15px corners, and the native sheet's 18px corners match. Native app fonts, authorized data, locale date formatting and available app metadata remain authoritative. Focused Detail/Gallery checks (14) and Store integration checks (7) pass. Read-only control semantics are tested; its separate visual permutation and the authenticated HMR session are not verified.

## Files changed for Mosaic

- `@selldone/components-vue/backoffice/app/detail/BAppDetail.vue`: detail layout, native review dialog, configuration drafts and current-context guards.
- `@selldone/components-vue/backoffice/app/config/dialog/BAppConfigDialog.vue`: lets the detail's approved 18px corners control the native sheet.
- `@selldone/components-vue/backoffice/app/detail/gallery/BAppDetailGallery.vue`: compact mosaic and native fullscreen viewer.
- `@selldone/components-vue/backoffice/app/comments/BAppComments.vue`: compact review presentation and native Vue 3 pagination event.
- `src/Applications/Selldone/pages/app-store/pages/AppStore_App.vue`: public caller loading/readiness, current-scope responses and retry.
- `@selldone/translate/dashboard/en.ts` and `fa.ts`: English/Persian detail, gallery and loading/error text.
- `@selldone/components-vue/backoffice/app/detail/BAppDetail.test.mjs` and `gallery/BAppDetailGallery.test.mjs`: focused regression checks.
- This `README.md`: feature behavior, validation and handoff.
