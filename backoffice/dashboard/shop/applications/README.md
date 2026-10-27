# Dashboard applications

`BDashboardShopApplications` retains its original presentation unless `modern` is enabled. The modern Workspace layout contains the three existing mobile benefits, store badges, an accessible native iOS/Android QR selector, a desktop download link and an account reminder. It inherits the application font and shared `sd-modern` surface tokens.

Mobile links still come from `SetupService.IosApp()` and `SetupService.AndroidApp()`, including deployment overrides. The existing `UQrcode` renders the selected link with a white background and dark modules. The desktop action opens `SetupService.MainServiceUrl() + '/desktop#downloads'`; release, architecture and package choices stay on that public page. Platform marks use the existing Font Awesome Apple, Windows and Linux brand icons.

The parent owns the dialog, keyboard focus and reopening. An 860px maximum width accommodates the approved Workspace layout. Explicit close retains `hide-applications-dashboard-release`, the original calendar marker calculation and the `close` event; escaping the parent dialog does not add dismissal behavior.

Copy lives under `selldone_applications.workspace`; existing mobile feature descriptions and legacy copy remain in place. On narrow screens, store actions appear before the QR and feature list. Controls retain keyboard focus indicators, top tooltips and 44px mobile targets.

Run the isolated source/compiler and rendered behavior checks from the workspace root:

```sh
node --test @selldone/components-vue/backoffice/dashboard/shop/applications/BDashboardShopApplications.test.mjs
```

The tests use local Vue control and QR stubs. They verify real component state, URLs, rendering and dismissal contracts without network requests; native dialog focus, final responsive layout and QR scanning require browser review.
