<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="widget-box -x-large">
    <s-widget-header
      :title="$t('shop_license.license_detail.title')"
      icon="info"
    >
      <template v-slot:actions>
        <div v-if="plan && $vuetify.display.smAndUp">
          <div class="text-h4 p-4 font-weight-black highlight-yellow">
            {{ plan.name }}
          </div>
        </div>

        <span v-if="plan" class="ms-2">
          <u-smart-menu
            :items="[
              {
                title: 'Request Cancel Deal',
                icon: 'clear',
                click: () => {
                  verify_code = null;
                  cancel_plan_dialog = true;
                },
              },
            ]"
          >
          </u-smart-menu>
        </span>
      </template>
    </s-widget-header>

    <v-list-subheader
      >{{ $t("shop_license.license_detail.subtitle") }}
    </v-list-subheader>

    <div class="small mt-3 mb-1">
      <v-avatar class="me-1" rounded size="24">
        <img
          :src="
            agency && agency.logo
              ? getShopImagePath(agency.logo)
              : require('../../../../../assets/selldone-logo/selldone.svg')
          "
        />
      </v-avatar>

      <b>{{ getShopLicenseName(shop.license) }}</b>
      <template v-if="plan">
        <span class="mx-1">/</span>
        <b class="text-capitalize">{{ plan.name }}</b>
      </template>

      <u-text-value-box
        v-if="agency_client"
        :value="agency_client.uuid"
        class="mt-3 max-widget-width mx-auto"
        label="Your Deal UUID."
      >
      </u-text-value-box>
    </div>

    <div v-if="show_add_more_shops" class="widget-buttons">
      <v-btn
        :href="add_url"
        :loading="loading_add"
        color="#000"
        size="x-large"
        @click="loading_add = true"
      >
        <v-icon start>add_business</v-icon>
        Create new business (shop)
        <v-icon class="mx-2" size="small">add</v-icon>
        <img
          :src="getShopLicenseIcon(plan.license)"
          class="mx-1"
          height="24"
          width="24"
        />
      </v-btn>
    </div>

    <hr class="my-5" />

    <div class="typo-body">
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Partners License (Override Values) ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <template v-if="plan">
        <b-shop-license-partner-overrided
          :client="agency_client"
          :plan="plan"
          :shops-count="used_shops_count"
          :showPlanStores="show_plan_stores"
          class="font-weight-bold"
        ></b-shop-license-partner-overrided>

        <p class="font-weight-bold mt-5">
          {{
            $t("price_list.common_features", {
              license: getShopLicenseName(shop.license).toLowerCase(),
            })
          }}:
        </p>
      </template>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Normal License (Default Values) ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <template v-else>
        <!-- Custom domains -->
        <div>
          <v-icon class="me-1" color="green">check</v-icon>
          <v-icon v-if="domains >= 9999" color="#111">all_inclusive</v-icon>
          <span v-else>{{ domains }}</span>
          {{ $t("price_list.domains") }}
        </div>

        <!-- Staff -->
        <div>
          <v-icon class="me-1" color="green">check</v-icon>

          <v-icon v-if="staff >= 9999" color="#111">all_inclusive</v-icon>
          <span v-else>{{ staff }}</span>

          {{ $t("price_list.staff") }}
        </div>

        <!-- Community -->
        <div v-if="limits.community">
          <v-icon class="me-1" color="green">check</v-icon>
          {{ $t("price_list.community_builder") }}
        </div>
      </template>

      <!-- Storage -->
      <div v-if="['COMPANY', 'ENTERPRISE'].includes(license_object.code)">
        <v-icon class="me-1" color="green">check</v-icon>
        {{ $t("price_list.unlimited_storage") }}
      </div>

      <!-- Discount codes -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits["discount-codes"] }}
        {{ $t("price_list.active_discount_codes") }}
      </div>

      <!-- Coupons -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits.coupons }}
        {{ $t("price_list.active_coupons") }}
      </div>

      <!-- Offers -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits.offers }}
        {{ $t("price_list.active_offers") }}
      </div>

      <!-- Gift cards -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits["gift-card-types"] }}
        {{ $t("price_list.active_gift_card_types") }}
      </div>

      <!-- Campaigns -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits.campaigns }}
        {{ $t("price_list.active_campaigns") }}
      </div>

      <!-- Affiliates -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits.affiliates }}
        {{ $t("price_list.active_affiliates") }}
      </div>

      <!-- Emails -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits.emails }}
        {{ $t("price_list.active_emails") }}
      </div>

      <!-- Couriers -->
      <div>
        <v-icon class="me-1" color="green">check</v-icon>
        {{ limits["transportation-persons"] }}
        {{ $t("price_list.active_transportation_persons") }}
      </div>

      <!-- Support -->
      <div v-if="['COMPANY'].includes(license_object.code)">
        <v-icon class="me-1" color="green">check</v-icon>

        {{ $t("price_list.priority_support") }}
      </div>
      <div v-if="license_object.code === 'ENTERPRISE'">
        <v-icon class="me-1" color="green">check</v-icon>

        {{ $t("price_list.support_247") }}
      </div>

      <v-btn
        :to="{ name: 'OPagePrice' }"
        class="tnt my-2"
        color="primary"
        target="_blank"
        variant="text"
      >
        {{ $t("price_list.read_more") }}
      </v-btn>
    </div>

    <slot></slot>

    <!-- █████████████████ Dialog > Cancel Plan █████████████████ -->
    <v-dialog
      v-model="cancel_plan_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>
          <v-avatar class="me-1" rounded size="24">
            <img
              :src="
                agency?.logo
                  ? getShopImagePath(agency.logo)
                  : require('../../../../../assets/selldone-logo/selldone.svg')
              "
            />
          </v-avatar>

          {{ plan?.name }} | Cancel Deal
        </v-card-title>

        <v-card-text>
          <div class="widget-box mb-5">
            <s-widget-header
              icon="warning_amber"
              title="Permanent cancellation"
            ></s-widget-header>
            <v-list-subheader>
              Once you submit a cancellation request here, you will receive a
              confirmation link on shop owner mail box. Canceling this plan will
              result in the permanent termination of this deal for the current
              shop.
            </v-list-subheader>
            <v-text-field
              v-model="verify_code"
              :placeholder="`Enter Your Shop Name: ${shop.name}`"
              class="my-3 strong-field"
            ></v-text-field>

            <u-smart-verify
              v-model="verify_cancellation"
              class="my-3"
              true-description="I wish to terminate the existing deal in this shop."
              true-title="Verify cancel deal"
            ></u-smart-verify>

            <div class="widget-buttons">
              <v-btn
                :disabled="!verify_cancellation || verify_code !== shop.name"
                :loading="busy_cancel"
                color="primary"
                size="x-large"
                @click="confirmCancelDeal"
              >
                <v-icon class="me-1">done</v-icon>
                Request Cancel Deal
              </v-btn>
            </div>

            <hr />
            <v-list-subheader>
              <div>
                <b>Important:</b> You only have the option to remove this shop
                from your purchased deal! This action will not affect the
                purchased deal itself. If you wish to cancel or modify the
                purchased deal, please navigate to your dashboard and select the
                'Deals' tab.
              </div>
            </v-list-subheader>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="cancel_plan_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  ShopLicense,
  ShopLicenseLimits,
} from "@selldone/core-js/enums/shop/ShopLicense";
import BShopLicensePartnerOverrided from "../../../../shop/license/partner/overrided/BShopLicensePartnerOverrided.vue";

