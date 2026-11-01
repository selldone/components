<template>
  <div class="b-list-empty-state text-start" :data-empty-kind="resolvedKind">
    <div class="b-list-empty-state__body">
      <svg
        class="b-list-empty-state__art sd-modern-illustration"
        :data-empty-art="artwork"
        viewBox="0 0 240 154"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path class="b-list-empty-state__ground" d="M32 136h176" />

        <g v-if="artwork === 'catalog'" class="b-list-empty-state__reveal">
          <path class="b-list-empty-state__muted" d="M43 65V47a8 8 0 0 1 8-8h34l14 14h75a8 8 0 0 1 8 8v62H43Z" />
          <g class="b-list-empty-state__detail">
            <rect class="b-list-empty-state__surface" x="112" y="21" width="65" height="91" rx="9" />
            <rect class="b-list-empty-state__wash" x="124" y="34" width="41" height="30" rx="5" />
            <path class="b-list-empty-state__ink" d="m129 57 9-9 7 7 8-5 8 8M126 77h37M126 87h24" />
          </g>
          <path class="b-list-empty-state__surface" d="M37 69h58l12 10h79a7 7 0 0 1 7 8l-5 36a8 8 0 0 1-8 7H49a8 8 0 0 1-8-7l-10-46a7 7 0 0 1 6-8Z" />
          <path class="b-list-empty-state__ink" d="M55 93h31M58 103h18" />
        </g>

        <g v-else-if="artwork === 'parcel'" class="b-list-empty-state__reveal">
          <path class="b-list-empty-state__surface" d="M130 28h47a7 7 0 0 1 7 7v83l-8-4-8 4-8-4-8 4-8-4-8 4V35a7 7 0 0 1-6 7Z" />
          <path class="b-list-empty-state__ink" d="M145 49h26M145 60h19M145 78h26M145 89h16" />
          <g class="b-list-empty-state__detail">
            <path class="b-list-empty-state__muted" d="m48 74 44-22 44 22-44 23Z" />
            <path class="b-list-empty-state__surface" d="m48 74 44 23 44-23v42l-44 22-44-22Z" />
            <path class="b-list-empty-state__accent-line" d="M92 97v41m-22-75 44 22v17" />
            <path class="b-list-empty-state__ink" d="m59 105 13 7" />
          </g>
        </g>

        <g v-else-if="artwork === 'people'" class="b-list-empty-state__reveal">
          <rect class="b-list-empty-state__muted" x="59" y="34" width="128" height="91" rx="14" />
          <path class="b-list-empty-state__ink" d="M139 57h29M139 69h19M139 92h29M139 104h20" />
          <g class="b-list-empty-state__detail">
            <circle class="b-list-empty-state__surface" cx="82" cy="72" r="23" />
            <path class="b-list-empty-state__surface" d="M43 126v-10a31 31 0 0 1 31-31h16a31 31 0 0 1 31 31v10Z" />
            <path class="b-list-empty-state__accent-line" d="M62 124v-10m40 10v-10" />
            <circle class="b-list-empty-state__wash" cx="82" cy="68" r="13" />
          </g>
        </g>

        <g v-else-if="artwork === 'ticket'" class="b-list-empty-state__reveal">
          <path class="b-list-empty-state__muted" d="m70 33 118 17a8 8 0 0 1 7 9l-8 56a8 8 0 0 1-9 7L60 105a8 8 0 0 1-7-9l8-56a8 8 0 0 1 9-7Z" />
          <path class="b-list-empty-state__surface" d="M48 59h130a8 8 0 0 1 8 8v14a15 15 0 0 0 0 30v12a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-12a15 15 0 0 0 0-30V67a8 8 0 0 1 8-8Z" />
          <path class="b-list-empty-state__ink" stroke-dasharray="3 6" d="M145 68v54" />
          <g class="b-list-empty-state__detail b-list-empty-state__accent-line">
            <circle cx="88" cy="82" r="7" /><circle cx="115" cy="108" r="7" /><path d="m87 111 29-31" />
          </g>
        </g>

        <g v-else-if="artwork === 'mail'" class="b-list-empty-state__reveal">
          <rect class="b-list-empty-state__muted" x="78" y="26" width="90" height="82" rx="10" />
          <path class="b-list-empty-state__ink" d="M94 43h49M94 54h36" />
          <path class="b-list-empty-state__surface" d="M50 69h139v53a8 8 0 0 1-8 8H58a8 8 0 0 1-8-8Z" />
          <path class="b-list-empty-state__ink" d="m50 70 63 43a12 12 0 0 0 13 0l63-43M52 126l39-29m96 29-40-29" />
          <g class="b-list-empty-state__detail">
            <path class="b-list-empty-state__wash" d="m156 33 40-10-14 38-8-18Z" />
            <path class="b-list-empty-state__accent-line" d="m156 33 40-10-14 38-8-18Zm18 10 22-20" />
          </g>
        </g>

        <g v-else-if="artwork === 'delivery'" class="b-list-empty-state__reveal">
          <path class="b-list-empty-state__ground" stroke-dasharray="3 6" d="M40 46h59m-64 13h31" />
          <path class="b-list-empty-state__surface" d="M47 59h94v61H47Z" />
          <path class="b-list-empty-state__muted" d="M141 76h30l25 27v17h-55Z" />
          <path class="b-list-empty-state__surface" d="M151 83h15l17 20h-32Z" />
          <path class="b-list-empty-state__ink" d="M49 120h147" />
          <g class="b-list-empty-state__detail">
            <circle class="b-list-empty-state__surface" cx="73" cy="120" r="14" /><circle class="b-list-empty-state__surface" cx="171" cy="120" r="14" />
            <circle class="b-list-empty-state__wash" cx="73" cy="120" r="5" /><circle class="b-list-empty-state__wash" cx="171" cy="120" r="5" />
            <path class="b-list-empty-state__accent-line" d="M72 76h42m-42 12h28" />
          </g>
        </g>

        <g v-else-if="artwork === 'map'" class="b-list-empty-state__reveal">
          <path class="b-list-empty-state__surface" d="m44 59 48-15 55 15 47-15v75l-47 15-55-15-48 15Z" />
          <path class="b-list-empty-state__ground" d="M92 44v75m55-60v75" />
          <path class="b-list-empty-state__accent-line" stroke-dasharray="3 5" d="M64 108c12-25 21-12 33-23s27-5 43 14 19 0 32-22" />
          <g class="b-list-empty-state__detail">
            <path class="b-list-empty-state__surface" d="M143 23c-16 0-27 12-27 27 0 21 27 39 27 39s27-18 27-39c0-15-11-27-27-27Z" />
            <circle class="b-list-empty-state__wash" cx="143" cy="50" r="11" />
            <circle class="b-list-empty-state__accent-line" cx="143" cy="50" r="8" />
          </g>
        </g>

        <g v-else-if="artwork === 'connection'" class="b-list-empty-state__reveal">
          <path class="b-list-empty-state__ground" d="M75 77h36a15 15 0 0 1 15 15v9a15 15 0 0 0 15 15h26M126 92V59a15 15 0 0 1 15-15h26" />
          <rect class="b-list-empty-state__surface" x="38" y="53" width="59" height="49" rx="13" />
          <circle class="b-list-empty-state__wash" cx="67" cy="77" r="14" />
          <path class="b-list-empty-state__accent-line" d="M53 77h28M67 63a25 25 0 0 1 0 28 25 25 0 0 1 0-28Z" />
          <g class="b-list-empty-state__detail">
            <rect class="b-list-empty-state__surface" x="160" y="25" width="45" height="39" rx="11" />
            <rect class="b-list-empty-state__surface" x="160" y="97" width="45" height="39" rx="11" />
            <path class="b-list-empty-state__ink" d="m176 39-6 6 6 6m12-12 6 6-6 6M173 110h19m-19 9h12" />
          </g>
        </g>

        <g v-else-if="artwork === 'finance'" class="b-list-empty-state__reveal">
          <path class="b-list-empty-state__muted" d="m53 57 103-23a8 8 0 0 1 10 8v68H53Z" />
          <rect class="b-list-empty-state__surface" x="45" y="58" width="136" height="73" rx="12" />
          <path class="b-list-empty-state__muted" d="M150 82h38v31h-38a15 15 0 0 1 0-31Z" />
          <circle class="b-list-empty-state__ink" cx="156" cy="98" r="3" />
          <g class="b-list-empty-state__detail">
            <circle class="b-list-empty-state__surface" cx="175" cy="48" r="23" />
            <path class="b-list-empty-state__accent-line" d="M175 33v30m8-23h-11a5 5 0 0 0 0 10h6a5 5 0 0 1 0 10h-12" />
          </g>
        </g>

        <g v-else class="b-list-empty-state__reveal">
          <rect class="b-list-empty-state__muted" x="53" y="35" width="102" height="99" rx="11" />
          <path class="b-list-empty-state__surface" d="M86 22h61l28 28v75a9 9 0 0 1-9 9H86a9 9 0 0 1-9-9V31a9 9 0 0 1 9-9Z" />
          <path class="b-list-empty-state__ink" d="M147 22v23a5 5 0 0 0 5 5h23M94 69h63M94 82h48M94 95h58M94 108h33" />
          <g class="b-list-empty-state__detail">
            <rect class="b-list-empty-state__surface" x="153" y="99" width="39" height="34" rx="10" />
            <path class="b-list-empty-state__accent-line" d="M164 110h17m-17 9h11" />
          </g>
        </g>
      </svg>
      <h3 v-if="displayTitle" class="b-list-empty-state__title">{{ displayTitle }}</h3>
      <p v-if="displayDescription" class="b-list-empty-state__description">{{ displayDescription }}</p>
      <div v-if="$slots.default" class="b-list-empty-state__actions"><slot /></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const artworkByKind = {
  product: "catalog", category: "catalog", order: "parcel",
  customer: "people", content: "document", discount: "ticket",
  campaign: "mail", affiliate: "people", shipping: "delivery", location: "map",
  domain: "connection", payment: "finance", automation: "connection",
  team: "people", app: "connection", log: "document", records: "document",
};

