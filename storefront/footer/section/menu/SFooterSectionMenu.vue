<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-row v-if="menu_footer">
    <v-col
      v-for="index in 4"
      :key="index"
      class="menu-footer"
      cols="6"
      lg="3"
      md="3"
      sm="3"
    >
      <router-link
        v-for="(item, i) in menu[index - 1]"
        :key="i"
        :to="item.to"
        :href="item.href"
        class="menu-item pp"
        :target="item.target"
        :role="!item.href?'button':undefined"
      >
        {{ item.name }}
        <v-icon v-if="item.target === '_blank'" size="x-small" class="ms-1">launch</v-icon>
      </router-link>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { ShopFooterHelper } from "@selldone/components-vue/storefront/footer/ShopFooterHelper.ts";

export default defineComponent({
  name: "SFooterSectionMenu",
  components: {},
  inject: ["$shop"],
  data: () => ({}),
  computed: {
    menu_footer() {
      return this.$shop.menus.find((it) => it.type === "FOOTER");
    },

    menu() {
      return ShopFooterHelper.GetMenuItems(this.menu_footer, this.$router);
    },
  },
});
</script>

<style scoped lang="scss">
.menu-footer {
  line-height: 1.9rem;
  padding-bottom: 8px;
  padding-top: 8px;

  .menu-item {
    display: block;
    transition: all 0.45s;
    padding: 3px 8px;

    color: var(--color-link);
    //  font-size: 0.8rem;

    &:hover {
      background-color: var(--color-hover-bg);
      border-radius: 8px;
      font-size: 1.25rem;
    }
  }
}
</style>