import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import USmartVerify from "../../../../../ui/smart/verify/USmartVerify.vue";
import UTextValueBox from "../../../../../ui/text/value-box/UTextValueBox.vue";

export default {
  name: "BShopLicenseSubscriptionDetail",
  components: {
    UTextValueBox,
    USmartVerify,
    USmartMenu,

    BShopLicensePartnerOverrided,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    loading_add: false,

    cancel_plan_dialog: false,
    verify_cancellation: false,
    verify_code: null,
    busy_cancel: false,
  }),

  computed: {
    agency_client() {
      return this.shop.agency_client;
    },
    agency() {
      return this.agency_client && this.agency_client.agency;
    },
    plan() {
      return this.agency_client && this.agency_client.plan;
    },
    used_shops_count() {
      return this.agency_client && this.agency_client.used_shops_count;
    },
    show_plan_stores() {
      return (
        this.agency_client && this.shop.user_id === this.agency_client.user_id
      ); // Show only if shop did not transfer to others!
    },

    add_url() {
      return this.agency_client && this.agency_client.add_url;
    },

    giveaways() {
      return this.agency_client && this.agency_client.giveaways
        ? this.agency_client.giveaways
        : 0;
    },

    show_add_more_shops() {
      return (
        this.show_plan_stores &&
        this.used_shops_count < this.plan.stores + this.giveaways &&
        this.add_url
      );
    },

    license_object() {
      return ShopLicense[this.shop.license];
    },
    limits() {
      return ShopLicenseLimits[this.shop.license];
    },
    domains() {
      return this.plan && this.plan.domains
        ? this.plan.domains
        : this.limits.domains;
    },
    staff() {
      return this.plan && this.plan.staff ? this.plan.staff : this.limits.staff;
    },
  },

  methods: {
    confirmCancelDeal() {
      this.busy_cancel = true;
      axios
        .post(window.API.POST_SHOP_CANCEL_ACTIVE_DEAL(this.shop.id), {
          uuid: this.agency_client.uuid, // Agency Client UUID
        })
        .then(({ data }) => {
          if (!data.error) {
            this.cancel_plan_dialog = false;
            this.showSuccessAlert(
              null,
              "A confirmation link to cancel the deal has been dispatched to the email of the shop owner.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_cancel = false;
        });
    },
  },
};
</script>

<style scoped></style>
