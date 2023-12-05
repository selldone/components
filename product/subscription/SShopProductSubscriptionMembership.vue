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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    v-show="isMembershipSubscription"
    class="s-shop-product-subscription-membership"
  >
    <v-container class="my-16 position-relative">
      <s-expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="40vh"
      >
        <s-shop-product-membership-content-viewer
          v-if="membership_subscribed_plan"
          class="min-height-60vh"
          :product="product"
        ></s-shop-product-membership-content-viewer>
        <div
          v-else
          class="min-height-40vh d-flex pa-2 align-center justify-center flex-column"
        >
          <v-icon x-large color="#111">lock</v-icon>
          <div class="display-2 font-weight-light my-2">Locked content!</div>
          <div>
            After subscribing, you will have access to the contents here.
          </div>
        </div>
      </s-expand-view>
    </v-container>
  </div>
</template>

<script>
import SExpandView from "@components/ui/expand-view/SExpandView.vue";
import SShopProductMembershipContentViewer from "@components/product/subscription/SShopProductMembershipContentViewer.vue";
import { SubscriptionMode } from "@core/enums/subscription/SubscriptionMode";
import { RibbonHelper } from "@core/helper/ribbon/RibbonHelper";

export default {
  name: "SShopProductSubscriptionMembership",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    SShopProductMembershipContentViewer,
    SExpandView,
  },

  data: function () {
    return {};
  },

  computed: {
    // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀▀▀▀▀▀

    isMembershipSubscription() {
      return this.product?.ribbon?.mode === SubscriptionMode.Membership.code;
    },

    // 🦄 Membership > Subscribed
    membership_subscribed_plan() {
      return RibbonHelper.isMembershipSubscribed(this.product);
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s-shop-product-subscription-membership {
}
</style>
