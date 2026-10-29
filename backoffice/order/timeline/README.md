# Order timeline · Grouped

The modern Backoffice timeline uses the approved Grouped layout: a bounded
content column, category filters, separate pinned notes, local-date sections and
expandable notification groups. `BOrderTimeline` remains the owner of the native
fetch, note, pin, delete, email-preview and resend operations. Its `modern` opt-in
is always disabled in vendor routes; legacy callers retain their original view.

## Data and behavior

- `timelinePresentation.ts` groups only originally adjacent, compatible customer
  notifications from the same shop/local day within 60 seconds of the first
  event. It preserves the received order and original objects. Filtering happens
  after grouping, so hidden order/payment events cannot create a new group.
- The expandable group keeps every original event, exact timestamp, recipient
  detail, email preview and eligible resend action. Unknown email-update topics
  use a generic notification heading; no shipping state is inferred from prose.
- Pinned records retain their stable native order above the date sections.
  Only native note records can be edited, pinned or deleted. Mention/emoji
  inputs, formatting, author display, confirmation dialogs and server checks
  remain in place. Notes have no invented reply or revision-history feature.
- Payments keep the recorded amount, currency and message. A payment record
  does not universally mean capture or settlement. Only an exact historical
  reference matching the already loaded order receives its readable order code;
  the original reference stays available and unresolved references remain text.
- Saved old/new addresses and map actions, custom event images, delivery users
  and services, Connect identities, vendor events and unknown event types remain
  visible. Smart transportation/reaction/brand/medium/club replacements continue
  through the existing formatter.
- Email preview renders the current order/template, rather than an archived
  sent email. Resend keeps the existing confirmation, eligibility, one-resend
  limit and recorded resend time. A notification log is not evidence that a
  message was delivered or read.
- The native main-order endpoint returns up to 100 recent records, without a
  total or cursor. The footer reports loaded records only. Loading, failed reads
  and empty categories remain distinct, with a read-only Retry for failures.

`orderType` is presentation-only. Existing type flags and their API paths are
unchanged, including legacy File/Service/Subscription flag conventions.

## Approved geometry

The content column is capped at 960px, with 48px combined desktop canvas inset
and 26px on narrow screens. Page headings use 22px/29px medium text, event
headings 13px/20px, descriptions 12px/20px and metadata 11px/17px. Add note uses
the standard 42px modern action; filters are 32px on desktop. Direct controls
retain at least 44px narrow/touch targets. Inactive filters stay transparent;
the selected filter uses the shared raised theme surface.

The first notification bundle opens initially; the remaining bundles start
collapsed. Every group has a native keyboard-operable button with expanded and
controlled-content semantics. The shared mention input's optional modern mode
keeps the real picker and suggestion handlers, with a named 32px/44px emoji
button and 13px/21px desktop or 16px/24px narrow editor. Its contenteditable
exposes a named multiline textbox.

## Local checks

Run from the application repository:

```text
node @selldone/components-vue/backoffice/order/timeline/timelinePresentation.test.mjs
node @selldone/components-vue/backoffice/order/timeline/BOrderTimeline.test.mjs
node src/Applications/Backoffice/pages/order-physical/timeline/BPageOrderTimeline.test.mjs
node src/Applications/Backoffice/pages/order-physical/BPageOrderPhysicalDashboard.test.mjs
```

The tests use isolated data and mocked transports. Browser review uses the
existing HMR application at `http://localhost:9000`; it must not submit notes,
pin/delete real records, resend notifications or update order state. No server,
cache rebuild or production build is required.

## Change manifest

- This folder: `BOrderTimeline.vue`, `BOrderTimelineGrouped.vue`,
  `BOrderTimelineEvent.vue`, `timelinePresentation.ts`,
  `timelinePresentation.test.mjs`, `BOrderTimeline.test.mjs`, and this README.
- `@selldone/translate/dashboard/en.ts` and `fa.ts`: localized
  `order_timeline.modern` copy.
- `@selldone/components-vue/ui/text/mention-input/UTextMentionInput.vue`:
  optional modern input/emoji presentation; native mention and emoji operations
  unchanged.
- `@selldone/components-vue/ui/text/html-input/UTextHtmlInput.vue`: accessible
  textbox/multiline/name attributes on the existing contenteditable.
- `@selldone/translate/global/en.ts` and `fa.ts`: generic
  `global.actions.add_emoji` label.
- `src/Applications/Backoffice/pages/order-physical/README.md`: feature link.
- `src/Applications/Backoffice/pages/order-physical/timeline/BPageOrderTimeline.test.mjs`:
  main/vendor rendering, exact route gates and unchanged native API flags.
- Parent/window and timeline wrapper pairs under
  `src/Applications/Backoffice/pages/`:

| Folder | Parent | Timeline wrapper |
| --- | --- | --- |
| `order-physical` | `BPageOrderPhysical.vue` | `timeline/BPageOrderPhysicalTimeline.vue` |
| `order-virtual` | `BPageOrderVirtual.vue` | `timeline/BPageOrderVirtualTimeline.vue` |
| `order-file` | `BPageOrderFile.vue` | `timeline/ShopProcessCenterFileOrderPage_Timeline.vue` |
| `order-service` | `BPageOrderService.vue` | `timeline/BPageOrderServiceTimeline.vue` |
| `order-subscription` | `BPageOrderSubscription.vue` | `timeline/BPageOrderSubscriptionTimeline.vue` |
| `order-pos` | `BPageOrderPos.vue` | `timeline/BPageOrderPosTimeline.vue` |
| `order-fulfillment` | `BPageOrderFulfillment.vue` | `timeline/BPageOrderFulfillmentTimeline.vue` |
| `order-avocado` | `BPageOrderAvocado.vue` | `timeline/BPageOrderAvocadoTimeline.vue` |
| `order-hyper` | `BPageOrderHyper.vue` | `timeline/BPageOrderHyperTimeline.vue` |

Existing tracked edits stay unstaged; only new task files are staged for the
local Git review. No commit or remote publication is performed.
