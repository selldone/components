<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div v-if="importing || images_que" class="widget-box mb-5">
    <p class="font-weight-black mt-2 text-uppercase">
      <i class="fas fa-cog fa-spin me-1"></i>
      {{ $t("product_import_processing.title") }}
    </p>
    <u-loading-progress color="blue" stream></u-loading-progress>

    <v-list-subheader>
      {{ $t("product_import_processing.message") }}
    </v-list-subheader>

    <div class="widget-buttons">
      <v-btn
        v-if="importing"
        :to="{
          name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? 'VendorProductsImportQuePage'
            : 'BPageShopProductsProductsQue',
        }"
        size="x-large"
        variant="flat"
      >
        <v-icon class="me-2">fa:fas fa-box</v-icon>
        <div class="d-flex flex-column">
          <div class="small">{{ $t("admin_shop.products.view_que_list") }}</div>
          <div>
            {{ $t("global.commons.products") }} | <b>{{ importing }}</b>
          </div>
        </div>
      </v-btn>
      <v-btn
        v-if="images_que"
        :to="{
          name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? 'VendorProductsImageImportQuePage'
            : 'BPageShopProductsImagesQue',
        }"
        size="x-large"
        variant="flat"
      >
        <v-icon class="me-2">fa:fas fa-image</v-icon>
        <div class="d-flex flex-column">
          <div class="small">{{ $t("admin_shop.products.view_que_list") }}</div>
          <div>
            {{ $t("global.commons.images") }} | <b>{{ images_que }}</b>
          </div>
        </div>
      </v-btn>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: "BShopProductsImportProcessing",

  props: {
    shop: {
      required: true,
    },
  },
  data: () => ({
    busy: false,
    interval: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    importing() {
      return this.shop.importing;
    },
    images_que() {
      return this.shop["images-que"];
    },
  },

  mounted() {
    this.fetchImportingInfo();
    this.interval = setInterval(() => {
      this.fetchImportingInfo();
    }, 30 * 1000);
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    fetchImportingInfo() {
      if (this.busy) return;
      this.busy = true;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.importer.info(this.$route.params.vendor_id)
        : window.$backoffice.product.importer.info(this.shop.id)
      )
        .then((data) => {
          this.shop.importing = data.importing;
          this.shop["images-que"] = data["images-que"];

          if (this.interval && !data.importing && !data["images-que"]) {
            // No new importing!
            clearInterval(this.interval);
          }
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

<style lang="scss" scoped></style>
