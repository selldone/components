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
  <v-btn
    :color="modern ? undefined : modelValue ? '#222' : '#aaa'"
    :variant="modern ? 'outlined' : modelValue ? 'elevated' : 'outlined'"
    :class="modern ? ['b-inventory-option', { '-selected': modelValue }] : 'm-1 tnt'"
    :disabled="disabled"
    :aria-pressed="!!modelValue"
    @click="
      () => {
        $emit('update:modelValue', !modelValue);
      }
    "
    :min-height="modern ? 74 : 52"
    :style="{ order: GetVariantOrderIndexByCode(variantCode, product) }"
  >
    <v-icon start :size="modern ? 20 : undefined">
      {{ GetVariantIconByCode(variantCode, product) }}
    </v-icon>
    <div class="text-start" :class="{ 'b-inventory-option__content': modern }">
      <div :class="{ 'b-inventory-option__name': modern }">
        {{ $t(GetVariantNameByCode(variantCode, product)) }}
        <span v-if="modern && modelValue" class="b-inventory-option__dot" aria-hidden="true"></span>
        <small v-else-if="modern">{{ $t('b_product_inventory.options_off') }}</small>
      </div>
      <div
        v-if="items?.length"
        class="mt-1 d-flex flex-wrap align-center lhn"
        :class="{ 'b-inventory-option__values': modern }"
        :style="modern ? undefined : 'font-size: 8px; max-width: 140px'"
      >
        <!-- color -->
        <template v-if="variantCode === 'color'">
          <u-color-circle
            v-for="it in items.limit(max)"
            :color="it"
            :key="it"
            :size="modern ? 18 : 10"
            border-less
            style="margin-inline-end: 2px; border: solid 1px #fff"
            :style="{
              order: GetVariantValueIndexCode(variantCode, product, it),
            }"
          ></u-color-circle>
          <v-icon v-if="items.length > max" size="10">more_horiz</v-icon>
        </template>

        <!-- Others -->
        <template v-else>
          <span
            v-for="(it, index) in items.limit(max)"
            :key="it"
            style="margin-inline-end: 3px"
            :style="{
              order: GetVariantValueIndexCode(variantCode, product, it),
            }"
          >
            <u-variant-asset-image
              :size="modern ? 20 : 10"
              :value="it"
            ></u-variant-asset-image>
            <span>{{ it.removeVariantAsset() }}</span><span v-if="index !== items.length - 1 && !modern">,</span>
          </span>
          <v-icon v-if="items.length > max" size="10">more_horiz</v-icon>
        </template>
      </div>
    </div>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UColorCircle from "@selldone/components-vue/ui/color/circle/UColorCircle.vue";
import UVariantAssetImage from "@selldone/components-vue/ui/variant/asset/image/UVariantAssetImage.vue";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
  GetVariantOrderIndexByCode,
  GetVariantValueIndexCode,
} from "@selldone/core-js/enums/product/ProductVariants.ts";

export default defineComponent({
  name: "BProductVariantsOptionButton",
  components: { UVariantAssetImage, UColorCircle },
  emits: ["update:modelValue"],
  props: {
    modern: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    modelValue: {},

    variantCode: {
      type: String,
      required: true,
    },

    product: {
      type: Object,
      required: true,
    },

    max: {
      type: Number,
      default: 4,
    },
  },
  data() {
    return {
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,
      GetVariantOrderIndexByCode: GetVariantOrderIndexByCode,
      GetVariantValueIndexCode: GetVariantValueIndexCode,
    };
  },

  computed: {
    product_variants() {
      return this.product.product_variants;
    },
    items() {
      return (
        this.product_variants?.length &&
        this.product_variants
          .map((i) => i[this.variantCode])
          .filter((i) => !!i)
          .unique()
      );
    },
  },
});
</script>

<style scoped lang="scss">
.b-inventory-option {
  min-width: 0;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--sd-modern-border, rgba(127, 127, 127, .2));
  border-radius: 10px;
  color: var(--sd-modern-text, currentColor);
  background: var(--sd-modern-surface, rgb(var(--v-theme-surface)));
  text-transform: none;
  letter-spacing: normal;
  font-size: 12px;
  font-weight: 400;

  &.-selected {
    background: var(--sd-modern-surface-subtle, rgba(127, 127, 127, .04));
    border-color: var(--sd-modern-border-strong, rgba(127, 127, 127, .35));
  }

  :deep(.v-btn__content) { width: 100%; justify-content: flex-start; min-width: 0; }

  &__content { min-width: 0; flex: 1; }
  &__name { display: flex; align-items: center; gap: 6px; line-height: 18px; }
  &__name small { margin-inline-start: auto; font-size: 10px; opacity: .6; }
  &__dot { width: 5px; height: 5px; border-radius: 50%; background: #0061ef; margin-inline-start: auto; }
  &__values { gap: 3px; max-height: 24px; overflow: hidden; font-size: 10px; opacity: .85; }
  &__values > span { display: inline-flex; align-items: center; gap: 3px; min-width: 0; }
  &__values > span > span { max-width: 52px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
}
</style>
