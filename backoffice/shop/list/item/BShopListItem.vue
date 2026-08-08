<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
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
  <v-list-item
    :class="{
      'bg-red-lighten-5 border-opacity-50': shop.deleted_at,
      'bg-surface': !shop.deleted_at,
    }"
    :to="shop.deleted_at ? undefined : to"
    border
    class="pa-0 mb-2"
    rounded="lg"
  >
    <v-row align="center" class="ma-0 px-3 px-sm-4 py-3" no-gutters>
      <v-col :md="shop.deleted_at ? 8 : 5" cols="12">
        <div class="d-flex align-center">
          <v-avatar
            :class="{ 'opacity-70': shop.deleted_at }"
            :color="shop.deleted_at ? 'red-lighten-4' : 'grey-lighten-4'"
            class="flex-shrink-0"
            rounded="lg"
            size="52"
          >
            <v-img
              v-if="shop.icon"
              :alt="shop.title"
              :src="getShopImagePath(shop.icon, 128)"
              cover
            />
            <v-icon v-else :color="shop.deleted_at ? 'error' : 'primary'">
              storefront
            </v-icon>
          </v-avatar>

          <div class="ms-3 flex-grow-1 overflow-hidden">
            <div class="d-flex align-center flex-wrap gc-2 gr-1">
              <strong class="text-body-1 text-high-emphasis">
                {{ shop.title }}
              </strong>

              <v-chip
                v-if="shop.deleted_at"
                color="error"
                label
                prepend-icon="delete_outline"
                size="x-small"
                variant="tonal"
              >
                {{ $t("global.commons.deleted") }}
              </v-chip>
              <v-chip
                v-else
                :color="shop.active ? 'success' : 'blue-grey'"
                label
                size="x-small"
                variant="tonal"
              >
                <v-icon size="8" start>circle</v-icon>
                {{
                  shop.active
                    ? $t("global.commons.active")
                    : $t("global.commons.inactive")
                }}
              </v-chip>

              <v-chip
                v-if="shop.user_id === USER_ID()"
                color="amber-darken-3"
                label
                prepend-icon="fa:fas fa-crown"
                size="x-small"
                variant="tonal"
              >
                {{ $t("global.commons.owner") }}
              </v-chip>
            </div>

            <div
              class="d-flex align-center flex-wrap gc-3 gr-1 mt-2 text-caption text-medium-emphasis"
            >
              <span class="font-weight-medium text-no-wrap" dir="ltr">
                @{{ handle }}
              </span>

              <span
                :title="$t('user_dashboard.shops.shop_card.license')"
                class="d-inline-flex align-center ga-1 text-no-wrap"
              >
                <img
                  :alt="getShopLicenseName(shop.license)"
                  :src="getShopLicenseIcon(shop.license)"
                  height="17"
                  width="17"
                />
                {{ getShopLicenseName(shop.license) }}
              </span>

              <span
                v-if="shop.deleted_at"
                class="d-inline-flex align-center text-error text-no-wrap"
              >
                <v-icon class="me-1" size="14">history</v-icon>
                {{
                  $t("shops_list.deleted.deleted_at", {
                    time: getFromNowString(shop.deleted_at),
                  })
                }}
              </span>
              <span
                v-else-if="shop.created_at"
                class="d-inline-flex align-center text-no-wrap"
              >
                <v-icon class="me-1" size="14">schedule</v-icon>
                {{
                  $t("shops_list.created_at", {
                    time: getFromNowString(shop.created_at),
                  })
                }}
              </span>
            </div>
          </div>
        </div>
      </v-col>

      <v-col
        v-if="shop.deleted_at"
        class="pt-3 pt-md-0 ps-md-4"
        cols="12"
        md="4"
      >
        <v-divider class="mb-3 d-md-none" />

        <div class="d-flex justify-md-end">
          <b-shop-recovery-dialog
            v-model="recoveryDialog"
            :disabled="recoveryDisabled"
            :loading="recoveryLoading"
            :shop="shop"
            @recover="$emit('recover', $event)"
          >
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                :block="$vuetify.display.smAndDown"
                :disabled="recoveryDisabled || recoveryLoading"
                :loading="recoveryLoading"
                class="font-weight-bold px-5 text-none"
                color="primary"
                elevation="0"
                prepend-icon="settings_backup_restore"
                rounded="lg"
                size="default"
                variant="flat"
              >
                {{ $t("shops_list.deleted.recover") }}
              </v-btn>
            </template>
          </b-shop-recovery-dialog>
        </div>
      </v-col>

      <template v-else>
        <v-col class="pt-3 pt-md-0 ps-md-4" cols="12" md="6">
          <v-divider class="mb-3 d-md-none" />

          <v-row class="ma-0" no-gutters>
            <v-col
              class="d-flex d-sm-block align-center justify-space-between px-1 px-sm-2 py-1"
              cols="12"
              sm="4"
            >
              <div
                class="d-flex align-center ga-1 text-caption text-medium-emphasis text-no-wrap"
              >
                <v-icon size="15">receipt_long</v-icon>
                <span>{{ $t("user_dashboard.shops.shop_card.orders") }}</span>
              </div>
              <div
                class="mt-sm-1 text-body-2 font-weight-bold text-high-emphasis"
              >
                {{ numeralFormat(orderCount, "0.[0]a") }}
              </div>
            </v-col>

            <v-col
              class="d-flex d-sm-block align-center justify-space-between px-1 px-sm-2 py-1"
              cols="12"
              sm="4"
            >
              <div
                class="d-flex align-center ga-1 text-caption text-medium-emphasis text-no-wrap"
              >
                <v-icon size="15">payments</v-icon>
                <span>{{ $t("user_dashboard.shops.shop_card.payments") }}</span>
              </div>
              <div
                class="d-flex align-center justify-end justify-sm-start flex-wrap ga-1 mt-sm-1 text-body-2 font-weight-bold text-high-emphasis"
              >
                <u-price
                  v-for="finance in visiblePayments"
                  :key="finance.currency"
                  :amount="finance.pay"
                  :currency="finance.currency"
                  compact
                />
                <span v-if="hiddenPaymentsCount" class="text-medium-emphasis">
                  +{{ hiddenPaymentsCount }}
                </span>
                <span v-if="!payments.length">—</span>
              </div>
            </v-col>

            <v-col
              class="d-flex d-sm-block align-center justify-space-between px-1 px-sm-2 py-1"
              cols="12"
              sm="4"
            >
              <div
                class="d-flex align-center ga-1 text-caption text-medium-emphasis text-no-wrap"
              >
                <v-icon size="15">visibility</v-icon>
                <span :title="$t('shops_list.total_views')">
                  {{ $t("global.commons.views") }}
                </span>
              </div>
              <div
                class="mt-sm-1 text-body-2 font-weight-bold text-high-emphasis"
              >
                {{ numeralFormat(shop.total_views || 0, "0.[0]a") }}
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col
          class="d-none d-md-flex align-center justify-end"
          cols="12"
          md="1"
        >
          <v-icon class="text-medium-emphasis" size="22">
            {{ $vuetify.locale.isRtl ? "chevron_left" : "chevron_right" }}
          </v-icon>
        </v-col>
      </template>
    </v-row>
  </v-list-item>
