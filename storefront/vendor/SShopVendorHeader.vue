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
  <!-- Show Vendor Info -->
  <v-expand-transition>
    <div v-if="vendor">
      <div class="s--vendor-view d-flex align-center text-start pa-3">
        <v-avatar class="me-2 flex-grow-0">
          <img
            v-if="vendor.icon"
            :alt="vendor.name"
            :src="getShopImagePath(vendor.icon, 64)"
          />
          <v-icon v-else>storefront</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <b class="d-block">{{ vendor.name }}</b>
          <div>
            {{ vendor.description }}
          </div>
        </div>
      </div>
    </div>
  </v-expand-transition>
</template>

<script>
export default {
  name: "SShopVendorHeader",
  inject: ["$shop"],
  props: {
    vendorId: {},
  },
  components: {},
  data: () => ({
    vendor: null, // Show vendor info if this page is for vendor!
  }),

  computed: {},
  watch: {
    vendorId() {
      this.fetchVendorInfo();
    },
  },
  created() {
    this.fetchVendorInfo();
  },
  methods: {
    fetchVendorInfo() {
      this.vendor = null;
      if (!this.vendorId) return;

      this.busy = true;

      window.$storefront.vendor
        .getVendor(this.vendorId)
        .then(({ vendor }) => {
          this.vendor = vendor;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--vendor-view {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--vendor-view {
}
</style>
