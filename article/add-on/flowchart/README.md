# Official article flowcharts

Selldone Help (`help`) and the official Selldone Blog (`blog`) can insert and edit bounded flow definitions. Shop Blog (`shop-blog`) and other article types are excluded by both the editor integration and the server boundary.

`SArticleFlow.vue` and `flow-content.ts` contain the existing API Docs renderer and geometry. API Docs keeps its mixed content/video normalizer and delegates flow figures to this same renderer. Articles validate through `parseArticleFlowchart`, so a malformed node, unknown field or connection is rejected rather than silently dropped.

The editor dialog provides a JSON definition editor, a live preview and a copyable AI prompt with the complete schema and a branching example. Apply changes only the current local article draft. The owning editor must recheck its live authorization and DOM context before accepting Apply or opening the dialog.

Persist only this empty marker with HTML-escaped canonical JSON:

```html
<article-flowchart data-version="1" data-flow="{...}"></article-flowchart>
```

Rendered SVG, toolbars, runtime attributes and editor controls never belong in the saved article body. `parseArticleFlowchartElement` reads the definition from the marker; `serializeArticleFlowchart` reconstructs the empty marker. The server independently enforces the same schema, eligible parent types, eight-diagram limit and 64 KiB JSON limit.

All labels are plain text. The format has no executable HTML/SVG or URL, style, action or script fields. Node icons are Material ligature names. Curved connectors, node help, outcome markers, RTL, responsive layouts, the text version and finite reduced-motion-safe animation remain owned by the shared API Docs renderer.

Run the isolated authoring and API regression suites from the repository root:

```powershell
node --test @selldone/components-vue/article/add-on/flowchart/article-flowchart.test.mjs src/Applications/Selldone/pages/api-doc/components/ApiDocContent.test.mjs
```
