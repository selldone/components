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
  <router-link
    :to="{ name: 'ShopEdit_License' }"
    class="font-weight-bold inline-block"
    :class="{ 'text-success': shop.license !== 'FREE', small: small ,'pen':viewOnly}"
    :title="$t('admin_shop.dashboard.info.license')"
  >
    <img
      :width="small ? 20 : vertical ? 46 : 24"
      :height="small ? 20 : vertical ? 46 : 24"
      :src="getShopLicenseIcon(shop.license)"
      :class="vertical ? 'mb-1' : 'me-1'"
    />
    <br v-if="vertical" />
    {{ getShopLicenseName(shop.license) }}
    {{ getShopLicenseObject(shop.license)?.wage_percent }}%
  </router-link>
</template>

<script>
export default {
  name: "ShopLicenseView",
  props: {
    shop: { require: true, type: Object },
    vertical: {
      default: false,
      type: Boolean,
    },
    small: {
      default: false,
      type: Boolean,
    },
    viewOnly: {
      default: false,
      type: Boolean,
    },
  },
};
</script>

<style scoped></style>
