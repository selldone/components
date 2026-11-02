<template>
  <figure class="b-product-pricing-illustration sd-modern-illustration text-start">
    <figcaption class="b-product-pricing-illustration__caption">
      {{ $t("add_product.edit_info.modern.pricing_illustration.label") }}
      <span class="b-product-pricing-illustration__summary">{{ $t("add_product.edit_info.modern.pricing_illustration." + mode + "_summary") }}</span>
    </figcaption>

    <div :key="mode" class="b-product-pricing-illustration__stage" aria-hidden="true">
      <svg class="b-product-pricing-illustration__canvas" viewBox="0 0 360 220" fill="none" focusable="false">
        <g class="b-product-pricing-illustration__guides">
          <path d="m25 137 160-80 150 75M25 158l160-80 150 75M25 179l160-80 150 75M62 118l150 75M99 100l150 75M136 81l150 75M173 63l150 75" />
          <path d="M27 45h8m-4-4v8M315 58h8m-4-4v8M42 196h5m-2.5-2.5v5" />
          <circle cx="300" cy="190" r="2" /><circle cx="54" cy="62" r="1.5" />
        </g>

        <template v-if="mode === 'area'">
          <path class="b-product-pricing-illustration__shadow" d="m65 119 151-50 83 54-151 57Z" />
          <g class="b-product-pricing-illustration__assemble">
            <path class="b-product-pricing-illustration__paper" d="m65 96 151-50 83 54v9l-151 57-83-54Z" />
            <path class="b-product-pricing-illustration__plane" d="m65 96 151-50 83 54-151 57Z" />
            <path class="b-product-pricing-illustration__tint" d="m115 79 51-16 83 54-51 19Z" />
            <path class="b-product-pricing-illustration__fine" d="m115 79 83 57m-32-73 83 54M106 123l152-50M65 96l83 61v9m0-9 151-57" />
            <path class="b-product-pricing-illustration__measure" pathLength="1" d="m66 130 74 48m-78-42 8-12m66 60 8-12m14-4 142-53m-144 47 4 12m138-65 4 12" />
            <g class="b-product-pricing-illustration__dimension">
              <rect x="39" y="51" width="65" height="28" rx="9" />
              <path d="M50 65h13m-13-4v8m13-8v8" />
              <text x="71" y="69">2 m</text>
              <rect x="251" y="40" width="65" height="28" rx="9" />
              <path d="M263 48v13m-4-13h8m-8 13h8" />
              <text x="276" y="58">3 m</text>
            </g>
            <path class="b-product-pricing-illustration__dashes" d="M73 80v14m211-25v21" />
          </g>
        </template>

        <template v-else-if="mode === 'volume'">
          <ellipse class="b-product-pricing-illustration__shadow" cx="184" cy="196" rx="100" ry="15" />
          <g class="b-product-pricing-illustration__assemble">
            <path class="b-product-pricing-illustration__paper" d="m96 74 84-42 84 42v84l-84 42-84-42Z" />
            <path class="b-product-pricing-illustration__plane" d="m96 74 84-42 84 42-84 42Z" />
            <path class="b-product-pricing-illustration__tint" d="m180 116 84-42v84l-84 42Z" />
            <path class="b-product-pricing-illustration__fine" d="m96 74 84 42 84-42m-84 42v84m-84-84 84 42 84-42m-140-56v84m28-70v84m56-70v84m28-98v84m-112-98 84 42m-56-56 84 42" />
            <path class="b-product-pricing-illustration__dashes" d="m96 158 84-42 84 42m-84-126v84" />
            <g class="b-product-pricing-illustration__dimension">
              <rect x="24" y="96" width="62" height="28" rx="9" />
              <text x="42" y="114">2 m</text>
              <rect x="113" y="7" width="62" height="28" rx="9" />
              <text x="131" y="25">3 m</text>
              <rect x="275" y="111" width="62" height="28" rx="9" />
              <text x="293" y="129">2 m</text>
            </g>
            <path class="b-product-pricing-illustration__measure" pathLength="1" d="M85 81v74m-5-74h10m-10 74h10m109 53 72-36m-74 31 5 10m66-46 5 10" />
          </g>
        </template>

        <template v-else-if="mode === 'custom'">
          <path class="b-product-pricing-illustration__flow" pathLength="1" d="M180 142v11c0 12-100 0-100 22m100-33v33m0-33v11c0 12 100 0 100 22" />
          <g class="b-product-pricing-illustration__assemble">
            <rect class="b-product-pricing-illustration__paper b-product-pricing-illustration__back" x="70" y="17" width="206" height="116" rx="14" transform="rotate(-5 173 75)" />
            <rect class="b-product-pricing-illustration__paper" x="77" y="24" width="206" height="118" rx="14" />
            <path class="b-product-pricing-illustration__fine" d="M77 49h206M91 37h30m117 0h25M92 63h40m-40 26h40m-40 26h40" />
            <circle class="b-product-pricing-illustration__swatch" cx="156" cy="64" r="7" />
            <circle class="b-product-pricing-illustration__teal" cx="178" cy="64" r="7" />
            <circle class="b-product-pricing-illustration__quiet" cx="200" cy="64" r="7" />
            <circle class="b-product-pricing-illustration__selected" cx="156" cy="64" r="10" />
            <path class="b-product-pricing-illustration__fine" d="M149 89h63" />
            <path class="b-product-pricing-illustration__accent" d="M149 89h35" />
            <g class="b-product-pricing-illustration__slider">
              <circle class="b-product-pricing-illustration__paper" cx="184" cy="89" r="6" />
              <path class="b-product-pricing-illustration__accent" d="M184 87v4" />
            </g>
            <rect class="b-product-pricing-illustration__switch" x="148" y="106" width="32" height="17" rx="8.5" />
            <circle class="b-product-pricing-illustration__knob" cx="171" cy="114.5" r="5.5" />
            <g class="b-product-pricing-illustration__numbers">
              <text x="232" y="68">+10</text><text x="232" y="93">+20</text><text x="232" y="119">+25</text>
            </g>
          </g>
          <g v-for="(x, index) in [80, 180, 280]" :key="x" :transform="'translate(' + (x - 22) + ', 170)'">
            <g class="b-product-pricing-illustration__product" :style="{ animationDelay: (0.45 + index * 0.12) + 's' }">
              <rect class="b-product-pricing-illustration__paper" width="44" height="40" rx="10" />
              <path class="b-product-pricing-illustration__accent" d="m13 15 9-5 9 5v12l-9 5-9-5Zm0 0 9 5 9-5m-9 5v12" />
              <circle class="b-product-pricing-illustration__check-surface" cx="39" cy="5" r="8" />
              <path class="b-product-pricing-illustration__check" d="m35 5 2.5 2.5L43 2" />
            </g>
          </g>
        </template>

        <template v-else>
          <ellipse class="b-product-pricing-illustration__shadow" cx="170" cy="167" rx="119" ry="18" />
          <g v-for="(point, index) in [[57, 74], [128, 47], [195, 76]]" :key="index" :transform="'translate(' + point[0] + ', ' + point[1] + ')'">
            <g class="b-product-pricing-illustration__product" :style="{ animationDelay: index * 0.12 + 's' }">
              <path class="b-product-pricing-illustration__paper" d="m0 15 27-14 27 14v45L27 74 0 60Z" />
              <path class="b-product-pricing-illustration__plane" d="m0 15 27-14 27 14-27 14Z" />
              <path class="b-product-pricing-illustration__tint" d="m27 29 27-14v45L27 74Z" />
              <path class="b-product-pricing-illustration__fine" d="m0 15 27 14 27-14M27 29v45m-9-57 27-14m-27 14v13l9 5" />
              <path class="b-product-pricing-illustration__accent" d="m7 49 9 5m-9 1 13 7" />
            </g>
          </g>
          <path class="b-product-pricing-illustration__flow" pathLength="1" d="M148 178c0 18 110 18 110-2" />
          <g class="b-product-pricing-illustration__receipt" transform="rotate(8 285 145)">
            <path class="b-product-pricing-illustration__paper" d="M253 95h68v100l-8-4-9 4-8-4-9 4-8-4-9 4-8-4-9 4Z" />
            <path class="b-product-pricing-illustration__fine" d="M266 108h22m-22 15h41m-41 11h23m10 0h8m-41 11h23m10 0h8m-41 13h41" />
            <path class="b-product-pricing-illustration__accent" d="M286 173h21" />
            <circle class="b-product-pricing-illustration__quiet" cx="307" cy="109" r="3" />
          </g>
        </template>
      </svg>
      <div class="b-product-pricing-illustration__equation" dir="ltr">
        {{ mode === "area" ? "2 × 3 = 6 m²" : mode === "volume" ? "2 × 3 × 2 = 12 m³" : mode === "custom" ? "10 + 20 + 25 → USD 55" : "3 × USD 10 → USD 30" }}
      </div>
    </div>
  </figure>
