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
      <u-widget-header
        :title="$t('b_shop_theme_vendor.onboarding.title')"
        icon="login"
      >
      </u-widget-header>
      <v-list-item-subtitle>
        {{ $t("b_shop_theme_vendor.onboarding.subtitle") }}
      </v-list-item-subtitle>

      <b-page-input
        :model-value="vendorPageLoginId"
        @update:model-value="(p) => $emit('update:vendorPageLoginId', p)"
        :label="$t('b_shop_theme_vendor.inputs.page_vendor_login.label')"
        :message="$t('b_shop_theme_vendor.inputs.page_vendor_login.message')"
        published-only
        clearable
        :returnObject="false"
      ></b-page-input>

      <b-page-input
        :model-value="vendorPageRegisteredId"
        @update:model-value="(p) => $emit('update:vendorPageRegisteredId', p)"
        :label="$t('b_shop_theme_vendor.inputs.page_vendor_registered.label')"
        :message="
          $t('b_shop_theme_vendor.inputs.page_vendor_registered.message')
        "
        published-only
        clearable
        :returnObject="false"
      ></b-page-input>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import SVideoUploader from "@selldone/components-vue/ui/uploader/SVideoUploader.vue";
import BPageInput from "@selldone/components-vue/backoffice/page/input/BPageInput.vue";

export default defineComponent({
  name: "BShopThemeVendor",
  components: { BPageInput, SVideoUploader, UWidgetHeader },

  inject: ["$shop"],
  emits: ["update:vendorPageLoginId", "update:vendorPageRegisteredId"],

  props: {
    vendorPageLoginId: {},
    vendorPageRegisteredId: {},
  },

  computed: {},
});
</script>

<style scoped lang="scss"></style>
