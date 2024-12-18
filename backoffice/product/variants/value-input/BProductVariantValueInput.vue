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
  <!-- ━━━━━━━━━━━━━━ Color ━━━━━━━━━━━━━━ -->
  <div v-if="variantCode === 'color'">
    <v-text-field
      :model-value="modelValue"
      @update:model-value="(v) => $emit('update:modelValue', v)"
      :counter="32"
      :disabled="disabled"
      :label="name"
      :prepend-inner-icon="icon"
      required
      variant="underlined"
      @blur="validateColor"
    >
      <template v-slot:append-inner>
        <div class="d-flex align-center">
          <u-color-name
            :color="modelValue"
            class="x-small mx-1 min-width-75"
          ></u-color-name>
          <u-color-circle :color="color"></u-color-circle>
        </div>
      </template>
    </v-text-field>

    <div v-if="!disabled" class="text-center">
      <v-expand-transition group>
        <v-btn
          v-for="item in show_all_colors ? colors : colors.limit(22)"
          :key="item"
          :title="GetNameOfColor(item)"
          class="mx-1 color-button-ball no-inv"
          icon
          size="32"
          variant="text"
          @click="$emit('update:modelValue', item)"
        >
          <u-color-circle :color="item" :size="20" class="circle-border m-1">
          </u-color-circle>
        </v-btn>
      </v-expand-transition>

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
  <!-- ━━━━━━━━━━━━━━ Other > With suggested items in property set ━━━━━━━━━━━━━━ -->

  <v-combobox
    v-else-if="items?.length"
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    :counter="21"
    :disabled="disabled"
    :label="name"
    :prepend-inner-icon="icon"
    class="input-variant"
    messages=" "
    required
    variant="underlined"
    :items="items"
  >
    <template v-if="modelValue" v-slot:append-inner>
      <u-variant-asset-image
        :size="24"
        :value="modelValue"
      ></u-variant-asset-image>
    </template>

    <template v-slot:message>
      <b-product-graphical-assets-selector
        @select="(v) => $emit('update:modelValue', v)"
      ></b-product-graphical-assets-selector>
    </template>
  </v-combobox>
  <!-- ━━━━━━━━━━━━━━ Other > Default ━━━━━━━━━━━━━━ -->
  <v-text-field
    v-else
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    :counter="21"
    :disabled="disabled"
    :label="name"
    :prepend-inner-icon="icon"
    class="input-variant"
    messages=" "
    required
    variant="underlined"
  >
    <template v-if="modelValue" v-slot:append-inner>
      <u-variant-asset-image
        :size="24"
        :value="modelValue"
      ></u-variant-asset-image>
    </template>

    <template v-slot:message>
      <b-product-graphical-assets-selector
        @select="(v) => $emit('update:modelValue', v)"
      ></b-product-graphical-assets-selector>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UColorName from "@selldone/components-vue/ui/color/name/UColorName.vue";
import UColorCircle from "@selldone/components-vue/ui/color/circle/UColorCircle.vue";
import {
  GetVariantDefaultValuesByCode,
  GetVariantIconByCode,
  GetVariantNameByCode,
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import VariantColorsSet from "@selldone/core-js/helper/color/VariantColorsSet.ts";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper.ts";
import BProductGraphicalAssetsSelector from "@selldone/components-vue/backoffice/product/graphical-assets/selector/BProductGraphicalAssetsSelector.vue";
import UVariantAssetImage from "@selldone/components-vue/ui/variant/asset/image/UVariantAssetImage.vue";

export default defineComponent({
  name: "BProductVariantValueInput",
  components: {
    UVariantAssetImage,
    BProductGraphicalAssetsSelector,
    UColorCircle,
    UColorName,
  },
  inject: ["$product"],
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    variantCode: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      GetNameOfColor: GetNameOfColor,
      ProductVariants: ProductVariants,
      colors: VariantColorsSet,

      show_all_colors: false,
    };
  },

  computed: {
    name() {
      return this.$t(GetVariantNameByCode(this.variantCode, this.$product));
    },
    icon() {
      return GetVariantIconByCode(this.variantCode, this.$product);
    },

    items() {
      return GetVariantDefaultValuesByCode(this.variantCode, this.$product);
    },
  },

  methods: {
    validateColor() {
      if (!this.color?.startsWith("#")) {
        this.color = "#FFFFFF";
        NotificationService.showErrorAlert(null, "Invalid color code!");
      }
    },
  },
});
</script>

<style scoped lang="scss"></style>
