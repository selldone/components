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
  <v-card class="text-start text-wrap" :elevation="elevation" rounded="xl">
    <v-card-title class="text-subtitle-2 d-flex align-center">
      <v-icon class="me-1">{{ $t(quotaKey.icon)}}</v-icon>
      <b>{{ $t("quota_importer.quota") }} | {{$t(quotaKey.title)}}</b>
    </v-card-title>
    <v-card-subtitle>
      Total items limit:
      <b>{{ numeralFormat(quota_max + quota_extra, "0,0") }}</b>
    </v-card-subtitle>
    <v-card-text class="text-h4">
      <v-list class="border-between-vertical" lines="two" density="compact">
        <v-list-item>
          <template v-slot:prepend>
            <span class="me-2 text-h5" style="min-width: 40px">
              {{ numeralFormat(max_items_limit, "0a") }}
            </span>
          </template>
          <v-list-item-title>
            <shop-license-view :shop="$shop" class="mx-1"></shop-license-view>
          </v-list-item-title>
          <v-list-item-subtitle> Remains items. </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template v-slot:prepend>
            <span class="me-2 text-h5" style="min-width: 40px">
              {{ numeralFormat(quota_max, "0a") }}
            </span>
          </template>

          <v-list-item-title>
            <v-avatar
              class="me-2 avatar-gradient -thin -shop"
              color="primary"
              size="24"
            >
              <v-img :src="getShopImagePath($shop.icon, 128)" />
            </v-avatar>
            <b>{{ $shop.title }}</b>
          </v-list-item-title>
          <v-list-item-subtitle>
            Maximum items you can add per day.
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template v-slot:prepend>
            <span class="me-2" style="min-width: 40px">
              <v-icon size="28">add</v-icon>
            </span>
          </template>

          <v-list-item-title>
            {{ numeralFormat(quota_extra, "0a") }}
          </v-list-item-title>
          <v-list-item-subtitle>
            Additional items allowed beyond the daily limit.
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template v-slot:prepend>
            <span class="me-2" style="min-width: 40px">
              <v-icon size="28">remove</v-icon>
            </span>
          </template>
          <v-list-item-title>
            {{ numeralFormat(quota_usage, "0a") }}
          </v-list-item-title>
          <v-list-item-subtitle> Used items today. </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ShopLicenseView from "@selldone/components-vue/backoffice/shop/license/view/ShopLicenseView.vue";
import { ShopQuotaHelper } from "@selldone/core-js/enums/shop/quota/ShopQuota.ts";

export default defineComponent({
  name: "BShopQuotaCard",
  components: { ShopLicenseView },
  inject: ["$shop"],

  props: {
    /**
     * {@link shopQuota}
     */
    quotaKey: {
      type: Object,
      required: true,
    },
    elevation:{
      default:3
    }
  },

  computed: {
    max_items_limit() {
      return this.quota_max + this.quota_extra - this.quota_usage;
    },

    quota_max() {
      return ShopQuotaHelper.GetShopQuotaMax(this.$shop, this.quotaKey);
    },
    quota_extra() {
      return ShopQuotaHelper.GetShopQuotaExtra(this.$shop, this.quotaKey);
    },
    quota_usage() {
      return ShopQuotaHelper.GetShopQuotaUsage(this.$shop, this.quotaKey);
    },
  },
});
</script>

<style scoped lang="scss"></style>
