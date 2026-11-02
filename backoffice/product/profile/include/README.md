# Product package items

`BProductProfileInclude` assigns existing included items to a product. The
opt-in `modern` dialog follows the approved Refined package-items mockup;
legacy callers retain their fullscreen selector and automatic selection add.

Opening copies the assigned array into a local draft. Modern selection requires
the explicit Add action; removing an item changes only that draft. Cancel or
native dismissal leaves the product unchanged, and reopening restores its saved
assignment. The existing create-item form saves a reusable item independently;
its successful Add event also inserts the returned item into this draft.

Save posts only the draft item IDs through the existing shop or vendor URL
builder. A vendor ID alone does not select the vendor API: the matched route
must also carry the existing vendor metadata. The server response replaces the
product's assigned items and closes the dialog after success. Validation and
network failures retain the draft and release the busy state for retry. While
saving, modern draft controls and repeated Save are unavailable. Vendor-panel
management and creation restrictions remain in place.

The Refined dialog is capped at 760px on desktop and remains floating on narrow
screens. Legacy callers retain the native fullscreen mode. Real item images,
readable titles and copyable codes form a three-column grid, reflowing into two
columns at narrow widths.
The selected-items widget and separate Add existing item widget share the
modern neutral surfaces, theme-aware borders and existing blue Save action.
The native selector and create-item uploader/API remain unchanged.

Approved geometry: 20px dialog corners; header/body/widget/footer insets of
24px, 20px, 20px and 18px × 24px; 14px widget corners; 20px/28px medium header,
15px/23px medium section titles, 13px/20px item titles/body and 12px/19px codes
and footer copy. Buttons use 13px/20px medium labels and 42px desktop/44px touch
targets. Grid gaps are 22px × 16px with 100px images. At 520px and below, the
dialog corners are 15px, two columns use 20px × 12px gaps and 86px image areas;
header/body/widget insets become 20px × 16px, 12px and 16px.

Focused isolated checks:

```powershell
node --test @selldone/components-vue/backoffice/product/profile/include/BProductProfileInclude.test.mjs
```

All 17 isolated checks pass. The suite compiles the actual Vue template with production asset transforms and
its scoped styles, then mounts its real component logic and Core collection
helpers with synthetic data and deferred HTTP boundary responses. It covers
draft/open/cancel, explicit Add/remove, create events, shop/vendor save payloads,
success/failure/busy behavior, empty assignments and modern/legacy presentation.
It also mounts the existing selector itself to check localized label,
placeholder and disabled-attribute passthrough, and verifies EN/FA copy parity.
Nested help consumes the first Escape without closing the dialog or dropping
its draft. With no active help, Escape remains available to native dismissal;
stale tooltip leave events cannot clear a newer help target.
No live API request, upload, product save or production build runs in the suite.
The include, parent General-editor and adjacent tax suites pass 56 checks.
An isolated headless fixture also rendered the actual Vue/Vuetify dialog,
selector, scoped styles and shared modern stylesheet with synthetic data. It
verified the 760px desktop width, 20px/28px header, 15px/23px section titles,
13px/20px button labels, 42px desktop/44px mobile actions, and no horizontal
overflow at 1366px, 390px and 320px. English Light and Persian native Dark were
inspected, and native Escape dismissed help before the dialog.

The authenticated HMR page and its Smart invert boundary remain unverified:
the browser-control tool fails to launch with a host resource error. The
isolated fixture does not establish full-app font, shell or Smart invert fidelity.
