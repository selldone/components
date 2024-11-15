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
  <div class="position-relative" style="min-height: 56px">
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄  🦄 Membership  > Subscribed ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <v-btn
      v-if="membership_subscribed_plan"
      :loading="load_basket"
      :to="{
        name: 'MySubscriptionOrderInfoPage',
        params: { basket_id: membership_subscribed_plan.basket_id },
      }"
      class="s--shop-subscription-button"
      color="#000"
      min-width="220"
      @click="load_basket = !load_basket"
    >
      <v-icon class="me-2"> shopping_bag</v-icon>
      {{ $t("buy_button.manage_subscriptions") }}
      <small class="ms-2">SN-{{ membership_subscribed_plan.basket_id }}</small>
    </v-btn>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Subscribe button ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <v-btn
      v-else
      :class="{ disabled: !selectedSubscriptionPrice }"
      :loading="busy"
      class="s--shop-subscription-button"
      color="#D32F2F"
      min-width="220"
      rounded
      v-bind="
        window.ExternalWidget
          ? { href: ShopURLs.GetProductLink(shop, product.id), target: '' }
          : {}
      "
      @click.stop="showSubscribe"
    >
      <v-icon class="me-2">
        {{ !selectedSubscriptionPrice ? "help_outline" : "shopping_cart" }}
      </v-icon>
      {{
        !selectedSubscriptionPrice
          ? $t("buy_button.select_a_subscription_plan")
          : $t("buy_button.subscribe_now")
      }}
    </v-btn>

    <!-- ███████████████████████ Dialog ███████████████████████ -->
    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>
          <v-avatar class="me-2" size="36">
            <img :src="getShopImagePath(product.icon, 64)" alt="Product Image" />
          </v-avatar>
          {{ product.title }} | <b> Subscription</b>
        </v-card-title>
        <v-card-text>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Shipping ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <div v-if="has_shipping" class="widget-box mb-5 mt-5">
            <u-widget-header
              icon="place"
              title="Delivery Address"
            ></u-widget-header>
            <v-list-subheader></v-list-subheader>

            <div class="mb-4">
              <div v-if="!receiver_info">
                <div class="widget-buttons">
                  <v-btn
                    class="-delivery-btn"
                    color="#03A9F4"
                    rounded
                    size="x-large"
                    @click="showMapSelect"
                  >
                    <v-icon class="me-1 blink-me" size="small">lens</v-icon>
                    {{ $t("global.commons.select_address") }}
                  </v-btn>
                </div>

                <div class="my-2">
                  <v-icon class="me-1">tips_and_updates</v-icon>
                  Select your address
                </div>
              </div>

              <div v-else>
                <s-shop-customer-receiver-info-widget
                  :receiver-info="receiver_info"
                  @show:detail="
                    () => {
                      startup_mode_map_dialog = 'detail';
                      showMapSelect();
                    }
                  "
                  @show:map="
                    startup_mode_map_dialog = 'default';
                    showMapSelect();
                  "
                ></s-shop-customer-receiver-info-widget>
              </div>
            </div>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Billing ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="has_billing" class="widget-box mb-5 mt-5">
            <u-widget-header
              icon="receipt"
              title="Billing Address"
            ></u-widget-header>
            <v-list-subheader></v-list-subheader>
            <s-shop-billing-address-form
              v-model="billing"
              :force-show-form="!has_shipping"
              :receiver-info="receiver_info"
            ></s-shop-billing-address-form>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Plans / Price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div class="widget-box mb-5">
            <u-widget-header icon="payment" title="Payment"></u-widget-header>
            <v-list-subheader></v-list-subheader>

            <s-subscription-price-select
              v-model="selected_price_id"
              :subscription-prices="subscription_prices"
              class="mb-5"
            ></s-subscription-price-select>

            <u-number-input
              v-if="has_count"
              v-model="count"
              :label="$t('buy_button.quantity_in_basket')"
              :min="1"
              :placeholder="$t('buy_button.quantity')"
              background-color="#fff"
              class="extendable strong-field"
              clearable
              filled
              flat
              hide-details
            >
            </u-number-input>

            <div class="widget-buttons">
              <v-btn
                :class="{ disabled: !can_subscribe }"
                :color="default_color"
                :loading="busy_subscribe"
                height="82"
                size="x-large"
                @click="subscribeNow"
              >
                <div class="flex-grow-1">
                  <div v-if="selected_price">
                    <u-price
                      :amount="selected_price.price * count"
                      :currency="selected_price.currency"
                      large
                    ></u-price>
                    / {{ $t(selected_period.title) }}
                  </div>
                  <div v-else class="font-weight-light">Select a plan!</div>
                  <hr class="my-2" style="border-color: #ffffff4d" />
                  <b>Start Plan Now</b>
                </div>
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
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
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SShopCustomerReceiverInfoWidget from "../../../storefront/order/delivery/SShopCustomerReceiverInfoWidget.vue";
import SSubscriptionPriceSelect from "../../../storefront/order/subscription/SSubscriptionPriceSelect.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import SShopBillingAddressForm from "../../../storefront/order/billing/SShopBillingAddressForm.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import { RibbonHelper } from "@selldone/core-js/helper/ribbon/RibbonHelper";
import MapMixin from "@selldone/components-vue/mixin/map/MapMixin.ts";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";
import {Product} from "@selldone/core-js/models";
import {ShopURLs} from "@selldone/core-js/helper";


