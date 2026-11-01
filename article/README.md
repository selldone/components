# Shared article content

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
