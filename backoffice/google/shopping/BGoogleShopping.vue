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
  <div class="widget-box ">
    <s-widget-header
      :src="require('../../../assets/trademark/google-shopping.png')"
      title="Google Shopping"
    >
    </s-widget-header>

    <v-list-subheader>
      Data Sources indicate the origins of your catalog information on Google.
      Follow this link to automatically add all products and categories to
      Google merchandise.
    </v-list-subheader>

    <v-row align="center" class="mb-2" justify="start" no-gutters>
      <div class="pod">
        <v-icon>storefront</v-icon>
        <small class="d-block">{{ shop.title }}</small>
      </div>

      <div class="flex-grow-1 sph">
        <span class="dot -reverse"></span>
      </div>
      <div class="pod">
        <div>
          <img
            class="m-1"
            height="20"
            src="../../../assets/trademark/google.svg"
            width="20"
          />
        </div>
      </div>
    </v-row>

    <v-list-subheader>
      You can utilize this tool to effortlessly and automatically manage Google
      ads.
    </v-list-subheader>

    <u-text-copy-box
      :image="require('../../../assets/icons/link.svg')"
      :value="google_products_feed"
      message="Google Products Feed URL"
      small-width-mode
    >
    </u-text-copy-box>
  </div>
</template>

<script>
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";

export default {
  name: "BGoogleShopping",
  components: {
    UTextCopyBox,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({}),
  computed: {
    google_products_feed() {
      return `${this.getShopMainUrl(this.shop)}/rss/google`;
    },

  },

  watch: {},

  created() {

  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>
