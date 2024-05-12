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

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BDashboardShopLicenseBar",
  props: {
    shop: {
      type: Object,
      required: true,
    },
  },
  computed: {
    license() {
      return this.getShopLicenseObject(this.shop.license);
    },
  },
});
</script>

<template>
  <div class="s--shop-license-bar px-4 py-1 no-inv" dir="ltr">
    <span class="pen"
      ><b>Business</b>
      <span class="bg-strong-bliss text-gradient mx-1">OS</span> |</span
    >
    <router-link
      :to="{ name: 'BPageShopSettingLicense' }"
      class="text-white z1"
      title="Go to license management."
    >
      <img :src="license.icon" class="mx-1" height="16" width="16" />
      {{ $t(license.name) }}
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-license-bar {
  position: absolute;
  top: 52px;
  left: -12px;
  font-size: 80%;
  background-image: linear-gradient(
    90deg,
    var(--theme-deep-dark) 0%,
    var(--theme-dark) 100%
  );
  border-radius: 0 8px 8px 0;
  color: #fff;
}
</style>