/** The owning list decides whether a successful response is empty and which actions are allowed. */
export default defineComponent({
  name: "BListEmptyState",
  props: {
    kind: { type: String, default: "records" },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
  },
  computed: {
    resolvedKind(): keyof typeof artworkByKind {
      return Object.prototype.hasOwnProperty.call(artworkByKind, this.kind)
        ? this.kind as keyof typeof artworkByKind
        : "records";
    },
    artwork() { return artworkByKind[this.resolvedKind]; },
    displayTitle() { return this.title ?? this.$t(`dashboard_empty_state.${this.resolvedKind}.title`); },
    displayDescription() { return this.description ?? this.$t(`dashboard_empty_state.${this.resolvedKind}.description`); },
  },
});
</script>

<style lang="scss" scoped>
.b-list-empty-state {
  min-width: 0;
  width: 100%;
  padding: 24px 12px 28px;
  color: var(--sd-modern-text, rgb(var(--v-theme-on-surface)));

  &__body { display: flex; flex-direction: column; align-items: center; min-width: 0; text-align: center; }
  &__art { display: block; flex: 0 0 auto; width: 180px; max-width: 100%; height: auto; margin-block-end: 14px; pointer-events: none; }
  &__ground { stroke: rgba(var(--v-theme-on-surface), .12); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  &__surface { fill: rgb(var(--v-theme-surface)); stroke: rgba(var(--v-theme-on-surface), .22); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  &__muted { fill: rgba(var(--v-theme-on-surface), .035); stroke: rgba(var(--v-theme-on-surface), .16); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  &__ink { stroke: rgba(var(--v-theme-on-surface), .3); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  &__wash { fill: rgba(var(--sd-modern-illustration-accent-rgb, 147, 66, 193), .08); }
  &__accent-line { stroke: rgba(var(--sd-modern-illustration-accent-rgb, 147, 66, 193), .8); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  &__title { margin: 0; max-width: 100%; font-size: 18px; font-weight: 500; line-height: 26px; letter-spacing: normal; overflow-wrap: anywhere; }
  &__description { margin: 8px 0 0; max-width: 420px; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); font-size: 14px; font-weight: 400; line-height: 23px; overflow-wrap: anywhere; }
  &__actions { display: flex; justify-content: center; flex-wrap: wrap; align-items: center; gap: 8px; max-width: 100%; margin-block-start: 18px; }
  &__reveal { animation: empty-state-reveal 1.8s ease-out both; }
  &__detail { animation: empty-state-detail 2.6s ease-out both; }

  @media (max-width: 599px) {
    padding-inline: 8px;
    &__art { width: 160px; }
  }
  @media (prefers-reduced-motion: reduce) {
    &__reveal, &__detail { animation: none; }
  }
}
@keyframes empty-state-reveal {
  0% { opacity: 0; transform: translateY(6px); }
  55%, 100% { opacity: 1; transform: translateY(0); }
}
@keyframes empty-state-detail {
  0%, 35% { opacity: 0; transform: translateY(5px); }
  75%, 100% { opacity: 1; transform: translateY(0); }
}
</style>
