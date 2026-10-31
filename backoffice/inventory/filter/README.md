# Product type and status filter

`BInventoryFilter` keeps the native Vuetify multi-select and its controlled model,
chip removal, clear action, form state, keyboard navigation and menu lifecycle.
Every change emits `update:modelValue` immediately, then `change` after the next
Vue render tick. Closing the menu never restores an earlier selection.

The opt-in `modern` presentation uses the approved Split menu: a 548px popover,
two columns containing all five product types and all five statuses, 13px labels,
42px rows and 44px touch targets. On extra-small screens the same native menu is
docked to the viewport bottom with 16px top corners and square bottom corners.
Clear all updates the selection; Done and Close only dismiss the menu.
One selected filter retains its native removable chip, with a primary/on-primary
theme pair, 4px native label corners, 26px height and 12px medium text. Its existing
`no-inv` hook preserves the primary color and nested product image under Smart
invert; true Vuetify dark mode inherits the current theme. Multiple selected filters
show one localized active-filter count instead of chips, keeping narrow toolbars
compact without horizontal scrolling. Each checked menu choice still removes
only that filter immediately; Clear all empties the selection.

The modern `prepend-item` slot renders all native transformed items through
`VSelect.filteredItems` and delegates toggles to `VSelect.select(item, null)`.
Its ordinary virtualized item slot stays empty because linear virtual scrolling
cannot measure a two-column list correctly. Native list selection and focus stay
in charge. Direct and inherited form disabled/readonly states also guard the
custom row and Clear all actions. Legacy callers retain their original menu.

Validation: `node --test backoffice/inventory/filter/BInventoryFilter.test.mjs`
from the components package, plus local browser checks for desktop/mobile, RTL,
clipped-height scrolling, dismissal and all ten choices.
