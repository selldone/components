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
  <div :class="modern ? 'b-license-details text-start' : 'widget-box -large'">
    <template v-if="modern">
      <details
        class="sd-modern-widget sd-modern-disclosure b-license-details__main"
      >
        <summary
          class="sd-modern-disclosure__summary b-license-details__heading"
        >
          <span class="b-license-details__heading-copy">
            <v-icon size="18" aria-hidden="true">checklist</v-icon>
            <h2>
              {{ $t("shop_license.workspace.details_title") }}
            </h2>
          </span>
          <v-icon
            class="sd-modern-disclosure__chevron"
            size="18"
            aria-hidden="true"
            >expand_more</v-icon
          >
        </summary>
        <div class="b-license-details__content">
          <dl class="b-license-details__summary">
            <div>
              <dt>{{ $t("price_list.domains") }}</dt>
              <dd>
                {{
                  domains >= 9999
                    ? $t("global.commons.unlimited")
                    : numeralFormat(domains, "0,0")
                }}
              </dd>
            </div>
            <div>
              <dt>{{ $t("price_list.staff") }}</dt>
              <dd>
                {{
                  staff >= 9999
                    ? $t("global.commons.unlimited")
                    : numeralFormat(staff, "0,0")
                }}
              </dd>
            </div>
            <div>
              <dt>{{ $t("shop_license.workspace.fee_label") }}</dt>
              <dd>
                <bdi>{{ plan?.fee ?? license_object.wage_percent }}%</bdi>
              </dd>
            </div>
            <div>
              <dt>{{ $t("price_list.active_coupons") }}</dt>
              <dd>{{ numeralFormat(limits.coupons, "0,0") }}</dd>
            </div>
            <div>
              <dt>{{ $t("price_list.active_transportation_persons") }}</dt>
              <dd>
                {{ numeralFormat(limits["transportation-persons"], "0,0") }}
              </dd>
            </div>
            <div>
              <dt>{{ $t("shop_license.workspace.source_label") }}</dt>
              <dd>
                {{
                  $t(
                    agency_client
                      ? "shop_license.workspace.source_deal"
                      : shop.license === "FREE"
                        ? "shop_license.workspace.source_free"
                        : "shop_license.workspace.source_subscription",
                  )
                }}
              </dd>
            </div>
          </dl>
          <p class="b-license-details__help">
            {{ $t("shop_license.workspace.details_help") }}
          </p>
          <div class="b-license-details__actions">
            <v-btn
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--inline sd-modern-button--compact"
              :aria-expanded="show_all_limits"
              :aria-controls="`license-limits-${shop.id}`"
              @click="show_all_limits = !show_all_limits"
            >
              {{ $t("shop_license.workspace.view_all_limits")
              }}<v-icon end size="15">{{
                show_all_limits ? "expand_less" : "arrow_forward"
              }}</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--inline sd-modern-button--compact"
              :aria-expanded="show_plan_comparison"
              :aria-controls="`license-comparison-${shop.id}`"
              @click="show_plan_comparison = !show_plan_comparison"
            >
              {{ $t("shop_license.workspace.compare_plans")
              }}<v-icon end size="15">view_column</v-icon>
            </v-btn>
          </div>
          <dl
            v-if="show_all_limits"
            :id="`license-limits-${shop.id}`"
            class="b-license-details__allowances"
          >
            <div v-for="feature in modernFeatures" :key="feature.label">
              <dt>{{ $t(feature.label) }}</dt>
              <dd>
                {{
                  typeof feature.value === "number"
                    ? numeralFormat(feature.value, "0,0")
                    : feature.value
                }}
              </dd>
            </div>
          </dl>
          <div
            v-if="show_plan_comparison"
            :id="`license-comparison-${shop.id}`"
            class="b-license-details__compare"
          >
            <div class="b-license-details__comparison">
              <div v-for="license in licenses" :key="license.code">
                <h3>
                  <img
                    :src="getShopLicenseIcon(license.code)"
                    alt=""
                    width="24"
                    height="24"
                  />{{ getShopLicenseName(license.code) }}
                </h3>
                <p>
                  <b>{{ license.wage_percent }}%</b>
                  {{ $t("shop_license.workspace.fee_label") }}
                </p>
                <p>
                  {{ displayLimit(allLimits[license.code].domains) }}
                  {{ $t("price_list.domains") }}
                </p>
                <p>
                  {{ displayLimit(allLimits[license.code].staff) }}
                  {{ $t("price_list.staff") }}
                </p>
              </div>
            </div>
            <v-btn
              :to="{ name: 'OPagePrice' }"
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--inline sd-modern-button--compact"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t("price_list.read_more")
              }}<v-icon end size="16">north_east</v-icon>
            </v-btn>
          </div>
          <dl
            v-if="show_plan_stores || agency_client?.uuid"
            class="b-license-details__records"
          >
            <div v-if="show_plan_stores">
              <dt>{{ $t("shop_license.workspace.slots_label") }}</dt>
              <dd>
                {{
                  $t("shop_license.workspace.shops_used", {
                    used: used_shops_count,
                    total: plan.stores + giveaways,
                  })
                }}
              </dd>
            </div>
            <div v-if="giveaways">
              <dt>{{ $t("shop_license.workspace.giveaways") }}</dt>
              <dd>{{ numeralFormat(giveaways, "0,0") }}</dd>
            </div>
            <div v-if="agency_client?.uuid">
              <dt>{{ $t("shop_license.workspace.deal_id") }}</dt>
              <dd>
                <bdi>{{ agency_client.uuid }}</bdi>
              </dd>
            </div>
          </dl>
          <div
            v-if="show_add_more_shops && !readOnly"
            class="b-license-details__business"
          >
            <v-btn
              :href="add_url"
              :loading="loading_add"
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--inline"
              @click="loading_add = true"
            >
              <v-icon start size="18">add_business</v-icon
              >{{ $t("shop_license.workspace.create_business") }}
            </v-btn>
            <p>{{ $t("shop_license.workspace.create_business_help") }}</p>
          </div>
        </div>
      </details>
      <!-- Detachment keeps the purchased deal and its owner-email confirmation boundary. -->
      <details
        v-if="plan"
        class="sd-modern-disclosure sd-modern-critical b-license-details__remove"
      >
        <summary>
          <span
            ><v-icon size="17" aria-hidden="true">link_off</v-icon
            >{{ $t("shop_license.workspace.remove_title") }}</span
          >
          <v-icon size="17" aria-hidden="true">expand_more</v-icon>
        </summary>
        <p>{{ $t("shop_license.workspace.remove_help") }}</p>
        <p>{{ $t("shop_license.workspace.remove_kept") }}</p>
        <v-text-field
          v-model="verify_code"
          :label="$t('shop_license.workspace.remove_verify')"
          :placeholder="
            $t('shop_license.workspace.remove_placeholder', { shop: shop.name })
          "
          :disabled="readOnly || busy_cancel"
          class="sd-modern-underlined-field mt-4"
          variant="underlined"
          hide-details
        />
        <u-smart-verify
          v-model="verify_cancellation"
          :disabled="readOnly || busy_cancel"
          class="my-3"
          color="error"
          false-gray
          :true-description="$t('shop_license.workspace.remove_consent')"
          :true-title="$t('shop_license.workspace.remove_verify')"
        />
        <v-btn
          :disabled="
            readOnly || !verify_cancellation || verify_code !== shop.name
          "
          :loading="busy_cancel"
          variant="elevated"
          color="error"
          class="sd-modern-button sd-modern-button--danger"
          @click="confirmCancelDeal"
          >{{ $t("shop_license.workspace.remove_action") }}</v-btn
        >
      </details>
    </template>
    <template v-else>
      <u-widget-header
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
      </u-widget-header>

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
    </template>
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
            <u-widget-header
              icon="warning_amber"
              title="Permanent cancellation"
            ></u-widget-header>
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

