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
      {{ offer ? $t("offer_edit.title_edit") : $t("offer_edit.title_add") }}
    </v-card-title>-->
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
            {{ $t("offer_edit.config.subtitle") }}
          </v-list-subheader>

          <v-text-field
            v-model="title"
            :counter="48"
            :hint="$t('offer_edit.title_input_hint')"
            :label="$t('offer_edit.title_input') + '*'"
            :rules="[GlobalRules.required()]"
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-offer
                v-if="offer?.id"
                :label="$t('offer_edit.title_input')"
                :offer="offer"
                :shop="shop"
                translation-key="title"
              ></b-translation-button-offer>
            </template>

            <template v-slot:message>
              <u-smart-suggestion
                v-if="!offer?.id || !title"
                :samples="$tm('suggestions.offer.title')"
                class="mb-4"
                @select="(v) => (title = v)"
              ></u-smart-suggestion>
            </template>
          </v-text-field>
          <v-text-field
            v-model="description"
            :counter="128"
            :hint="$t('offer_edit.description_input_hint')"
            :label="$t('offer_edit.description_input')"
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-offer
                v-if="offer?.id"
                :label="$t('offer_edit.title_input')"
                :offer="offer"
                :shop="shop"
                translation-key="description"
              ></b-translation-button-offer>
            </template>

            <template v-slot:message>
              <u-smart-suggestion
                v-if="!offer?.id || !description"
                :samples="$tm('suggestions.offer.description')"
                class="mb-4"
                @select="(v) => (description = v)"
              ></u-smart-suggestion>
            </template>
          </v-text-field>

          <u-widget-header :title="$t('offer_edit.enable')" icon="flash_auto">
          </u-widget-header>
          <v-list-subheader>
            {{ $t("offer_edit.max_actives_is_3") }}
          </v-list-subheader>
          <u-smart-switch
            v-model="enable"
            :false-title="$t('global.commons.disable')"
            :true-title="$t('global.commons.enable')"
            class="mt-3"
            false-gray
            false-icon="not_interested"
            true-icon="check_circle_outline"
          ></u-smart-switch>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Limits ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div class="widget-box mb-5">
          <h2>
            <v-icon class="me-1">call_missed_outgoing</v-icon>

            {{ $t("global.commons.limits_config") }}
          </h2>
          <v-list-subheader>
            {{ $t("offer_edit.limit.subtitle") }}
          </v-list-subheader>

          <u-number-input
            v-model="max"
            :hint="$t('offer_edit.count_input_hint')"
            :label="`${$t('offer_edit.count_input')}*`"
            :min="1"
            variant="underlined"
          />
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Duration ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div :class="{ disabled: !percent }" class="widget-box mb-5">
          <h2>
            <v-icon class="me-1">schedule</v-icon>
            {{ $t("global.commons.duration_config") }}
          </h2>
          <v-list-subheader>
            {{ $t("offer_edit.duration.subtitle") }}
          </v-list-subheader>

          <u-date-input
            v-model="start"
            :label="$t('offer_edit.date_start_input')"
            :placeholder="$t('offer_edit.date_start_input_placeholder')"
            color="#C2185B"
            return-utc
            clearable
            variant="underlined"
          ></u-date-input>

          <u-date-input
            v-model="end"
            :disabled="!start"
            :label="$t('offer_edit.date_end_input')"
            :min="start"
            :placeholder="$t('offer_edit.date_end_input_placeholder')"
            clearable
            color="#C2185B"
            return-utc
            variant="underlined"
          ></u-date-input>

          <u-time-progress-bar
            :end-time="end"
            :start-time="start"
          ></u-time-progress-bar>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Constraints ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div class="widget-box mb-5">
          <h2>
            <v-icon class="me-1">border_outer</v-icon>

            {{ $t("global.commons.constraints_config") }}
          </h2>
          <v-list-subheader>
            {{ $t("offer_edit.constraints.subtitle") }}
          </v-list-subheader>

          <u-price-input
            v-model="min_purchase"
            :decimal="currencyObject.floats"
            :hint="$t('offer_edit.min_purchase_hint')"
            :label="$t('offer_edit.min_purchase')"
            :suffix="getCurrencyName(currency)"
            clearable
            required
            variant="underlined"
          />

          <u-currency-input
            v-model="currency"
            :disabled="offer !== null"
            :label="$t('global.commons.currency')"
            :messages="$t('offer_edit.currency_input_message')"
            :return-object="false"
            variant="underlined"
            :active-currencies="shop.currencies"
          >
          </u-currency-input>

          <u-number-input
            v-model="min_quantity"
            :label="$t('offer_edit.min_items')"
            :messages="$t('offer_edit.min_items_message')"
            :min="1"
            variant="underlined"
          ></u-number-input>

          <b-products-select-box
            v-model="buy_products"
            :label="$t('offer_edit.qualified_products') + '*'"
            :messages="$t('offer_edit.qualified_products_message')"
            :shop="shop"
            border-less
            class="my-5"
            >{{ $t("global.placeholders.select_products") }}
          </b-products-select-box>
        </div>

        <div class="text-center">
          <v-icon class="mb-5" color="#222">expand_more</v-icon>
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Discounted Products ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('offer_edit.discounted_products.title')"
            icon="border_outer"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("offer_edit.discounted_products.subtitle") }}
          </v-list-subheader>

          <b-products-select-box
            v-model="get_products"
            :label="$t('offer_edit.offered_products') + '*'"
            :messages="$t('offer_edit.offered_products_message')"
            :shop="shop"
            border-less
            class="my-5"
            >{{ $t("global.placeholders.select_products") }}
          </b-products-select-box>

          <u-number-input
            v-model="percent"
            :alternative-button-text="$t('global.commons.free')"
            :alternative-button-value="100"
            :hint="$t('offer_edit.discount_percent_hint')"
            :label="$t('offer_edit.discount_percent')"
            :max="100"
            :messages="$t('offer_edit.discount_percent_message')"
            :min="1"
            append-icon="fa:fas fa-percentage"
            persistent-hint
            variant="underlined"
          />

          <u-number-input
            v-model="per_order"
            :label="$t('offer_edit.per_order')"
            :messages="$t('offer_edit.per_order_message')"
            :rounded="false"
            clearable
            variant="underlined"
          ></u-number-input>
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
            {{ $t("offer_edit.cluster.subtitle") }}
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
          {{ $t("global.actions.cancel") }}
        </v-btn>

        <v-btn
          v-if="offer && !licenseRestriction && cloneMode"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createOffer()"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create_clone") }}
        </v-btn>

        <v-btn
          v-else-if="offer && !licenseRestriction"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editOffer()"
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
          @click="createOffer"
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
import BProductsSelectBox from "../../../backoffice/product/select-box/BProductsSelectBox.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import BShopLicenseBlockOverlay from "../../shop/license/block/overlay/BShopLicenseBlockOverlay.vue";
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import BTranslationButtonOffer from "../../translation/button/offer/BTranslationButtonOffer.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import UWidgetHeader from "../../../ui/widget/header/UWidgetHeader.vue";
import { Club } from "@selldone/core-js";

