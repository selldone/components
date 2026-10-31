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
  <div v-if="modern" class="b-product-variant-value-input">
    <v-text-field
      v-if="variantCode === 'color'"
      :model-value="modelValue"
      @update:model-value="(value) => $emit('update:modelValue', value)"
      :counter="32"
      :disabled="disabled"
      :label="name"
      class="sd-modern-underlined-field b-product-variant-value-input__color-field"
      messages=" "
      required
      variant="underlined"
      @blur="validateColor"
    >
      <template #append-inner>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button sd-modern-input-action"
          :disabled="disabled"
          :aria-label="$t('b_product_inventory.editor.choose_color')"
          @click="color_dialog = true"
        >
          <u-color-circle :color="modelValue" :size="22" />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("b_product_inventory.editor.choose_color") }}</v-tooltip
          >
        </v-btn>
      </template>
      <template #message>
        <u-color-name v-if="modelValue" :color="modelValue" />
      </template>
    </v-text-field>

    <v-combobox
      v-else-if="items?.length"
      :model-value="modelValue"
      @update:model-value="(value) => $emit('update:modelValue', value)"
      :counter="21"
      :disabled="disabled"
      :label="name"
      :items="items"
      class="sd-modern-underlined-field"
      required
      variant="underlined"
    >
      <template #prepend-inner>
        <u-variant-asset-image
          v-if="modelValue"
          :size="26"
          :value="modelValue"
        />
      </template>
      <template #append-inner>
        <b-product-graphical-assets-selector
          modern
          :disabled="disabled"
          @select="(value) => $emit('update:modelValue', value)"
        />
      </template>
    </v-combobox>

    <v-text-field
      v-else
      :model-value="modelValue"
      @update:model-value="(value) => $emit('update:modelValue', value)"
      :counter="21"
      :disabled="disabled"
      :label="name"
      class="sd-modern-underlined-field"
      required
      variant="underlined"
    >
      <template #prepend-inner>
        <u-variant-asset-image
          v-if="modelValue"
          :size="26"
          :value="modelValue"
        />
      </template>
      <template #append-inner>
        <b-product-graphical-assets-selector
          modern
          :disabled="disabled"
          @select="(value) => $emit('update:modelValue', value)"
        />
      </template>
    </v-text-field>

    <v-dialog
      v-if="variantCode === 'color'"
      v-model="color_dialog"
      :fullscreen="$vuetify.display.xs"
      max-width="560"
      scrollable
    >
      <v-card
        class="sd-modern-widget b-product-variant-value-input__palette text-start"
        :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
      >
        <header class="b-product-variant-value-input__palette-header">
          <h2>{{ $t("b_product_inventory.editor.choose_color") }}</h2>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            @click="color_dialog = false"
          >
            <v-icon>close</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            >
          </v-btn>
        </header>
        <v-card-text>
          <div class="b-product-variant-value-input__colors">
            <v-btn
              v-for="item in show_all_colors ? colors : colors.limit(22)"
              :key="item"
              icon
              variant="text"
              class="b-product-variant-value-input__color no-inv"
              :disabled="disabled"
              :aria-label="GetNameOfColor(item) || item"
              :aria-pressed="modelValue === item"
              @click="selectColor(item)"
            >
              <u-color-circle :color="item" :size="24" />
              <v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                >{{ GetNameOfColor(item) }} · {{ item }}</v-tooltip
              >
            </v-btn>
          </div>
          <div class="b-product-variant-value-input__palette-actions">
            <v-btn
              v-if="!show_all_colors"
              variant="text"
              class="sd-modern-button sd-modern-button--inline"
              :disabled="disabled"
              @click="show_all_colors = true"
              >{{ $t("global.actions.show_all") }}</v-btn
            >
            <u-color-plate-name
              :disabled="disabled"
              :title="$t('b_product_inventory.editor.choose_color')"
              :button-text="$t('b_product_inventory.editor.color_palette')"
              :search-label="$t('b_product_inventory.editor.search_colors')"
              :close-text="$t('global.actions.close')"
              @select="selectColor"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>

  <!-- ━━━━━━━━━━━━━━ Color ━━━━━━━━━━━━━━ -->
  <div v-else-if="variantCode === 'color'">
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
          <u-color-circle :color="modelValue"></u-color-circle>
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

      <u-color-plate-name
        @select="(v) => $emit('update:modelValue', v)"
      ></u-color-plate-name>
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
import UColorPlateName from "@selldone/components-vue/ui/color/plate-name/UColorPlateName.vue";

export default defineComponent({
  name: "BProductVariantValueInput",
  components: {
    UColorPlateName,
    UVariantAssetImage,
    BProductGraphicalAssetsSelector,
    UColorCircle,
    UColorName,
  },
  inject: ["$product"],
  emits: ["update:modelValue"],
  props: {
    modern: { type: Boolean, default: false },
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
      color_dialog: false,
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

  watch: {
    disabled(value) {
      if (value) this.color_dialog = false;
    },
  },

  methods: {
    selectColor(value) {
      if (this.disabled) return;
      this.$emit("update:modelValue", value);
      this.color_dialog = false;
    },
    validateColor() {
      if (this.disabled || !this.modelValue) return;
      const valid = String(this.modelValue)
        .split("/")
        .every((value) =>
          /^#(?:[a-f\d]{3}|[a-f\d]{6}|[a-f\d]{8})$/i.test(value.trim()),
        );
      if (!valid)
        NotificationService.showErrorAlert(
          null,
          this.$t("b_product_inventory.editor.invalid_color"),
        );
    },
  },
});
</script>

<style scoped lang="scss">
.b-product-variant-value-input {
  min-width: 0;

  &__color-field :deep(input) {
    direction: ltr;
    text-align: start;
  }

  &__palette.v-card {
    padding: 0;
    border-radius: 16px;
    color: rgb(var(--v-theme-on-surface));
  }

  &__palette-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px 12px;

    h2 {
      margin: 0;
      font-size: 16px;
      line-height: 24px;
      font-weight: 500;
    }
  }

  &__colors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    gap: 8px;
  }

  &__color.v-btn {
    width: 44px;
    height: 44px;
    min-width: 44px;
    margin-inline: auto;
  }

  &__palette-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
    font-size: 13px;
    line-height: 20px;
  }
}

@media (max-width: 600px) {
  .b-product-variant-value-input__palette.v-card {
    border-radius: 0;
  }
}
</style>
