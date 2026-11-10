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
  <div class="b-category-add-header text-start">
    <v-toolbar class="b-category-add-header__toolbar" color="surface" flat>
      <v-btn
        class="sd-modern-button sd-modern-button--inline"
        variant="text"
        @click="$emit('back')"
      >
        <v-icon start aria-hidden="true">{{ $t("icons.arrow_back") }}</v-icon>
        {{ $t("add_category.menu.back") }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="category"
        :href="`${ShopURLs.MainShopUrl(shop)}/${category.name}-category`"
        class="sd-modern-button sd-modern-button--inline b-category-add-header__public"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
      >
        <v-avatar
          v-if="category.icon"
          class="me-2 avatar-gradient -thin -category"
          size="28"
        >
          <v-img :src="getShopImagePath(category.icon, 64)"></v-img>
        </v-avatar>

        {{ $t("add_category.modern.open_category") }}
        <v-icon end aria-hidden="true">north_east</v-icon>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script lang="ts">
import { ShopURLs } from "@selldone/core-js/helper";

export default {
  name: "BCategoryAddHeader",
  components: {},
  emits: ["back"],
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
  },

  data: () => ({}),
  computed: {
    ShopURLs() {
      return ShopURLs;
    },
  },
  watch: {},
  created() {},
  mounted() {},

  methods: {},
};
</script>

<style scoped lang="scss">
.b-category-add-header {
  flex: 0 0 auto;

  &__toolbar {
    padding-inline: 14px;
  }
  &__public {
    max-width: calc(100% - 100px);
  }

  @media (max-width: 660px) {
    &__toolbar {
      padding-inline: 2px;
    }
    &__public {
      font-size: 12px;
    }
  }
}
</style>
