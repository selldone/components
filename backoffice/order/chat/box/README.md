# Order Chat · Refined

The five Backoffice order Chat pages opt into `BOrderChatBox` with `modern`.
The default remains the existing presentation for other callers, including the
Orders list dialog and storefront message previews.

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

Run the isolated checks from the components-vue directory:

```powershell
node backoffice/order/chat/box/BOrderChatBox.test.mjs
```

The test uses synthetic records and mocked requests. It covers guards, draft
replacement, variables, template and email flows, stale responses, guest-link
reset, deletion confirmation, legacy behavior, escaped rendering, SFC/style
compilation and English/Persian key parity. It sends no messages or email and
creates no live link.

## Integration files

- `BOrderChatBox.vue`, `BOrderChatBox.test.mjs` and this README.
- `backoffice/order/share/BOrderShare.vue` and
  `storefront/order/chat/message/SOrderChatMessage.vue` in components-vue.
- `dashboard/en.ts` and `dashboard/fa.ts` in translate.
- `BPageOrderPhysical.vue`, `BPageOrderVirtual.vue`, `BPageOrderFile.vue`,
  `BPageOrderService.vue`, `BPageOrderSubscription.vue` and each corresponding
  `chat/BPageOrder…Chat.vue` in the Backoffice application.
- The shared disabled `sd-modern-button` rule in `modern-design.scss` overrides
  Vuetify's theme-color utility so unavailable actions retain their neutral style.
