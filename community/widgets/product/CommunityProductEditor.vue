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
  <div>
    <v-text-field
      v-model="product_url"
      append-inner-icon="local_mall"
      class="z2 position-relative mx-4 english-field"
      clearable
      messages="Only show in this community"
      placeholder="Past product id / url... + Press enter"
      variant="solo"
      @blur="process(product_url)"
      @keydown.enter="process(product_url)"
    ></v-text-field>

    <div class="text-muted text-center">
      {{ $t("global.commons.or") }}
    </div>

    <div class="widget-buttons mb-3">
      <v-btn
        color="primary"
        dark
        size="x-large"
        variant="flat"
        @click="showQRScanner"
      >
        <v-icon class="me-1">qr_code_scanner</v-icon>
        {{ $t("global.commons.scan_qr_code") }}
      </v-btn>
    </div>

    <!-- ---------------- Product Info ---------------- -->
    <community-product-view
      :community="community"
      :product-id="product_id"
      :shop="shop"
      class="fadeIn"
    >
    </community-product-view>

    <!-- ████████████████ Dialog > Scan ████████████████ -->
    <v-dialog
      v-model="show_scanner"
      content-class="no-shadow-dialog"
      max-width="680"
    >
      <v-card class="rounded-28px">
        <v-card-title>
          <v-icon class="me-1">qr_code_scanner</v-icon>
          {{ $t("global.commons.barcode_scanner") }}
        </v-card-title>
        <v-card-text v-if="show_scanner">
          <barcode-scanner qr-code @on-scan="onScan"></barcode-scanner>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="show_scanner = false">
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CommunityProductView from "./CommunityProductView.vue";

export default {
  name: "CommunityProductEditor",
  components: { CommunityProductView },
  props: {
    shop: {
      require: true,
      type: Object,
    },

    community: {
      require: true,
      type: Object,
    },

    value: {},
  },

  data: () => ({
    //-------------------

    product: null,
    spec_array: null,

    // ---------------------------
    show_scanner: false,
    model: null,

    // ---------------------------
    product_id: null,

    product_url: null,
  }),

  watch: {
    product_id(val) {
      this.$emit("input", val);
    },
  },

  computed: {},

  created() {
    this.product_id = this.value;
    this.product_url = this.value;
  },

  methods: {
    process(text) {
      this.product_id = null;

      if (!text) return;

      let product_id = null;

      if (text.includes("product/")) {
        product_id = text.substring(text.indexOf("product/") + 8, text.length);
        const len = product_id.indexOf("-");

        if (len > 0) {
          product_id = product_id.substring(0, product_id.indexOf("-"));
        }
      } else if (!isNaN(text)) {
        product_id = parseInt(text);
      }

      // console.log(text,"Product ID", product_id);

      this.product_id = product_id;
    },

    showQRScanner() {
      this.show_scanner = true;
    },
    onScan(result) {
      if (!result || !result.includes("product/")) return; // Invalid url!

      this.process(result);

      this.show_scanner = false;
    },

    //------------------------------------------------------------------
  },
};
</script>

<style scoped></style>
