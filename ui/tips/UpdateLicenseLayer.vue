<template>
  <div
    class="overlay-block clickable --red text-uppercase"
    :class="{ 'fill-h': fillH }"
    :title="$t('global.notification.update_license')"
    @click.stop="$router.push({ name: 'ShopEdit_License' })"
  ></div>
</template>

<script>
export default {
  name: "UpdateLicenseLayer",
  props: {
    fillH: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
