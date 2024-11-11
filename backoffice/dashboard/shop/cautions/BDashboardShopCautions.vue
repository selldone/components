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
  <div v-if="cautions?.length" class="s--shop-dashboard-cations">
    <p class="mb-1 small text-muted">
      <v-icon class="me-1">arrow_drop_down</v-icon>
      <b>{{ $t("global.commons.tips") }}: </b>
      {{ $t("cautions.title") }}
    </p>
    <b-alert-cation
      v-for="(cation, index) in cautions"
      :key="index"
      :cation="cation"
      :shop="shop"
      class="mb-2"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BAlertCation from "../../../alert/cation/BAlertCation.vue";
import { ShopCautionHelper } from "@selldone/core-js/helper/shop/ShopCautionHelper";

export default defineComponent({
  name: "BDashboardShopCautions",
  components: { BAlertCation },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  computed: {
    cautions() {
      const cautions = ShopCautionHelper.Generate(this.shop);
      return cautions?.limit(3); // Limit the number of cautions to 3
    },
  },
});
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-dashboard-cations {
  text-align: start;
}
</style>
