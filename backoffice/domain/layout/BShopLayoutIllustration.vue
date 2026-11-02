<template>
  <div
    class="sd-modern-illustration b-shop-layout-illustration"
    :class="{ 'b-shop-layout-illustration--active': active }"
    aria-hidden="true"
  >
    <svg viewBox="0 0 220 160" fill="none" focusable="false">
      <g class="b-shop-layout-illustration__standard">
        <rect class="b-shop-layout-illustration__surface" x="28" y="28" width="164" height="110" rx="14" />
        <path class="b-shop-layout-illustration__line" d="M28 51h164" />
        <g class="b-shop-layout-illustration__muted">
          <circle cx="41" cy="40" r="2" /><circle cx="49" cy="40" r="2" /><circle cx="57" cy="40" r="2" />
          <rect x="41" y="63" width="138" height="28" rx="5" />
          <rect x="41" y="101" width="39" height="23" rx="4" />
          <rect x="90" y="101" width="39" height="23" rx="4" />
          <rect x="139" y="101" width="40" height="23" rx="4" />
        </g>
        <path class="b-shop-layout-illustration__line" d="M52 73h43m-43 7h27m110-40h-29" />
      </g>
      <g v-if="active" class="b-shop-layout-illustration__custom">
        <rect class="b-shop-layout-illustration__surface b-shop-layout-illustration__custom-border" x="49" y="20" width="154" height="116" rx="14" />
        <path class="b-shop-layout-illustration__line" d="M49 43h154" />
        <g class="b-shop-layout-illustration__accent">
          <rect x="62" y="29" width="12" height="5" rx="2.5" />
          <circle cx="179" cy="31.5" r="2" /><circle cx="188" cy="31.5" r="2" />
        </g>
        <rect class="b-shop-layout-illustration__hero" x="62" y="55" width="62" height="43" rx="7" />
        <svg class="sd-modern-illustration__icon b-shop-layout-illustration__picture" x="80" y="64" width="26" height="26" viewBox="0 0 24 24" focusable="false">
          <path d="m2 19 6-8 6 6 4-5 4 7" /><circle cx="16" cy="6" r="2" />
        </svg>
        <path class="b-shop-layout-illustration__ink" d="M136 61h42m-42 9h30" />
        <path class="b-shop-layout-illustration__line" d="M136 80h45m-45 7h37" />
        <rect class="b-shop-layout-illustration__action" x="136" y="94" width="30" height="6" rx="3" />
        <rect class="b-shop-layout-illustration__tile" x="62" y="110" width="37" height="12" rx="4" />
        <rect class="b-shop-layout-illustration__tile" x="107" y="110" width="37" height="12" rx="4" />
        <rect class="b-shop-layout-illustration__tile" x="152" y="110" width="37" height="12" rx="4" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps({ active: Boolean });
</script>

<style scoped lang="scss">
.b-shop-layout-illustration {
  --sd-modern-illustration-accent-rgb: 38, 139, 128;
  --sd-modern-illustration-highlight-rgb: 67, 127, 172;
  width: 100%;
  height: 100%;
  pointer-events: none;

  > svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  &__surface {
    fill: rgb(var(--v-theme-surface));
    stroke: rgba(var(--v-theme-on-surface), 0.22);
    stroke-width: 1.2;
  }
  &__line {
    stroke: rgba(var(--v-theme-on-surface), 0.2);
    stroke-width: 1.4;
    stroke-linecap: round;
  }
  &__muted {
    fill: rgba(var(--v-theme-on-surface), 0.07);
  }
  &__ink {
    stroke: rgba(var(--v-theme-on-surface), 0.55);
    stroke-width: 2;
    stroke-linecap: round;
  }
  &__accent {
    color: rgb(var(--sd-modern-illustration-accent-rgb));
    fill: currentColor;
  }
  &__picture {
    color: rgb(var(--sd-modern-illustration-accent-rgb));
  }
  &__custom-border {
    stroke: rgba(var(--sd-modern-illustration-accent-rgb), 0.65);
  }
  &__hero {
    fill: rgba(var(--sd-modern-illustration-accent-rgb), 0.13);
  }
  &__tile {
    fill: rgba(var(--sd-modern-illustration-highlight-rgb), 0.14);
  }
  &__action {
    fill: rgb(var(--v-theme-on-surface));
  }
  &--active &__standard {
    opacity: 0.55;
    transform: translate(-11px, 7px);
    animation: layout-recede 2.8s ease both;
  }
  &__custom {
    animation: layout-apply 2.8s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  }
  @keyframes layout-recede {
    0%, 12% { opacity: 1; transform: translate(0, 0); }
    42%, 100% { opacity: 0.55; transform: translate(-11px, 7px); }
  }
  @keyframes layout-apply {
    0%, 12% { opacity: 0; transform: translate(6px, -10px); }
    54%, 100% { opacity: 1; transform: translate(0, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    & &__standard, & &__custom { animation: none; }
  }
  &:dir(rtl) > svg { transform: scaleX(-1); }
}
</style>
