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
  <div v-if="connect_shipping_options?.length" class="s--shop-connect-shipping-options border-between-vertical">




    <div
      v-for="connect_shipping_option in connect_shipping_options"
      :key="connect_shipping_option.connect_id"
    >

      <v-subheader  class="my-2">

        {{ $t("global.commons.shipping") }}
        <products-dense-images-circles inline raw-images-path :ids="basket.items.filter(i=>i.connect_id===connect_shipping_option.connect_id).map(i=>getShopImagePath(i.variant?.image?i.variant.image:i.product.icon,128))"></products-dense-images-circles>


      </v-subheader>


      <template v-if="connect_shipping_option.error">
        <div class="font-weight-bold d-flex align-center my-3">
          <img
            :src="getConnectIcon(connect_shipping_option.connect_id)"
            width="16"
            height="16"
            class="me-2"
          />
          {{ connect_shipping_option.connect_name }}
        </div>
        <div class="my-1 amber--text">
          <v-icon color="amber" class="me-1" small>warning_amber</v-icon>
          {{ connect_shipping_option.error }}
        </div>
      </template>

      <template v-else-if="connect_shipping_option.options?.length">
        <v-smart-select
          :value="
            findSelectedConnectShipping(connect_shipping_option)?.shipping_id
          "
          :dark="dark"
          :items="connect_shipping_option.options"
          item-description="message"
          item-text="name"
          item-value="id"
          @input="(val) => selectOption(connect_shipping_option, val)"
          force-show-all
          :background-color="dark?SaminColorDark:'#fafafa'"
class="my-3"
        >
          <template v-slot:prepend-title="{ item }">
            <price-view
              :amount="item.rate"
              :currency="item.currency"
            ></price-view>
            <span class="mx-2">|</span>
          </template>
        </v-smart-select>
      </template>
    </div>
  </div>
</template>

<script>
import VSmartSelect from "@/Components/smart/VSmartSelect.vue";
import ProductsDenseImagesCircles
  from "@/Components/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";

export default {
  name: "SShopConnectShippingOptions",
  components: {ProductsDenseImagesCircles, VSmartSelect },
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

    init(){
      // Create clone:
      this.connect_shippings = Object.assign(
          [],
          this.basket.delivery_info?.connect_shippings
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
        (x) => x.connect_id === connect_shipping_option.connect_id
      );
    },
  },
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-connect-shipping-options{

}
</style>
