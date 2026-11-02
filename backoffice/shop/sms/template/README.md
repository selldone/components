# Shop SMS settings and templates

The Backoffice SMS page opts into the shared template list and editor with `modern`.
Other callers keep the existing presentation. `hidePreview` lets the page own its
message-type preview above the list. The compact list is a separate section below
the chooser and preview, headed by the selected message's title and full copyable
code. The list uses its actual container width for native mobile table rows.

Message-type counts come from the catalogue's `templates_count`, covering all
template languages and enabled states. The list emits `templates-changed` only
after a successful add or delete so its parent can refresh that catalogue.
Search results, enabled-only filters and pagination never publish their filtered
counts as catalogue totals; editing a template does not invalidate its count.

## Provider settings

The modern provider form follows the connected Email card layout: provider and
supported message types, delivery controls, connection parameters, then common
Save and optional validation. Cards have real 8px canvas gaps with square inner
corners and rounded top/bottom exterior corners. Conditional cards disappear for
the default provider. Existing native controls, fixed Save actions, locale-filtered
provider choices, complete save payload, provider errors/reset and verified contact
sync remain intact; legacy callers retain the original enclosing widget.

Validation stays an explicit option on Save, available only for an enabled custom
provider and an account with a phone number. It can send a chargeable test SMS;
saving without that option does not verify delivery. Local QA uses synthetic
credentials and blocked/fake requests, never the values shown in browser feedback.

## Guided editor

The modern editor uses the existing language, Smart Switch, Smart Select and
Vuetify controls in three steps: Basics, Message and Review. Moving between steps
keeps the local draft. Only Review can submit, and saving retains the existing
request payload, errors and success-close behavior. Existing template formats
stay locked; editing a structural draft does not mutate the original table row.

The modern workspace is bounded to the normal 760px form width. Basics uses a
compact 620px vertical language, enabled-state and format flow. Footer actions
keep content-sized 42px desktop/44px touch targets and explicit native primary
variants so VCardActions' text-button defaults cannot conceal the Continue label
against its blue surface. Legacy callers retain their original layout and flow.

Plain-text preview values are extracted only when the authored message body and
sample match reliably. Missing values remain visible as parameters. Preview text
is rendered as text, and inserting a parameter preserves the native textarea
caret. Reset uses the existing language/provider default endpoint with stale-read
guards and scoped caching.

Structural mode preserves provider-specific keys and dynamic parameter controls.
Kavenegar uses its fixed `template` key and receives event values automatically;
its Persian provider reference is labeled separately from the editable text and
is never presented as proof of delivery. Previewing never sends an SMS.

## Local checks

From the main repository root:

```powershell
node --test src/Applications/Backoffice/pages/shop/setting/sms/BPageShopSettingSms.test.mjs
node --test @selldone/components-vue/backoffice/shop/sms/provider/BShopSmsProvider.test.mjs
node --test @selldone/components-vue/backoffice/shop/sms/template/editor/BShopSmsTemplateEditor.test.mjs
node --test @selldone/components-vue/backoffice/shop/sms/template/list/BShopSmsTemplateList.test.mjs
```

These checks use fixture requests and native controls without Laravel/provider
calls. They do not send test messages or validate live provider configuration.
