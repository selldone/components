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
  <div class="widget-box mb-5">
    <s-widget-header
      :title="$t('shop_theme.theme_colors')"
      icon="palette"
    ></s-widget-header>
    <v-list-subheader
      >You can personalize the primary color palette of your shop here. Each
      template can utilize these colors to automatically generate a complete
      color range that aligns with your brand.
    </v-list-subheader>

    <u-smart-switch
      :dark="lightHeader === false"
      :false-title="
        $t('shop_theme.light_header') + ' | ' + $t('global.commons.dark')
      "
      :force-show-all="false"
      :model-value="lightHeader"
      :true-title="
        $t('shop_theme.light_header') + ' | ' + $t('global.commons.light')
      "
      class="my-3"
      false-icon="mode_night"
      true-icon="light_mode"
      @update:model-value="(v) => $emit('update:lightHeader', v)"
    ></u-smart-switch>

    <u-smart-switch
      :dark="lightFooter === false"
      :false-title="
        $t('shop_theme.light_footer') + ' | ' + $t('global.commons.dark')
      "
      :force-show-all="false"
      :model-value="lightFooter"
      :true-title="
        $t('shop_theme.light_footer') + ' | ' + $t('global.commons.light')
      "
      class="my-3"
      false-icon="mode_night"
      true-icon="light_mode"
      @update:model-value="(v) => $emit('update:lightFooter', v)"
    ></u-smart-switch>

    <u-smart-switch
      :dark="lightCheckout === false"
      :false-title="
        $t('shop_theme.light_checkout') + ' | ' + $t('global.commons.dark')
      "
      :force-show-all="false"
      :model-value="lightCheckout"
      :true-title="
        $t('shop_theme.light_checkout') + ' | ' + $t('global.commons.light')
      "
      class="my-3"
      false-icon="mode_night"
      true-icon="light_mode"
      @update:model-value="(v) => $emit('update:lightCheckout', v)"
    ></u-smart-switch>

    <u-smart-switch
      :dark="lightFilter === false"
      :false-title="
        $t('shop_theme.light_filter') + ' | ' + $t('global.commons.dark')
      "
      :force-show-all="false"
      :model-value="lightFilter"
      :true-title="
        $t('shop_theme.light_filter') + ' | ' + $t('global.commons.light')
      "
      class="my-3"
      false-icon="mode_night"
      true-icon="light_mode"
      @update:model-value="(v) => $emit('update:lightFilter', v)"
    ></u-smart-switch>

    <u-color-selector
      :model-value="colorDark"
      :title="$t('shop_theme.color_dark')"
      no-alpha
      prepend-icon="looks_one"
      @update:model-value="(v) => $emit('update:colorDark', v)"
    ></u-color-selector>

    <u-color-selector
      :model-value="colorDeepDark"
      :title="$t('shop_theme.color_deep_dark')"
      no-alpha
      prepend-icon="looks_two"
      @update:model-value="(v) => $emit('update:colorDeepDark', v)"
    ></u-color-selector>

    <u-color-selector
      :model-value="colorBill"
      no-alpha
      prepend-icon="looks_3"
      title="Checkout color"
      @update:model-value="(v) => $emit('update:colorBill', v)"
    ></u-color-selector>

    <u-color-selector
      :model-value="colorLight"
      :title="$t('shop_theme.color_light')"
      no-alpha
      prepend-icon="looks_4"
      @update:model-value="(v) => $emit('update:colorLight', v)"
    ></u-color-selector>

    <u-color-selector
      :model-value="colorInfo"
      :title="$t('shop_theme.color_info')"
      no-alpha
      prepend-icon="looks_5"
      @update:model-value="(v) => $emit('update:colorInfo', v)"
    ></u-color-selector>

    <v-list-subheader class="mb-3 mt-5">
      <v-icon class="me-1">arrow_drop_down</v-icon>
      {{ $t("global.commons.preview") }}
    </v-list-subheader>

    <div
      class="max-widget-width position-relative"
      style="border-radius: 2rem; background-color: #fff"
    >
      <!-- Header -->

      <div
        :style="`background-color: ${!lightHeader ? colorDark : '#fff'}`"
        class="d-flex align-start"
        style="height: 120px; border-radius: 2rem 2rem 0 0"
      >
        <v-icon class="ma-3">looks_one</v-icon>
        <div class="text-end px-2 flex-grow-1">
          <v-icon :color="lightHeader ? '#000' : '#fff'" class="m-3"
            >shopping_cart
          </v-icon>

          <v-icon :color="lightHeader ? '#000' : '#fff'" class="m-3"
            >account_circle
          </v-icon>
        </div>
      </div>
      <!-- Content -->

      <v-card
        :color="colorDeepDark"
        class="s--shadow-no-padding mx-2 mb-9"
        style="border-radius: 16px 16px 42px 42px; margin-top: -64px"
      >
        <v-toolbar
          :color="colorDeepDark"
          class="overflow-visible"
          extended
          flat
          style="overflow-x: auto"
        >
          <v-icon class="mx-4">looks_two</v-icon>
          <template v-slot:extension>
            <div style="height: 64px"></div>
          </template>

          <v-spacer />

          <!-- Title -->
          <div
            class="body-title me-2 hide-on-small-600 font-weight-black"
            style="line-height: 1.4em"
          >
            {{ shop.title }}
          </div>

          <!-- Image -->

          <v-avatar :size="34" class="mx-2">
            <v-img
              v-if="shop && shop.icon"
              :src="getShopImagePath(shop.icon, 128)"
              alt="Shop logo"
            />
          </v-avatar>
        </v-toolbar>

        <v-card-text
          class="s--card-window-content mx-3 v-card mb-3"
          style="min-height: 180px; background-color: #fff"
        >
          <v-btn :color="colorLight" class="m-2" size="small" variant="flat"
            >Button
            <v-icon end>looks_4</v-icon>
          </v-btn>
          <v-btn :color="colorInfo" class="m-2" size="small" variant="text"
            >Link
            <v-icon end>looks_5</v-icon>
          </v-btn>

          <div class="d-flex">
            <div class="flex-grow-1"></div>

            <v-sheet
              :style="{
                '--color-bg-1': colorBill ? colorBill : SaminColorDarkDeep,
                '--color-bg-2': ShadeColor(
                  colorBill ? colorBill : SaminColorDarkDeep,
                  -30,
                ),
                background: lightCheckout
                  ? '#fff'
                  : 'linear-gradient(160deg, var(--color-bg-1) 0%, var(--color-bg-2) 100%)',
              }"
              :theme="lightCheckout ? 'light' : 'dark'"
              class="text-center p-3 small"
              style="
                width: 33%;
                border: #00a89a 4px solid;
                border-radius: 16px;
                min-height: 180px;
                min-width: 180px;
              "
            >
              <v-icon size="large">shopping_bag</v-icon>
              <small class="d-block">Checkout Bill</small>
              <div>
                <img
                  class="mx-auto my-2"
                  height="24"
                  src="../../../../../core-js/enums/customer/assets/customer-levels/diamond.svg"
                  width="24"
                />
              </div>

              <u-text-value-dashed>
                <template v-slot:label>
                  {{ $t("global.commons.net_price") }}
                </template>

                <u-price :amount="2900"></u-price>
              </u-text-value-dashed>

              <u-text-value-dashed>
                <template v-slot:label>
                  {{ $t("global.commons.tax") }}
                </template>

                <u-price :amount="100"></u-price>
              </u-text-value-dashed>

              <u-text-value-dashed>
                <template v-slot:label>
                  {{ $t("global.commons.shipping_tax") }}
                </template>
                <u-price :amount="0"></u-price>
              </u-text-value-dashed>

              <u-text-value-dashed>
                <template v-slot:label>
                  {{ $t("global.commons.price") }}
                </template>
                <u-price
                  :amount="3000"
                  class="font-weight-black"
                  medium
                ></u-price>
              </u-text-value-dashed>

              <v-icon>looks_3</v-icon>
            </v-sheet>
          </div>
        </v-card-text>
      </v-card>
      <!-- Footer -->
      <v-sheet
        :color="!lightFooter ? colorDeepDark : '#fff'"
        class="d-flex align-items-center"
        style="height: 140px; border-radius: 0 0 2rem 2rem"
      >
        <v-row class="mx-2">
          <v-col
            class="d-flex align-items-center justify-center"
            cols="12"
            sm="4"
          >
            <div class="f-s"></div>
            <div class="f-s"></div>
            <div class="f-s"></div>
          </v-col>
          <v-col
            v-for="i in 4"
            :key="i"
            class="d-flex align-items-center"
            cols="6"
            sm="2"
          >
            <div class="flex-grow-1">
              <div class="f-m"></div>
              <div class="f-m"></div>
              <div class="f-m"></div>
              <div class="f-m"></div>
            </div>
          </v-col>
        </v-row>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { ShadeColor } from "core-js/helper/color/ColorGenerator";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import UTextValueDashed from "./../../../../ui/text/value-dashed/UTextValueDashed.vue";
import UColorSelector from "./../../../../ui/color/selector/UColorSelector.vue";

export default defineComponent({
  name: "BShopThemeColors",
  components: { UColorSelector, UTextValueDashed, USmartSwitch },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    lightHeader: {},
    lightFooter: {},
    lightCheckout: {},
    lightFilter: {},
    colorDark: {},
    colorDeepDark: {},
    colorLight: {},
    colorInfo: {},
    colorBill: {},
  },
  methods: { ShadeColor },
});
</script>

<style lang="scss" scoped>
.f-s,
.f-m {
  background-color: rgba(170, 170, 170, 0.35);
  margin: 5px 3px;
  height: 4px;
  flex-grow: 1;
}

.f-s {
  height: 64px;
  border-radius: 6px;
}
</style>
