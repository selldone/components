<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
    <!--  <v-card-title>
      {{
        discountCode
          ? $t("discount_codes.dialog.title_edit")
          : $t("discount_codes.dialog.title_add")
      }}
    </v-card-title>-->
    <v-card-text class="text-start position-relative pt-6">
      <v-form ref="form" lazy-validation>
        <!-- ---------------------- General ---------------------- -->
        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('discount_codes.dialog.config.title')"
            icon="tune"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("discount_codes.dialog.config.subtitle") }}
          </v-list-subheader>
          <v-text-field
            v-model="code"
            :label="`${$t('discount_codes.dialog.discount_code_input')}*`"
            :rules="[GlobalRules.required()]"
            append-inner-icon="shuffle"
            class="strong-field"
            hide-details
            messages=" "
            required
            variant="underlined"
            @click:append-inner="createRandomCode"
          >
          </v-text-field>
          <u-smart-suggestion
            v-if="!discountCode?.id"
            :samples="$tm('suggestions.discount_code.code')"
            class="mb-4"
            @select="(v) => (code = v)"
          ></u-smart-suggestion>

          <u-number-input
            v-model="percent"
            :decimal="0"
            :hint="$t('discount_codes.dialog.discount_percent_input_hint')"
            :label="`${$t('discount_codes.dialog.discount_percent_input')}*`"
            :max="100"
            :min="1"
            :step="1"
            append-icon="fa:fas fa-percentage"
            class="strong-field"
            persistent-hint
            variant="underlined"
          />

          <u-currency-input
            v-model="currency"
            :color="SaminColorLight"
            :disabled="discountCode !== null && !cloneMode"
            :label="$t('global.commons.currency')"
            :messages="$t('discount_codes.dialog.currency_input_message')"
            :return-object="false"
            variant="underlined"
          >
          </u-currency-input>
        </div>
        <!-- ---------------------- Limits ---------------------- -->

        <div :class="{ disabled: !code }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('discount_codes.dialog.limit.title')"
            icon="call_missed_outgoing"
          >
          </s-widget-header>

          <v-list-subheader
            >{{ $t("discount_codes.dialog.limit.subtitle") }}
          </v-list-subheader>
          <u-price-input
            v-model="limit"
            :decimal="currencyObject.floats"
            :hint="$t('discount_codes.dialog.limit_input_hint')"
            :label="`${$t(
              'discount_codes.dialog.limit_input',
            )}  ${getCurrencyName(currency)}`"
            :messages="
              limit === 0 ? $t('discount_codes.dialog.limit_input_message') : ''
            "
            :suffix="getCurrencyName(currency)"
            class="strong-field"
            required
            variant="underlined"
          />

          <v-text-field
            v-model="max"
            :hint="$t('discount_codes.dialog.count_input_hint')"
            :label="`${$t('discount_codes.dialog.count_input')}*`"
            persistent-hint
            variant="underlined"
          />
        </div>

        <!-- ---------------------- Duration ---------------------- -->

        <div :class="{ disabled: !code }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('discount_codes.dialog.duration.title')"
            icon="schedule"
          >
          </s-widget-header>

          <v-list-subheader
            >{{ $t("discount_codes.dialog.duration.subtitle") }}
          </v-list-subheader>
          <u-date-input
            v-model="dis_start"
            :label="$t('discount_codes.dialog.date_start_input')"
            :placeholder="
              $t('discount_codes.dialog.date_start_input_placeholder')
            "
            clearable
            return-utc
            variant="underlined"
          ></u-date-input>

          <u-date-input
            v-model="dis_end"
            :disabled="!dis_start"
            :label="$t('discount_codes.dialog.date_end_input')"
            :min="dis_start"
            :placeholder="
              $t('discount_codes.dialog.date_end_input_placeholder')
            "
            clearable
            return-utc
            variant="underlined"
          ></u-date-input>

          <u-time-progress-bar
            :end-time="dis_end"
            :start-time="dis_start"
          ></u-time-progress-bar>
        </div>
        <!-- ---------------------- Design ---------------------- -->

        <div :class="{ disabled: !code }" class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.design_config')"
            icon="architecture"
          >
          </s-widget-header>

          <v-list-subheader>
            {{ $t("discount_codes.dialog.design.subtitle") }}
          </v-list-subheader>
          <v-text-field
            v-model="title"
            :counter="48"
            :label="$t('discount_codes.dialog.title_input')"
            :placeholder="$t('discount_codes.dialog.title_input_hint')"
            hide-details
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-discount-code
                v-if="discountCode?.id"
                :discount-code="discountCode"
                :label="$t('discount_codes.dialog.title_input')"
                :shop="shop"
                translation-key="title"
              ></b-translation-button-discount-code>
            </template>
          </v-text-field>
          <u-smart-suggestion
            v-if="!discountCode?.id || !title"
            :samples="$tm('suggestions.discount_code.title')"
            class="mb-4"
            @select="(v) => (title = v)"
          ></u-smart-suggestion>

          <v-text-field
            v-model="description"
            :counter="128"
            :label="$t('discount_codes.dialog.description_input')"
            :placeholder="$t('discount_codes.dialog.description_input_hint')"
            hide-details
            messages=" "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-discount-code
                v-if="discountCode?.id"
                :discount-code="discountCode"
                :label="$t('discount_codes.dialog.description_input')"
                :shop="shop"
                translation-key="description"
              ></b-translation-button-discount-code>
            </template>
          </v-text-field>
          <u-smart-suggestion
            v-if="!discountCode?.id || !description"
            :samples="$tm('suggestions.discount_code.description')"
            class="mb-4"
            @select="(v) => (description = v)"
          ></u-smart-suggestion>
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
            {{ $t("discount_codes.dialog.cluster.subtitle") }}
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
    <!-- ---------------------- Actions ---------------------- -->

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
          v-if="discountCode && !licenseRestriction && cloneMode"
          :disabled="!code"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createDiscountCode()"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create_clone") }}
        </v-btn>

        <v-btn
          v-else-if="discountCode && !licenseRestriction"
          :disabled="!code"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editDiscountCode()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else-if="!licenseRestriction"
          :disabled="!code"
          :loading="busy_set"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createDiscountCode"
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
import BShopLicenseBlockOverlay from "../../shop/license/block/overlay/BShopLicenseBlockOverlay.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { RandomString } from "@selldone/core-js/helper/string/StringHelper";
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import BTranslationButtonDiscountCode from "../../translation/button/discount-code/BTranslationButtonDiscountCode.vue";
import SWidgetHeader from "../../../ui/widget/header/SWidgetHeader.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BDiscountCodeAdd",
  components: {
    SWidgetButtons,
    SWidgetHeader,
    BTranslationButtonDiscountCode,
    BClusterInput,
    USmartSuggestion,
    UTimeProgressBar,
    UNumberInput,
    BShopLicenseBlockOverlay,
    UDateInput,
    UPriceInput,
    UCurrencyInput,
  },
  emits: ["add", "edit", "close"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    discountCode: {
      required: false,
      type: Object,
    },
    cloneMode: {
      // Is clone mode? Create a clone from discountCode
      default: false,
      type: Boolean,
    },
    hasClose: {
      default: false,
      type: Boolean,
    },
    licenseRestriction: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    code: "",
    percent: 5,
    max: 200,

    limit: 0,
    currency: null,

    title: "",
    description: "",

    dis_start: "",
    dis_end: "",
    cluster_id: null,

    busy_set: false,
  }),

  computed: {
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
  },

  methods: {
    createRandomCode() {
      this.code = RandomString(8).toUpperCase();
    },

    createDiscountCode() {
      this.$refs.form.validate();

      this.busy_set = true;
      axios
        .post(window.API.POST_CREATE_DISCOUNT_CODE(this.shop.id), {
          code: this.code,
          percent: this.percent,
          max: this.max,
          limit: this.limit,
          currency: this.currency,
          dis_start: this.dis_start,
          dis_end: this.dis_end,
          title: this.title,
          description: this.description,
          cluster_id: this.cluster_id,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.discount_code);
            this.showSuccessAlert(
              null,
              this.$t("discount_codes.dialog.notifications.add"),
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

    editDiscountCode() {
      this.$refs.form.validate();

      this.busy_set = true;

      axios
        .put(
          window.API.PUT_EDIT_DISCOUNT_CODE(
            this.$route.params.shop_id,
            this.discountCode.id,
          ),
          {
            code: this.code,
            percent: this.percent,
            max: this.max,
            limit: this.limit,
            currency: this.currency,
            dis_start: this.dis_start,
            dis_end: this.dis_end,
            title: this.title,
            description: this.description,
            cluster_id: this.cluster_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("edit", data.discount_code);
            this.showSuccessAlert(
              null,
              this.$t("discount_codes.dialog.notifications.edit"),
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
    if (this.discountCode) {
      this.code = this.discountCode.code;
      this.percent = this.discountCode.percent;
      this.max = this.discountCode.max;

      this.limit = this.discountCode.limit;
      this.currency = this.discountCode.currency;

      this.title = this.discountCode.title;
      this.description = this.discountCode.description;

      this.dis_start = this.discountCode.dis_start;
      this.dis_end = this.discountCode.dis_end;

      this.cluster_id = this.discountCode.cluster_id;

      if (this.cloneMode) {
        this.title += "-clone";
        this.code += "-" + RandomString(8);
      }
    } else {
      this.code = "";
      this.percent = 5;
      this.max = 200;

      this.limit = 0;
      this.currency = this.$t("global.currency_default");

      this.title = "";
      this.description = "";

      this.dis_start = "";
      this.dis_end = "";
      this.cluster_id = null;
    }
  },
};
</script>

<style scoped></style>
