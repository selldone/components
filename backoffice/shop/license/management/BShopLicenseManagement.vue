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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <!-- ██████████████████ Agency Client ██████████████████ -->

    <div v-if="agency_client">
      <div class="widget-box -large mb-5">
        <u-widget-header
          :title="$t('shop_license.active_license.title')"
          icon="workspace_premium"
        >
        </u-widget-header>

        <v-list-subheader
          >{{
            agency
              ? $t("shop_license.active_license.subtitle_partner", {
                  name: agency.name,
                })
              : $t("shop_license.active_license.subtitle")
          }}
        </v-list-subheader>

        <v-row align="start" class="text-center my-1">
          <v-col v-if="agency" class="text-start mb-2" cols="12" md="4" sm="6">
            <div class="d-flex align-start">
              <v-avatar class="me-3" rounded size="72">
                <img :src="getShopImagePath(agency.logo)" />
              </v-avatar>

              <div class="flex-grow-1">
                <h2 class="mb-1">
                  <img
                    v-if="agency.official"
                    class="me-1"
                    height="24"
                    src="../../../../assets/selldone-logo/logo-box.svg"
                    width="24"
                  />
                  {{
                    agency.official
                      ? agency.name
                      : $t("onboarding.partners.title", { name: agency.name })
                  }}
                </h2>
                <h3 class="font-weight-light">
                  {{
                    agency.official
                      ? $t("onboarding.partners.subtitle_official")
                      : $t("onboarding.partners.subtitle")
                  }}
                </h3>

                <div v-if="agency.phone">
                  <v-icon class="me-1" size="small">call</v-icon>
                  {{ agency.phone }}
                </div>
                <div v-if="agency.email">
                  <v-icon class="me-1" size="small">email</v-icon>

                  {{ agency.email }}
                </div>

                <v-chip
                  v-if="agency.url"
                  :href="agency.url"
                  size="small"
                  target="_blank"
                  variant="text"
                >
                  <v-icon start>public</v-icon>

                  {{ agency.url.replace("https://", "") }}

                  <v-icon end>open_in_new</v-icon>
                </v-chip>
              </div>
            </div>
          </v-col>
          <v-col v-if="plan" cols="12" md="3" sm="6">
            <small class="d-block">{{ $t("global.commons.license") }}</small>
            <h2>
              <img
                :src="getShopLicenseIcon(plan.license)"
                class="me-1"
                height="36"
                width="36"
              />
              {{ getShopLicenseName(plan.license) }}
            </h2>
          </v-col>

          <v-col cols="12" md="3" sm="6">
            <small class="d-block">{{ $t("global.commons.expire_at") }}</small>
            <h2 v-if="shop.expire_at">
              {{ getLocalDateString(shop.expire_at) }}
            </h2>
            <v-icon
              v-else
              :title="$t('global.commons.infinite')"
              color="#111"
              size="large"
              >all_inclusive
            </v-icon>
          </v-col>

          <v-col cols="12" md="2" sm="6">
            <small class="d-block">{{ $t("global.commons.fee") }}</small>
            <h2>
              %{{ plan && plan.fee ? plan.fee : license_object.wage_percent }}
            </h2>
          </v-col>

          <v-col v-if="!agency.official" class="text-start" cols="12">
            <u-smart-toggle
              v-model="read_access"
              :loading="busy_access"
              false-gray
              false-icon="disabled_visible"
              true-description="Do you confirm that the agency has read access to this store?"
              true-icon="visibility"
              true-title="Agency Read Access"
              @change="setAgencyReadAccess"
            >
            </u-smart-toggle>
          </v-col>
        </v-row>
      </div>

      <!-- Fix sho license issue -->

      <div
        v-if="
          (plan && plan.license !== shop.license) ||
          !(
            (
              (agency_client.expire_at &&
                shop.expire_at &&
                agency_client.expire_at
                  .convertToLocalDate()
                  .isSameDay(
                    shop.expire_at.convertToLocalDate(),
                  )) /*Normal limited time mode*/ ||
              (!agency_client.expire_at && !shop.expire_at)
            ) /*Lifetime mode*/
          )
        "
        class="widget-box -large mb-5"
      >
        <u-widget-header icon="build" title="Deal Issue Fix"></u-widget-header>
        <v-list-subheader>
          Your shop currently has an active deal; however, some information
          about your shop and the associated plan does not align. Please click
          the 'Fix' button for an automatic resolution. If you encounter any
          issues, feel free to contact our support team.
        </v-list-subheader>
        <v-list-subheader>
          <div>
            <v-avatar class="me-1" rounded size="20">
              <img :src="getShopImagePath(shop.icon, 128)" />
            </v-avatar>
            {{ shop.license }}

            <v-icon class="mx-2">{{ $t("icons.chevron_next") }}</v-icon>

            <v-avatar class="mx-1" rounded size="20">
              <img :src="getShopImagePath(agency.logo)" />
            </v-avatar>
            {{ plan.license }}
          </div>
        </v-list-subheader>
        <v-list-subheader>
          <div>
            <v-avatar class="me-1" rounded size="20">
              <img :src="getShopImagePath(shop.icon, 128)" />
            </v-avatar>

            {{ getLocalDateString(shop.expire_at) }}

            <v-icon class="mx-2">{{ $t("icons.chevron_next") }}</v-icon>

            <v-avatar class="mx-1" rounded size="20">
              <img :src="getShopImagePath(agency.logo)" />
            </v-avatar>
            {{ getLocalDateString(agency_client.expire_at) }}
          </div>
        </v-list-subheader>

        <div class="widget-buttons">
          <v-btn
            :loading="busy_fix"
            color="primary"
            size="x-large"
            @click="autoFixShopLicense()"
          >
            <v-icon class="me-1">autorenew</v-icon>
            Fix & Update shop license
          </v-btn>
        </div>
      </div>

      <b-shop-license-subscription-detail
        v-if="showPartnerUpgrade"
        :shop="shop"
        class="my-5"
      >
        <v-expand-transition>
          <div v-if="partner_upgrade_url">
            <p class="typo-body">
              <img class="me-1" height="24" src="./assets/cat.svg" width="24" />

              {{
                $t("price_list.partners_upgrade_suggestion_message", {
                  name: agency.name,
                })
              }}
            </p>
            <div class="widget-buttons">
              <v-btn
                :href="partner_upgrade_url"
                color="primary"
                size="x-large"
                target="_blank"
                variant="flat"
              >
                <v-icon class="me-1">switch_access_shortcut_add</v-icon>
                {{
                  $t("price_list.partners_upgrade_suggestion_action", {
                    name: agency.name,
                  })
                }}

                <v-icon class="ms-2">{{ $t("icons.chevron_next") }}</v-icon>
              </v-btn>
            </div>
          </div>
        </v-expand-transition>
      </b-shop-license-subscription-detail>
    </div>

    <!-- ██████████████████ Normal User ██████████████████ -->

    <div v-else>
      <!-- Current shop license info -->

      <div class="widget-box -large mb-5">
        <u-widget-header
          :title="$t('shop_license.active_license.title')"
          icon="workspace_premium"
        >
        </u-widget-header>

        <v-list-subheader
          >{{ $t("shop_license.active_license.subtitle") }}
        </v-list-subheader>

        <v-row align="center" class="text-center my-1">
          <v-col cols="12" md="4" sm="4">
            <small class="d-block">{{ $t("global.commons.license") }}</small>
            <h2>
              <img
                :src="getShopLicenseIcon(shop.license)"
                class="me-1"
                height="36"
                width="36"
              />
              {{ getShopLicenseName(shop.license) }}
            </h2>
          </v-col>

          <v-col cols="12" md="4" sm="4">
            <small class="d-block">{{ $t("global.commons.expire_at") }}</small>
            <h2 v-if="shop.expire_at">
              {{ getLocalDateString(shop.expire_at) }}
            </h2>
            <v-icon
              v-else
              :title="$t('global.commons.infinite')"
              color="#111"
              size="large"
              >all_inclusive
            </v-icon>
          </v-col>

          <v-col cols="12" md="4" sm="4">
            <small class="d-block">{{ $t("global.commons.fee") }}</small>
            <h2>%{{ license_object.wage_percent }}</h2>
          </v-col>
        </v-row>
      </div>

      <shop-subscription-list
        v-if="showSubscriptionsList"
        :shop="shop"
        class="mb-5"
      ></shop-subscription-list>

      <b-shop-license-subscription-detail
        v-if="showSubscriptionDetails"
        :shop="shop"
        class="mb-5"
      ></b-shop-license-subscription-detail>
    </div>
  </div>
