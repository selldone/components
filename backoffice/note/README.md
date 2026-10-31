# Shared notes

`BNoteDialog` is the shared notes bottom sheet for products, categories, incentive resources and Admin partnership requests. The current integration has ten instances in nine callers; product callers also serve the vendor workspace. The refined presentation is the shared default and keeps its styles inside the component so Admin and vendor callers do not depend on Backoffice page styles.

The caller supplies `title`, optional `icon`, `target`, `addUrl()` and `deleteUrl(index)`, and controls visibility through `modelValue` / `update:modelValue`. The `pre-messages` slot remains before the history; Admin uses it for the request, contact details and administrator-only visibility notice. Admin copy stays English; Backoffice retains English/Persian and RTL support.

History uses `target.note` in its original order, retaining author avatars, names, relative/absolute dates and plain-text bodies. Delete sends the original array index immediately. Both operations adopt the full `data.note` array returned by the existing endpoint; they do not sort or reconstruct saved notes locally.

Add posts `{ body }`, clears the draft only after success and leaves the sheet open. Application and network errors use the existing notification service and retain the draft. The 1024 counter is advisory: the UI only disables Add for an empty value, while existing server validation and authorization decide acceptance. No new permission mode, endpoint or read request is introduced; callers retain their existing access checks and protected errors.

The native Vuetify bottom sheet owns scrolling, focus, Escape and backdrop dismissal. Closing emits visibility only; it does not reset the component's draft or cancel requests. Reopening the same mounted instance retains unsaved input. Add and delete have independent loading states, while one pending delete disables all delete controls.

The sheet is at most 600px wide and keeps 32px of viewport breathing room. Its top corners have a 16px radius; its bottom corners stay square where the sheet meets the viewport edge. Its medium-weight title uses 18px/25px type, note bodies 14px/22px, and metadata/actions 13px/20px. Content padding is 22px on desktop and 16px on mobile. Labeled actions are at least 42px high on desktop and 44px on touch; delete/close buttons use 32px/34px desktop squares, 44px touch targets and 18px icons.

Run the isolated contract checks from the repository root:

```sh
node --test @selldone/components-vue/backoffice/note/dialog/BNoteDialog.test.mjs
```

These checks compile the actual SFC and exercise deferred local request/notification fakes. They make no network calls; native responsive, RTL, theme and overlay behavior is verified separately in the existing development browser.
