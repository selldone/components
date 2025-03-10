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
    :lines="!dense ? 'three' : undefined"
    class="bg-transparent border-between-vertical rounded-18px overflow-hidden"
  >
    <!-- --------------------------------------- PDF --------------------------------------- -->
    <v-list-item
      v-if="pdf"
      :href="pdf"
      :subtitle="pdfMessage"
      :title="`${type} PDF`"
      append-icon="download"
      target="_blank"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0">
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
      append-icon="download"
      target="_blank"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0">
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
      append-icon="download"
      target="_blank"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0">
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
  },
};
</script>

<style scoped></style>
