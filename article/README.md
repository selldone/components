# Shared article content

## Official Blog editing tools

The approved Blog editor keeps Category, Schedule and Search & sharing in
separate panels. Switching panels retains the native translation/author dialog
owners. Publication and visibility tooltips explain the action that the next
article save will apply. Google Search Console appears after Timeline with the
existing Google asset and native permission/loading guards.
Word import appears only while editing, with the existing bundled DOCX logo;
the native importer and its busy/pending guards stay unchanged.

Blog FAQ and structured-data sections use the shared editors with `blog=true`.
Questions support safe inline answer preview and add/edit/reorder/delete;
schema editing retains Book, Occupation, Course, HowTo and Recipe, recursive
properties and read-only JSON. Unsupported saved schema types retain JSON and
delete actions. FAQPage is derived from the FAQ collection rather than authored
as a separate schema. Existing Help/shop consumers keep their default styles.

Apply updates only the current article draft; the native article Save persists
it. Unapplied FAQ/schema forms block Save, Preview and other reader actions.
Permission, actor, article identity and busy-state checks still apply, including
late callbacks. The stored `faqs`/`structures` formats and unknown fields remain
unchanged. See the repository's `Backend/app/Admin/Mcp/OfficialContent/README.md`
for the narrower MCP FAQ proposal contract and bounded schema reads.

The Blog search report reuses the installed ApexCharts line renderer and a local
SVG distribution. It shows the returned daily clicks/impressions, fraction CTR
and impression-weighted position; missing days/values remain gaps or unavailable.
Country/search-appearance percentages use only the returned rows. Native query,
country, date and appearance tables remain available. No synthetic fallback,
extra API dimension, comparison period or new dependency is introduced.

Implementation: `ArticleViewer.vue`, `faq/SArticleWorkspaceFaqs.vue`,
`SArticleStructuredData.vue`, `SStructureDataInput.vue`,
`seo/SArticleSearchConsole.vue`, `seo/article-search-console.ts`, the official
`OPageBlogsView.vue` caller and their focused tests. EN/FA labels live in the
existing global translation modules; the category input retains native disabled
behavior.

Validation covers native draft/save payloads, stale/denied actions, pending-form
guards, recursive/unknown schema preservation, real SFC/template/Sass compilation,
runtime asset compilation and synthetic report ingestion. Local HMR browser
checks cover focused panels, publication/privacy help, the retained translation
dialog, required FAQ validation, native HowTo/JSON controls and 320/360px plus
desktop layouts. Forms were canceled without changing article content. Live
Search Console data is unavailable locally; no Google request or production
build is part of this verification.

2026-11-11 validation: 163 focused frontend tests and 36 isolated backend tests
(2,183 assertions) passed. EN/FA translation syntax and scoped whitespace checks
also passed. Existing tracked changes remain unstaged; only the new feature-local
`seo/article-search-console.ts` helper is staged, without a commit.

The follow-up sample preview renders this actual component with native Vuetify
and ApexCharts in an isolated development harness; its synthetic fetch never
uses the application API. Real browser checks cover all metrics, both share
dimensions, all table tabs, keyboard table scrolling, EN/FA and light/dark modes
at 320/360/600/768/1024/1337px. The installed chart wrapper drops formatter
functions during reactive option updates, so the main trend remounts on metric
or daily-data changes. The mobile heading keeps its row beside the logo, and
the donut's short localized unit stays inside the ring. The 13 focused report
tests cover the chart identity and formatting regression.

## Article body

Official Help/Blog comment typography is scoped through the existing
`isSelldone` flag in `comment/SArticleComments.vue`. It inherits the host font,
uses restrained body/identity/time sizes and regular placeholder text, retaining
the exact existing comment structure, transitions, action positions and script.
Storefront/Product comments keep their existing presentation.

The official Blog Share dialog in `OPageBlogsView.vue` keeps the native social
sharing group, adds a separate labeled Copy action through CoreMixin and a
bounded public-path link. It never shares editor queries/hashes. Social targets
stay aligned at 44px, including mobile. Recommendation cards own 20px of real
padding inside their hover surface; their native routes and content remain.
The page test exercises the real clipboard owner against an isolated browser
clipboard boundary. These Blog refinements are local to that page; the shared
share-group component is unchanged.