export default {
  name: "BOfferAdd",
  components: {
    UWidgetHeader,
    SWidgetButtons,
    BTranslationButtonOffer,
    BClusterInput,
    USmartSuggestion,
    USmartSwitch,
    UTimeProgressBar,
    BShopLicenseBlockOverlay,
    UNumberInput,
    BProductsSelectBox,
    UDateInput,
    UPriceInput,
    UCurrencyInput,
  },
  props: {
    offer: {
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
      // Is clone mode? Create a clone from offer
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    CustomerClubLevels: Club.Levels,

    enable: false,

    max: 200,

    per_order: 1,

    currency: null,

    start: null,
    end: null,

    title: "",
    description: "",

    min_quantity: 1,
    min_purchase: 0,
    buy_products: {},

    get_products: {},
    percent: 100, // is Free!

    busy_set: false,

    cluster_id: null,
  }),

  computed: {
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
  },

  methods: {
    createOffer() {
      this.$refs.form.validate();

      this.busy_set = true;
      axios
        .post(window.API.POST_CREATE_OFFER(this.$route.params.shop_id), {
          enable: this.enable,
          max: this.max,
          per_order: this.per_order,
          currency: this.currency,
          start: this.start,
          end: this.end,

          title: this.title,
          description: this.description,

          min_quantity: this.min_quantity,
          min_purchase: this.min_purchase,
          buy_products: this.buy_products,

          get_products: this.get_products,
          percent: this.percent,

          cluster_id: this.cluster_id,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.offer);
            this.showSuccessAlert(
              null,
              this.$t("offer_edit.notifications.add"),
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

    editOffer() {
      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .put(
          window.API.PUT_EDIT_OFFER(this.$route.params.shop_id, this.offer.id),
          {
            enable: this.enable,
            max: this.max,
            per_order: this.per_order,

            start: this.start,
            end: this.end,

            title: this.title,
            description: this.description,

            min_quantity: this.min_quantity,
            min_purchase: this.min_purchase,
            buy_products: this.buy_products,

            get_products: this.get_products,
            percent: this.percent,

            cluster_id: this.cluster_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("edit", data.offer);
            this.showSuccessAlert(
              null,
              this.$t("offer_edit.notifications.edit"),
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
    if (this.offer) {
      this.enable = this.offer.enable;
      this.max = this.offer.max;
      this.per_order = this.offer.per_order;
      this.currency = this.offer.currency;

      this.start = this.offer.start;
      this.end = this.offer.end;

      this.title = this.offer.title;
      this.description = this.offer.description;

      this.min_quantity = this.offer.min_quantity;
      this.min_purchase = this.offer.min_purchase;
      this.buy_products = this.offer.buy_products;

      this.get_products = this.offer.get_products;
      this.percent = this.offer.percent;

      if (this.cloneMode) {
        this.title += "-clone";
      }

      this.cluster_id = this.offer.cluster_id;
    } else {
      this.enable = true;
      this.max = 200;
      this.per_order = 1;
      this.currency = this.$t("global.currency_default");

      this.start = null;
      this.end = null;

      this.title = null;
      this.description = null;

      this.min_quantity = 1;
      this.min_purchase = 0;
      this.buy_products = {};

      this.get_products = {};
      this.percent = 100;

      this.cluster_id = null;
    }
  },
};
</script>

<style scoped></style>