</template>

<script lang="ts">
import BShopRecoveryDialog from "@selldone/components-vue/backoffice/shop/recovery/dialog/BShopRecoveryDialog.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import LicenseMixin from "@selldone/components-vue/mixin/license/LicenseMixin.ts";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";

const ORDER_COUNT_FIELDS = [
  "sell_products_virtual",
  "sell_products_physical",
  "sell_products_file",
  "sell_products_service",
  "sell_products_subscription",
];
const MAX_VISIBLE_PAYMENTS = 1;

export default {
  name: "BShopListItem",
  components: { BShopRecoveryDialog, UPrice },
  mixins: [DateMixin, LicenseMixin],
  emits: ["recover"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    to: {
      type: [Object, String],
    },
    recoveryDisabled: {
      default: false,
      type: Boolean,
    },
    recoveryLoading: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    recoveryDialog: false,
  }),
  computed: {
    handle() {
      return (
        this.shop.original_name ||
        String(this.shop.name || "").split("::deleted-")[0]
      );
    },
    orderCount() {
      const lastData = this.shop.lastdata || {};

      return ORDER_COUNT_FIELDS.reduce(
        (total, field) => total + (Number(lastData[field]) || 0),
        0,
      );
    },
    payments() {
      return (this.shop.lastdata?.finances || []).filter(
        (finance) => Number(finance.pay) > 0,
      );
    },
    visiblePayments() {
      return this.payments.slice(0, MAX_VISIBLE_PAYMENTS);
    },
    hiddenPaymentsCount() {
      return Math.max(this.payments.length - MAX_VISIBLE_PAYMENTS, 0);
    },
  },
};
</script>
