# Order Chat · Refined

The five Backoffice order Chat pages opt into `BOrderChatBox` with `modern`.
The default remains the existing presentation for other callers, including
storefront message previews. The approved Orders-list Conversation dialog opts
into both `modern` and `dialogMode`; `dialogMode` defaults to false so the existing
five modern Chat pages keep their page layout.

The conversation and composer share one widget. Saved replies are inserted into
the draft, with confirmation before replacing existing text. The native shop-wide
create/edit requests and first-occurrence `{order_id}` / `{buyer_name}` replacements
remain intact. The editor provides a plain-text preview and server-aligned limits
(message 1024, reply title 64, reply body 1000).

Status email stays a separate preview/send flow and checks the existing mail
service requirements. Chat notification help describes the server's 10-minute
queue delay and once-per-order 24-hour limit; it does not imply delivery or reading.
Message text stays escaped, and staff-message deletion retains its native endpoint
with a modern confirmation.

`BOrderShare` keeps the normal customer URL separate from the 30-day guest access
link. Guest checkout availability and server permissions are unchanged. The modern
flow confirms the link's access consequence before creation and does not display
the signed URL in the page. Copy still uses the complete native value.

Modern order/shop changes clear local drafts, dialogs and guest links. Late
responses cannot populate another conversation, overwrite its busy state or
expose an earlier order's guest link. Legacy request behavior remains unchanged.

## Design and checks

The approved Refined layout uses a 960px content limit, 22/29px page title,
13/21px message text, 12/20px supporting text, standard 42px actions and native
32px operational icons. Narrow/touch layouts use 44px targets and 16px inputs.
Shared modern surfaces, buttons, tooltips and list captions retain theme and RTL
behavior. Existing navigation and canonical avatars are preserved.

The approved Conversation dialog uses a single column within the host's 704px
content width: a 19/26px title and order/customer identity, 22px desktop insets,
a bounded scrolling history, the native composer with Templates at its trailing
edge, compact quick samples, recipient and Send action, and a quiet footer with
collapsible order/guest access and the separate status-email action. Message body
text remains 13/21px, with neutral customer bubbles and plain staff messages.
Opening a conversation and successfully adding a message reveal its latest
record; deleting an older message does not force the history to jump.
The child emits `close`; the native dialog host owns dismissal and focus return.
Narrow/touch layouts retain 44px controls and readable inputs. All request,
template, deletion, guest-link and notification timing contracts above remain
the same; the dialog does not invent sent/read indicators or sample messages.

The Process Center host enables this dialog only on the five native seller order
lists, with the route's shop matching the supplied shop. Vendor, marketplace,
affiliate and other order channels retain their native dialog presentation.
The desktop host is capped at 706px including its border, with 18px corners;
below 600px it uses the native fullscreen dialog. Its explicit Light/Dark theme
follows the real user preference, including inherited themes for nested dialogs.
Closing unmounts the conversation and clears the selected row. Leaving the
route/shop/context also closes it, while same-scope list refreshes retain it.

Run the isolated checks from the components-vue directory:

```powershell
node backoffice/order/chat/box/BOrderChatBox.test.mjs
node --test backoffice/process-center/list/BProcessCenterList.test.mjs
```

The test uses synthetic records and mocked requests. It covers guards, draft
replacement, variables, template and email flows, stale responses, guest-link
reset, deletion confirmation, legacy behavior, escaped rendering, SFC/style
compilation and English/Persian key parity. It sends no messages or email and
creates no live link.

The parent list suite also checks the five-route opt-in, mobile/fullscreen and
Light/Dark props, absence of duplicate dialog chrome, close/unmount, scope reset
and preserved legacy callers. The current isolated suites pass; authenticated
browser measurement was unavailable because the UI automation kernel failed to
start (`0x800705AA`). No message, email or guest link was created in the running app.

## Integration files

- `BOrderChatBox.vue`, `BOrderChatBox.test.mjs` and this README.
- `backoffice/order/share/BOrderShare.vue` and
  `storefront/order/chat/message/SOrderChatMessage.vue` in components-vue.
- `backoffice/process-center/list/BProcessCenterList.vue`: approved native
  Orders-list dialog host and its existing selected-order lifecycle.
- `backoffice/process-center/list/BProcessCenterList.test.mjs`: focused dialog
  boundary, lifecycle and appearance regressions alongside the native list checks.
- `dashboard/en.ts` and `dashboard/fa.ts` in translate.
- `BPageOrderPhysical.vue`, `BPageOrderVirtual.vue`, `BPageOrderFile.vue`,
  `BPageOrderService.vue`, `BPageOrderSubscription.vue` and each corresponding
  `chat/BPageOrder…Chat.vue` in the Backoffice application.
- The shared disabled `sd-modern-button` rule in `modern-design.scss` overrides
  Vuetify's theme-color utility so unavailable actions retain their neutral style.
