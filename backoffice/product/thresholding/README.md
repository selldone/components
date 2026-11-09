# Storefront urgency messages (product thresholds)

## What it is

On the storefront product page, `storefront/product/section/incentivise/SProductSectionIncentivise.vue` can show a short urgency line that encourages shoppers to buy now, for example "🔥 Popular choice! Stocks are running low…". It can also show:

- a sold-progress bar;
- an "N others have this in their carts!" line.

This folder holds the product setting that decides when each of these appears.

## The rules

The rules come from `@selldone/core-js/enums/product/ProductThresholds.ts`:

- Physical and virtual products have four levels (Critical, High, Moderate, Low). Each level has a minimum sales count and a stock range.
- File products have the same four levels on sales only.
- Services and subscriptions have no urgency messages.

The levels are checked in order, and the first one whose sales (strictly more than the minimum) and stock (an inclusive range) match picks the message. Physical and virtual products show nothing when they are out of stock.

The two percentages apply only when a product uses custom rules; otherwise the storefront uses 10%:

- `progress`: the bar shows once `sold / (stock + sold)` reaches it.
- `carts`: the cart line shows once `in_carts >= stock × carts`.

`FindProductThresholdCondition` (in core-js) is the one matcher. The storefront and the editor preview both call it, so they always agree.

## The editor (`BProductThresholding.vue`)

**Modern mode** is the product editor's "Urgency messages" tab (`BProductAddFull`, edit only, after Inventory, hash `#urgency`). It has:

- **Rules source:** a Store defaults / Custom for this product switch.
- **Storefront preview:** the shared dashed `sd-modern-sketch` frame. It has a fixed height, holds at most three lines of message and shows an inert hatched Add to cart. It opens on the "Selling fast" preset, so the message, the striped storefront progress bar and the cart line all show.
- **Simulator:** presets and logarithmic sliders for stock, sales and items in carts. A three-line, fixed-height sentence explains which rule matched and why.
- **"Which message shows" map:** an SVG on a linear stock axis and a square-root sales axis. Each rule's region is drawn in reverse priority, so the rule that wins each point sits on top. Clicking the map moves the preview to that point, and RTL mirrors it.
- **Rules list:** in check order, with inputs for "Sold more than", "Stock from" and "to". An empty input means no limit.
- **Signal cards:** the progress bar and the cart line, each with a percentage slider.
- **Save bar.**

Store defaults and the vendor panel are read-only. Saving uses the existing `PUT_SET_PRODUCT_THRESHOLDS` payload (`custom`, `variables`, `progress`, `carts`), and nothing else changes on the server.

**Legacy mode** (non-modern editors) keeps the original widget and `BProductThresholdingPreview`.

## Copy and checks

Copy is under `b_product_urgency` in `@selldone/translate/dashboard/{en,fa}.ts`. The level names come from `b_product_inventory.thresholds.levels`, and the storefront strings from `global.product_section_incentivise`.

`BProductThresholding.test.mjs` covers:

- the shared matcher;
- the preview against the storefront rules;
- defaults versus custom, and vendor read-only;
- map geometry and clicks;
- file products;
- English and Persian copy parity.
