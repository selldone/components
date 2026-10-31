# Domain connection

The modern add dialog uses the approved full-screen **Guided** layout: domain and connection, DNS and ownership, then review and connect. The existing `BDomainAdd` component owns the draft and requests throughout the three stages. The legacy/inline add view and the existing domain-edit capabilities remain available.

The flow retains apex, subdomain and wildcard addresses; Selldone hosting with the merchant's own CDN or the available Selldone secure CDN; and externally hosted websites with META or TXT ownership verification. DNS values come from the shop's configured connection targets. Host and value copying, provider guidance, quota/access controls, loading states and retry details stay in the existing feature. A and CNAME records for a matching host are alternatives.

`POST_ADD_DOMAIN` verifies ownership and creates the connection together. Moving between the local stages does not verify ownership or create a domain. A successful add does not prove HTTPS is ready: external providers manage their certificates, while secure-CDN certificate setup can continue asynchronously. The edit view retains visitor-access updates and sign-in callback/client operations; those are not extra add steps.

The connection diagram uses the feature's existing flowchart grammar with curved paths, opaque nodes and contextual explanations. Its labels describe routing, not connection-health results.

Selection-specific HTML/SVG illustrations explain hosting and certificate ownership. Standard and custom Selldone Layouts both use Selldone hosting without a separate server; an independently hosted storefront uses its own deployment. The external option links to the public storefront source. Cloudflare Pages and CDN/SSL copy describes eligible free-plan configurations, not unlimited hosting or universal hostname coverage. Illustrations are inert, finish their automatic sequence within four seconds and retain a complete reduced-motion view.

Failed Guided attempts retain the returned DNS and challenge-query evidence. `BDomainDnsFeedback` separates confirmed matches, wrong values/hosts, checked-but-missing records and unchecked requirements. A/CNAME routing targets are alternatives. An unfamiliar public CDN IP alone is not an incorrect origin, and an unequal bcrypt ownership token alone is not an invalid proof. Missing challenge records are reported only when that host was actually checked. Legacy/edit request behavior remains unchanged.

Cloudflare setup offers a validated, local BIND-file download and the official DNS dashboard link. Only the selected A or CNAME alternative and the required TXT record are exported; external META verification has no DNS export. Records import as DNS only, and the user reviews conflicts and confirms the import in Cloudflare. No Cloudflare credential or API request is involved, and no file is stored on the server or in the database. Fully automatic [Domain Connect](https://developers.cloudflare.com/dns/reference/domain-connect/) needs provider template onboarding and signed requests; the dashboard link is not an automatic setup endpoint. See the official [record import documentation](https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/).

The prepared [Selldone Domain Connect package](../../../../../Backend/app/Storefront/Domains/DomainConnect/README.md) contains three submission templates, a pure server-side signed-URL builder and registration instructions. It is not wired to a live dashboard action or endpoint. Keep the manual flow until template onboarding, signing-key provisioning and authorized shop integration are complete; no Cloudflare client secret is needed for the synchronous consent flow.

## Approved geometry

Keep the selected application font. The dialog heading is 24px/32px at weight 500, stage headings 20px/28px at weight 500, body text 14px and supporting guidance 13px. Desktop actions are 42px high, increasing to at least 44px for touch. The desktop stage rail is 210px wide with a 28px gap to the content. Stage panels use 28px insets and 17px corners. On narrow screens the rail becomes a top row and content, long DNS values and actions reflow without horizontal page overflow.

## Verification

Run the focused domain-add component checks and the existing domain-quota checks with synthetic shop data and mocked requests. Verify the three-step guards, invalid addresses, A/CNAME alternatives, external META/TXT, available secure-CDN options, loading/retry behavior, editing and access/quota restrictions. Review the rendered desktop/narrow and English/Persian layouts, keyboard focus and actual Light/Dark appearance through the existing HMR session. Do not submit a real connection merely to check the interface.
