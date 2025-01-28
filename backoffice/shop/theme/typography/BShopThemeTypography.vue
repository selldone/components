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
  <div class="widget-box mb-5">
    <u-widget-header
      icon="font_download"
      :title="$t('b_shop_theme_typography.main_font.title')"
    ></u-widget-header>

    <v-list-subheader>
      <div>
        {{$t('b_shop_theme_typography.main_font.subtitle')}}

        <a
          class="mx-1 font-weight-bold"
          href="https://fonts.google.com"
          target="_blank"
        >
          <v-icon class="mx-1" size="small">fa:fab fa-google</v-icon>
          https://fonts.google.com</a
        >.
      </div>
    </v-list-subheader>

    <v-text-field
      :model-value="fontFamily"
      @update:model-value="(v) => $emit('update:fontFamily', v)"
      :label="$t('b_shop_theme_typography.inputs.font_family.label') "
      :messages="$t('b_shop_theme_typography.inputs.font_family.message') "
      persistent-placeholder
      placeholder="'Maven Pro', sans-serif"
      @blur="fixFontFamily"
      variant="underlined"
      :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
      dir="ltr"
    >
      <template v-slot:append-inner>
        <v-slide-y-transition>
          <v-btn
            v-if="font_family_name"
            :href="`https://fonts.google.com/?query=${font_family_name}`"
            class="me-2"
            icon
            size="small"
            target="_blank"
            title="Find font"
          >
            <v-icon>search</v-icon>
          </v-btn>
        </v-slide-y-transition>

        <v-icon
          v-if="fontFamily && fontFamily.includes('\'')"
          class="zoomIn"
          color="green"
          >check_circle
        </v-icon>
      </template>
    </v-text-field>

    <v-expansion-panels variant="inset" flat bg-color="transparent">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon class="me-1">lightbulb_outline</v-icon>
          {{ $t("global.commons.sample") }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="mb-10">
            <div>
              <small>Sample 1</small>
              <code class="d-block mt-1"> 'Black Han Sans', sans-serif </code>
            </div>

            <div class="mt-3">
              <small>Sample 2</small>
              <code class="d-block mt-1">
                "Roboto", "Graphik", -apple-system, BlinkMacSystemFont, "Segoe
                UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
                "Segoe UI Emoji", "Segoe UI Symbol"
              </code>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <hr>


    <v-textarea
      :model-value="fontRes"
      @update:model-value="(v) => $emit('update:fontRes', v)"
      :rows="3"
      auto-grow
      :label="$t('b_shop_theme_typography.inputs.font_res.label') "
      :messages="$t('b_shop_theme_typography.inputs.font_res.message')"
      persistent-placeholder
      placeholder="<link href='https://fonts.googleap..."
      variant="underlined"
      :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
      dir="ltr"
    >
      <template v-slot:append-inner>
        <v-icon
          v-if="
            fontRes && (fontRes.includes('<style') || fontRes.includes('<link'))
          "
          class="zoomIn"
          color="green"
          >check_circle
        </v-icon>
      </template>
    </v-textarea>

    <v-expansion-panels variant="inset" flat bg-color="transparent">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon class="me-1">lightbulb_outline</v-icon>
          {{ $t("global.commons.sample") }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="mb-5">
            <div>
              <small>Sample 1</small>
              <code class="d-block mt-1" v-text="sample1"></code>
            </div>

            <div class="mt-3">
              <small>Sample 2</small>
              <code class="d-block mt-1" v-text="sample2"></code>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";

export default defineComponent({
  name: "BShopThemeTypography",

  emits: ["update:fontFamily", "update:fontRes"],
  props: {
    fontFamily: {},
    fontRes: {},
  },
  data: () => ({
    ShopPermissionRegions: ShopPermissionRegions,
  }),

  computed: {
    font_family_name() {
      const match = this.fontFamily && this.fontFamily.match(/['|"](.+)['|"]/g);
      return match && match.length && match[0].replace(/['|"]/g, "");
    },
  },
});
</script>

<style scoped lang="scss"></style>
