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
import { ShopLicense } from "@selldone/core-js/enums/shop/ShopLicense.ts";

export default defineComponent({
  name: "BDashboardShopLicenseBar",
  props: {
    modern: Boolean,
    shop: {
      type: Object,
      required: true,
    },
  },
  computed: {
    license() {
      return ShopLicense[this.shop.license];
    },
  },
});
</script>

<template>
  <div
    class="s--shop-license-bar no-inv"
    :class="modern ? 's--shop-license-bar--modern' : 'px-4 py-1 elevation-3'"
    dir="ltr"
  >
    <span class="pen"
      ><b>Business</b>
      <span class="bg-strong-bliss text-gradient mx-1">OS</span> |</span
    >
    <router-link
      :to="{ name: 'BPageShopSettingLicense' }"
      :class="modern ? 's--shop-license-bar__link' : 'text-white z1'"
    >
      <img :src="license.icon" class="mx-1" height="16" width="16" />
      {{ $t(license.name) }}
      <v-tooltip
        activator="parent"
        :open-on-focus="true"
        location="bottom"
        content-class="sd-modern-tooltip text-start"
        >{{ $t("admin_shop.dashboard.modern.manage_license") }}</v-tooltip
      >
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
    var(--theme-deep-dark) 30%,
    var(--theme-dark) 100%
  );
  border-radius: 0 8px 8px 0;
  color: #fff;

  &--modern {
    position: static;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border-radius: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;

    > .pen {
      display: none;
    }
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: inherit;
    text-decoration: none;
  }
}
</style>
