# Category editor

The approved Refined layout is shared by category creation and editing in shop
and vendor contexts. It uses the opt-in Backoffice modern primitives and keeps
the existing uploader, translation buttons, category selector and advanced editors.

The header and content share an 800px maximum width. Settings use a 1.45:1 grid
with a 16px gap: category details span the two image/parent rows. Below 660px the
cards stack naturally. Cards have 22px insets (20px on narrow screens), 16px
corners, 15px/22px section titles, and 12px/19px supporting copy. The page title
uses 21px/28px type; form actions use 13px/20px labels and native modern 42px
desktop/44px touch controls. The application's selected font is retained.

Creation submits the native selected file with FormData. Editing retains immediate
image uploads, parent selection/clearing, star, slug, translations, custom pages
and page augment data. Routine drafts stay mounted while navigating sections.
Settings saves only the category's routine fields, emits the result before Back,
and keeps input after a failed request. It cannot commit an unsaved Template draft.

Template uses the existing shop/vendor category-update endpoint with only `page_id`
and `augment`. Clearing the custom page sends both values as explicit `null`.
Its separate Save/loading state leaves the editor open, applies the saved template
to the existing category object and emits the saved result without resetting
routine drafts. Errors retain both drafts; stale results for another category or
shop are ignored.
Page augment reads are scoped to the selected page, category and shop. Switching
pages or clearing the selection prevents late reads from replacing current input.
An active augment-read failure blocks Template Save until Retry succeeds or the
custom page is cleared.

Filters and Engine reuse their shared embedded editors and propagate saved results.
Their independent saves keep the category editor open; Engine omits its standalone
Cancel action here. A missing Engine projection is read on entering that section
through the existing bounded category-field endpoint, before mounting the editor.
An explicit saved `null` means an empty engine and does not trigger a read. Failed
reads offer Retry, and responses from an old category or shop cannot populate the
current editor.

Deletion remains separate: open Critical zone, expand the card, Verify, then use
the existing final confirmation. Leaving the tab, collapsing the card or changing
the category resets verification. The final callback checks the current category
and intent again before requesting deletion; server authorization is unchanged.

Run the isolated behavior checks from the workspace root:

```sh
node --test @selldone/components-vue/backoffice/category/add/BCategoryAdd.test.mjs
```

The checks use the Vue renderer with mocked requests and never change shop data.
They cover separate persistence scopes, template clearing/error/stale responses,
engine loading, creation/editing in shop and vendor contexts, upload events,
keyboard verification, stale deletion confirmation, and Persian mixed-direction
content. Browser inspection remains necessary for responsive geometry and themes.
