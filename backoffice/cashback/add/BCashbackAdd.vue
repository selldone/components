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
    <v-card-text class="text-start position-relative pt-6">
      <v-form ref="form" lazy-validation>
        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ General ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.general_config')"
            icon="tune"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("cashback_edit.config.subtitle") }}
          </v-list-subheader>

          <u-number-input
            v-model="percent"
            :decimal="0"
            :hint="$t('cashback_edit.percent_input.message')"
            :label="$t('cashback_edit.percent_input.title')"
            :max="100"
            :min="0"
            :step="1"
            append-icon="fa:fas fa-percentage"
            class="strong-field"
            variant="underlined"
          />

          <u-smart-toggle
            v-model="boosted"
            :false-title="$t('cashback_edit.boosted_input.false_title')"
            :true-title="$t('cashback_edit.boosted_input.true_title')"
            :true-description="$t('cashback_edit.boosted_input.true_msg')"
            :false-description="$t('cashback_edit.boosted_input.false_msg')"
            true-icon="local_fire_department"
            false-gray
            color="#D32F2F"
          ></u-smart-toggle>

          <u-currency-input
            v-model="currency"
            :disabled="cashback !== null"
            :label="$t('global.commons.currency')"
            :messages="$t('cashback_edit.currency_input.message')"
            :return-object="false"
            variant="underlined"
            :active-currencies="shop.currencies"
          >
          </u-currency-input>

          <u-price-input
            v-model="limit"
            :decimal="currencyObject.floats"
            :hint="$t('cashback_edit.limit_input.hint')"
            :label="$t('cashback_edit.limit_input.title')"
            :messages="
              limit === 0 ? $t('cashback_edit.limit_input.zero_message') : ''
            "
            :suffix="getCurrencyName(currency)"
            class="strong-field"
            required
            variant="underlined"
          />

          <u-smart-switch
            v-model="enable"
            :false-title="$t('global.commons.disable')"
            :true-title="$t('global.commons.enable')"
            :true-description="$t('cashback_edit.enable_input.true_msg')"
            :false-description="$t('cashback_edit.enable_input.false_msg')"
            class="mt-5"
            false-gray
          ></u-smart-switch>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Duration ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !percent }" class="widget-box mb-5">
          <u-widget-header
            :title="$t('cashback_edit.duration.title')"
            icon="schedule"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("cashback_edit.duration.subtitle") }}
          </v-list-subheader>

          <u-date-input
            v-model="start"
            :label="$t('cashback_edit.start_input.title')"
            :placeholder="$t('cashback_edit.start_input.placeholder')"
            clearable
            color="#C2185B"
            return-utc
            variant="underlined"
          ></u-date-input>

          <u-date-input
            v-model="end"
            :disabled="!start"
            :label="$t('cashback_edit.end_input.title')"
            :placeholder="$t('cashback_edit.end_input.placeholder')"
            :min="start"
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

        <div :class="{ disabled: !percent }" class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.design_config')"
            icon="architecture"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("cashback_edit.design.subtitle") }}
          </v-list-subheader>

          <v-text-field
            v-model="title"
            :counter="48"
            :label="$t('cashback_edit.title_input.title') + '*'"
            :rules="[GlobalRules.required()]"
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-cashback
                v-if="cashback?.id"
                :cashback="cashback"
                :label="$t('cashback_edit.title_input.title')"
                :shop="shop"
                translation-key="title"
              ></b-translation-button-cashback>
            </template>

            <template v-slot:message>
              <u-smart-suggestion
                v-if="!cashback?.id || !title"
                :samples="$tm('suggestions.cashback.title')"
                class="mb-4"
                @select="(v) => (title = v)"
              ></u-smart-suggestion>
            </template>
          </v-text-field>
          <v-text-field
            v-model="description"
            :counter="128"
            :label="$t('cashback_edit.description_input.title')"
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-cashback
                v-if="cashback?.id"
                :cashback="cashback"
                :label="$t('cashback_edit.description_input.title')"
                :shop="shop"
                translation-key="description"
              ></b-translation-button-cashback>
            </template>

            <template v-slot:message>
              <u-smart-suggestion
                v-if="!cashback?.id || !description"
                :samples="$tm('suggestions.cashback.description')"
                class="mb-4"
                @select="(v) => (description = v)"
              ></u-smart-suggestion>
            </template>
          </v-text-field>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Constraints ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !percent }" class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.constraints_config')"
            icon="border_outer"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("cashback_edit.constraints.subtitle") }}
          </v-list-subheader>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Has qualify ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

          <u-smart-switch
            v-model="qualify"
            :false-title="$t('cashback_edit.qualify_input.false_title')"
            :true-description="$t('cashback_edit.qualify_input.true_msg')"
            :true-title="$t('cashback_edit.qualify_input.true_title')"
            class="my-3"
          >
          </u-smart-switch>

          <v-expand-transition>
            <div v-if="qualify">
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Min Purchase ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <u-price-input
                v-model="min_purchase"
                :decimal="currencyObject.floats"
                :hint="$t('cashback_edit.min_purchase_input.hint')"
                :label="$t('cashback_edit.min_purchase_input.title')"
                :suffix="getCurrencyName(currency)"
                required
                variant="underlined"
              />

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Only first buy ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <u-smart-switch
                v-model="only_first_buy"
                :false-description="
                  $t('cashback_edit.only_first_buy_input.false_desc')
                "
                :false-title="
                  $t('cashback_edit.only_first_buy_input.false_title')
                "
                :label="$t('global.commons.constraints')"
                :true-description="
                  $t('cashback_edit.only_first_buy_input.true_desc')
                "
                :true-title="
                  $t('cashback_edit.only_first_buy_input.true_title')
                "
                class="my-3"
              >
              </u-smart-switch>
            </div>
          </v-expand-transition>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Clubs ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !percent }" class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.clubs_config')"
            icon="groups"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("cashback_edit.club.subtitle") }}
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
          <u-widget-header
            :add-caption="$t('global.commons.management')"
            :title="$t('global.commons.cluster')"
            :to="{ name: 'BPageShopClassificationClusters' }"
            add-icon="settings"
            add-text
            icon="workspaces"
          ></u-widget-header>

          <v-list-subheader>
            {{ $t("cashback_edit.cluster.subtitle") }}
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
      </v-form>
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
          v-if="cashback"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editCashback()"
          v-ctrl.s="()=>{editCashback()}"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createCashback()"
          v-ctrl.s="()=>{createCashback()}"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
    <slot></slot>
  </v-card>
