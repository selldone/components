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
