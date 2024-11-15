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
    v-if="product?.external && service"
    :color="action_color"
    class="s--product-external-button"
    min-width="220"
    rounded
    :href="product.external"
    target="_blank"
    size="x-large"
    variant="flat"
  >
    <img
      v-if="action_image"
      class="me-3"
      :src="action_image"
      height="20"
      width="auto"
      :alt="`${action_text} Logo`"

    />
    {{ action_text }}
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ProductExternal } from "@selldone/components-vue/storefront/product/external/button/ProductExternal.ts";

export default defineComponent({
  name: "SProductExternalButton",
  props: {
    product: {
      required: true,
      type: Object,
    },
  },
  computed: {
    service() {
      return ProductExternal.getServiceData(this.product.external);
    },
    action_image() {
      return this.service?.image;
    },
    action_text() {
      return this.$t(this.service?.actionText);
    },
    action_color() {
      return this.service?.color;
    },
  },
});
</script>

<style scoped lang="scss">
.s--product-external-button {
}
</style>
