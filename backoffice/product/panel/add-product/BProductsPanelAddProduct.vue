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
    :theme="dialogTheme"
    transition="dialog-bottom-transition"
    close-on-back
  >
    <v-card
      :color="modern ? undefined : '#FFF'"
      :class="{ 'b-products-panel-add-product--modern sd-modern-canvas text-start': modern }"
    >
      <v-card-title v-if="modern" class="b-products-panel-add-product__header">
        <div class="b-products-panel-add-product__header-inner">
          <v-icon class="b-products-panel-add-product__purpose" size="24" aria-hidden="true">add_box</v-icon>
          <div class="b-products-panel-add-product__title">
            <h1>{{ $t('add_product.title_new') }}</h1>
            <p>{{ $t('add_product.flow.subtitle') }}</p>
          </div>
          <v-tooltip location="top" content-class="sd-modern-tooltip">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon="close" :aria-label="$t('global.actions.close')" @click="close" />
            </template>
            {{ $t('global.actions.close') }}
          </v-tooltip>
        </div>
      </v-card-title>
      <v-card-title v-else>
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
        v-if="!modern || modelValue"
        :modern="modern"
        :shop="$shop"
        :vendor="$vendor"
        @add="
          (p) => {
            $emit('add', p);
          }
        "
        @delete="()=>{
           //close dialog
           $emit('update:modelValue', false)
        }"
      >
      </b-product-add-full>

      <v-card-actions v-if="!modern">
        <div class="widget-buttons">
          <v-btn
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            variant="text"
            @click="close"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            v-if="new_product?.id"
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
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
    modern: { type: Boolean, default: false },
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
    dialogTheme() {
      // Fullscreen content is outside Shuttle's Smart invert window.
      return this.modern && this.USER()?.preferences?.dark ? 'dark' : undefined;
    },
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

<style scoped lang="scss">
.b-products-panel-add-product--modern {
  color: rgb(var(--v-theme-on-surface));

  .b-products-panel-add-product__header {
    flex: 0 0 auto;
    padding: 22px 24px 20px;
    background: rgb(var(--v-theme-surface));
    border-block-end: 1px solid var(--sd-modern-border);
    white-space: normal;
  }

  .b-products-panel-add-product__header-inner {
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: 1040px;
    margin-inline: auto;
  }

  .b-products-panel-add-product__purpose { flex: 0 0 40px; color: var(--sd-modern-muted); }
  .b-products-panel-add-product__title {
    flex: 1;
    min-width: 0;
    h1 { margin: 0; font-family: inherit; font-size: 22px; font-weight: 500; line-height: 30px; letter-spacing: -0.4px; }
    p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; font-weight: 400; line-height: 20px; }
  }

  @media (max-width: 620px) {
    .b-products-panel-add-product__header { padding: 20px 18px; }
    .b-products-panel-add-product__header-inner { gap: 8px; }
    .b-products-panel-add-product__purpose { flex-basis: 28px; }
    .b-products-panel-add-product__title h1 { font-size: 20px; }
  }
}
</style>
