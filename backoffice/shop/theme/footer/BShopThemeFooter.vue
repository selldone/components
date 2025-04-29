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
    <div class="widget-box mb-5">
      <u-smart-switch
        v-model="custom_mode"
        @update:model-value="
          (v) => {
            if (!v) $emit('update:customCode', null);
          }
        "
        true-title="Custom Code Mode"
        true-description="You can enter your HTMl/Vue code to replace footer."
        true-icon="code"
        false-title="Default Smart Mode"
        false-description="Use default dynamic and well crafted footer for high conversion."
        false-icon="auto_fix_high"
        :disabled="!writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
      ></u-smart-switch>
    </div>

    <template v-if="custom_mode">
      <div class="widget-box -large py-5">
        <u-widget-header
          icon="code"
          title="Custom Footer Code"
        ></u-widget-header>
        <v-list-subheader>
          You can past custom HTML or even Vue + Vuetify components code here to
          replace default website footer. You must implement all functionality
          by yourself.
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
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";

export default defineComponent({
  name: "BShopThemeFooter",
  components: {
    USmartSwitch,
    USmartToggle,
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
    custom_mode: false,
  }),
  computed: {
    theme() {
      return this.$shop.theme;
    },
  },

  created() {
    this.custom_mode = !!(this.customCode && this.customCode.length > 0);
  },
});
</script>

<style scoped lang="scss"></style>
