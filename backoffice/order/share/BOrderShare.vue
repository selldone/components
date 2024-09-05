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

<template>
  <div v-if="order_link" class="widget-box -large">
    <s-widget-header title="Order Link" icon="shopping_bag"></s-widget-header>
    <v-list-subheader>
      You can share the order link with the customer.

      <span v-if="has_guest_checkout">
        Guest shoppers can automatically view their order in the same browser.
        However, if the customer is a guest and you need to share the order
        details, you can create a secure link for them.</span
      >
    </v-list-subheader>

    <u-text-copy-box
      v-if="order_link"
      :value="order_link"
      message="Customer Order URL"
      small-width-mode
    >
      <template v-slot:append-message>
        <v-chip size="x-small" color="#673AB7" label variant="flat" class="mx-2"
          >Authentication
        </v-chip>
      </template>
    </u-text-copy-box>

    <div v-if="has_guest_checkout" class="position-relative">
      <u-text-copy-box
        :value="secure_link"
        message="Secure Order URL"
        small-width-mode
      >
        <template v-slot:append-message>
          <v-chip
            size="x-small"
            color="#C2185B"
            label
            variant="flat"
            class="mx-2"
            >Guest
          </v-chip>
        </template>
      </u-text-copy-box>
      <div
        v-if="!secure_link"
        style="
          position: absolute;
          left: 8px;
          right: 8px;
          top: 4px;
          bottom: 4px;
          backdrop-filter: blur(8px);
          background-color: #ffffff33;
          border-radius: 18px;
        "
        class="d-flex align-center justify-center text-black pp flex-column"
        @click="createSecureLink"
      >
        Click to create... <small>[valid for 30 days]</small>

        <u-loading-progress
          v-if="busy_secure_link"
          color="blue"
        ></u-loading-progress>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import { ShopOptionsHelper, ShopURLs } from "@selldone/core-js/helper";
import { Product } from "@selldone/core-js/models";
import ProductType = Product.ProductType;

export default defineComponent({
  name: "BOrderShare",
  components: { ULoadingProgress, UTextCopyBox },
  inject: ["$shop"],
  props: {
    basket: { type: Object, required: true },
  },
  data: () => ({
    secure_link: null,
    busy_secure_link: false,
  }),

  computed: {
    has_guest_checkout() {
      return ShopOptionsHelper.HasGuestCheckout(this.$shop);
    },

    order_link() {
      if (this.basket.type === ProductType.PHYSICAL) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/physical/SM-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.VIRTUAL) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/virtual/SV-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.FILE) {
        return (
          ShopURLs.MainShopUrl(this.$shop) + `/orders/file/SF-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.SERVICE) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/service/SS-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.SUBSCRIPTION) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/subscription/SN-${this.basket.id}`
        );
      } else if (this.basket.type === "POS") {
        return (
          ShopURLs.MainShopUrl(this.$shop) + `/orders/pos/POS-${this.basket.id}`
        );
      }

      return null;
    },
  },
  methods: {
    createSecureLink() {
      this.busy_secure_link = true;

      axios
        .post(
          this.basket.type === "POS"
            ? window.API.POST_POS_BASKET_CREATE_SECURE_LINK(
                this.$shop.id,
                this.basket.id,
              )
            : window.API.POST_BASKET_CREATE_SECURE_LINK(
                this.$shop.id,
                this.basket.id,
              ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.secure_link = data.url;
            this.showSuccessAlert(
              null,
              "Secure link has been created successfully.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_secure_link = null;
        });
    },
  },
});
</script>

<style scoped lang="scss"></style>
