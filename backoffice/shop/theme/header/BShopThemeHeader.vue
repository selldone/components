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
  <div>
    <div class="max-widget-width py-5">
      <v-list-subheader class="op-0-5"
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

        <span class="ms-2 font-weight-bold" style="font-size: 22px">
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

    <div class="widget-box mb-5">
      <u-widget-header icon="photo" :title="$t('b_shop_theme_header.logo.title')"></u-widget-header>
      <v-list-subheader>
        {{$t('b_shop_theme_header.logo.subtitle')}}

      </v-list-subheader>

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
            :model-value="logoH"
            @update:model-value="(v) => $emit('update:logoH', v)"
            :label="$t('b_shop_theme_header.inputs.height.label') "
            :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
          ></u-dimension-input>
        </v-col>
        <v-col cols="6">
          <u-dimension-input
            :model-value="logoW"
            @update:model-value="(v) => $emit('update:logoW', v)"
            :label="$t('b_shop_theme_header.inputs.width.label') "

            :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
          ></u-dimension-input>
        </v-col>
      </v-row>
    </div>

    <div class="widget-box mb-5">
      <u-widget-header
        icon="edit_square"
        :title="$t('b_shop_theme_header.header_title.title') "
      ></u-widget-header>

      <v-list-subheader>
        {{$t('b_shop_theme_header.header_title.subtitle')}}

      </v-list-subheader>

      <v-text-field
        :model-value="title"
        @update:model-value="v=>$emit('update:title',v)"
        hide-details
        :label="$t('b_shop_theme_header.inputs.title.label') "
        variant="underlined"
        :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        clearable
      ></v-text-field>
      <div
        v-if="writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        class="text-end mb-3"
      >
        <v-btn class="tnt" size="small" variant="text" @click="$emit('update:title', '⠀')">
          <v-icon start>space_bar</v-icon>
          {{$t('b_shop_theme_header.inputs.title.set_empty')}}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SImageUploader from "@selldone/components-vue/ui/uploader/SImageUploader.vue";
import UDimensionInput from "@selldone/components-vue/ui/dimension/input/UDimensionInput.vue";
import {ShopPermissionRegions} from "@selldone/core-js/enums/permission/ShopPermissions.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default defineComponent({
  name: "BShopThemeHeader",
  components: {UWidgetHeader, UDimensionInput, SImageUploader },
  inject: ["$shop"],
  props: {
    logo: {},
    logoW: {},
    logoH: {},
    title:{},
  },

  data: () => ({
    ShopPermissionRegions:ShopPermissionRegions,
  }),
  computed: {
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
          (this.lologoHo_h && this.logoH !== "unset"))
      );
    },
  },
});
</script>

<style scoped lang="scss"></style>
