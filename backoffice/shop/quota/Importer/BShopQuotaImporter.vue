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
  <v-container class="text-start">
    <v-row align="stretch" justify="space-around">
      <v-col cols="12" sm="4">
        <v-card class="min-h-100" elevation="24" rounded="xl">
          <v-card-title>
            <b>{{ $t("quota_importer.quota") }}</b>
          </v-card-title>
          <v-card-subtitle>
            {{ $t("importer.max_items_limit") }} |
            <b>{{ numeralFormat(quota_max + quota_extra, "0,0") }}</b>
          </v-card-subtitle>
          <v-card-text class="text-h4">
            <v-list
              class="border-between-vertical"
              lines="two"
              density="compact"
            >
              <v-list-item>
                <template v-slot:prepend>
                  <span class="me-2 text-h5" style="min-width: 40px">
                    {{ numeralFormat(max_items_limit, "0a") }}
                  </span>
                </template>
                <v-list-item-title>
                  <shop-license-view
                    :shop="shop"
                    class="mx-1"
                  ></shop-license-view>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ $t("quota_importer.max_batch_msg") }}
                </v-list-item-subtitle>
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
                    <v-img :src="getShopImagePath(shop.icon, 128)" />
                  </v-avatar>
                  <b>{{ shop.title }}</b>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ $t("quota_importer.max_daily_limit_msg") }}
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
                  {{ $t("quota_importer.extra_daily_limit_msg") }}
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
                <v-list-item-subtitle>
                  {{ $t("quota_importer.add_items_today_msg") }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card
          :dark="!valid_count"
          :image="
            valid_count
              ? require('./assets/import-accepted-card.jpg')
              : require('./assets/import-rejected-card.jpg')
          "
          class="min-h-100"
          elevation="24"
          rounded="xl"
        >
          <v-card-title>
            <b> {{ $t("importer.total_items") }}</b>
          </v-card-title>
          <v-card-subtitle>
            <img
              class="me-1"
              height="16"
              src="../../../../assets/file/excel.svg"
              width="16"
            />
            {{ $t("quota_importer.file_statistic_msg") }}
          </v-card-subtitle>

          <v-card-text>
            <div class="text-h4 font-weight-black text-center">
              {{ newCount }}
            </div>
          </v-card-text>
          <v-card-text class="text-center">
            <v-progress-circular
              :color="valid_count ? 'primary' : 'red'"
              :model-value="(100 * quota_usage) / (quota_max + quota_extra)"
              :size="84"
              :width="12"
            >
              <u-check
                :model-value="valid_count"
                false-icon="cancel"
                read-only
                size="32"
                true-color="#388E3C"
                false-color="red"
                true-icon="check_circle"
              ></u-check>
            </v-progress-circular>

            <div class="ma-2 pa-2 rounded-lg text-white text-uppercase" style="background: #ffffff33;backdrop-filter: blur(6px);text-shadow: #00000055 0px 0px 6px;">
              {{ $t("quota_importer.used_quota") }}:
              {{ numeralFormat(quota_usage, "0,0.[0]a") }} /
              {{ numeralFormat(quota_max + quota_extra, "0,0.[0]a") }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { defineComponent } from "vue";
import ShopLicenseView from "../../../shop/license/view/ShopLicenseView.vue";
import { ShopQuotaHelper } from "@selldone/core-js/enums/shop/quota/ShopQuota";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";

export default defineComponent({
  name: "BShopQuotaImporter",
  components: { ShopLicenseView },

  props: {
    shop: {
      type: Object,
      required: true,
    },

    newCount: {
      type: Number,
      required: true,
    },

    /**
     * {@link shopQuota}
     */
    quotaKey: {
      type: Object,
      required: true,
    },
  },

  computed: {
    max_items_limit() {
      return Eligible.getImportQueLimit(this.shop);
    },

    quota_max() {
      const out = ShopQuotaHelper.GetShopQuotaMax(this.shop, this.quotaKey);
      return out ? out : this.max_items_limit; // If not set, use default limit!
    },
    quota_extra() {
      return ShopQuotaHelper.GetShopQuotaExtra(this.shop, this.quotaKey);
    },
    quota_usage() {
      return ShopQuotaHelper.GetShopQuotaUsage(this.shop, this.quotaKey);
    },

    valid_count() {
      return this.newCount <= this.max_items_limit;
    },
  },
});
</script>

<style lang="scss" scoped></style>
