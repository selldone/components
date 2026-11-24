# Shop SMS settings and templates

The Backoffice SMS page opts into the shared template list and editor with `modern`.
Other callers keep the existing presentation. The page uses the storefront theme
page's side rail: Messages (one entry per audience) and Delivery (the provider).
An audience lists its messages; each row shows the languages that have their own
text (from the catalogue's `overrides`), struck through when turned off, or
"Default text". Opening a message shows Back, its preview and this list;
`hidePreview` lets the page own that preview. Every section and message has its
own `#hash`. The list uses its actual container width for native mobile table rows.

Message-type counts come from the catalogue's `templates_count`, covering all
template languages and enabled states. The list emits `templates-changed` only
after a successful add or delete so its parent can refresh that catalogue.
Search results, enabled-only filters and pagination never publish their filtered
counts as catalogue totals; editing a template does not invalidate its count.

## Provider settings

On the modern page a saved provider shows as one card: logo, status (Active, errors,
Paused or Disabled), capabilities, home-country flags, details, Change provider and
Send a test SMS. A test posts only `{test: true}`, so it always uses the saved
settings; unsaved edits, a disabled or paused provider, or a missing phone number
block it and say why. Change opens an always-open picker: search (name, key, country
code or name) narrows every group, and a target country lists that country's own
providers first (usually cheaper there), then the worldwide ones, then the rest.
Each row shows up to three flags (+N lists the rest) and an info dialog with its
home markets, delivery reach and capabilities. Switching away from a saved provider
asks before saving, because its stored credentials are removed. With `readOnly`
(staff without Settings write access) the card and status stay visible and nothing
can be changed.

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

Run the focused checks from the components-vue repository root.

```powershell
node --test backoffice/shop/sms/provider/BShopSmsProvider.test.mjs backoffice/shop/sms/template/editor/BShopSmsTemplateEditor.test.mjs
node --test @selldone/components-vue/backoffice/shop/sms/template/list/BShopSmsTemplateList.test.mjs
```

These checks use fixture requests and native controls without Laravel/provider
calls. They do not send test messages or validate live provider configuration.
