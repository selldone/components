# Shared export format selection

`SExportFormatSelect` renders the supplied PDF, CSV and Excel URLs. It builds no URLs, sends no requests and owns no download state. Existing callers keep the legacy list unless they pass `modern`.

The approved modern Compare treatment uses canonical file icons and a single native `_blank` link per supplied format with `rel="noopener noreferrer"`. Purpose overrides are optional; existing `type` and message props remain supported. Missing descriptions use localized format guidance. Each instance has unique purpose/description IDs, a localized download name and explicit new-tab meaning. Modern callers forward existing unavailability through `disabled`; unavailable links have no URL, leave the tab order and expose their disabled state. Inherited disabled classes remain in place for caller-owned presentation.

Modern panels use equal desktop columns for the actual one, two or three formats, preserving PDF/CSV/Excel order. The outer wrappers carry straight separators; only inner interaction surfaces are rounded. Desktop panels have a 238px minimum that grows with content. At 600px and below they become naturally sized rows with horizontal dividers. Actions use 13px regular labels, 36px desktop and at least 44px mobile/coarse-pointer height. Reuse `sd-modern-clickable-item`; do not duplicate its hover/elevation behavior.

The caller owns the surrounding widget/header, actual scope explanation, selected dates/filters, unavailable states and privacy guidance. Do not invent an extra format, scope filter, progress state or success notification. Generated/callback downloads retain their own request, validation and error flow.

Current dashboard consumers:

- Product exporter: modern and legacy shop/vendor contexts; the modern page supplies the approved format purposes and descriptions.
- Category exporter: CSV/Excel with the existing shop/vendor builders; the category shell/window opt into the modern canvas.
- CRM customers: one Excel option in the export dialog. The whole customer list is exported; search and segment filters do not scope that endpoint.
- Inventory: CSV/Excel native links with the existing shop/vendor builders, extensions and identifier/reimport guidance.
- Gift cards: separate card-list and report groups, each CSV/Excel.
- Affiliate orders: PDF/CSV/Excel with the existing independent date parameters.
- Bulk order processing: PDF/CSV/Excel tasks and a separate PDF-only shipping-label export; delivery states, A4/A5 and item-detail options stay caller-owned.
- Product subscribers: Excel/PDF with the existing required dates and maximum-range guidance.

Validation uses isolated Vue rendering with synthetic URL builders, SFC/TypeScript/SCSS compilation and browser layout checks. Never request a real export endpoint just to verify presentation. See the repository's Selldone Product UI Design guide for theme, RTL, accessibility and privacy rules.