</template>

<script lang="ts">
export default {
  name: "BProductPricingIllustration",
  props: {
    mode: { type: String, default: "default" },
  },
};
</script>

<style scoped lang="scss">
.b-product-pricing-illustration {
  position: relative;
  min-inline-size: 0;
  min-block-size: 0;
  margin: 0;
  color: rgb(var(--v-theme-on-surface));

  &__caption {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }

  &__stage {
    position: absolute;
    inset: 23px 0 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr) 30px;
    gap: 7px;
  }

  &__summary {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__canvas {
    inline-size: 100%;
    block-size: 100%;
    min-block-size: 0;
    overflow: visible;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.2;
  }

  &__canvas :is(path, rect, circle, ellipse) { vector-effect: non-scaling-stroke; }
  &__guides { stroke: rgba(var(--v-theme-on-surface), .065); }
  &__shadow { fill: rgba(var(--sd-modern-illustration-accent-rgb), .055); stroke: none; }
  &__paper { fill: rgb(var(--v-theme-surface)); stroke: rgba(var(--v-theme-on-surface), .2); }
  &__back { fill: color-mix(in srgb, rgb(var(--v-theme-surface)), rgb(var(--sd-modern-illustration-accent-rgb)) 5%); }
  &__plane { fill: color-mix(in srgb, rgb(var(--v-theme-surface)), rgb(var(--sd-modern-illustration-accent-rgb)) 9%); stroke: rgba(var(--sd-modern-illustration-accent-rgb), .5); }
  &__tint { fill: rgba(var(--sd-modern-illustration-accent-rgb), .11); stroke: rgba(var(--sd-modern-illustration-accent-rgb), .5); }
  &__fine { stroke: rgba(var(--v-theme-on-surface), .2); }
  &__accent { stroke: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__quiet { fill: rgba(var(--v-theme-on-surface), .12); stroke: none; }
  &__swatch { fill: rgba(var(--sd-modern-illustration-accent-rgb), .7); }
  &__teal { fill: #83b9b4; }
  &__selected { stroke: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__switch { fill: rgb(var(--v-theme-on-surface)); }
  &__knob { fill: rgb(var(--v-theme-surface)); }
  &__numbers { fill: rgba(var(--v-theme-on-surface), .65); font-family: inherit; font-size: 11px; }
  &__check-surface { fill: rgb(var(--v-theme-surface)); stroke: rgba(var(--sd-modern-illustration-accent-rgb), .25); }
  &__check { stroke: rgb(var(--sd-modern-illustration-accent-rgb)); }

  &__dimension {
    rect { fill: rgb(var(--v-theme-surface)); stroke: rgba(var(--v-theme-on-surface), .15); }
    path { stroke: rgba(var(--v-theme-on-surface), .5); }
    text { fill: rgb(var(--v-theme-on-surface)); font-size: 12px; font-weight: 500; }
  }

  &__measure,
  &__flow {
    stroke: rgba(var(--sd-modern-illustration-accent-rgb), .55);
    stroke-dasharray: 1;
    animation: pricing-draw .9s .3s both;
  }

  &__dashes { stroke: rgba(var(--sd-modern-illustration-accent-rgb), .35); stroke-dasharray: 3 5; }
  &__assemble { animation: pricing-arrive .7s both; }
  &__product { animation: pricing-arrive .65s both; }
  &__receipt { animation: pricing-reveal .5s .6s both; }
  &__slider { animation: pricing-slide .8s .2s both; }

  &__equation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: fit-content;
    max-inline-size: 100%;
    box-sizing: border-box;
    margin-inline: auto;
    padding-inline: 12px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
    line-height: 20px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    animation: pricing-reveal .45s .8s both;
  }

  @keyframes pricing-arrive { from { opacity: .2; transform: translateY(7px); } to { opacity: 1; transform: none; } }
  @keyframes pricing-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes pricing-reveal { from { opacity: .1; } to { opacity: 1; } }
  @keyframes pricing-slide { from { transform: translateX(-12px); } to { transform: none; } }

  @media (prefers-reduced-motion: reduce) {
    &__assemble, &__product, &__receipt, &__slider, &__measure, &__flow, &__equation { animation: none; }
  }
}
</style>
