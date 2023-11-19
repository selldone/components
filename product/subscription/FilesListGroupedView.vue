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
  <div>
    <v-row no-gutters class="my-1" align="center" justify="center">
      <div
        v-for="(val, extension) in files_grouped"
        :key="extension"
        class="m-1"
      >
        <img
          :src="getFileExtensionImage(extension)"
          width="20"
          class="hover-scale"
          style="vertical-align: top"
        />
        {{ val | numeralFormat("0.[0] a") }}🞬
      </div>
    </v-row>

    <div class="my-1 small font-weight-bold" title="Total files size">
      <v-icon small class="me-1">storage</v-icon>
      {{ files_size | numeralFormat("0.[0] b") }}
    </div>
  </div>
</template>

<script>
export default {
  name: "FilesListGroupedView",
  props: {
    files: { type: Array, required: true },
  },

  computed: {
    files_grouped() {
      let out = {};
      this.files.forEach((file) => {
        const extension = file.name.split(".").pop();

        if (out[extension]) out[extension]++;
        else out[extension] = 1;
      });
      return out;
    },
    files_size() {
      let sum = 0;
      this.files.forEach((item) => (sum += item.size));
      return sum * 1024;
    },
  },
};
</script>

<style scoped></style>