</template>

<script lang="ts">
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import UDateInput from "../../../ui/date/input/UDateInput.vue";
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import BClubConstraint from "../../club/constraint/BClubConstraint.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import UWidgetHeader from "../../../ui/widget/header/UWidgetHeader.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import { Club } from "@selldone/core-js";
import BTranslationButtonCashback from "@selldone/components-vue/backoffice/translation/button/cashback/BTranslationButtonCashback.vue";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BCashbackAdd",
  mixins: [CurrencyMixin ],
  components: {
    USmartToggle,
    BTranslationButtonCashback,
    SWidgetButtons,
    UWidgetHeader,
    BClusterInput,
    USmartSuggestion,
    USmartSwitch,
    BClubConstraint,
    UNumberInput,
    UTimeProgressBar,

    UDateInput,
    UPriceInput,
    UCurrencyInput,
  },
  props: {
    cashback: {
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
  },

  data: () => ({
    CustomerClubLevels: Club.Levels,

    enable: false,
    boosted: false,

    max: 200,
    percent: 5,
    limit: 0,

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

  watch: {},
  computed: {
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
  },

  methods: {
    createCashback() {
      // Auto create title:
      if (!this.title) {
        this.title =
          this.$t("global.commons.cashback") +
          (this.percent ? ` ${this.percent}%` : "") +
          (this.percent && this.limit
            ? ` / ${this.limit}${this.currency}`
            : "");
      }

      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .post(window.API.POST_SHOP_CASHBACK_ADD(this.shop.id), {
          enable: this.enable,
          boosted: this.boosted,

          max: this.max,
          percent: this.percent,
          limit: this.limit,
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
            this.$emit("add", data.cashback);
            NotificationService.showSuccessAlert(
              null,
              this.$t("cashback_edit.notifications.add"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    editCashback() {
      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .put(
          window.API.PUT_SHOP_CASHBACK_EDIT(this.shop.id, this.cashback.id),
          {
            enable: this.enable,
            boosted: this.boosted,

            max: this.max,
            percent: this.percent,
            limit: this.limit,
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
            this.$emit("edit", data.cashback);
            NotificationService.showSuccessAlert(
              null,
              this.$t("cashback_edit.notifications.edit"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },

  created() {
    if (this.cashback) {
      this.enable = this.cashback.enable;
      this.boosted = this.cashback.boosted;

      this.percent = this.cashback.percent;
      this.limit = this.cashback.limit;

      this.currency = this.cashback.currency;

      this.start = this.cashback.start;
      this.end = this.cashback.end;

      this.title = this.cashback.title;
      this.description = this.cashback.description;

      this.qualify = this.cashback.qualify;

      this.only_first_buy = this.cashback.only_first_buy;
      this.min_purchase = this.cashback.min_purchase;

      this.no_club = this.cashback.no_club;
      this.bronze_club = this.cashback.bronze_club;
      this.silver_club = this.cashback.silver_club;
      this.gold_club = this.cashback.gold_club;
      this.platinum_club = this.cashback.platinum_club;
      this.diamond_club = this.cashback.diamond_club;

      this.created_at = this.cashback.created_at;

      this.cluster_id = this.cashback.cluster_id;
    } else {
      this.enable = true;
      this.boosted = false;

      this.percent = 3;

      this.currency = this.shop.currencies[0];

      this.start = null;
      this.end = null;

      this.title = null;
      this.description = null;

      this.qualify = false;

      this.only_first_buy = false;
      this.min_purchase = 0;

      this.no_club = true;
      this.bronze_club = true;
      this.silver_club = true;
      this.gold_club = true;
      this.platinum_club = true;
      this.diamond_club = true;

      this.created_at = null;

      this.cluster_id = null;
    }
  },
};
</script>

<style scoped></style>