<script lang="ts">
import {
  ShopLicense,
  ShopLicenseLimits,
} from "@selldone/core-js/enums/shop/ShopLicense";
import BShopLicensePartnerOverrided from "../../../../shop/license/partner/overrided/BShopLicensePartnerOverrided.vue";

import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import USmartVerify from "../../../../../ui/smart/verify/USmartVerify.vue";
import UTextValueBox from "../../../../../ui/text/value-box/UTextValueBox.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import LicenseMixin from "@selldone/components-vue/mixin/license/LicenseMixin.ts";

export default {
  name: "BShopLicenseSubscriptionDetail",
  mixins: [LicenseMixin],
  components: {
    UTextValueBox,
    USmartVerify,
    USmartMenu,

    BShopLicensePartnerOverrided,
  },
  props: {
    modern: Boolean,
    readOnly: Boolean,
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    loading_add: false,
    show_all_limits: false,
    show_plan_comparison: false,

    cancel_plan_dialog: false,
    verify_cancellation: false,
    verify_code: null,
    busy_cancel: false,
  }),

  computed: {
    licenses() {
      return Object.values(ShopLicense);
    },
    allLimits() {
      return ShopLicenseLimits;
    },
    modernFeatures() {
      const counts = [
        ["discount-codes", "price_list.active_discount_codes"],
        ["coupons", "price_list.active_coupons"],
        ["offers", "price_list.active_offers"],
        ["gift-card-types", "price_list.active_gift_card_types"],
        ["campaigns", "price_list.active_campaigns"],
        ["affiliates", "price_list.active_affiliates"],
        ["emails", "price_list.active_emails"],
        ["transportation-persons", "price_list.active_transportation_persons"],
      ];
      const features = counts.map(([key, label]) => ({
        label,
        value: this.displayLimit(this.limits[key]),
      }));
      if (this.limits.community)
        features.unshift({
          label: "price_list.community_builder",
          value: this.$t("shop_license.workspace.included"),
        });
      if (this.limits.marketplace)
        features.unshift({
          label: "price_list.marketplace",
          value: this.$t("shop_license.workspace.included"),
        });
      features.push({
        label: "shop_license.workspace.storage_label",
        value: this.$t("shop_license.workspace.storage_included", {
          capacity: this.limits.capacity,
        }),
      });
      if (this.shop.license === "COMPANY")
        features.push({
          label: "price_list.priority_support",
          value: this.$t("shop_license.workspace.included"),
        });
      if (this.shop.license === "ENTERPRISE")
        features.push({
          label: "price_list.support_247",
          value: this.$t("shop_license.workspace.included"),
        });
      return features;
    },
    cancellationIdentity() {
      return `${this.shop.id}:${this.agency_client?.uuid || ""}`;
    },
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
        this.agency_client &&
        this.plan &&
        this.shop.user_id === this.agency_client.user_id
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
      return this.plan?.domains || this.limits.domains;
    },
    staff() {
      return this.plan?.staff || this.limits.staff;
    },
  },

  watch: {
    cancellationIdentity() {
      this.cancel_plan_dialog = false;
      this.verify_code = null;
      this.verify_cancellation = false;
    },
  },
  methods: {
    displayLimit(value) {
      return value >= 9999 ? this.$t("global.commons.unlimited") : value;
    },
    confirmCancelDeal() {
      if (
        this.busy_cancel ||
        (this.modern &&
          (this.readOnly ||
            !this.verify_cancellation ||
            this.verify_code !== this.shop.name))
      )
        return;
      const identity = this.cancellationIdentity;
      this.busy_cancel = true;
      axios
        .post(window.API.POST_SHOP_CANCEL_ACTIVE_DEAL(this.shop.id), {
          uuid: this.agency_client.uuid, // Agency Client UUID
        })
        .then(({ data }) => {
          if (identity !== this.cancellationIdentity) return;
          if (!data.error) {
            this.cancel_plan_dialog = false;
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("shop_license.workspace.remove_sent")
                : "A confirmation link to cancel the deal has been dispatched to the email of the shop owner.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (identity === this.cancellationIdentity)
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_cancel = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-license-details {
  display: grid;
  gap: 20px;

  &__main.sd-modern-widget {
    padding: 0;
  }
  & > &__main[open] > &__heading {
    background: transparent;
  }
  &__heading {
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 20px 28px;
  }
  &__heading-copy {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  &__heading h2 {
    margin: 0;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0;
  }
  &__content {
    padding-inline: 28px;
  }
  &__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px 25px;
    margin: 0;
    padding-block: 2px 20px;
  }
  &__summary > div {
    display: grid;
    align-content: start;
    gap: 3px;
    min-width: 0;
  }
  &__summary dt {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
  }
  &__summary dd {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  &__help {
    margin: 0;
    padding-block-start: 6px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.7;
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 24px;
    margin-block: 12px 18px;
  }
  &__actions > .sd-modern-button,
  &__compare > .sd-modern-button {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__allowances {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px 24px;
    margin: 0;
    padding-block-end: 20px;
  }
  &__allowances > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
    padding-block-end: 10px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__allowances dt {
    font-size: 12px;
    line-height: 1.5;
    color: var(--sd-modern-muted);
  }
  &__allowances dd {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
    text-align: end;
  }
  &__records {
    display: grid;
    gap: 12px;
    margin: 0;
    padding-block: 0 20px;
  }
  &__records > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    min-width: 0;
  }
  &__records dt {
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__records dd {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    text-align: end;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  &__business {
    padding-block-end: 20px;
  }
  &__business p {
    margin-block: 8px 0;
    font-size: 11px;
    line-height: 1.7;
    color: var(--sd-modern-muted);
  }
  &__compare {
    padding-block: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__comparison {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-block: 0 17px;
  }
  &__comparison > div {
    min-width: 0;
  }
  &__comparison h3 {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
    margin: 0 0 6px;
  }
  &__comparison p {
    font-size: 12px;
    color: var(--sd-modern-muted);
    line-height: 1.7;
    margin: 3px 0;
  }
  &__comparison b {
    font-weight: 500;
  }
  &__remove {
    padding-inline: 3px;
  }
  &__remove > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    list-style: none;
    cursor: pointer;
    padding-block: 12px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.6;
  }
  &__remove > summary::-webkit-details-marker {
    display: none;
  }
  &__remove > summary > span {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  &__remove[open] > summary > .v-icon {
    transform: rotate(180deg);
  }
  &__remove > summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 8px;
  }
  &__remove p {
    max-width: 660px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--sd-modern-muted);
    margin: 6px 0 18px;
  }
  @media (max-width: 740px) {
    &__main.sd-modern-widget {
      padding-block: 22px;
    }
    &__heading {
      padding-inline: 20px;
    }
    &__content {
      padding-inline: 20px;
    }
  }
  @media (max-width: 570px) {
    &__heading {
      padding-inline: 17px;
    }
    &__content {
      padding-inline: 17px;
    }
    &__summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px 16px;
    }
    &__allowances {
      grid-template-columns: 1fr;
    }
    &__records > div {
      display: grid;
      gap: 5px;
    }
    &__records dd {
      text-align: start;
    }
  }
  @media (pointer: coarse) {
    &__heading,
    &__remove > summary {
      min-height: 44px;
    }
  }
}
</style>
