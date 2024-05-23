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
  <div
    v-if="connect_shipping_options?.length"
    class="s--shop-connect-shipping-options border-between-vertical"
  >
    <div
      v-for="connect_shipping_option in connect_shipping_options"
      :key="connect_shipping_option.connect_id"
    >
      <div class="d-flex align-center my-2">
        <small>{{ $t("global.commons.shipping") }}</small>
        <products-dense-images-circles
          :ids="
            basket.items
              .filter(
                (i) => i.connect_id === connect_shipping_option.connect_id,
              )
              .map((i) =>
                getShopImagePath(
                  i.variant?.image ? i.variant.image : i.product.icon,
                  128,
                ),
              )
          "
          inline
          raw-images-path
        ></products-dense-images-circles>
      </div>

      <template v-if="connect_shipping_option.error">
        <div class="font-weight-bold d-flex align-center my-3">
          <img
            :src="getConnectIcon(connect_shipping_option.connect_id)"
            class="me-2"
            height="16"
            width="16"
          />
          {{ connect_shipping_option.connect_name }}
        </div>
        <div class="my-1 text-amber">
          <v-icon class="me-1" color="amber" size="small">warning_amber</v-icon>
          {{ connect_shipping_option.error }}
        </div>
      </template>

      <template v-else-if="connect_shipping_option.options?.length">
        <u-smart-select
          :background-color="dark ? SaminColorDark : '#fafafa'"
          :dark="dark"
          :items="connect_shipping_option.options"
          :model-value="
            findSelectedConnectShipping(connect_shipping_option)?.shipping_id
          "
          class="my-3"
          force-show-all
          item-description="message"
          item-text="name"
          item-value="id"
          @update:model-value="
            (val) => selectOption(connect_shipping_option, val)
          "
        >
          <template v-slot:prepend-title="{ item }">
            <u-price :amount="item.rate" :currency="item.currency"></u-price>
            <span class="mx-2">|</span>
          </template>
        </u-smart-select>
      </template>
    </div>
  </div>
</template>

<script>
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";

export default {
  name: "SShopConnectShippingOptions",
  components: { ProductsDenseImagesCircles, USmartSelect },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    basket: {
      required: true,
      type: Object,
    },

    dark: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    connect_shippings: null,
  }),

  watch: {
    /* bill(){
      this.init();
    }*/
  },

  computed: {
    bill() {
      return this.basket?.bill;
    },
    connect_shipping_options() {
      return this.bill?.connect_shipping_options;
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      // Create clone:
      this.connect_shippings = Object.assign(
        [],
        this.basket.delivery_info?.connect_shippings,
      );

      if (!this.connect_shippings || !Array.isArray(this.connect_shippings)) {
        this.connect_shippings = [];
      }
    },

    selectOption(connect_shipping_option, shipping_id) {
      const found = this.findSelectedConnectShipping(connect_shipping_option);
      if (found) {
        found.shipping_id = shipping_id;
      } else {
        this.connect_shippings.push({
          connect_id: connect_shipping_option.connect_id,
          shipping_id: shipping_id,
        });
      }
      // console.log('connect_shippings',this.connect_shippings,this.basket.delivery_info.connect_shippings)
      this.$emit("change", this.connect_shippings);
    },

    findSelectedConnectShipping(connect_shipping_option) {
      return this.connect_shippings?.find(
        (x) => x.connect_id === connect_shipping_option.connect_id,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-connect-shipping-options {
}
</style>
