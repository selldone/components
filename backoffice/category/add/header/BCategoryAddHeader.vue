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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-toolbar color="#fff" flat>
    <v-btn size="x-large" variant="text" @click="$emit('back')">
      <v-icon class="me-1">{{ $t("icons.arrow_back") }}</v-icon>
      {{ $t("add_category.menu.back") }}
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn
      v-if="category"
      :href="`${getShopMainUrl(shop)}/${category.name}-category`"
      class="tnt"
      rounded
      size="x-large"
      target="_blank"
      variant="text"
    >
      <v-avatar
        v-if="category.icon"
        class="me-2 ms-n3 avatar-gradient -thin -category"
        size="36"
      >
        <v-img :src="getShopImagePath(category.icon, 64)"></v-img>
      </v-avatar>

      Open Category Page
      <v-icon class="ms-1">open_in_new</v-icon>
    </v-btn>
  </v-toolbar>

  <div v-if="category" class="max-w-640 mx-auto mt-5">
    <v-btn-toggle
      :model-value="tab"
      class="widget-toggle mx-0"
      mandatory
      rounded
      selected-class="blue-flat"
      @update:model-value="(v) => $emit('update:tab', v)"
    >
      <v-btn value="setting">
        <v-icon class="me-1">settings</v-icon>
        {{ $t("add_category.menu.settings") }}
      </v-btn>

      <v-btn value="filter">
        <v-icon class="me-1">filter_alt</v-icon>
        {{ $t("add_category.menu.filter") }}
      </v-btn>

      <v-btn value="template">
        <v-icon class="me-1">architecture</v-icon>
        {{ $t("global.commons.template") }}
      </v-btn>

      <v-btn value="engine">
        <v-icon class="me-1">auto_mode</v-icon>
        {{ $t("global.commons.engine") }}
      </v-btn>

      <v-btn value="critical">
        <v-icon class="me-1">warning_amber</v-icon>
        {{ $t("global.commons.critical_zone") }}
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script lang="ts">
export default {
  name: "BCategoryAddHeader",
  components: {},
  emits: ["back", "update:tab"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    category: {
      required: false,
      type: Object,
    },

    tab: {
      default: "setting",
    },
  },

  data: () => ({}),
  computed: {},
  watch: {},
  created() {},
  mounted() {},

  methods: {},
};
</script>

<style scoped></style>
