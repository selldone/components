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
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card class="text-start" dir="ltr">
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
            variant="flat"
          >
            <v-icon class="me-1">download</v-icon>
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
            variant="flat"
          >
            <v-icon class="me-1">download</v-icon>
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
            variant="flat"
          >
            <v-icon class="me-1">download</v-icon>
            Wholesaler version
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
  </v-dialog>
</template>

<script>
export default {
  name: "BProductImporterSampleDialog",
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
  },
};
</script>

<style scoped></style>
