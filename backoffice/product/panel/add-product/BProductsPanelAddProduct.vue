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
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card color="#FFF">
      <v-card-title>
        <v-row no-gutters>
          <div class="body-title">
            <span class="text-primary pp" @click="close">
              <template v-if="category">
                <v-avatar class="me-1" size="18">
                  <v-img :src="getShopImagePath(category.icon, 64)" />
                </v-avatar>
                <span>{{ category.title }}</span>
              </template>
              <template v-else>
                <v-icon class="me-1" color="primary" size="small"
                  >view_module
                </v-icon>
                <span>{{ $t("admin_shop.products.title") }}</span>
              </template>
            </span>

            <v-icon class="mx-1" size="small"
              >{{ $t("icons.angle_next") }}
            </v-icon>

            <span>{{ $t("add_product.title_new") }}</span>
          </div>

          <v-spacer />
        </v-row>
      </v-card-title>
      <b-product-add-full
        :shop="$shop"
        :vendor="$vendor"
        @add="
          (p) => {
            $emit('add', p);
          }
        "
      >
      </b-product-add-full>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="close">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            v-if="new_product?.id"
            size="x-large"
            variant="text"
            :to="{
              name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? 'Vendor_ProductDashboard'
                : 'BPageProductDashboard',
              params: { product_id: new_product.id },
            }"
            prepend-icon="done_all"
          >
            {{ $t("global.actions.finish") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
/**
 * <b-products-panel-add-product>
 */
import { computed, defineComponent } from "vue";
import BProductAddFull from "@selldone/components-vue/backoffice/product/add/full/BProductAddFull.vue";
import { Product } from "@selldone/core-js";
import ProductCondition = Product.ProductCondition;

export default defineComponent({
  name: "BProductsPanelAddProduct",
  components: { BProductAddFull },
  inject: {
    $shop: { from: "$shop" },
    $vendor: { from: "$vendor", default: null }, // Provide default as `null` if undefined
  },
  emits: ["update:modelValue", "add"],

  /**
   * Simulate new product
   */

  provide() {
    return {
      $product: computed(() => this.new_product),
    };
  },

  props: {
    modelValue: Boolean,
    category: Object,
  },
  data: () => ({
    new_product: {
      status: "Open",
      condition: ProductCondition.NEW,
      original: true,
    },
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.new_product = {
          status: "Open",
          condition: ProductCondition.NEW,
          original: true,
        };
      }
    },
  },

  methods: {
    close() {
      this.$emit("update:modelValue", false);
    },
  },
});
</script>

<style scoped lang="scss"></style>
