<template>
  <section
    class="b-spreadsheet-conversion text-start"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <figure class="sd-modern-illustration b-spreadsheet-conversion__illustration">
      <div class="b-spreadsheet-conversion__art" aria-hidden="true">
        <img src="../../../assets/file/excel.svg" width="28" height="28" alt="" />
        <svg
          class="b-spreadsheet-conversion__curve"
          viewBox="0 0 44 32"
          fill="none"
          focusable="false"
        >
          <path d="M1 22C11 22 11 10 22 10S33 22 43 22" pathLength="1" />
        </svg>
        <img src="../../../assets/file/csv.svg" width="28" height="28" alt="" />
      </div>
      <figcaption>{{ $t("importer.conversion.illustration_label") }}</figcaption>
    </figure>
    <div class="b-spreadsheet-conversion__copy">
      <p class="b-spreadsheet-conversion__title">
        {{ $t("importer.conversion.title") }}
      </p>
      <p class="b-spreadsheet-conversion__help">
        {{ $t("importer.conversion.help") }}
      </p>
      <bdi v-if="filename" class="b-spreadsheet-conversion__filename" :title="filename">
        {{ filename }}
      </bdi>
    </div>
    <v-progress-circular
      class="b-spreadsheet-conversion__progress"
      color="primary"
      :size="20"
      :width="2"
      indeterminate
      aria-hidden="true"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BSpreadsheetConversionProgress",
  props: {
    filename: { type: String, default: "" },
  },
});
</script>

<style lang="scss" scoped>
.b-spreadsheet-conversion {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 16px;
  min-width: 0;
  min-height: 88px;
  padding: 12px 16px;
  border: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface, 30, 34, 42), 0.12));
  border-radius: 12px;
  color: rgb(var(--v-theme-on-surface, 30, 34, 42));
  background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface, 30, 34, 42), 0.035));
  font-family: inherit;
  text-align: start;

  &__illustration {
    min-width: 0;
    margin: 0;
    text-align: center;

    figcaption {
      margin-block-start: 4px;
      color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface, 30, 34, 42), 0.65));
      font-size: 11px;
      line-height: 16px;
    }
  }

  &__art {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    img {
      display: block;
      flex: 0 0 auto;
      object-fit: contain;
    }
  }

  &__curve {
    display: block;
    flex: 0 0 44px;
    width: 44px;
    height: 32px;
    overflow: visible;
    color: rgb(var(--sd-modern-illustration-accent-rgb, 147, 66, 193));

    path {
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 1;
      stroke-dashoffset: 0;
      animation: spreadsheet-conversion-route 1.6s ease-out both;
    }
  }

  &__copy {
    min-width: 0;
  }

  &__title,
  &__help {
    margin: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }

  &__help,
  &__filename {
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface, 30, 34, 42), 0.65));
    font-size: 12px;
    line-height: 18px;
  }

  &__help {
    margin-block-start: 2px;
    font-size: 13px;
    line-height: 20px;
  }

  &__filename {
    display: block;
    overflow: hidden;
    margin-block-start: 3px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:dir(rtl) &__curve,
  .v-locale--is-rtl & &__curve {
    transform: scaleX(-1);
  }

  @media (max-width: 600px) {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 6px 12px;
    padding: 12px;

    &__illustration {
      grid-column: 1;
      grid-row: 1;
      align-self: end;
    }

    &__art {
      gap: 4px;

      img {
        width: 20px;
        height: 20px;
      }
    }

    &__curve {
      flex-basis: 24px;
      width: 24px;
      height: 24px;
    }

    &__copy {
      grid-column: 2;
      grid-row: 1 / 3;
    }

    &__title {
      font-size: 13px;
      line-height: 20px;
    }

    &__progress {
      grid-column: 1;
      grid-row: 2;
      align-self: start;
      justify-self: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__curve path {
      animation: none;
      stroke-dashoffset: 0;
    }

    &__progress :deep(> svg),
    &__progress :deep(.v-progress-circular__overlay) {
      animation: none;
      transition: none;
    }
  }
}

@keyframes spreadsheet-conversion-route {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
</style>
