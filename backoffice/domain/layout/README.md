# Shop and domain layouts

`BShopLayoutEditor` owns the staged layout selection in **Domains & Home → Default layout** and in each domain's existing **Storefront** section. The former Advanced entry links to the default tab and preserves existing saved values. A picker selection changes only the local draft; an explicit Save applies it. Preview opens the authenticated server preview with the staged selection in the query and performs no write.

The default supports standard, official and private layouts. A domain supports those modes plus inheritance from the shop default. Custom domains and hosted `local`/`sub` addresses use the same editor. Existing domain rows, metadata, status indicators, details and actions remain intact; `BDomainLayoutMark` adds a compact link to the existing Storefront route. `DomainsHelper` forwards server summaries without inferring assignments from names or missing fields.

The assignment link's existing tooltip also shows the effective custom layout's
real `layout_summary.image_url` when available, including inherited assignments.
The contained thumbnail is limited to 150px high within the shared mobile-safe
tooltip width. Missing images and the standard layout retain the text-only
tooltip. The list link also replaces its leading layers icon with a fixed 16px
avatar when a custom image is available. It has no hover scaling or image
transition; missing/broken images retain the layers icon and native link.
No additional catalog request or assignment change is performed.

## Server contract

- Default: `GET /shops/{shop}/layout/options`, `POST /shops/{shop}/layout`.
- Domain: `GET /shops/{shop}/domains/{numeric-id|local|sub}/layout/options`, `POST /shops/{shop}/domains/{numeric-id|local|sub}/layout`.
- Options and successful writes return `selection`, `layout_summary`, `official_layouts`, `private_layouts`, `can_write` and `preview_url`. Default responses also return `domain_summaries` for authoritative refresh of inherited indicators.
- Writes send `mode` plus `official_layout_id` for official layouts, or `layout_id` and nullable `layout_version` for private layouts. Other modes send no stale target IDs. Official releases are pinned by the server. The server enforces current authorization and target availability.
- Missing or unavailable current assignments remain visible and are never automatically cleared. Search requests preserve the draft. Resource changes invalidate pending reads and Save responses. Read-only and pending-save states block local mutation and duplicate writes.
- The picker browses in bounded pages of 20, appending distinct choices with Load more. The selected draft record and its private release choices remain available when a search hides that record; search matching is owned by the server.

`BOfficialLayoutShowcase` adds up to three authorized official choices to the existing Setup customization flow. Try now opens staged preview; Explore uses the server/public `/custom-layouts` route. Existing templates, Builder, theme, AI and developer paths remain available.

## Official source and customization help

Official option cards display the catalog entry's real public cover in `image`.
The optional `github_url` is a bounded canonical HTTPS GitHub repository URL;
missing or invalid repository metadata does not create a source/help action.
The image helper passes these absolute public URLs through unchanged.

GitHub and How to Customize are separate actions beside the card's selection
control. They never choose, apply or save a layout. How to Customize opens a
native fullscreen read-only guide with localized steps and a source-aware AI
prompt; Copy prompt writes only that plain text to the clipboard.

The guide follows the selected repository's actual README/scripts, a new unique
private package, local preview/build and authenticated developer CLI upload.
Use the same eligible Selldone account for developer upload and Shop MCP. After
the private version is ready, the developer workspace provides Live test; Shop
MCP can discover eligible choices and assign an exact version to the shop default
or a domain. It does not build or upload developer bundles. No repository is
fetched and no credentials or shop data are inserted by this help UI.

## Presentation and verification

The approved design uses the existing `sd-modern-*` shell, 22px widget padding, a 220×160 current-layout thumbnail, and a native fullscreen picker. Its header and footer stay in place while the list scrolls within a centered 1040px content width, so loading and tab changes do not move the dialog. The three-column option grid stacks on small screens. Both Explore all official layouts (`/custom-layouts`) and Manage my layouts (`DeveloperLayoutsListPage`) remain available in either source tab and open in new tabs without changing the draft. The native dialog activator returns focus to Change layout after closing. Styling inherits project fonts, theme tokens and logical spacing; all feature copy is provided in English and Persian.

The picker source tabs show distinct Material icons and the API's official/private
totals in compact red rounded-square badges (a requested treatment local to this
picker); unknown totals remain a neutral em dash and an observed zero remains zero.
Tab-shadow space belongs inside Vuetify's actual slide-group clipping surface,
with native horizontal scrolling retained where needed. The search control and
tabs align as one desktop toolbar; narrow layouts retain both source labels/counts.

An initial pending list without choices reuses the shared `BListLoadingState`
Pipeline SVG. Same-scope refresh keeps choices visible with one small progress
indicator. Successful empty/search-no-results uses the shared `BListEmptyState`
SVG and localized next-step guidance; an error is never reported as an empty list.

The Change layout control is one native button: its icon/action and bounded
selected name are separated by a full-height logical divider. Private release
selection sits at logical end in the same responsive action row. Its single-line
flat solo field has a package icon, matching 9px corners and 42px desktop/44px
touch height, plus a localized accessible name and native version menu. The picker footer's
Reset to Selldone standard action closes the picker and clears the custom target
and version in the local draft; the outer Save remains the only write. Domain
inheritance remains a separate choice.

When no real cover is supplied, `BShopLayoutIllustration` depicts the standard
storefront in neutral tones or a teal/blue custom storefront over it, including
inherited custom layouts. Its inert SVG finishes within 2.8 seconds, mirrors in
RTL and has a complete static reduced-motion composition. The image's localized
accessible summary stays outside the hidden artwork; real covers take precedence.

Run the focused real-Vue source suite with:

```powershell
node --test '@selldone/components-vue/backoffice/domain/layout/BShopLayoutEditor.test.mjs'
```

It compiles the actual scripts, templates (including production absolute-asset transformation) and scoped Sass; mounts actual feature components; and checks staged/explicit saves, all domain modes, unavailable assignments, request races, permissions, summaries, preview URLs, default-tab routing/leave guards, Setup and translation parity. Native Vuetify/router and HTTP services are fixture boundaries; the real Core image helper and domain normalizer are used. Keep the existing domain workspace, domain navigation and Setup customization suites passing as regression checks. This suite does not replace visual review of the user's HMR session in light/dark, LTR/RTL and compact/touch variants.

Task verification also rendered the actual components with Vue, Vuetify, scoped Sass, shared modern/Admin styles and synthetic transport data in an isolated headless browser. The 1280px desktop and 390px touch cases covered English/Persian editor, picker and public catalog/detail plus the Admin Details editor. They had no page overflow or runtime exceptions. Text used the existing Inter/Persian font assets; touch buttons, source tabs and compact layout links had 44px hit targets. This isolated check does not exercise an authenticated application session or its complete shell.

The fullscreen follow-up checked 32 picker states at 1462px desktop and 390px touch widths across English/Persian and light/dark themes: official, private, empty and pending lists kept identical header/footer geometry, a single scrolling body, both navigation destinations and close-focus return. Eight additional states retained nested customization help, source-tooltip Escape and focus return without changing the selection or issuing writes. No runtime exceptions or horizontal overflow were observed.
