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
  <v-btn
    v-if="admin_url"
    :href="admin_url"
    class="tnt fadeIn"
    target="_blank"
    title="Open product admin panel"
  >
    <img
      class="me-1"
      height="16"
      src="@selldone/components-vue/assets/selldone-logo/logo-mini-white.svg"
      width="16"
      alt="Selldone"
    />
    Product Admin
    <v-icon class="mx-1" size="small">open_in_new</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SetupService } from "@selldone/core-js/server";

export default defineComponent({
  name: "SProductAdminButton",
  inject: ["$shop", "$product"],
  computed: {
    admin_url() {
      if (!this.$product) return null;
      const can_edit = this.$product?.article_pack?.can_edit;

      return (
        this.USER() &&
        (this.USER_ID() === this.$shop.user_id || can_edit) &&
        SetupService.MainServiceUrl() +
          `/shuttle/shop/${this.$shop.id}/product/${this.$product.id}`
      );
    },
  },
});
</script>

<style scoped lang="scss"></style>
