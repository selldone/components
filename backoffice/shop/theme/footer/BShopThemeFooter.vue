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
  <div class="b-shop-theme-footer text-start">
    <div class="sd-modern-widget">
      <u-smart-select
        class="sd-modern-smart-select"
        border
        :model-value="footer_mode"
        :items="footer_modes"
        item-value="id"
        item-text="title"
        item-description="description"
        item-icon="icon"
        force-show-all
        :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        @update:model-value="setFooterMode"
      ></u-smart-select>
    </div>

    <template v-if="footer_mode === 'custom'">
      <div class="sd-modern-widget">
        <u-widget-header
          class="sd-modern-form-header"
          icon="code"
          :title="$t('shop_theme.studio.custom_footer_title')"
        ></u-widget-header>
        <v-list-subheader class="sd-modern-subtitle b-shop-theme-footer__subtitle">
          {{ $t('shop_theme.studio.custom_footer_description') }}
        </v-list-subheader>

        <BShopHtmlEditor
          :model-value="customCode"
          @update:model-value="(code) => $emit('update:customCode', code)"
          :readOnly="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        ></BShopHtmlEditor>
      </div>
    </template>

    <template v-else></template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import BShopHtmlEditor from "@selldone/components-vue/backoffice/shop/html/editor/BShopHtmlEditor.vue";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";

export default defineComponent({
  name: "BShopThemeFooter",
  components: {
    USmartSelect,
    BShopHtmlEditor,
    UWidgetHeader,
  },
  inject: ["$shop"],
  emits: ["update:customCode"],
  props: {
    customCode: {},
  },

  data: () => ({
    ShopPermissionRegions: ShopPermissionRegions,
    footer_mode: "default" as "default" | "custom" | "none",
    last_custom_code: "",
  }),
  watch: {
    customCode(code) {
      if (this.isNoFooterCode(code)) {
        this.footer_mode = "none";
        return;
      }

      if (typeof code === "string" && code.length > 0) {
        this.last_custom_code = code;
        this.footer_mode = "custom";
        return;
      }

      if (this.footer_mode !== "custom") {
        this.footer_mode = "default";
      }
    },
  },
  computed: {
    footer_modes() {
      return [
        { id: "default", title: this.$t("shop_theme.studio.footer_modes.default_title"), description: this.$t("shop_theme.studio.footer_modes.default_description"), icon: "auto_fix_high" },
        { id: "custom", title: this.$t("shop_theme.studio.footer_modes.custom_title"), description: this.$t("shop_theme.studio.footer_modes.custom_description"), icon: "code" },
        { id: "none", title: this.$t("shop_theme.studio.footer_modes.none_title"), description: this.$t("shop_theme.studio.footer_modes.none_description"), icon: "visibility_off" },
      ];
    },
    theme() {
      return this.$shop.theme;
    },
  },

  created() {
    this.footer_mode = this.resolveFooterMode(this.customCode);

    if (this.footer_mode === "custom") {
      this.last_custom_code = this.customCode;
    }
  },

  methods: {
    isNoFooterCode(code: unknown) {
      return (
        typeof code === "string" &&
        code.trim().toLowerCase() === "<div></div>"
      );
    },

    resolveFooterMode(code: unknown) {
      if (this.isNoFooterCode(code)) return "none";

      return typeof code === "string" && code.length > 0
        ? "custom"
        : "default";
    },

    setFooterMode(mode: "default" | "custom" | "none" | null) {
      if (!mode) return;

      this.footer_mode = mode;

      if (mode === "default") {
        this.$emit("update:customCode", null);
        return;
      }

      if (mode === "none") {
        this.$emit("update:customCode", "<div></div>");
        return;
      }

      if (this.isNoFooterCode(this.customCode)) {
        this.$emit("update:customCode", this.last_custom_code || "");
      }
    },
  },
});
</script>

<style scoped lang="scss">
.b-shop-theme-footer {
  display: grid;
  gap: 22px;
  min-width: 0;

  &__subtitle { padding: 0; margin-block: 0 20px; min-height: 0; }
}
</style>
