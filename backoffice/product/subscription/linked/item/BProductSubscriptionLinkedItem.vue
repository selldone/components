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
  <div class="b-sub-linked-item">
    <div class="b-sub-linked-item__identity">
      <u-avatar-flip
        :size="44"
        :src="getShopImagePath(image_path, IMAGE_SIZE_SMALL)"
        :to="{
          name: 'BPageProductDashboard',
          params: { product_id: item['product_id'] },
        }"
        class="b-sub-linked-item__avatar"
      >
      </u-avatar-flip>
      <div class="b-sub-linked-item__text">
        <div class="b-sub-linked-item__title">
          <span class="b-sub-linked-item__name">{{
            product
              ? product.title
              : $t("b_product_subscription.linked_invalid_product")
          }}</span>
          <img
            v-if="type"
            :src="type.image"
            :title="$t(type.name)"
            :alt="$t(type.name)"
            width="16"
            height="16"
          />
        </div>
        <div class="b-sub-linked-item__meta">
          <span v-if="variant?.sku || product?.sku"
            >{{ $t("global.commons.sku") }}:
            {{ variant?.sku ? variant.sku : product.sku }}</span
          >
          <span v-if="variant?.mpn || product?.mpn"
            >{{ $t("global.commons.mpn") }}:
            {{ variant?.mpn ? variant.mpn : product.mpn }}</span
          >
          <span v-if="!product"
            >ID <b>{{ item["product_id"] }}</b>
            <template v-if="item['variant_id']">
              / <b>{{ item["variant_id"] }}</b></template
            ></span
          >
        </div>
        <product-variants-view
          v-if="variant"
          :variants="[variant]"
          dense
          small
          class="b-sub-linked-item__variant"
        />
      </div>
    </div>

    <u-number-input
      v-model="item.count"
      :min="1"
      :title="$t('b_product_subscription.linked_count')"
      :aria-label="$t('b_product_subscription.linked_count')"
      class="b-sub-linked-item__count"
      dense
      flat
      hide-details
      variant="plain"
    ></u-number-input>

    <v-tooltip
      location="top"
      content-class="sd-modern-tooltip text-start"
      open-on-focus
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          variant="text"
          class="sd-modern-icon-button b-sub-linked-item__remove"
          :aria-label="$t('b_product_subscription.linked_remove')"
          @click="$emit('clear')"
          ><v-icon size="17" aria-hidden="true">close</v-icon></v-btn
        >
      </template>
      {{ $t("b_product_subscription.linked_remove") }}
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import ProductVariantsView from "../../../../../storefront/product/variant/ProductVariantsView.vue";
import UNumberInput from "../../../../../ui/number/input/UNumberInput.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UAvatarFlip from "../../../../../ui/avatar/flip/UAvatarFlip.vue";

export default {
  name: "BProductSubscriptionLinkedItem",
  components: { UAvatarFlip, UNumberInput, ProductVariantsView },
  emits: ["change", "clear"],
  props: {
    item: {
      type: Object,
      required: true,
    },
    productsRepository: { type: Array },
  },

  computed: {
    product() {
      return this.productsRepository?.find(
        (p) => p.id === this.item.product_id,
      );
    },
    variant() {
      return this.product?.product_variants?.find(
        (v) => v.id === this.item.variant_id,
      );
    },

    image_path() {
      return this.variant?.image ? this.variant.image : this.product?.icon;
    },

    type() {
      return this.product && ProductType[this.product.type];
    },
  },

  watch: {
    "item.count"() {
      this.$emit("change");
    },
  },
};
</script>

<style lang="scss" scoped>
.b-sub-linked-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 136px 36px;
  align-items: center;
  gap: 14px;
  min-height: 68px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 20px;
  letter-spacing: 0;

  & + & {
    border-block-start: 1px solid
      var(--sd-modern-border, rgba(var(--v-theme-on-surface), 0.09));
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  &__avatar {
    flex: none;
  }
  &__text {
    min-width: 0;
  }
  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  &__title > img {
    flex: none;
  }
  &__name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 12px;
    margin-block-start: 2px;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 12px;
    line-height: 18px;
  }
  &__variant {
    margin-block-start: 4px;
  }
  &__count {
    min-width: 0;
  }
  &__count :deep(.v-field__input) {
    font-weight: 500;
    text-align: center;
  }
  &__remove {
    width: 36px !important;
    height: 36px !important;
    border-radius: 8px;
    flex: none;
  }
}
@media (max-width: 560px) {
  .b-sub-linked-item {
    grid-template-columns: minmax(0, 1fr) 36px;
    gap: 10px 12px;
    &__count {
      grid-column: 1 / -1;
      max-width: 160px;
    }
    &__remove {
      width: 44px !important;
      height: 44px !important;
    }
  }
}
@media (pointer: coarse) {
  .b-sub-linked-item__remove {
    width: 44px !important;
    height: 44px !important;
  }
}
</style>
