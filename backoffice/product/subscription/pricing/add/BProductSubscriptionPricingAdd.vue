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
  <v-card class="font-weight-regular text-start">
    <v-card-title
      >{{
        subscriptionPrice ? "Edit subscription price" : "Add subscription price"
      }}
    </v-card-title>

    <v-card-subtitle>
      Unique Product Price Code :
      <b>PRC{{ subscriptionPrice ? subscriptionPrice.id : "-" }}</b>
    </v-card-subtitle>

    <v-card-text>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅  Defining Subscription Price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div class="widget-box mb-5">
        <u-widget-header
          icon="tune"
          title="Title & Description"
        ></u-widget-header>

        <v-list-subheader
          >Enter the plan title and SKU in this section. The title will be
          displayed to the user as the title of the pricing tier, and it can be
          modified at a later time.
        </v-list-subheader>

        <u-smart-toggle
          v-model="enable"
          color="success"
          false-description="This pricing will not display to customers. New users can't subscribe. Old subscriptions will remain active."
          false-gray
          false-icon="public_off"
          false-title="Unavailable"
          true-description="This pricing will be shown to customers. Users can buy this subscription. Old subscriptions will remain active."
          true-icon="public"
          true-title="Available"
        ></u-smart-toggle>

        <v-text-field
          v-model="title"
          :label="$t('global.commons.title') + '*'"
          messages=" "
          placeholder="This title will be shown to customers to pick."
          required
          variant="underlined"
        >
          <template v-slot:message>
            <u-smart-suggestion
              :samples="$tm('suggestions.subscription_price.title')"
              @select="(v) => (title = v)"
            ></u-smart-suggestion>
          </template>
        </v-text-field>

        <v-text-field
          v-model="sku"
          :counter="64"
          hint="You can set a SKU for this pricing (optional)."
          label="SKU"
          required
          variant="underlined"
        >
        </v-text-field>

        <v-text-field
          v-model="description"
          :label="$t('global.commons.description')"
          messages=" "
          placeholder="This description help you stay organize. It will not display to customers."
          required
          variant="underlined"
        >
          <template v-slot:message>
            <u-smart-suggestion
              :samples="$tm('suggestions.subscription_price.description')"
              @select="(v) => (description = v)"
            ></u-smart-suggestion>
          </template>
        </v-text-field>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pricing ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div class="widget-box mb-5">
        <u-widget-header
          icon="sell"
          title="Recurring Pricing"
        ></u-widget-header>

        <v-list-subheader
          >Configure the plan's pricing in this section. Please be aware that
          the price cannot be modified once it has been saved.
        </v-list-subheader>

        <u-currency-input
          v-model="currency"
          :activeCurrencies="shop.currencies"
          :disabled="!!subscriptionPrice"
          :label="$t('add_product.pricing.currency_input')"
          :messages="$t('add_product.pricing.currency_input_messages')"
          :return-object="false"
          class="sm-suffix price-input"
        />

        <u-loading-progress v-if="busy_billings"></u-loading-progress>

        <v-expand-transition>
          <div v-if="!busy_billings">
            <u-smart-select
              v-if="gateways && gateways.length"
              v-model="gateway_code"
              :disabled="!!subscriptionPrice"
              :item-image="(val) => getShopImagePath(val.icon)"
              :items="gateways"
              class="my-3"
              item-description="description"
              item-text="name"
              item-value="code"
              rounded
            >
            </u-smart-select>
            <div v-else-if="currency" class="my-3">
              <v-icon class="me-1" color="red">error_outline</v-icon>
              <b class="text-red"
                >Not billing service found for {{ currency }}.</b
              >
              Please add Stripe, or other subscription-supported payments before
              adding the subscription price.
            </div>
            <div v-else class="my-3">
              <v-icon class="me-1" color="red">error_outline</v-icon>
              <b class="text-red">Select a currency.</b>
            </div>
          </div>
        </v-expand-transition>

        <u-price-input
          v-model="price"
          :currency="currency"
          :disabled="price_lock"
          :label="$t('add_product.pricing.price_input')"
          class="sm-suffix price-input strong-field"
          required
        >
          <template v-slot:append-inner>
            <v-tooltip
              v-if="subscriptionPrice"
              color="#000"
              location="bottom"
              max-width="360"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                  variant="text"
                  @click="price_lock = !price_lock"
                >
                  <v-icon>{{ price_lock ? "lock" : "lock_open" }}</v-icon>
                </v-btn>
              </template>
              <div class="text-start">
                <b>Important!</b><br />
                Some payment services, like Stripe, do not support price change!
                If you receive an error after changing the price:

                <ul>
                  <li>
                    Change the price on the payment service manually and then
                    apply changes here.
                  </li>
                  <li>
                    Or deactivate this subscription plan and create a new one.
                  </li>
                </ul>
              </div>
            </v-tooltip>

            <v-tooltip v-else color="#000" location="bottom" max-width="360">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props">info</v-icon>
              </template>
              <div class="text-start">
                <b>Important!</b><br />
                Be careful about setting the price; You can not change the price
                after creation. You should create a new subscription plan if you
                want to change the price in some payment service providers like
                Stripe.
              </div>
            </v-tooltip>
          </template>
        </u-price-input>

        <v-select
          v-model="period"
          :disabled="!!subscriptionPrice"
          :item-title="(p) => $t(p.title)"
          :items="BillingPeriod"
          :return-object="false"
          append-icon="pending_actions"
          class="sm-suffix price-input strong-field"
          item-value="code"
          label="Billing period"
          required
          variant="underlined"
        />
      </div>
    </v-card-text>
    <!-- ██████████████████████ Actions ██████████████████████ -->

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :class="{ disabled: !gateway_code || !title || !currency || !price }"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="flat"
          @click="addItem()"
        >
          <v-icon class="me-1">{{ subscriptionPrice ? "save" : "add" }}</v-icon>
          {{
            subscriptionPrice
              ? $t("global.actions.save")
              : $t("global.actions.add")
          }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";

import UCurrencyInput from "../../../../../ui/currency/input/UCurrencyInput.vue";
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import USmartSelect from "../../../../../ui/smart/select/USmartSelect.vue";
import USmartSuggestion from "../../../../../ui/smart/suggestion/USmartSuggestion.vue";

export default {
  name: "BProductSubscriptionPricingAdd",
  components: {
    USmartSuggestion,
    USmartSelect,
    UPriceInput,
    UCurrencyInput,

    USmartToggle,
  },
  props: {
    shop: {
      required: true,
    },

    product: {
      required: true,
    },

    subscriptionPrice: {
      required: false,
    },
  },

  data() {
    return {
      BillingPeriod: Object.values(BillingPeriod),

      enable: true,
      title: "",
      sku: "",
      description: null,

      price: 0,
      currency: null,
      period: BillingPeriod.Monthly.code,

      gateway_code: null,

      busy_save: false,

      busy_billings: false,
      gateways: null,

      price_lock: false,
    };
  },

  computed: {
    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },
  },

  watch: {
    subscriptionPrice() {
      this.assignFromProp();
    },

    currency(currency) {
      if (currency) {
        this.gateway_code = this.subscriptionPrice
          ? this.subscriptionPrice.gateway_code
          : null; // Only in the edit mode we can change the currency!
        this.fetchBillingOptions(currency);
      }
    },
  },
  created() {
    this.assignFromProp();
  },

  methods: {
    addItem() {
      let item = {};
      if (this.subscriptionPrice) {
        item = Object.assign({}, this.subscriptionPrice);
      }

      item.enable = this.enable;

      item.title = this.title;
      item.description = this.description;
      item.sku = this.sku;

      item.price = parseFloat(this.price);
      item.currency = this.currency;
      item.period = this.period;

      item.gateway_code = this.gateway_code;

      if (this.subscriptionPrice) {
        this.addOrUpdateSubscriptionPrice(item);
      } else {
        this.addOrUpdateSubscriptionPrice(item);
      }
    },

    assignFromProp() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.subscriptionPrice) {
        this.enable = this.subscriptionPrice.enable;
        this.title = this.subscriptionPrice.title;
        this.description = this.subscriptionPrice.description;
        this.sku = this.subscriptionPrice.sku;
        this.price = this.subscriptionPrice.price;
        this.currency = this.subscriptionPrice.currency;
        this.period = this.subscriptionPrice.period;
        this.gateway_code = this.subscriptionPrice.gateway_code;

        this.price_lock = true;
      }
    },

    //――――――――――――――――――――――― Subscription Price ▶ Add ―――――――――――――――――――――――

    addOrUpdateSubscriptionPrice(subscription_price) {
      this.busy_save = true;

      const params = {
        enable: subscription_price.enable,
        title: subscription_price.title,

        description: subscription_price.description,
        sku: subscription_price.sku,
        price: subscription_price.price,
        currency: subscription_price.currency,
        period: subscription_price.period,

        gateway_code: subscription_price.gateway_code,
      };

      const promise = subscription_price.id
        ? axios.put(
            window.API.PUT_PRODUCT_EDIT_SUBSCRIPTION_PRICE(
              this.shop.id,
              this.product.id,
              subscription_price.id,
            ),
            params,
          )
        : axios.post(
            window.API.POST_PRODUCT_ADD_SUBSCRIPTION_PRICE(
              this.shop.id,
              this.product.id,
            ),
            params,
          );

      promise
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              "Pricing has been set successfully." +
                (data.extra?.message ? `<hr>${data.extra.message}` : ""),
            );

            // Update current subscription price:
            if (this.subscriptionPrice)
              Object.assign(this.subscriptionPrice, data.subscription_price);

            // Update current product:
            this.AddOrUpdateItemByID(
              this.product.subscription_prices,
              data.subscription_price,
            );

            // Emit update:
            this.$emit("update", data.subscription_price);

            this.$emit("close");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    fetchBillingOptions() {
      this.busy_billings = true;

      this.gateways = null;

      axios
        .get(
          window.API.GET_PRODUCT_SUBSCRIPTION_PRICE_AVAILABLE_BILLINGS(
            this.shop.id,
          ),
          { params: { currency: this.currency } },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.gateways = data.gateways;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_billings = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
