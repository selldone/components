<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <div
    v-if="modern"
    class="s--export-format-select s--export-format-select--modern"
    :style="{ '--s-export-column-count': exportFormats.length }"
    role="list"
  >
    <div
      v-for="format in exportFormats"
      :key="format.code"
      class="s--export-format-select__format"
      role="listitem"
    >
      <a
        :href="disabled ? undefined : format.href"
        :target="disabled ? undefined : '_blank'"
        :rel="disabled ? undefined : 'noopener noreferrer'"
        class="s--export-format-select__link"
        :class="{ 'sd-modern-clickable-item': !disabled }"
        :role="disabled ? 'link' : undefined"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        :aria-label="disabled ? format.label : `${format.label} · ${$t('exporter.formats.opens_new_tab')}`"
        :aria-describedby="`${exportId}-${format.code}-purpose ${exportId}-${format.code}-description`"
      >
        <div class="s--export-format-select__heading">
          <span class="s--export-format-select__icon">
            <img :src="format.icon" alt="" width="30" height="34" />
          </span>
          <h3>{{ format.title }}</h3>
        </div>
        <div class="s--export-format-select__copy">
          <h3 :id="`${exportId}-${format.code}-purpose`">{{ format.purpose }}</h3>
          <p :id="`${exportId}-${format.code}-description`">{{ format.description }}</p>
        </div>
        <span
          class="sd-modern-button sd-modern-button--inline s--export-format-select__download"
          :class="{ 'text-primary': !disabled }"
        >
          {{ format.label }}
          <v-icon size="18" aria-hidden="true">north_east</v-icon>
        </span>
      </a>
    </div>
  </div>
  <v-list
    v-else
    :lines="!modern && !dense ? 'three' : undefined"
    class="s--export-format-select bg-transparent"
    :class="modern ? 's--export-format-select--modern' : 'border-between-vertical rounded-18px overflow-hidden'"
  >
    <!-- --------------------------------------- PDF --------------------------------------- -->
    <v-list-item
      v-if="pdf"
      :href="pdf"
      :subtitle="pdfMessage"
      :title="`${type} PDF`"
      :class="{ 'sd-modern-clickable-item': modern }"
      :append-icon="modern ? 'north_east' : 'download'"
      target="_blank"
      :rel="modern ? 'noopener noreferrer' : undefined"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0" :size="modern ? 45 : undefined">
          <v-img :src="require('../../../assets/icons/pdf.svg')"></v-img>
        </v-avatar>
      </template>
    </v-list-item>

    <!-- --------------------------------------- CSV --------------------------------------- -->

    <v-list-item
      v-if="csv"
      :href="csv"
      :subtitle="csvMessage"
      :title="`${type} CSV`"
      :class="{ 'sd-modern-clickable-item': modern }"
      :append-icon="modern ? 'north_east' : 'download'"
      target="_blank"
      :rel="modern ? 'noopener noreferrer' : undefined"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0" :size="modern ? 45 : undefined">
          <v-img :src="require('../../../assets/file/csv.svg')"></v-img>
        </v-avatar>
      </template>
    </v-list-item>

    <!-- --------------------------------------- Excel --------------------------------------- -->
    <v-list-item
      v-if="excel"
      :href="excel"
      :subtitle="excelMessage"
      :title="`${type} Excel`"
      :class="{ 'sd-modern-clickable-item': modern }"
      :append-icon="modern ? 'north_east' : 'download'"
      target="_blank"
      :rel="modern ? 'noopener noreferrer' : undefined"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0" :size="modern ? 45 : undefined">
          <v-img :src="require('../../../assets/file/excel.svg')"></v-img>
        </v-avatar>
      </template>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { useId } from "vue";

export default {
  name: "SExportFormatSelect",
  setup: () => ({ exportId: `export-format-${useId()}` }),
  props: {
    pdf: { required: false },
    excel: { required: false },
    csv: { required: false },
    type: { required: true },
    pdfMessage: { required: false },
    excelMessage: { required: false },
    csvMessage: { required: false },
    pdfPurpose: { type: String, default: "" },
    csvPurpose: { type: String, default: "" },
    excelPurpose: { type: String, default: "" },
    dense: { default: false, type: Boolean },
    modern: { default: false, type: Boolean },
    disabled: { default: false, type: Boolean },
  },
  computed: {
    exportFormats() {
      return [
        {
          code: "pdf", title: "PDF", href: this.pdf,
          purpose: this.pdfPurpose, message: this.pdfMessage,
          icon: require("../../../assets/icons/pdf.svg"),
        },
        {
          code: "csv", title: "CSV", href: this.csv,
          purpose: this.csvPurpose, message: this.csvMessage,
          icon: require("../../../assets/file/csv.svg"),
        },
        {
          code: "excel", title: "Excel", href: this.excel,
          purpose: this.excelPurpose, message: this.excelMessage,
          icon: require("../../../assets/file/excel.svg"),
        },
      ]
        .filter((format) => format.href)
        .map((format) => ({
          ...format,
          purpose: format.purpose || this.type,
          description: format.message || this.$t(`exporter.formats.${format.code}_description`),
          label: this.$t("exporter.formats.download", { format: format.title }),
        }));
    },
  },
};
</script>

<style lang="scss" scoped>
.s--export-format-select--modern {
  display: grid;
  grid-template-columns: repeat(var(--s-export-column-count), minmax(0, 1fr));
  padding: 0;
  border-block-start: 1px solid var(--sd-modern-border);
  border-radius: 0;

  .s--export-format-select__format {
    min-width: 0;
    padding: 8px;

    + .s--export-format-select__format {
      border-inline-start: 1px solid var(--sd-modern-border);
    }
  }

  .s--export-format-select__link {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    height: 100%;
    min-height: 238px;
    padding: 16px;
    border-radius: 12px;
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    text-decoration: none;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.6;
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }

  .s--export-format-select__heading {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .s--export-format-select__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 42px;
    width: 42px;
    height: 46px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: var(--sd-modern-inset);

    img {
      display: block;
      object-fit: contain;
    }
  }

  .s--export-format-select__copy {
    flex: 1;
    min-width: 0;

    p {
      margin: 4px 0 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }
  }

  .s--export-format-select__download.sd-modern-button--inline {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 7px;
    min-height: 36px;
    height: auto;
    padding: 7px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }

  .s--export-format-select__download .v-icon {
    color: inherit;
  }

  .s--export-format-select__link[aria-disabled="true"] .s--export-format-select__download {
    color: var(--sd-modern-muted);
  }
}

@media (max-width: 600px) {
  .s--export-format-select--modern {
    grid-template-columns: minmax(0, 1fr);

    .s--export-format-select__format + .s--export-format-select__format {
      border-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
    }

    .s--export-format-select__link {
      min-height: 0;
      padding: 14px 12px;
    }

    .s--export-format-select__download.sd-modern-button--inline {
      min-height: 44px;
    }
  }
}

@media (max-width: 420px) {
  .s--export-format-select--modern .s--export-format-select__icon {
    flex-basis: 36px;
    width: 36px;
    height: 40px;
    border-radius: 8px;

    img {
      width: 26px;
      height: 30px;
    }
  }
}

@media (pointer: coarse) {
  .s--export-format-select--modern .s--export-format-select__download.sd-modern-button--inline {
    min-height: 44px;
  }
}
</style>
