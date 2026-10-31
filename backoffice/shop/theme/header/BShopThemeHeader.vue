<!--
  - Copyright (c) 2025. Selldone® Business OS™
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
  <div class="b-shop-theme-header text-start">
    <div class="sd-modern-widget b-shop-theme-header__modes">
      <u-smart-select
        class="sd-modern-smart-select"
        border
        accessible
        :model-value="header_mode"
        :items="header_modes"
        item-value="id"
        item-text="title"
        item-description="description"
        item-icon="icon"
        force-show-all
        :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        @update:model-value="setHeaderMode"
      ></u-smart-select>
    </div>

    <slot v-if="header_mode === 'custom'" name="custom-code" />

    <div v-else-if="header_mode === 'default'" class="b-shop-theme-header__default">
      <div class="b-shop-theme-header__preview">
        <v-list-subheader class="sd-modern-eyebrow"
          >{{ $t("global.commons.preview") }}
        </v-list-subheader>

        <v-toolbar
          :color="light_header ? '#fff' : color_dark"
          :dark="!light_header"
          class="rounded-lg px-3"
          flat
        >
          <img
            v-if="logo_custom_size"
            :height="logoH"
            :src="getShopImagePath(logo ? logo : $shop.icon)"
            :width="logoW"
            style="object-fit: contain"
          />

          <v-btn v-else class="mx-1 zoomIn" icon>
            <v-avatar size="36">
              <img :src="getShopImagePath(logo ? logo : $shop.icon)" />
            </v-avatar>
          </v-btn>

          <span v-if="title!==null && title!==''" class="b-shop-theme-header__store-title ms-2">
            {{ title ? title : $shop.title }}
          </span>

          <v-spacer></v-spacer>

          <v-icon class="mx-1">shopping_cart</v-icon>

          <v-avatar
            :color="light_header ? '#fff' : color_dark"
            class="ms-1"
            size="32"
          >
            <v-img :src="getUserAvatar(USER_ID())"></v-img>
          </v-avatar>
        </v-toolbar>
      </div>

      <div class="sd-modern-widget b-shop-theme-header__settings">
      <section class="b-shop-theme-header__logo">
        <u-widget-header
          class="sd-modern-form-header"
          icon="photo"
          :title="$t('b_shop_theme_header.logo.title')"
        ></u-widget-header>
        <p class="sd-modern-subtitle b-shop-theme-header__subtitle">
          {{ $t("b_shop_theme_header.logo.subtitle") }}
        </p>

        <s-image-uploader
          :image="getShopImagePath(logo ? logo : $shop.icon)"
          :server="window.API.UPLOAD_SHOP_IMAGE_LOGO($shop.id)"
          auto-compact
          clearable
          :label="$t('b_shop_theme_header.inputs.logo.label')"
          maxFileSize="1MB"
          @onClear="$emit('update:logo', null)"
          @new-path="(path) => $emit('update:logo', path)"
          :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        />

        <v-row>
          <v-col cols="6">
            <u-dimension-input
              class="sd-modern-underlined-field"
              :model-value="logoH"
              @update:model-value="(v) => $emit('update:logoH', v)"
              :label="$t('b_shop_theme_header.inputs.height.label')"
              :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
            ></u-dimension-input>
          </v-col>
          <v-col cols="6">
            <u-dimension-input
              class="sd-modern-underlined-field"
              :model-value="logoW"
              @update:model-value="(v) => $emit('update:logoW', v)"
              :label="$t('b_shop_theme_header.inputs.width.label')"
              :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
            ></u-dimension-input>
          </v-col>
        </v-row>
      </section>

      <section class="b-shop-theme-header__title">
        <u-widget-header
          class="sd-modern-form-header"
          icon="edit_square"
          :title="$t('b_shop_theme_header.header_title.title')"
        ></u-widget-header>

        <p class="sd-modern-subtitle b-shop-theme-header__subtitle">
          {{ $t("b_shop_theme_header.header_title.subtitle") }}
        </p>

        <v-text-field
          class="sd-modern-underlined-field"
          :model-value="title"
          @update:model-value="(v) => $emit('update:title', v)"
          hide-details
          :label="$t('b_shop_theme_header.inputs.title.label')"
          variant="underlined"
          :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
          clearable
          persistent-placeholder
          :placeholder="$t('shop_theme.studio.hide_shop_name')"
        ></v-text-field>
        <div
          v-if="writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
          class="text-end mb-3"
        >
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            size="small"
            variant="text"
            @click="$emit('update:title', '')"
          >
            <v-icon start>space_bar</v-icon>
            {{ $t("b_shop_theme_header.inputs.title.set_empty") }}
          </v-btn>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SImageUploader from "@selldone/components-vue/ui/uploader/SImageUploader.vue";
