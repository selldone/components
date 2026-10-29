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
  <v-list
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
export default {
  name: "SExportFormatSelect",
  props: {
    pdf: { required: false },
    excel: { required: false },
    csv: { required: false },
    type: { required: true },
    pdfMessage: { required: false },
    excelMessage: { required: false },
    csvMessage: { required: false },
    dense: { default: false, type: Boolean },
    modern: { default: false, type: Boolean },
  },
};
</script>

<style lang="scss" scoped>
.s--export-format-select--modern {
  padding: 0;
  border-radius: 0;

  :deep(.v-list-item) {
    min-height: 90px;
    padding: 23px 14px;
    border-radius: 8px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-family: inherit;
  }

  :deep(.v-list-item:last-child) {
    border-block-end: 0;
  }

  :deep(.v-list-item__prepend > .v-list-item__spacer) {
    width: 16px;
  }

  :deep(.v-list-item-title) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    white-space: normal;
  }

  :deep(.v-list-item-subtitle) {
    display: block;
    margin-block-start: 6px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.6;
    white-space: normal;
    opacity: 1;
    -webkit-line-clamp: unset;
  }

  :deep(.v-list-item__append .v-icon) {
    color: rgb(var(--v-theme-on-surface));
    font-size: 18px;
    opacity: 1;
  }
}

@media (max-width: 599px) {
  .s--export-format-select--modern :deep(.v-list-item) {
    padding-block: 18px;
    padding-inline: 10px;
  }
}
</style>
