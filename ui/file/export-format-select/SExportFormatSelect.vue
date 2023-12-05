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
    :three-line="!dense"
    class="bg-transparent border-between-vertical rounded-18px overflow-hidden"
  >
    <!-- --------------------------------------- PDF --------------------------------------- -->
    <v-list-item v-if="pdf" :href="pdf" target="_blank">
      <v-list-item-avatar tile>
        <v-img
          :src="require('@components/assets/icons/pdf.svg')"
          contain
        ></v-img>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title> {{ type }} PDF </v-list-item-title>
        <v-list-item-subtitle>
          {{ pdfMessage }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-icon class="align-self-center m-auto">
        <v-icon>download</v-icon>
      </v-list-item-icon>
    </v-list-item>

    <!-- --------------------------------------- Excel --------------------------------------- -->
    <v-list-item v-if="excel" :href="excel" target="_blank">
      <v-list-item-avatar tile>
        <v-img
          :src="require('@components/assets/file/excel.svg')"
          contain
        ></v-img>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title> {{ type }} Excel </v-list-item-title>
        <v-list-item-subtitle>
          {{ excelMessage }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-icon class="align-self-center m-auto">
        <v-icon>download</v-icon>
      </v-list-item-icon>
    </v-list-item>

    <!-- --------------------------------------- CSV --------------------------------------- -->

    <v-list-item v-if="csv" :href="csv" target="_blank">
      <v-list-item-avatar tile>
        <v-img
          :src="require('@components/assets/file/csv.svg')"
          contain
        ></v-img>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title> {{ type }} CSV </v-list-item-title>
        <v-list-item-subtitle>
          {{ csvMessage }}
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-icon class="align-self-center m-auto">
        <v-icon>download</v-icon>
      </v-list-item-icon>
    </v-list-item>
  </v-list>
</template>

<script>
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