export default {
  name: "SShopSubscribeButton",
  mixins: [MapMixin, AuthMixin ],
  components: {
    UNumberInput,
    SShopBillingAddressForm,
    SSubscriptionPriceSelect,
    SShopCustomerReceiverInfoWidget,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 🟣 Marketplace 🟣 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    vendorProduct: {
      required: false,
      type: Object,
    },
    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    // ▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀
    selectedSubscriptionPrice: {
      type: Object,
    }, // External selected subscription price
  },
  data: () => ({
    Product: Product,

    busy: false,
    busy_subscribe: false,

    dialog: false,

    count: 1,
    receiver_info: null,
    billing: null,

    //-----------------------
    startup_mode_map_dialog: "default",
    center: { lat: 0, lng: 0 },
    map_location: {},
    //-----------------------

    selected_price_id: null,

    //-----------------------
    load_basket: false,
  }),

  computed: {
    ShopURLs() {
      return ShopURLs
    },
    subscription_prices() {
      return this.product.subscription_prices;
    },

    shop() {
      return this.getShop();
    },

    theme() {
      return this.shop.theme;
    },
    default_color() {
      return this.theme && this.theme.color_buy
        ? this.theme.color_buy
        : "#0061e0";
    },

    can_subscribe() {
      return (
        this.count > 0 &&
        (!this.has_shipping || this.receiver_info?.address) &&
        this.selected_price
      );
    },

    selected_price() {
      return (
        this.selected_price_id &&
        this.subscription_prices.find((i) => i.id === this.selected_price_id)
      );
    },

    selected_period() {
      return this.selected_price && BillingPeriod[this.selected_price.period];
    },

    shop_ribbon() {
      return this.shop.ribbon;
    },

    has_shipping() {
      return RibbonHelper.hasShipping(this.shop, this.product);
    },
    has_billing() {
      return RibbonHelper.hasBilling(this.shop, this.product);
    },
    has_count() {
      return RibbonHelper.hasCount(this.shop, this.product);
    },

    // 🦄 Membership > Subscribed
    membership_subscribed_plan() {
      return RibbonHelper.isMembershipSubscribed(this.product);
    },
  },

  watch: {
    product() {
      this.resetToDefault(); // 🞇 Reset to default
    },
  },

  methods: {
    showSubscribe() {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }

      this.selected_price_id = this.selectedSubscriptionPrice?.id;
      this.dialog = true;
    },

    showMapSelect() {
      if (this.receiver_info && this.receiver_info.location) {
        this.center = {
          lat: this.receiver_info.location.lat,
          lng: this.receiver_info.location.lng,
        };
      }
      if (this.receiver_info) {
        this.map_location = Object.assign({}, this.receiver_info);
      }

      this.showMap(
        this.center,
        this.startup_mode_map_dialog,
        this.map_location,
        this.onClickSetLocation,
        false,
      );
    },
    onClickSetLocation(info) {
      //   console.log("info", info);

      if (!info.phone && this.USER()) info.phone = this.USER().phone; // Autofill phone!

      this.receiver_info = info;
      this.closeMap();
    },

    subscribeNow() {
      this.busy_subscribe = true;

      axios
        .post(window.XAPI.POST_SUBSCRIBE_NOW(this.shop_name, this.product.id), {
          count: this.has_count ? this.count : 1,
          price_id: this.selected_price.id,
          receiver_info: this.receiver_info,
          billing: this.billing,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.ShowPaymentDialogSubscription(
              data.currency,
              null,
              data.bill,
              data.gateway_codes,
              /*Used for in site payment flow & free orders!*/
              (data) => {
                console.log("🎗️ Subscription > On callback payment!", data);
              },
            );

            //  this.dialog=false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_subscribe = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-subscription-button {
  font-size: 18px !important;
  font-weight: 500;
  min-height: 54px !important;
  transition: all 0.4s;
}
</style>
