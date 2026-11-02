# App Store Catalog

Implements the approved Catalog design inside the existing Advanced Options
fullscreen sheet. The Store owns one canonical App Store heading, More menu and
Close action. Its parent passes `active`, handles `close` and uses the native
activator for focus return. Vuetify owns scrolling, Escape and transitions;
internal dialogs return focus to the selected card or More after leaving, only
while the catalog remains active.

The catalog cards show only the actual list projection: icon, name, code and
TEST/ENTERPRISE mode. PUBLIC apps have no mode badge. Card selection still loads
`GET_SHOP_APP_INFO` and opens the existing `BAppConfigDialog`; installation,
permissions, configuration, reviews and confirmed uninstall retain their original
owners and access checks. Installed-app cards are unchanged.

Category filtering, route-query initialization and server pagination retain the
existing request fields. Native `VDataIterator` uses `items-length` for manual
pagination. The grid has three columns, two at 640px and below, and one at 360px
and below; each page holds six rows (18/12/6 apps). Use the shared list loader,
empty state and pagination styles. Failed reads show retry guidance rather than
a successful-empty result; same-category refreshes retain their loaded cards.

Request counters discard older list/detail responses after selection, shop
changes or unmount. `active=false` closes child dialogs and invalidates their
pending responses without discarding the catalog category. This prevents a late
detail response from reopening a nested sheet after the catalog was dismissed.

Enterprise credentials use a password field and are sent only by the existing
access-assignment endpoint. Blank and concurrent submissions are blocked locally;
the server remains the authorization boundary. Failure retains the draft for
correction, while cancel, close, successful assignment, shop changes and unmount
clear it. Assignment makes an app available in the catalog; installation remains
a separate action in its details. Successful assignment reloads the unfiltered
first page and server count, because the assignment response has no category or
catalog total. No credential is persisted locally or logged.

Feature styling is scoped to the Store and its catalog card. Shared modern
tokens own neutral colors, controls, tooltips and pagination. Canonical app and
mode assets are preserved. Copy lives in `app_store_catalog` in the English and
Persian dashboard translations.

Changes: `BAppShopStore.vue`, `icon/BAppShopStoreIcon.vue`, the Advanced Apps
sheet wrapper, the two dashboard locale files, this README and the focused Store
test. The existing `backoffice/empty-state.shared-lists.test.mjs` fixture uses the
Store's actual active state while retaining other owners' filter states.
Existing tracked files remain unstaged; only newly created files are staged.
Verification uses actual Vue/Vuetify components with synthetic API boundaries;
no live installation, credential assignment or production build is required.
