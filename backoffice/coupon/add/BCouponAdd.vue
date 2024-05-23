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
  <v-card :color="!hasClose ? 'transparent' : undefined" flat>
    <!-- <v-card-title>
      {{ coupon ? $t("coupon_edit.title_edit") : $t("coupon_edit.title_add") }}
    </v-card-title>-->
    <v-card-text class="text-start position-relative pt-6">
      <v-form ref="form" lazy-validation>
        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ General ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.general_config')"
            icon="tune"
          >
          </s-widget-header>

          <v-list-subheader>
            {{ $t("coupon_edit.config.subtitle") }}
          </v-list-subheader>

          <u-price-input
            v-model="charge"
            :decimal="currencyObject.floats"
            :hint="$t('coupon_edit.charge_message')"
            :label="$t('coupon_edit.charge')"
            :suffix="getCurrencyName(currency)"
            append-icon="card_giftcard"
            class="strong-field"
            variant="underlined"
          />

          <u-number-input
            v-model="percent"
            :decimal="0"
            :hint="$t('coupon_edit.percent_message')"
            :label="$t('coupon_edit.percent')"
            :max="100"
            :min="0"
            :step="1"
            append-icon="fa:fas fa-percentage"
            class="strong-field"
            variant="underlined"
          />

          <u-currency-input
            v-model="currency"
            :disabled="coupon !== null && !cloneMode"
            :messages="$t('coupon_edit.currency_input_message')"
            :return-object="false"
            variant="underlined"
          >
          </u-currency-input>

          <u-smart-switch
            v-model="enable"
            :false-title="$t('global.commons.disable')"
            :true-title="$t('global.commons.enable')"
            class="mt-5"
            false-gray
          ></u-smart-switch>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Limits ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !charge && !percent }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.limits_config')"
            icon="call_missed_outgoing"
          >
          </s-widget-header>

          <v-list-subheader>
            {{ $t("coupon_edit.limit.subtitle") }}
          </v-list-subheader>

          <u-price-input
            v-model="limit"
            :decimal="currencyObject.floats"
            :hint="$t('coupon_edit.limit_input_hint')"
            :label="`${$t('coupon_edit.limit_input')}  ${getCurrencyName(
              currency,
            )}`"
            :messages="limit === 0 ? $t('coupon_edit.limit.zero_message') : ''"
            :suffix="getCurrencyName(currency)"
            class="strong-field"
            required
            variant="underlined"
          />

          <v-text-field
            v-model="max"
            :hint="$t('coupon_edit.count_input_hint')"
            :label="`${$t('coupon_edit.count_input')}*`"
            :messages="
              max === 0 ? $t('coupon_edit.limit_input_message') : undefined
            "
            variant="underlined"
          />
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Duration ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !charge && !percent }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.duration_config')"
            icon="schedule"
          >
          </s-widget-header>

          <v-list-subheader>
            {{ $t("coupon_edit.duration.subtitle") }}
          </v-list-subheader>

          <u-date-input
            v-model="start"
            :label="$t('coupon_edit.date_start_input')"
            :placeholder="$t('coupon_edit.date_start_input_placeholder')"
            clearable
            color="#C2185B"
            return-utc
            variant="underlined"
          ></u-date-input>

          <u-date-input
            v-model="end"
            :disabled="!start"
            :label="$t('coupon_edit.date_end_input')"
            :min="start"
            :placeholder="$t('coupon_edit.date_end_input_placeholder')"
            clearable
            color="#C2185B"
            return-utc
            variant="underlined"
          ></u-date-input>

          <u-time-progress-bar
            :created-time="created_at"
            :end-time="end"
            :start-time="start"
          ></u-time-progress-bar>
        </div>
        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Design ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !charge && !percent }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.design_config')"
            icon="architecture"
          >
          </s-widget-header>

          <v-list-subheader>
            {{ $t("coupon_edit.design.subtitle") }}
          </v-list-subheader>

          <v-text-field
            v-model="title"
            :counter="48"
            :hint="$t('coupon_edit.title_input_hint')"
            :label="$t('coupon_edit.title_input') + '*'"
            :rules="[GlobalRules.required()]"
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-coupon
                v-if="coupon?.id"
                :coupon="coupon"
                :label="$t('coupon_edit.title_input_hint')"
                :shop="shop"
                translation-key="title"
              ></b-translation-button-coupon>
            </template>

            <template v-slot:message>
              <u-smart-suggestion
                v-if="!coupon?.id || !title"
                :samples="$tm('suggestions.coupon.title')"
                class="mb-4"
                @select="(v) => (title = v)"
              ></u-smart-suggestion>
            </template>
          </v-text-field>
          <v-text-field
            v-model="description"
            :counter="128"
            :hint="$t('coupon_edit.description_input_hint')"
            :label="$t('coupon_edit.description_input')"
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-coupon
                v-if="coupon?.id"
                :coupon="coupon"
                :label="$t('coupon_edit.description_input')"
                :shop="shop"
                translation-key="description"
              ></b-translation-button-coupon>
            </template>

            <template v-slot:message>
              <u-smart-suggestion
                v-if="!coupon?.id || !description"
                :samples="$tm('suggestions.coupon.description')"
                class="mb-4"
                @select="(v) => (description = v)"
              ></u-smart-suggestion>
            </template>
          </v-text-field>

          <u-color-selector
            v-model="color"
            :title="$t('coupon_edit.coupon_color')"
          ></u-color-selector>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Constraints ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !charge && !percent }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.constraints_config')"
            icon="border_outer"
          >
          </s-widget-header>

          <v-list-subheader>
            {{ $t("coupon_edit.constraints.subtitle") }}
          </v-list-subheader>

          <v-switch
            v-model="has_code"
            :label="$t('coupon_edit.need_code')"
            :messages="$t('coupon_edit.constraints.has_code_message')"
            color="success"
            density="compact"
            inset
          >
          </v-switch>

          <v-text-field
            v-model="code"
            :counter="64"
            :label="
              $t('coupon_edit.coupon_code') +
              ` (${$t('global.commons.optional')})`
            "
            :persistent-hint="has_code"
            :readonly="!has_code"
            :single-line="!has_code"
            color="success"
            hint="User should enter this code to add coupon."
            variant="underlined"
            @blur="has_code = !!code"
            @click="has_code = true"
          >
          </v-text-field>

          <u-price-input
            v-model="min_purchase"
            :decimal="currencyObject.floats"
            :hint="$t('coupon_edit.min_purchase_amount_hint')"
            :label="$t('coupon_edit.min_purchase_amount')"
            :suffix="getCurrencyName(currency)"
            required
            variant="underlined"
          />

          <b-products-select-box
            v-model="products"
            :label="$t('coupon_edit.should_exist_product')"
            :shop="shop"
            border-less
            class="my-6"
            >{{ $t("global.placeholders.select_products") }}
          </b-products-select-box>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Only first buy ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

          <u-smart-switch
            v-model="only_first_buy"
            :false-description="$t('coupon_edit.apply_for_first_order_off')"
            :false-title="$t('global.commons.flexible')"
            :label="$t('global.commons.constraints')"
            :true-description="$t('coupon_edit.apply_for_first_order_on')"
            :true-title="$t('coupon_edit.apply_for_first_order')"
            class="my-3"
          >
          </u-smart-switch>

          <v-expand-transition>
            <div v-if="!only_first_buy">
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Has qualify ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <u-smart-switch
                v-model="qualify"
                :false-title="$t('coupon_edit.constraints.no_limit')"
                :label="$t('coupon_edit.has_qualify_constraints')"
                :true-description="
                  $t('coupon_edit.has_qualify_constraints_message')
                "
                :true-title="$t('coupon_edit.constraints.has_limit')"
                class="my-3"
              >
              </u-smart-switch>

              <v-expand-transition>
                <div v-if="qualify">
                  <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Single / Multiple ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

                  <u-smart-switch
                    v-model="qualify_single"
                    :disabled="!qualify"
                    :false-title="$t('coupons.multiple_use')"
                    :label="$t('global.commons.usage_limit')"
                    :true-description="$t('coupon_edit.one_time_use_message')"
                    :true-title="$t('coupons.one_time_use')"
                    class="my-3"
                  >
                  </u-smart-switch>

                  <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Multiple constraints ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

                  <v-expand-transition>
                    <div v-if="!qualify_single">
                      <div class="py-3">
                        <v-text-field
                          v-model="qualify_daily"
                          :disabled="!qualify"
                          :label="$t('coupon_edit.daily_limit')"
                          :messages="$t('coupon_edit.daily_limit_message')"
                          :placeholder="$t('coupon_edit.no_limit')"
                          clearable
                          variant="underlined"
                        />
                        <v-text-field
                          v-model="qualify_monthly"
                          :disabled="!qualify"
                          :label="$t('coupon_edit.monthly_limit')"
                          :messages="$t('coupon_edit.monthly_limit_message')"
                          :placeholder="$t('coupon_edit.no_limit')"
                          clearable
                          variant="underlined"
                        />
                        <v-text-field
                          v-model="qualify_yearly"
                          :disabled="!qualify"
                          :label="$t('coupon_edit.yearly_limit')"
                          :messages="$t('coupon_edit.yearly_limit_message')"
                          :placeholder="$t('coupon_edit.no_limit')"
                          clearable
                          variant="underlined"
                        />
                      </div>
                    </div>
                  </v-expand-transition>
                </div>
              </v-expand-transition>
            </div>
          </v-expand-transition>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Clubs ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !charge && !percent }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.clubs_config')"
            icon="groups"
          >
          </s-widget-header>

          <v-list-subheader>
            {{ $t("coupon_edit.club.subtitle") }}
          </v-list-subheader>
          <b-club-constraint
            v-model:bronze-club="bronze_club"
            v-model:diamond-club="diamond_club"
            v-model:gold-club="gold_club"
            v-model:no-club="no_club"
            v-model:platinum-club="platinum_club"
            v-model:silver-club="silver_club"
          >
          </b-club-constraint>
        </div>

        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster ━━━━━━━━━━━━━━━━━━━━━━━━ -->
        <div class="widget-box mb-5">
          <s-widget-header
            :add-caption="$t('global.commons.management')"
            :title="$t('global.commons.cluster')"
            :to="{ name: 'BPageShopClassificationClusters' }"
            add-icon="settings"
            add-text
            icon="workspaces"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("coupon_edit.cluster.subtitle") }}
          </v-list-subheader>
          <b-cluster-input
            v-model="cluster_id"
            :return-object="false"
            clearable
            icon="workspaces_filled"
            no-home
            variant="underlined"
          ></b-cluster-input>
        </div>
        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Preview ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !charge && !percent }" class="widget-box mb-5">
          <s-widget-header :title="$t('global.commons.preview')" icon="preview">
          </s-widget-header>
          <v-list-subheader>
            {{ $t("coupon_edit.preview.subtitle") }}
          </v-list-subheader>

          <s-storefront-coupon-view
            :coupon="coupon_sample"
            :disabled="!enable"
            class="mx-auto mb-5"
            style="min-width: 240px"
          ></s-storefront-coupon-view>
        </div>
      </v-form>
      <BShopLicenseBlockOverlay
        v-if="licenseRestriction"
        fill-h
      ></BShopLicenseBlockOverlay>
    </v-card-text>
    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="!hasClose">
        <v-btn
          v-if="hasClose"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="coupon && !licenseRestriction && cloneMode"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createCoupon()"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create_clone") }}
        </v-btn>

        <v-btn
          v-else-if="coupon && !licenseRestriction"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editCoupon()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else-if="!licenseRestriction"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createCoupon"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
    <slot></slot>
  </v-card>
</template>

<script>
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import UDateInput from "../../../ui/date/input/UDateInput.vue";
import { CustomerClubLevels } from "@selldone/core-js/enums/customer/CustomerClubLevels";
import UColorSelector from "../../../ui/color/selector/UColorSelector.vue";
import SStorefrontCouponView from "../../../storefront/coupon/view/SStorefrontCouponView.vue";
import BProductsSelectBox from "../../../backoffice/product/select-box/BProductsSelectBox.vue";
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";
import BShopLicenseBlockOverlay from "../../shop/license/block/overlay/BShopLicenseBlockOverlay.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import BClubConstraint from "../../club/constraint/BClubConstraint.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { RandomString } from "@selldone/core-js/helper/string/StringHelper";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import BTranslationButtonCoupon from "../../translation/button/coupon/BTranslationButtonCoupon.vue";
import SWidgetHeader from "../../../ui/widget/header/SWidgetHeader.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BCouponAdd",
  components: {
    SWidgetButtons,
    SWidgetHeader,
    BTranslationButtonCoupon,
    BClusterInput,
    USmartSuggestion,
    USmartSwitch,
    BClubConstraint,
    UNumberInput,
    BShopLicenseBlockOverlay,
    UTimeProgressBar,
    BProductsSelectBox,
    SStorefrontCouponView,
    UColorSelector,
    UDateInput,
    UPriceInput,
    UCurrencyInput,
  },
  props: {
    coupon: {
      required: false,
      type: Object,
    },
    hasClose: {
      default: false,
      type: Boolean,
    },
    shop: {
      required: true,
      type: Object,
    },
    licenseRestriction: {
      type: Boolean,
      default: false,
    },
    cloneMode: {
      // Is clone mode? Create a clone from coupon
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    CustomerClubLevels: CustomerClubLevels,

    enable: false,

    has_code: false,
    code: null,

    max: 200,
    percent: 5,
    limit: 0,
    charge: 0,
    currency: null,

    start: null,
    end: null,

    title: "",
    description: "",
    color: null,

    only_first_buy: false,
    min_purchase: 0,

    qualify: false,
    qualify_single: false,
    qualify_daily: 0,
    qualify_monthly: 0,
    qualify_yearly: 0,

    no_club: false,
    bronze_club: false,
    silver_club: false,
    gold_club: false,
    platinum_club: false,
    diamond_club: false,

    cluster_id: null,

    products: [],

    busy_set: false,

    created_at: null,
  }),

  watch: {
    has_code(has) {
      if (!has) this.code = null;
    },
  },
  computed: {
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
    coupon_sample() {
      return {
        enable: this.enable,
        max: this.max,
        percent: this.percent,
        limit: this.limit,
        charge: this.charge,
        currency: this.currency,
        start: this.start,
        end: this.end,
        title: this.title,
        description: this.description,
        color: this.color,
        only_first_buy: this.only_first_buy,
        min_purchase: this.min_purchase,
        qualify: this.qualify,
        qualify_single: this.qualify_single,
        qualify_daily: this.qualify_daily,
        qualify_monthly: this.qualify_monthly,
        qualify_yearly: this.qualify_yearly,
        no_club: this.no_club,
        bronze_club: this.bronze_club,
        silver_club: this.silver_club,
        gold_club: this.gold_club,
        platinum_club: this.platinum_club,
        diamond_club: this.diamond_club,
        products: this.products,
      };
    },
  },

  methods: {
    createCoupon() {
      // Auto create title:
      if (!this.title) {
        this.title =
          this.$t("global.commons.coupon") +
          (this.charge ? ` ${this.charge}${this.currency}` : "") +
          (this.percent ? ` ${this.percent}%` : "") +
          (this.percent && this.limit
            ? ` / ${this.limit}${this.currency}`
            : "");
      }

      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .post(window.API.POST_CREATE_COUPON(this.$route.params.shop_id), {
          code: this.code,

          enable: this.enable,
          max: this.max,
          percent: this.percent,
          limit: this.limit,
          charge: this.charge,
          currency: this.currency,
          start: this.start,
          end: this.end,
          title: this.title,
          description: this.description,
          color: this.color,
          only_first_buy: this.only_first_buy,
          min_purchase: this.min_purchase,
          qualify: this.qualify,
          qualify_single: this.qualify_single,
          qualify_daily: this.qualify_daily,
          qualify_monthly: this.qualify_monthly,
          qualify_yearly: this.qualify_yearly,
          no_club: this.no_club,
          bronze_club: this.bronze_club,
          silver_club: this.silver_club,
          gold_club: this.gold_club,
          platinum_club: this.platinum_club,
          diamond_club: this.diamond_club,
          products: this.products,

          cluster_id: this.cluster_id,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.coupon);
            this.showSuccessAlert(
              null,
              this.$t("coupon_edit.notifications.add"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    editCoupon() {
      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .put(
          window.API.PUT_EDIT_COUPON(
            this.$route.params.shop_id,
            this.coupon.id,
          ),
          {
            code: this.code,

            enable: this.enable,
            max: this.max,
            percent: this.percent,
            limit: this.limit,
            charge: this.charge,
            currency: this.currency,
            start: this.start,
            end: this.end,
            title: this.title,
            description: this.description,
            color: this.color,
            only_first_buy: this.only_first_buy,
            min_purchase: this.min_purchase,
            qualify: this.qualify,
            qualify_single: this.qualify_single,
            qualify_daily: this.qualify_daily,
            qualify_monthly: this.qualify_monthly,
            qualify_yearly: this.qualify_yearly,
            no_club: this.no_club,
            bronze_club: this.bronze_club,
            silver_club: this.silver_club,
            gold_club: this.gold_club,
            platinum_club: this.platinum_club,
            diamond_club: this.diamond_club,
            products: this.products,

            cluster_id: this.cluster_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("edit", data.coupon);
            this.showSuccessAlert(
              null,
              this.$t("coupon_edit.notifications.edit"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },

  created() {
    if (this.coupon) {
      this.enable = this.coupon.enable;
      this.max = this.coupon.max;
      this.percent = this.coupon.percent;
      this.limit = this.coupon.limit;
      this.charge = this.coupon.charge;
      this.currency = this.coupon.currency;
      this.start = this.coupon.start;
      this.end = this.coupon.end;
      this.title = this.coupon.title;
      this.description = this.coupon.description;
      this.color = this.coupon.color;
      this.only_first_buy = this.coupon.only_first_buy;
      this.min_purchase = this.coupon.min_purchase;
      this.qualify = this.coupon.qualify;
      this.qualify_single = this.coupon.qualify_single;
      this.qualify_daily = this.coupon.qualify_daily;
      this.qualify_monthly = this.coupon.qualify_monthly;
      this.qualify_yearly = this.coupon.qualify_yearly;
      this.no_club = this.coupon.no_club;
      this.bronze_club = this.coupon.bronze_club;
      this.silver_club = this.coupon.silver_club;
      this.gold_club = this.coupon.gold_club;
      this.platinum_club = this.coupon.platinum_club;
      this.diamond_club = this.coupon.diamond_club;
      this.products = this.coupon.products;

      this.created_at = this.coupon.created_at;
      this.code = this.coupon.code;
      this.has_code = !!this.code;

      this.cluster_id = this.coupon.cluster_id;

      if (this.cloneMode) {
        this.title += "-clone";
        if (this.code) this.code += "-" + RandomString(8);
      }
    } else {
      this.enable = true;
      this.max = 200;
      this.percent = 5;
      this.limit = 0;
      this.charge = 0;
      this.currency = this.$t("global.currency_default");
      this.start = null;
      this.end = null;
      this.title = null;
      this.description = null;
      this.color = "#FFA000";
      this.only_first_buy = false;
      this.min_purchase = 0;
      this.qualify = false;
      this.qualify_single = false;
      this.qualify_daily = null;
      this.qualify_monthly = null;
      this.qualify_yearly = null;
      this.no_club = true;
      this.bronze_club = true;
      this.silver_club = true;
      this.gold_club = true;
      this.platinum_club = true;
      this.diamond_club = true;
      this.products = [];

      this.created_at = null;
      this.code = null;
      this.has_code = false;

      this.cluster_id = null;
    }
  },
};
</script>

<style scoped></style>
