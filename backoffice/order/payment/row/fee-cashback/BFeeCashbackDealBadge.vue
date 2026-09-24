<!--
  - Copyright (c) 2026. Selldone® Business OS™
  -
  - Compact visual identity for a shop-specific Selldone fee cashback deal.
  -->

<template>
  <span
    :class="{ 'fee-cashback-badge--compact': compact }"
    class="fee-cashback-badge"
  >
    <svg
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 240 40"
    >
      <path
        class="fee-cashback-badge__wash"
        d="M8 8 C45 2 91 7 126 4 C166 1 204 6 232 8 L226 14 L239 20 L230 26 L237 33 C191 37 151 33 112 36 C73 39 34 35 7 32 L13 26 L1 21 L11 15 Z"
      />
      <path
        class="fee-cashback-badge__paint"
        d="M3 5 C39 8 72 1 111 4 C150 7 190 1 236 6 L230 12 L240 17 L232 23 L239 29 C205 35 166 31 127 35 C83 39 42 32 4 35 L10 29 L0 24 L8 18 L1 12 Z"
      />
      <path
        class="fee-cashback-badge__shine"
        d="M18 11 C66 7 113 11 151 8 C180 6 205 8 220 10"
      />
    </svg>

    <span
      class="fee-cashback-badge__content d-inline-flex align-center ga-1 px-3 py-1 text-caption font-weight-bold"
    >
      <v-icon aria-hidden="true" :size="compact ? 12 : 14"> handshake </v-icon>
      <span>{{ label }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean;
    label: string;
  }>(),
  {
    compact: false,
  },
);
</script>

<style scoped>
.fee-cashback-badge {
  position: relative;
  isolation: isolate;
  display: inline-grid;
  min-block-size: 24px;
  color: #fff;
  vertical-align: middle;
}

.fee-cashback-badge::before {
  position: absolute;
  z-index: -2;
  inset: -3px -6px;
  background: linear-gradient(
    105deg,
    #feda75 0%,
    #fa7e1e 4%,
    #c2410c 9%,
    #be185d 30%,
    #9d174d 52%,
    #962fbf 76%,
    #7e22ce 94%,
    #c084fc 100%
  );
  clip-path: polygon(
    3% 14%,
    18% 19%,
    34% 7%,
    51% 14%,
    68% 5%,
    97% 16%,
    94% 31%,
    100% 46%,
    95% 63%,
    99% 82%,
    72% 91%,
    52% 84%,
    34% 95%,
    4% 84%,
    7% 68%,
    0 53%,
    6% 37%,
    1% 26%
  );
  content: "";
}

.fee-cashback-badge svg {
  position: absolute;
  z-index: -1;
  inset: -3px -6px;
  width: calc(100% + 12px);
  height: calc(100% + 6px);
  overflow: visible;
}

.fee-cashback-badge__wash {
  fill: rgba(255, 255, 255, 0.035);
  stroke: none;
}

.fee-cashback-badge__paint {
  fill: rgba(255, 255, 255, 0.02);
  stroke: none;
}

.fee-cashback-badge__shine {
  fill: none;
  stroke: rgba(255, 255, 255, 0.03);
  stroke-linecap: round;
  stroke-width: 1.25;
}

.fee-cashback-badge__content {
  line-height: 1.2;
  white-space: nowrap;
}

.fee-cashback-badge--compact {
  min-block-size: 18px;
}

.fee-cashback-badge--compact::before,
.fee-cashback-badge--compact svg {
  inset: -2px -4px;
  width: calc(100% + 8px);
  height: calc(100% + 4px);
}

.fee-cashback-badge--compact .fee-cashback-badge__content {
  padding-block: 2px !important;
  padding-inline: 8px !important;
  font-size: 0.6875rem !important;
  line-height: 1.15;
}

@media (forced-colors: active) {
  .fee-cashback-badge {
    border: 1px solid CanvasText;
    border-radius: 3px;
    background: Canvas;
    color: CanvasText;
  }

  .fee-cashback-badge::before,
  .fee-cashback-badge svg {
    display: none;
  }
}
</style>
