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
  <div class="py-10">
    <div v-for="item in items" :key="item.id" class="widget-box -large mb-5">
      <s-widget-header
        :title="item.product.title"
        :to="{
          name: 'BPageProductDashboard',
          params: { product_id: item.product.id },
        }"
        :add-caption="$t('commons.product_admin')"
        add-icon="open_in_new"
        add-text
        icon="folder_shared"
      ></s-widget-header>

      <v-list-subheader>
        {{$t('order_input.message')}}
      </v-list-subheader>
      <!-- Product Info -->
      <v-list-item>
        <template v-slot:prepend>
          <v-avatar :size="48" rounded>
            <img
              v-if="item.product.icon"
              :src="getShopImagePath(item.product.icon, 128)"
            />
            <v-icon v-else>widgets</v-icon>
          </v-avatar>
        </template>
        <div class="small">
          <div class="ma-1">
            {{ item.product.title_en }}
            <variant-item-view-micro
              v-if="item.variant"
              :product-variant="item.variant"
              class="mx-2 inline-block p-0"
            />
          </div>
          <v-row align="center" justify="start" no-gutters>
            <u-text-value-box
              v-if="item.product.sku"
              class="ma-1 min-width-150"
              label="SKU"
              vb50
            >
              {{ item.product.sku }}
            </u-text-value-box>

            <u-text-value-box
              v-if="item.product.mpn"
              class="ma-1 min-width-150"
              label="MPN"
              vb50
            >
              {{ item.product.mpn }}
            </u-text-value-box>

            <u-text-value-box class="ma-1 min-width-150" label="Count" vb50>
              <b>{{ item.count }}</b>
            </u-text-value-box>
          </v-row>
        </div>
      </v-list-item>

      <basket-item-user-message-form
        :basket="basket"
        :product="item.product"
        :variant-id="item.variant_id"
        class="mt-3"
        color="transparent"
        force-show
        is-admin
        readonly
      ></basket-item-user-message-form>

      <slot :item="item" name="append-item"></slot>
    </div>
  </div>
</template>

<script>
import BasketItemUserMessageForm from "../../../storefront/order/product-input/BasketItemUserMessageForm.vue";
import UTextValueBox from "../../../ui/text/value-box/UTextValueBox.vue";
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";

export default {
  name: "BOrderInput",
  components: {
    VariantItemViewMicro,
    UTextValueBox,
    BasketItemUserMessageForm,
  },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
  },
  data: function () {
    return {};
  },
  computed: {
    items() {
      return this.basket.items.filter(
        (item) =>
          (item.product.inputs && item.product.inputs.length) ||
          (item.product.outputs && item.product.outputs.length),
      );
    },
  },

  watch: {},
  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped></style>
