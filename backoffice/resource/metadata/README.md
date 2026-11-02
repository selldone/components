# Resource metadata

`BResourceMetadata` is the shared merchant-dashboard metadata workspace. Products adopt it first; use the same component when adding Metadata to categories, coupons, discount codes and other shop resources.

Pass the currently authorized `shop`, loaded `resource`, the existing API collection segment as `resource-type`, current `read-only` permission, and `active`/`parent-busy` state. Mount only after the authorized resource is ready, and key the host boundary by shop/resource when appropriate. The component exposes `busy` and emits `saved` with `{ field, value }`; the host applies that exact field to its resource without resetting other form drafts.

Public and Private use the existing authenticated resource-attribute GET/PUT routes. AI Agent records are agent-maintained and read-only in this merchant UI. Selldone `meta` is read-only and comes only from the authorized resource projection; never add a system-metadata write endpoint. Public data may reach customers; Private and AI Agent data must remain outside storefront serialization.

Reads distinguish unavailable fields from successfully empty/null values. Drafts remain local, survive section navigation and failed saves, and clear on scope/permission changes. Each save sends only the selected field and checks for changes with a fresh read before the existing full-column PUT. This catches earlier concurrent edits, but the API has no atomic version precondition: simultaneous writes can still race. JSON accepts objects, arrays or null with a 64 KB editor limit. Store file references, never file bytes.

The shared localized help and inert illustration are resource-neutral. Reuse them rather than introducing resource-specific metadata editors. Verify with `node @selldone/components-vue/backoffice/resource/metadata/BResourceMetadata.test.mjs` and the product-editor tests. No production build or live write is required.
