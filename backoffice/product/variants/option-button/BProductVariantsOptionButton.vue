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
    :color="modelValue ? '#222' : '#aaa'"
    :variant="modelValue ? 'elevated' : 'outlined'"
    class="m-1 tnt"
    @click="
      () => {
        $emit('update:modelValue', !modelValue);
      }
    "
    min-height="52"
    :style="{ order: GetVariantOrderIndexByCode(variantCode, product) }"
  >
    <v-icon start>
      {{ GetVariantIconByCode(variantCode, product) }}
    </v-icon>
    <div class="text-start">
      {{ $t(GetVariantNameByCode(variantCode, product)) }}
      <div
        v-if="items?.length"
        class="mt-1 d-flex flex-wrap align-center lhn"
        style="font-size: 8px; max-width: 140px"
      >
        <!-- color -->
        <template v-if="variantCode === 'color'">
          <u-color-circle
            v-for="it in items.limit(max)"
            :color="it"
            :key="it"
            :size="10"
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
              :size="10"
              :value="it"
            ></u-variant-asset-image>
            {{ it.removeVariantAsset()
            }}<span v-if="index !== items.length - 1">,</span>
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

<style scoped lang="scss"></style>
