<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    max-width="640"
    width="98vw"
    content-class="rounded-t-xl"
    :aria-label="modern ? $t('importer.product_templates.title') : undefined"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card
      v-if="modern"
      class="sd-modern-widget s--product-template-dialog text-start"
      rounded="t-xl"
    >
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <img
            src="../../../../assets/file/excel.svg"
            width="28"
            height="28"
            alt=""
          />
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("importer.product_templates.title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("importer.product_templates.description") }}
            </p>
          </div>
        </div>
      </header>
      <div class="s--product-template-dialog__rows">
        <section
          v-for="template in templates"
          :key="template.code"
          class="s--product-template-dialog__row"
        >
          <div>
            <h3>{{ $t(`importer.product_templates.${template.code}`) }}</h3>
            <p>
              {{
                $t(`importer.product_templates.${template.code}_description`)
              }}
            </p>
            <span
              v-if="template.code === 'simple'"
              class="s--product-template-dialog__recommendation"
              >{{ $t("global.commons.recommended") }}</span
            >
          </div>
          <v-btn
            :href="template.href"
            target="_blank"
            rel="noopener"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            :aria-label="`${$t('global.actions.download')} · ${$t(`importer.product_templates.${template.code}`)}`"
          >
            <v-icon start size="16">download</v-icon
            >{{ $t("global.actions.download")
            }}<v-icon end size="16">north_east</v-icon>
          </v-btn>
        </section>
      </div>
      <footer class="s--product-template-dialog__footer">
        <v-btn
          href="https://github.com/selldone/excel"
          target="_blank"
          rel="noopener"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
        >
          {{ $t("importer.product_templates.samples")
          }}<v-icon end size="16">north_east</v-icon>
        </v-btn>
        <v-btn
          class="sd-modern-button"
          variant="text"
          @click="$emit('update:modelValue', false)"
          >{{ $t("global.actions.close") }}</v-btn
        >
      </footer>
    </v-card>
    <v-card v-else class="text-start" dir="ltr" rounded="t-xl">
      <v-card-title>
        <img
          class="me-1"
          height="36"
          src="../../../../assets/file/excel.svg"
          width="36"
        />
        Download Excel Template Files
      </v-card-title>
      <v-card-text>
        <p>
          If your product doesn't have any variations, we suggest using this
          version.
        </p>

        <div class="widget-buttons">
          <v-btn
            color="primary"
            href="/app/excel/products-import-no-variants-small.xlsx"
            min-width="180"
            size="x-large"
            target="_blank"
            variant="elevated"
          >
            <v-icon start>download</v-icon>
            <div>
              Simple version
              <small class="d-block text-white">Recommended</small>
            </div>
          </v-btn>
        </div>

        <p class="mt-4">
          If you require the complete version with additional features like
          supporting variants, specifications, product reviews, and more, feel
          free to download the file below. Note that many fields are optional.
        </p>
        <div class="widget-buttons">
          <v-btn
            color="primary"
            href="/app/excel/products-import-variants-full.xlsx"
            min-width="180"
            size="x-large"
            target="_blank"
            variant="elevated"
          >
            <v-icon start>download</v-icon>
            Full version
          </v-btn>
        </div>

        <p class="mt-4">
          As a wholesaler, if you wish to implement tiered pricing, altering
          prices according to quantity in a maximum of 10 increments, this file
          can be used.
        </p>
        <div class="widget-buttons">
          <v-btn
            color="primary"
            href="/app/excel/products-import-wholesaler.xlsx"
            min-width="180"
            size="x-large"
            target="_blank"
            variant="elevated"
          >
            <v-icon start>download</v-icon>
            Wholesaler version
          </v-btn>
        </div>
        <div class="widget-buttons my-5">
          <v-btn
            href="https://github.com/selldone/excel"
            target="_blank"
            size="x-large"
            prepend-icon="fa:fab fa-github"
            variant="elevated"
          >
            Click to find more samples & details
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
export default {
  name: "BProductImporterSampleDialog",
  emits: ["update:modelValue"],
  props: {
    modern: { type: Boolean, default: false },
    modelValue: {},
  },
  data: () => ({
    templates: [
      {
        code: "simple",
        href: "/app/excel/products-import-no-variants-small.xlsx",
      },
      { code: "full", href: "/app/excel/products-import-variants-full.xlsx" },
      {
        code: "wholesaler",
        href: "/app/excel/products-import-wholesaler.xlsx",
      },
    ],
  }),
};
</script>

<style lang="scss" scoped>
.s--product-template-dialog {
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  padding: 22px;

  .sd-modern-header {
    margin-block-end: 18px;
  }
  .sd-modern-title {
    align-items: start;
  }
  .sd-modern-title-text {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.4;
  }
  .sd-modern-subtitle {
    font-size: 13px;
  }
  .sd-modern-button {
    min-height: 36px;
  }
  &__rows {
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px 18px;
    padding-block: 16px;
    border-block-end: 1px solid var(--sd-modern-border);
    h3 {
      margin: 0;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.45;
    }
    p {
      margin: 5px 0 0;
      font-size: 13px;
      color: var(--sd-modern-muted);
      overflow-wrap: anywhere;
    }
  }
  &__recommendation {
    display: inline-block;
    margin-block-start: 5px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-block-start: 16px;
  }
}
@media (max-width: 600px) {
  .s--product-template-dialog {
    padding: 18px;
    .sd-modern-button {
      min-height: 44px;
    }
    &__row {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
      .sd-modern-button {
        justify-self: start;
      }
    }
  }
}
@media (pointer: coarse) {
  .s--product-template-dialog .sd-modern-button {
    min-height: 44px;
  }
}
</style>
