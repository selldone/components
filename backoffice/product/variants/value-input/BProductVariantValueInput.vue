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
  <v-combobox
    v-if="variantType"
    :label="$t(variantType.name)"
    :model-value="modelValue"
    :prepend-inner-icon="variantType.icon"
    chips
    closable-chips
    hide-details
    multiple
    variant="underlined"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <template v-slot:chip="{ item, props }">
      <v-chip v-bind="props" variant="text">
        <template v-if="is_color">
          <u-color-circle
            :color="item.raw"
            :size="16"
            class="circle-border m-1"
          >
          </u-color-circle>
        </template>
        <template v-else>
          <u-variant-asset-image
            :shop-id="shop.id"
            :size="24"
            :value="item.raw"
          ></u-variant-asset-image>

          {{ item.raw.removeVariantAsset() }}
        </template>
      </v-chip>
    </template>
  </v-combobox>

  <v-expand-transition>
    <div v-if="is_color">
      <v-list-subheader>
        <div>
          Enter a hex color code here. You can enter a single color like
          <b>#654FFF</b> or dual colors separated by a slash, such as
          <b>#764FFA/#000000</b>.
        </div>
      </v-list-subheader>
      <div class="text-center">
        <v-btn
          v-for="item in show_all_colors ? colors : colors.limit(22)"
          :key="item"
          :title="GetNameOfColor(item)"
          class="ma-1 hover-scale-tiny no-inv border"
          icon
          size="small"
          variant="text"
          @click="modelValue.add(item)"
        >
          <u-color-circle :color="item" :size="20" class="circle-border m-1">
          </u-color-circle>
        </v-btn>

        <v-btn
          v-if="!show_all_colors"
          class="m-1 tnt"
          color="primary"
          variant="text"
          @click="show_all_colors = true"
          >{{ $t("global.actions.show_all") }}...
        </v-btn>
      </div>
    </div>
    <b-product-graphical-assets-selector
      v-else
      :shop="shop"
      @select="(v) => modelValue.add(v)"
    ></b-product-graphical-assets-selector>
  </v-expand-transition>
</template>

<script>
import BProductGraphicalAssetsSelector from "../../../product/graphical-assets/selector/BProductGraphicalAssetsSelector.vue";
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import VariantColorsSet from "@selldone/core-js/helper/color/VariantColorsSet";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";

export default {
  name: "BProductVariantValueInput",
  components: {
    UVariantAssetImage,
    UColorCircle,
    BProductGraphicalAssetsSelector,
  },
  emits: ["update:modelValue"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    modelValue: {},
    variantCode: { required: true },
  },
  data() {
    return {
      ProductVariants: ProductVariants,
      show_all_colors: false,

      colors: VariantColorsSet,
    };
  },
  computed: {
    variantType() {
      if (this.isObject(this.variantCode)) return this.variantCode;
      return ProductVariants[this.variantCode];
    },

    is_color() {
      return this.variantType.code === ProductVariants.color.code;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped></style>
