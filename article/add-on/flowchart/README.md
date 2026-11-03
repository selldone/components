# Official article flowcharts

Selldone Help (`help`) and the official Selldone Blog (`blog`) can insert and edit bounded flow definitions. Shop Blog (`shop-blog`) and other article types are excluded by both the editor integration and the server boundary.

`SArticleFlow.vue` and `flow-content.ts` contain the existing API Docs renderer and geometry. API Docs keeps its mixed content/video normalizer and delegates flow figures to this same renderer. Articles validate through `parseArticleFlowchart`, so a malformed node, unknown field or connection is rejected rather than silently dropped.

The editor dialog provides a JSON definition editor, a live preview and a copyable AI prompt with the complete schema and a branching example. Apply changes only the current local article draft. The owning editor must recheck its live authorization and DOM context before accepting Apply or opening the dialog.

Persist only this empty marker with HTML-escaped canonical JSON:

```html
<article-flowchart data-version="1" data-flow="{...}"></article-flowchart>
```

Rendered SVG, toolbars, runtime attributes and editor controls never belong in the saved article body. `parseArticleFlowchartElement` reads the definition from the marker; `serializeArticleFlowchart` reconstructs the empty marker. The server independently enforces the same schema, eligible parent types, eight-diagram limit and 64 KiB JSON limit.

All labels are plain text. The format has no executable HTML/SVG or URL, style, action or script fields. Node icons are Material ligature names. Curved connectors, node help, outcome markers, RTL, responsive layouts, the text version and finite reduced-motion-safe animation remain owned by the shared API Docs renderer. Connector strokes and arrowheads share an opaque theme-aware color, so overlapping paths do not accumulate transparency.

Product workspaces also reuse `SArticleFlow` with trusted runtime data. The optional `interactive` prop emits `select(nodeId)` from a tile instead of opening tap-help; the caller owns navigation and permissions. The `caption` and `node-icon` slots support an existing section heading and canonical resource artwork. These runtime hooks never enter the serialized article format; article callers retain their default captions, icons and tap-help.

The optional `stage-decoration` slot receives measured node `boxes`, stage `size` and the current `layout`. Product callers can draw local ownership groups using the same geometry as the shared arrows; native tiles expose `data-node-id` for scoped presentation. The default slot is empty and adds no saved fields, actions, group schema or editor options.

Resize-observer measurements are coalesced into an animation frame and cancelled on unmount, keeping geometry writes outside observer delivery. Explicit/intersection measurements and the finite story remain unchanged. Outcome markers and product action-border layers use the existing Smart invert protection without counter-inverting neutral tile surfaces.

The visible “Text version of the diagram” disclosure is opt-in through the runtime `showTextVersion` prop, enabled by Help/official Blog, their editor preview and API Docs. Product and dashboard flows omit that disclosure by default while retaining node descriptions and connection lists for screen readers. This presentation choice is not part of the stored article definition or Admin MCP contract.

The optional runtime `railColumns` prop lets a linear workspace flow use more columns when its container has enough room. Domain Overview requests its current node count; measured narrow-width routing and the default article rail and branching layout remain unchanged. This is not a stored article field.

Run the isolated authoring and API regression suites from the repository root:

```powershell
node --test @selldone/components-vue/article/add-on/flowchart/article-flowchart.test.mjs src/Applications/Selldone/pages/api-doc/components/ApiDocContent.test.mjs
```
