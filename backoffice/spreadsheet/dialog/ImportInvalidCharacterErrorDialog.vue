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
  <v-dialog
    :model-value="modelValue"
    dark
    max-width="640"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card class="text-start" color="#217346">
      <v-card-title>
        <v-icon class="me-1" color="amber">report</v-icon>
        Invalid character!
      </v-card-title>

      <v-card-text>
        <p>Save your file in the UTF8 format.</p>
        <img
          :src="require('../../spreadsheet/assets/excel-utf8-save.png')"
          height="auto"
          style="aspect-ratio: 1.4; object-fit: contain"
          width="100%"
        />
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
  name: "ImportInvalidCharacterErrorDialog",
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
  },
};
</script>

<style scoped></style>
