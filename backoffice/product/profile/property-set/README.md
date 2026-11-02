# Product property-set profile

The General information profile row opens `BProductProfilePropertySet.vue`. Its modern dialog previews a selected set while keeping the product's current assignment unchanged until Confirm. The enclosing General information form performs the actual save; this is separate from Inventory's immediate-save `BPropertySetProductDialog`.

Cancel, Escape and backdrop dismissal discard the pending selection. Clearing and confirming writes explicit `null` to `property_set_id`, so the enclosing form can persist the return to shop defaults instead of omitting an `undefined` field. Assignment does not change existing variant values, prices or stock.

The native searchable `BPropertySetInput` retains shop-scoped reads, validation, stale-response protection and error notifications. Its additive `load-state` event lets this dialog show pending/error feedback, retry the same selector and block confirmation while the selection is unresolved. Vendors can select permitted sets but cannot create them. Creating a set retains the existing management route in a new tab.

`BProductPropertySetPreview` supplies the six real option codes in configured order followed by shop defaults. Its optional `option` slot adds suggested values and a Custom marker here without changing other callers. Suggested values show the first three plus a remaining count, using the existing color and variant-asset renderers. All values remain available in Property Set management.

The approved layout uses an 820px desktop maximum, 20px dialog corners, a 20px/500/28px title, 24px header insets and 20px content/widget insets. Options use two columns above 620px and one below. At the native `xs` breakpoint the dialog is fullscreen, with 16px content insets and shared touch controls. Styles are component-scoped and reuse modern theme tokens; English and Persian copy lives under `product_property_set.profile_refined`.

Focused tests cover compiled templates/styles, real enum and string helpers, draft/apply/cancel, serialized null removal, native loading/retry guards, vendor access, six-option previews, suggested values and unchanged variant records. No live shop save or set creation is needed for verification.