2026-11-11 Help/Blog refinement verification: 151 focused frontend tests and
12 isolated Help MCP tests (254 assertions) passed. The Blog suite was rerun
after the edit-only Word import refinement (12 passing tests). The comment SFC,
template and Sass compile, and its script remains unchanged. Local browser
checks covered FAQ disclosure, focused Help tabs, status/visibility drafts,
pending-form guards, Share alignment, card insets and official comment type.
Help layouts fit 320/360/600/768/1024/1337px; Blog Share and Word import fit 320px
and desktop. No article/comment save, publication or live Google request was
performed for this refinement.

`SArticleEditor` owns both the inline edit and read-only body. Its global style
imports `article-content.scss`, so the same restrained prose treatment reaches
official Help/Blog, Shop Blog, Product descriptions and storefront article uses.
`Article.scss` retains the viewer shell and media integration styles.

The host continues to choose its font family, body size, ink and reading line
height. Prose uses consistent paragraph/heading spacing, native nested list
markers with logical indentation, a quiet divider and the approved transparent
editorial quote. Native ordered-list `start`, `reversed`, `type` and item `value`
attributes retain their normal browser meaning. This CSS does not rewrite HTML.
Existing context-specific Help/Product typography and legacy note/code callouts
remain in their owners.

Selectors apply only inside `.s-article-editor__body`. Insertion controls,
flowcharts, code/catalog/comparison/canvas blocks, media, external embeds and
table content keep their own styles. Decorative quote glyphs retain their icon
font; prose does not introduce a font-family override.

Authored links and underlined text use a quiet native underline with ink skipping
and a stable offset. Links retain the host ink, native navigation and visible
keyboard focus; hover strengthens only the line. The shared body overrides the
legacy gradient fill without restyling media links or add-on controls.

The shared `add-on/code-editor` viewer and native edit sheet share one scoped
source surface: compact language/theme controls, a monospace LTR source area,
theme-aware scrollbars and bounded internal scrolling. The application font
continues to own surrounding UI. Existing authored language keys and `codes`
serialization stay unchanged. Highlighting selects the actual Prism grammar for
each supported language; unknown languages remain escaped text. Cancel leaves
the article alone, while Set applies only to the current local draft through the
native context guards. Saving the article remains the owner's existing action.

Code changes: `add-on/code-editor/AAddonCodeEditor.vue`,
`dialog/AAddonCodeEditorDialog.vue`, `article-code-editor.scss`,
`article-code-highlight.ts` and `article-code-editor.test.mjs`; localized labels
live in `@selldone/translate/global/{en,fa}.ts`. The same component reaches every
current article consumer without caller changes.

2026-11-01 link/code verification: the final 115 article/editor/prose/code tests
passed, including real Vue/Prism mounting, read-only behavior, cancel/apply,
serialization and stale native-owner guards. The local Help page shows native
underlines without gradient fills and keeps its inherited font. Code view/theme,
source edit, local draft preview and confirmed discard were checked in an
isolated tab; the edit sheet and its actions fit 320/360px after viewport layout
settles. No sample code was saved to the article. English/Persian translation
files also passed TypeScript syntax checks.

Run `node --test article/article-content.test.mjs` from this package, plus the
existing `ArticleViewer.test.mjs`, `SArticleEditor.test.mjs` and flowchart suites.
The focused style tests compile the real global stylesheet and exercise actual
selector boundaries in read/edit fixtures. Review inherited font, multiline and
nested lists, quotes, narrow widths, RTL and dark surfaces when refining it.

2026-11-01 verification: 127 focused article/flowchart/API tests passed. The local
Help page was checked in read/edit mode and its Persian edition in read mode;
the reading layout fits 320, 360, 600, 768, 1024 and 1440px without page overflow.
The existing body font and 16px context size remain intact, quote backgrounds are
transparent, and the diagram caption retains its own 15px type. No production
build or article save was run.

Source changes for the prose polish: `article-content.scss`, its test, this
README, the global style block in `SArticleEditor.vue`, and broad heading/ink
defaults in `Article.scss`. The repository product UI guide records the user's
global/inherited-font rule. No article APIs, stored bodies or editor logic change.
