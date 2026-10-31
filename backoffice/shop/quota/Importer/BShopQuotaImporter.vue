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
  <section v-if="modern" class="b-shop-quota-importer text-start">
    <header class="b-shop-quota-importer__header">
      <h3>{{ $t("quota_importer.quota") }}</h3>
      <div class="b-shop-quota-importer__shop">
        <v-avatar size="24">
          <v-img :src="getShopImagePath(shop.icon, 128)" />
        </v-avatar>
        <span>{{ shop.title }}</span>
      </div>
    </header>

    <dl class="sd-modern-stat-grid b-shop-quota-importer__stats">
      <div>
        <dt>{{ $t("importer.total_items") }}</dt>
        <dd>
          {{ newCount }}
          <p>{{ $t("quota_importer.file_statistic_msg") }}</p>
        </dd>
      </div>
      <div>
        <dt>{{ $t("importer.max_items_limit") }}</dt>
        <dd>
          {{ numeralFormat(quota_max + quota_extra, "0,0") }}
          <p>{{ $t("quota_importer.max_daily_limit_msg") }}</p>
        </dd>
      </div>
    </dl>

    <dl class="b-shop-quota-importer__limits">
      <div>
        <dt>
          {{ $t("quota_importer.max_batch_msg") }}
          <shop-license-view
            :shop="shop"
            small
            class="b-shop-quota-importer__license"
          />
        </dt>
        <dd>{{ numeralFormat(max_items_limit, "0a") }}</dd>
      </div>
      <div>
        <dt>{{ $t("quota_importer.max_daily_limit_msg") }}</dt>
        <dd>{{ numeralFormat(quota_max, "0a") }}</dd>
      </div>
      <div>
        <dt>{{ $t("quota_importer.extra_daily_limit_msg") }}</dt>
        <dd>{{ numeralFormat(quota_extra, "0a") }}</dd>
      </div>
      <div>
        <dt>{{ $t("quota_importer.add_items_today_msg") }}</dt>
        <dd>{{ numeralFormat(quota_usage, "0a") }}</dd>
      </div>
    </dl>

    <div
      class="sd-modern-notice b-shop-quota-importer__usage"
      :role="valid_count ? 'status' : 'alert'"
    >
      <div class="b-shop-quota-importer__status">
        <v-icon
          :color="valid_count ? 'success' : 'error'"
          size="18"
          aria-hidden="true"
        >
          {{ valid_count ? "check" : "error_outline" }}
        </v-icon>
        <span>{{
          $t(valid_count ? "global.commons.eligible" : "global.commons.invalid")
        }}</span>
        <span class="b-shop-quota-importer__fraction">
          {{ $t("quota_importer.used_quota") }}:
          {{ numeralFormat(quota_usage, "0,0.[0]a") }} /
          {{ numeralFormat(quota_max + quota_extra, "0,0.[0]a") }}
        </span>
      </div>
      <v-progress-linear
        :model-value="(100 * quota_usage) / (quota_max + quota_extra)"
        :aria-label="$t('quota_importer.used_quota')"
        color="var(--sd-modern-muted)"
        height="4"
        rounded
      />
      <p v-if="!valid_count">{{ $t("quota_importer.max_batch_msg") }}</p>
    </div>
  </section>
  <v-container v-else class="text-start">
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

            <div
              class="ma-2 pa-2 rounded-lg text-white text-uppercase"
              style="
                background: #ffffff33;
                backdrop-filter: blur(6px);
                text-shadow: #00000055 0px 0px 6px;
              "
            >
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
<script lang="ts">
import { defineComponent } from "vue";
import ShopLicenseView from "../../../shop/license/view/ShopLicenseView.vue";
import { ShopQuotaHelper } from "@selldone/core-js/enums/shop/quota/ShopQuota";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";

export default defineComponent({
  name: "BShopQuotaImporter",
  components: { ShopLicenseView },

  props: {
    modern: {
      type: Boolean,
      default: false,
    },
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

<style lang="scss" scoped>
.b-shop-quota-importer {
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;

  &__header,
  &__shop,
  &__status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__header {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.6;
  }
  p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 1.6;
  }
  dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  &__shop {
    min-width: 0;
    color: var(--sd-modern-muted);
  }
  &__shop > span {
    overflow-wrap: anywhere;
  }

  &__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 0;
    padding-block: 20px;
    border-block-end: 1px solid var(--sd-modern-border);

    dt {
      color: var(--sd-modern-muted);
      font-size: 13px;
    }
    dd {
      margin-block-start: 5px;
      font-size: 28px;
      line-height: 1.3;
    }
  }

  &__limits {
    margin: 0;

    > div {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 16px;
      padding-block: 12px;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    > div:last-child {
      border: 0;
    }
    dd {
      text-align: end;
    }
  }

  &__license {
    display: block;
    width: fit-content;
    margin-block-start: 6px;
    font-size: 13px;
    font-weight: 500 !important;
  }

  &__usage {
    display: block;
    padding: 14px 16px;
    margin-block-start: 8px;
    > p {
      color: inherit;
    }
  }
  &__status {
    flex-wrap: wrap;
    margin-block-end: 10px;
    font-size: 13px;
  }
  &__fraction {
    margin-inline-start: auto;
    color: var(--sd-modern-muted);
  }

  @media (max-width: 599px) {
    &__fraction {
      flex-basis: 100%;
      margin-inline-start: 0;
    }
  }
}
</style>
