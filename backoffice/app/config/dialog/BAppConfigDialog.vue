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
  <!-- ------------------- Edit Plugin Dialog ------------------- -->
  <v-bottom-sheet
    v-model="value_local"
    :fullscreen="$vuetify.display.mdAndDown"
    content-class="rounded-t-xl"
    max-width="1280"
    scrollable
  >
    <b-app-detail
      :app="app"
      :shop-app="shopApp"
      :shop-id="shop.id"
      class="rounded-t-xl"
      dark
      @close="value_local = false"
      @update:shopApp="(val) => $emit('update:shopApp', val)"
    ></b-app-detail>
  </v-bottom-sheet>
</template>

<script>
import BAppDetail from "../../detail/BAppDetail.vue";

export default {
  name: "BAppConfigDialog",
  components: { BAppDetail },
  emits: ["update:shopApp", "update:modelValue"],
  props: {
    shop: {
      type: Object,
      require: true,
    },

    app: {
      required: true,
      type: Object,
    },
    shopApp: {
      required: false,
      type: Object,
    },
    modelValue: {},
  },
  data: () => ({
    value_local: false,
  }),

  computed: {},
  watch: {
    value_local(val) {
      this.$emit("update:modelValue", val);
      //this.BlurApp(val);
    },

    modelValue(val) {
      this.value_local = val;
    },
  },
  created() {
    this.value_local = this.modelValue;
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped></style>
