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
  <div style="min-height: 56px" class="position-relative">
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄  🦄 Membership  > Subscribed ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <v-btn
      v-if="membership_subscribed_plan"
      class="s--shop-subscription-button"
      min-width="220"
      color="#000"
      dark
      :to="{
        name: 'MySubscriptionOrderInfoPage',
        params: { basket_id: membership_subscribed_plan.basket_id },
      }"
      @click="load_basket = !load_basket"
      :loading="load_basket"
    >
      <v-icon class="me-2"> shopping_bag </v-icon>
      {{ $t("buy_button.manage_subscriptions") }}
      <small class="ms-2">SN-{{ membership_subscribed_plan.basket_id }}</small>
    </v-btn>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Subscribe button ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <v-btn
      v-else
      class="s--shop-subscription-button"
      rounded
      color="#D32F2F"
      min-width="220"
      dark
      @click.stop="showSubscribe"
      v-bind="
        window.ExternalWidget
          ? { href: getProductLink(shop, product.id), target: '' }
          : {}
      "
      :loading="busy"
      :class="{ disabled: !selectedSubscriptionPrice }"
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
            <img :src="getShopImagePath(product.icon, 64)" />
          </v-avatar>
          {{ product.title }} | <b> Subscription</b>
        </v-card-title>
        <v-card-text>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Shipping ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <div v-if="has_shipping" class="widget-box mb-5 mt-5">
            <s-widget-header
              title="Delivery Address"
              icon="place"
            ></s-widget-header>
            <v-subheader> </v-subheader>

            <div class="mb-4">
              <div v-if="!receiver_info">
                <div class="widget-buttons">
                  <v-btn
                    color="#03A9F4"
                    class="-delivery-btn"
                    dark
                    rounded
                    x-large
                    @click="showMapSelect"
                  >
                    <v-icon small class="me-1 blink-me">lens</v-icon>
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
            <s-widget-header
              title="Billing Address"
              icon="receipt"
            ></s-widget-header>
            <v-subheader> </v-subheader>
            <s-shop-billing-address-form
              v-model="billing"
              :receiver-info="receiver_info"
              :force-show-form="!has_shipping"
            ></s-shop-billing-address-form>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Plans / Price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div class="widget-box mb-5">
            <s-widget-header title="Payment" icon="payment"></s-widget-header>
            <v-subheader> </v-subheader>

            <s-subscription-price-select
              v-model="selected_price_id"
              :subscription-prices="subscription_prices"
              class="mb-5"
            ></s-subscription-price-select>

            <s-number-input
              v-if="has_count"
              v-model="count"
              class="extendable strong-field"
              :placeholder="$t('buy_button.quantity')"
              :label="$t('buy_button.quantity_in_basket')"
              filled
              hide-details
              background-color="#fff"
              flat
              clearable
              :min="1"
            >
            </s-number-input>

            <div class="widget-buttons">
              <v-btn
                :color="default_color"
                dark
                x-large
                @click="subscribeNow"
                :loading="busy_subscribe"
                :class="{ disabled: !can_subscribe }"
                height="82"
              >
                <div class="flex-grow-1">
                  <div v-if="selected_price">
                    <price-view
                      :amount="selected_price.price * count"
                      :currency="selected_price.currency"
                      large
                    ></price-view>
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
            <v-btn x-large text @click="dialog = false">
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SShopCustomerReceiverInfoWidget from "@components/storefront/order/delivery/SShopCustomerReceiverInfoWidget.vue";
import SSubscriptionPriceSelect from "@components/storefront/order/subscription/SSubscriptionPriceSelect.vue";
import BillingPeriod from "@core/enums/subscription/BillingPeriod";
import SShopBillingAddressForm from "@components/storefront/order/billing/SShopBillingAddressForm.vue";
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import { RibbonHelper } from "@core/helper/ribbon/RibbonHelper";
export default {
  name: "SShopSubscribeButton",
  components: {
    SNumberInput,
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
    busy: false,
    busy_subscribe: false,

    dialog: false,

    count: 1,
    receiver_info: null,
    billing: null,

    //-----------------------
    startup_mode_map_dialog: "default",
    center: { lat: 35.715298, lng: 51.404343 },
    map_location: {},
    //-----------------------

    selected_price_id: null,

    //-----------------------
    load_basket: false,
  }),

  computed: {
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
        false
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
              }
            );

            //  this.dialog=false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_subscribe = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
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
