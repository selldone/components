# Product import processing

The approved **Refined** treatment is opt-in through `modern`. The catalog and
modern product dashboard use a full-width, neutral strip; legacy callers retain
their existing widget. The desktop strip is 64px high, with a leading 18px refresh
outline, a 14px/22px status and visible 13px/20px guidance. Queue links retain
13px/20px text and 16px outlines, with small directional chevrons. The local
Lucide/Feather SVG subset matches the mockup without a runtime dependency and
retains its ISC/MIT notices. On narrow screens the links wrap below the status,
the guidance remains visible, and native actions retain 44px touch targets.

The counts remain `shop.importing` and `shop["images-que"]`. Each nonzero count
keeps its own native shop/vendor queue route. No percentage, total or ETA is
inferred from these remaining counts.

The existing lifecycle is unchanged: fetch immediately, poll every 30 seconds
without overlapping requests, retain counts and notify on failure, and stop
polling when both queues are empty or the component unmounts. The catalog owns
collapse/expand through the default slot and its existing `v-if`; expanding
remounts the component and performs a fresh read.

The catalog's immediate `VExpandTransition` child has zero margin/padding,
border and minimum height, plus `display: flow-root`. This consistently contains
the card's bottom margin before and during Vuetify's temporary `overflow:hidden`
measurement, so the complete strip and gap animate together without a final
spacing jump. Queue-zero visibility and polling ownership are unchanged.

Run `node --test backoffice/product/importer/processing/BShopProductsImportProcessing.test.mjs`
from the components package. The tests mount the real SFC with deferred synthetic
SDK responses and fake timers; they do not import products or call live APIs.