import UDimensionInput from "@selldone/components-vue/ui/dimension/input/UDimensionInput.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";

export default defineComponent({
  name: "BShopThemeHeader",
  components: {
    USmartSelect,
    UWidgetHeader,
    UDimensionInput,
    SImageUploader,
  },
  inject: ["$shop"],
  emits: [
    "update:logo",
    "update:logoW",
    "update:logoH",
    "update:title",
    "update:customCode",
  ],
  props: {
    logo: {},
    logoW: {},
    logoH: {},
    title: {},
    customCode: {},
  },

  data: () => ({
    ShopPermissionRegions: ShopPermissionRegions,
    header_mode: "default" as "default" | "custom" | "none",
    last_custom_code: "",
  }),
  watch: {
    customCode(code) {
      if (this.isNoHeaderCode(code)) {
        this.header_mode = "none";
        return;
      }

      if (typeof code === "string" && code.length > 0) {
        this.last_custom_code = code;
        this.header_mode = "custom";
        return;
      }

      if (this.header_mode !== "custom") {
        this.header_mode = "default";
      }
    },
  },
  computed: {
    header_modes() {
      return [
        { id: "default", title: this.$t("shop_theme.studio.header_modes.default_title"), description: this.$t("shop_theme.studio.header_modes.default_description"), icon: "auto_fix_high" },
        { id: "custom", title: this.$t("shop_theme.studio.header_modes.custom_title"), description: this.$t("shop_theme.studio.header_modes.custom_description"), icon: "code" },
        { id: "none", title: this.$t("shop_theme.studio.header_modes.none_title"), description: this.$t("shop_theme.studio.header_modes.none_description"), icon: "visibility_off" },
      ];
    },
    theme() {
      return this.$shop.theme;
    },

    light_header() {
      return this.theme?.light_header;
    },

    logo_custom_size() {
      return (
        this.logo &&
        ((this.logoW && this.logoW !== "unset") ||
          (this.logoH && this.logoH !== "unset"))
      );
    },
  },

  created() {
    this.header_mode = this.resolveHeaderMode(this.customCode);

    if (this.header_mode === "custom") {
      this.last_custom_code = this.customCode;
    }
  },

  methods: {
    isNoHeaderCode(code: unknown) {
      return (
        typeof code === "string" &&
        code.trim().toLowerCase() === "<div></div>"
      );
    },

    resolveHeaderMode(code: unknown) {
      if (this.isNoHeaderCode(code)) return "none";

      return typeof code === "string" && code.length > 0
        ? "custom"
        : "default";
    },

    setHeaderMode(mode: "default" | "custom" | "none" | null) {
      if (!mode) return;

      this.header_mode = mode;

      if (mode === "default") {
        this.$emit("update:customCode", null);
        return;
      }

      if (mode === "none") {
        this.$emit("update:customCode", "<div></div>");
        return;
      }

      if (this.isNoHeaderCode(this.customCode)) {
        this.$emit("update:customCode", this.last_custom_code || "");
      }
    },
  },
});
</script>

<style scoped lang="scss">
.b-shop-theme-header {
  display: grid;
  gap: 22px;
  min-width: 0;

  &__subtitle { padding: 0; margin-block: 0 20px; min-height: 0; }
  &__store-title { font-size: 15px; font-weight: 500; line-height: 22px; }
  &__modes, &__default { width: min(760px, 100%); margin-inline: auto; }
  &__default { display: grid; gap: 22px; min-width: 0; }
  &__settings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 28px; }
  &__logo, &__title { min-width: 0; }
  &__preview { min-width: 0; }

  @media (max-width: 700px) {
    &__settings { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  }
}
</style>