</template>

<script lang="ts">
import ShopSubscriptionList from "../../../subscription/ShopSubscriptionList.vue";
import { ShopLicense } from "@selldone/core-js/enums/shop/ShopLicense";
import BShopLicenseSubscriptionDetail from "../../../shop/license/subscription/detail/BShopLicenseSubscriptionDetail.vue";

import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import LicenseMixin from "@selldone/components-vue/mixin/license/LicenseMixin.ts";

export default {
  name: "BShopLicenseManagement",
  mixins: [DateMixin,LicenseMixin ],

  components: {
    USmartToggle,

    BShopLicenseSubscriptionDetail,
    ShopSubscriptionList,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    showSubscriptionsList:Boolean,
    showSubscriptionDetails:Boolean,
    showPartnerUpgrade:Boolean,

  },
  data: () => ({
    busy_fix: false,
    partner_upgrade_url: null,
    busy_access: false,
    read_access: false,
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

    license_object() {
      return ShopLicense[this.shop.license];
    },
  },
  created() {
    this.read_access = this.shop.agency_meta?.read_access;
  },

  mounted() {
    if (this.agency_client) {
      // Try get upgrade url if existed:
      this.getUpgradeUrl();
    }
  },

  methods: {
    autoFixShopLicense() {
      this.busy_fix = true;
      axios
        .post(window.API.POST_PARTNER_FIX_SHOP_LICENSE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(null, "We fix your shop license.");

            // May shop license updated:
            this.shop.license = data.license;
            this.shop.expire_at = data.expire_at;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fix = false;
        });
    },

    getUpgradeUrl() {
      axios
        .get(window.API.GET_PARTNER_UPGRADE_URL(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.partner_upgrade_url = data.url;
          }
        })
        .catch((error) => {})
        .finally(() => {});
    },

    setAgencyReadAccess(access) {
      this.busy_access = true;
      axios
        .put(window.API.PUT_MY_SHOP_AGENCY_META_SET(this.shop.id), {
          read_access: access,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "The agency read access updated successfully.",
            );
            this.shop.agency_meta = data.agency_meta;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_access = false;
        });
    },
  },
};
</script>

<style scoped></style>
