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
  <v-card color="transparent" flat>
    <v-card-text>
      <h2 class="mb-2">Shopify Migration</h2>
      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.migration.shopify.msg") }}
        </p>

        <v-img
          :src="
            require('../../onboarding/assets/shopify.png')
          "
          class="m-2 imgi"
          contain
        ></v-img>
      </div>
      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopChannelConnect', add: true }"
          color="#000"
          dark
          exact
          size="x-large"
        >
          Free migration from shopify

          <img
            class="mx-1"
            height="24"
            src="../assets/shopify.png"
            width="24"
          />
          <v-icon class="me-1" size="small">sync_alt</v-icon>
          <img
            class="mx-1"
            height="24"
            src="../../../assets/selldone-logo/selldone-w.svg"
            width="24"
          />
        </v-btn>
      </div>

      <hr />

      <h2 class="mt-5 mb-2">Woocommerce Migration</h2>
      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.migration.woocommerce.msg") }}
        </p>
        <v-img
          :src="
            require('../../onboarding/assets/woocommerce.svg')
          "
          class="m-2 imgi"
          contain
        ></v-img>
      </div>

      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopChannelConnect', add: true }"
          color="#000"
          dark
          exact
          size="x-large"
        >
          Free migration from woocommerce

          <img
            class="mx-1"
            height="24"
            src="../assets/woocommerce.svg"
            width="24"
          />
          <v-icon class="me-1" size="small">sync_alt</v-icon>
          <img
            class="mx-1"
            height="24"
            src="../../../assets/selldone-logo/selldone-w.svg"
            width="24"
          />
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "ShopOnboardingMigrationTab",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {},

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped></style>
