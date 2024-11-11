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
  <!--
  █████████████████████████████████████████████████████████████
  ――――――――――――― Buy ▶ 🎗️ Subscribe ――――――――――――
  █████████████████████████████████████████████████████████████
  -->
  <s-shop-subscribe-button
    v-if="isSubscription && !isCartSubscriptionMode"
    :product="product"
    :selected-subscription-price="selectedSubscriptionPrice"
    :vendor-product="vendorProduct"
  >
  </s-shop-subscribe-button>

  <!--
  █████████████████████████████████████████████████████████████
  ―――――――――――――――― Buy ▶ Normal ―――――――――――――
  █████████████████████████████████████████████████████████████
  -->
  <div v-else class="position-relative px-1" style="min-height: 65px">
    <!-- 🞇 Loading -->

    <u-loading-ellipsis
      v-show="
        busy /*default_mode || changed to number input!*/ &&
        selected_order_count <= 1 /*Show loading for first action!*/
      "
      class="ma-auto"
      height="50px"
    />

    <!-- 🞇 Finished -->

    <v-btn
      v-if="!quantity && !busy"
      :class="{ 'waiting-mode': forAvailable }"
      :color="forAvailable ? default_color : '#eee'"
      class="s--shop-buy-button px-2"
      min-width="220"
      rounded
      v-bind="
        window.ExternalWidget
          ? { href: getProductLink(shop, product.id), target: '_blank' }
          : {}
      "
      variant="flat"
      @click.stop="
        forAvailable
          ? delete_from_waiting_when_available()
          : put_to_waiting_when_available()
      "
    >
      <img
        class="ms-2"
        src="../../../assets/icons/available-notify.svg"
        width="28"
      />
      <span v-if="forAvailable" class="mx-2">
        {{ $t("buy_button.waiting_for_availability") }}
      </span>
      <span v-else class="mx-2">
        {{ $t("buy_button.inform_me_when_available") }}
      </span>
    </v-btn>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Save notification ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <v-slide-y-reverse-transition>
      <div v-if="show_success_save">
        <v-sheet
          :color="default_color"
          dark
          style="
            border-radius: 6px;
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 2px 12px;
          "
        >
          <v-icon class="me-1" size="small">check_circle</v-icon>
          {{ $t("global.commons.saved") }}
        </v-sheet>
      </div>
    </v-slide-y-reverse-transition>
    <!--
      █████████████████████████████████████████████████████████████
      ――――――――――――――――――――――― Buy ▶ Change quantity ―――――――――――――――――――――
      █████████████████████████████████████████████████████████████
      -->
    <template
      v-if="
        quantity &&
        find_existed_in_basket &&
        (!busy /*!default_mode && changed to number input!*/ ||
          selected_order_count >
            1) /* Do not show loading in custom pricing input modes*/
      "
    >
      <!-- ―――――――――――――― 🞇 Price input: Default / Custom ―――――――――――――― -->
      <u-number-input
        v-if="default_mode || custom_mode"
        v-model="selected_order_count"
        :background-color="default_color"
        :items="order_counts"
        :label="$t('buy_button.quantity_in_basket')"
        :max="quantity"
        :placeholder="$t('buy_button.quantity')"
        class="extendable select-order-count"
        clearable
        dark
        flat
        hide-details
        hot-update-mode
        rounded="lg"
        variant="solo"
        @change="lock ? undefined : debounceSpinnerSelectAction()"
        @clear="buyRemoveAction"
      >
      </u-number-input>

      <!-- ―――――――――――――― 🞇 Price input: Area / Volume ―――――――――――――― -->

      <div v-else-if="area_mode || volume_mode" class="d-flex align-center">
        <u-number-input
          v-model="dim_1"
          :background-color="default_color"
          :color="default_color"
          :label="$t('global.commons.width')"
          :placeholder="$t('buy_button.quantity')"
          class="extendable select-order-count"
          clearable
          dark
          flat
          hide-details
          hot-update-mode
          rounded="lg"
          variant="solo"
          @blur="calculatorCall"
          @change="lock ? undefined : calculatorCall()"
        >
        </u-number-input>
        <u-number-input
          v-model="dim_2"
          :background-color="default_color"
          :color="default_color"
          :label="$t('global.commons.length')"
          :placeholder="$t('buy_button.quantity')"
          class="extendable select-order-count"
          clearable
          dark
          flat
          hide-details
          hot-update-mode
          rounded="lg"
          variant="solo"
          @blur="calculatorCall"
          @change="lock ? undefined : calculatorCall()"
        >
        </u-number-input>

        <u-number-input
          v-if="volume_mode"
          v-model="dim_3"
          :background-color="default_color"
          :color="default_color"
          :label="$t('global.commons.height')"
          :placeholder="$t('buy_button.quantity')"
          class="extendable select-order-count"
          clearable
          dark
          flat
          hide-details
          hot-update-mode
          rounded="lg"
          variant="solo"
          @blur="calculatorCall"
          @change="lock ? undefined : calculatorCall()"
        >
        </u-number-input>
      </div>
    </template>

    <!--
  █████████████████████████████████████████████████████████████
  ―――――――――――――――――――――――― Buy ▶ First action ―――――――――――――――――――――――
  █████████████████████████████████████████████████████████████
  -->
    <!-- Add to basket Button -->

    <v-btn
      v-if="canBuy && quantity && !busy && !find_existed_in_basket"
      :color="default_color"
      class="s--shop-buy-button"
      min-width="220"
      rounded
      v-bind="
        window.ExternalWidget
          ? { href: getProductLink(shop, product.id), target: '' }
          : {}
      "
      @click.stop="physicalBuyAction(1)"
    >
      <v-icon v-if="action_icon" class="me-2"> {{ action_icon }}</v-icon>
      {{ action_text }}
    </v-btn>

    <!--
█████████████████████████████████████████████████████████████
―――――――――――――――――――――――― External ▶ Second  Call to Action ―――――――――――――――――――――――
█████████████████████████████████████████████████████████████
-->
    <s-product-external-button :product="product"></s-product-external-button>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import ULoadingEllipsis from "../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import { GtagEcommerce } from "../../../plugins/gtag/GtagEcommerce";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import SShopSubscribeButton from "./SShopSubscribeButton.vue";
import { SubscriptionMode } from "@selldone/core-js/enums/subscription/SubscriptionMode";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import { BuyButtonHelper } from "@selldone/core-js/helper/shop/BuyButtonHelper";
import { debounce, delay } from "lodash-es";
import SProductExternalButton from "@selldone/components-vue/storefront/product/external/button/SProductExternalButton.vue";

export default {
  name: "SShopBuyButton",
  components: {
    SProductExternalButton,
    SShopSubscribeButton,
    UNumberInput,
    ULoadingEllipsis,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
    currentVariant: {
      required: false,
    },
    canBuy: {
      required: false,
      type: Boolean,
      default: false,
    },
    preferences: {
      // Can be set before buy item! (Used in services)
    },

    quickBuyMode: {
      // Show basket sidebar after add to cart
      required: false,
      type: Boolean,
      default: false,
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 🟣 Marketplace 🟣 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    vendorProduct: {
      required: false,
      type: Object,
    },
    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    // ▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀
    selectedSubscriptionPrice: { type: Object },
  },
  data: () => ({
    busy: false,

    // 🞇 Physical
    selected_order_count: null,

    pre_order_count: null, // Pre physical order count

    /*
    selected_vendor_product_id:null,
    vendors:[],
    busy_vendor:false,
*/

    dim_1: 1,
    dim_2: 1,
    dim_3: 1,

    lock: false, // Prevent set anything by sending request to the server!

    show_success_save: false,
  }),
  computed: {
    custom_action() {
      return BuyButtonHelper.ExtractIconCaption(this.product.action);
    },

    action_text() {
      return this.custom_action?.text
        ? this.custom_action.text
        : this.$t("buy_button.add_to_basket");
    },
    action_icon() {
      return this.custom_action?.icon
        ? this.custom_action.icon
        : "shopping_cart";
    },

    checkout() {
      return ShopOptionsHelper.GetCheckout(this.shop);
    },
    is_express() {
      // Redirect user to the checkout page after click add to cart
      return this.checkout && this.checkout.express;
    },

    default_mode() {
      return this.price_input === "default";
    },
    custom_mode() {
      return this.price_input === "custom";
    },
    area_mode() {
      return this.price_input === "area";
    },
    volume_mode() {
      return this.price_input === "volume";
    },
    shop() {
      return this.getShop();
    },

    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    theme() {
      return this.shop.theme;
    },
    default_color() {
      return this.theme && this.theme.color_buy
        ? this.theme.color_buy
        : "#0061e0";
    },

    unit() {
      return this.product.unit
        ? this.product.unit
        : this.$t("buy_button.count_unit");
    },

    basket() {
      return this.getBasket(this.product.type);
    },
    inform() {
      if (!this.product.informs) return null;
      return this.product.informs.find((item) => {
        return (
          item.variant_id ===
          (this.currentVariant ? this.currentVariant.id : null)
        );
      });
    },

    forAvailable() {
      return this.inform ? this.inform.available : false;
    },

    isVirtual() {
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },
    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },
    isSubscription() {
      return (
        this.product && this.product.type === ProductType.SUBSCRIPTION.code
      );
    },
    isCartSubscriptionMode() {
      return (
        this.shop.ribbon?.cart &&
        this.product.ribbon?.mode !== SubscriptionMode.Membership.code
      ); /*🦄 Not Membership*/
    },
    quantity() {
      //file:
      if (this.isFile) return 1;
      //subscription:
      if (this.isSubscription) return this.product.quantity > 0 ? 999 : 0;

      // 🟣 Marketplace 🟣
      if (this.vendorProduct) return this.vendorProduct.quantity;

      if (this.currentVariant) return this.currentVariant.quantity;
      return this.product ? this.product.quantity : 0;
    },

    need_user_fill_input_data() {
      return this.product.inputs && this.product.inputs.length;
    },

    order_counts() {
      let N = Math.min(this.quantity, 20);

      let foo = [];
      for (let i = 0; i <= N; i++) {
        foo.push(i);
      }
      return foo;
    },

    // 🞇 Find item in basket by product id and variant code
    find_existed_in_basket() {
      if (!this.basket) return false;

      let found = BasketHelper.FindItem(
        this.basket,
        this.product,
        this.currentVariant,
      );

      // 🞇 If change found item in basket change => set select order count
      this.setSelectedOrderCountByItemInBasket(found);

      return found;
    },

    price_input() {
      return this.product.type === ProductType.PHYSICAL.code &&
        this.product.price_input
        ? this.product.price_input
        : "default";
    },

    // ――――――――――――― Valuation ―――――――――――――
    /*
    valuation() {
      return this.product.valuation;
    },

    structure() {
      return this.valuation && this.valuation.structure;
    },

    validate_valuation(){
      console.log('preferences',this.preferences)
      console.log('structure',this.structure)
      return !this.structure || (  this.preferences &&
          // Make sure all select input selected by user:
          !this.structure.filter(i=>['select'].includes(i.type)).some(i=>!this.preferences[i.name])
      )
    }

    */
  },

  watch: {
    selected_order_count(new_value, old_value) {
      if (new_value === this.pre_order_count) return; // Initial state filled by current basket state!

      if (new_value > old_value)
        GtagEcommerce.AddingProductToShoppingCart(
          this.shop,
          this.product,
          this.currentVariant,
          new_value - old_value,
          this.GetUserSelectedCurrency().code,
        );
      else if (old_value > new_value)
        GtagEcommerce.RemovingProductFromShoppingCart(
          this.shop,
          this.product,
          this.currentVariant,
          old_value - new_value,
          this.GetUserSelectedCurrency().code,
        );

      //    this.pre_order_count = new_value;
    },

    currentVariant() {
      this.resetToDefault(); // 🞇 Reset to default
      this.pre_order_count = this.selected_order_count;
    },
    product() {
      this.pre_order_count = this.selected_order_count;
    },
  },

  created() {
    // Solve problem in change state in instagram mode:
    /*  if(!this.inform){
      this.product.informs=[];
      this.product.product.variants.forEach(variant=>{
        this.product.informs.push({variant_id:variant.id,available:false,auction:false})

      })
    }*/
    this.pre_order_count = this.selected_order_count;
  },

  methods: {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Buy ▶ Item ―――――――――――――――――――――――
    // External Function!
    //█████████████████████████████████████████████████████████████

    // 🟡 Important: This function call externally!
    physicalBuyAction(count = 1) {
      if (
        !this.USER() &&
        !ShopOptionsHelper.HasGuestCheckout(this.getShop()) /*🥶 Guest*/
      ) {
        this.NeedLogin();
        return;
      }

      this.selected_order_count = count;

      this.buyAddAction();

      /*
       * 💡 Google Analytic  Event      🞇 Event : Physical ▶ button-buy-click ▶ Product title
       */
      /*if (this.$ga)
        this.$ga.event(
          "Physical",
          "button-buy-click",
          this.product.title,
          this.selected_order_count
        );*/
    },

    debounceSpinnerSelectAction: debounce(
      function () {
        // console.log("Auto get rates...");
        this.spinnerSelectAction();
      },
      1000,
      { maxWait: 3000, trailing: true },
    ),

    spinnerSelectAction() {
      if (this.selected_order_count) {
        if (
          this.find_existed_in_basket &&
          this.find_existed_in_basket.count === this.selected_order_count
        )
          return;

        this.buyAddAction();
      } else {
        if (!this.find_existed_in_basket) return;

        this.buyRemoveAction();
      }

      /*
       * 💡 Google Analytic      🞇 Event : Physical ▶ spinner-buy-set ▶ Product title
       */
      /* if (this.$ga)
        this.$ga.event(
          "Physical",
          "spinner-buy-set",
          this.product.title,
          this.selected_order_count
        );*/
    },

    calculatorCall: debounce(
      function () {
        // console.log("Auto get rates...");
        this.calculateNow();
      },
      1000,
      { maxWait: 3000, trailing: true },
    ),

    calculateNow() {
      let new_count = 1;
      if (this.area_mode) {
        new_count = this.dim_1 * this.dim_2;
      } else if (this.volume_mode) {
        new_count = this.dim_1 * this.dim_2 * this.dim_3;
      } else {
        this.showWarningAlert(null, "Invalid pricing input configuration!");
      }

      if (new_count === this.selected_order_count) return;
      this.selected_order_count = new_count;

      if (this.selected_order_count) {
        this.buyAddAction();
      } else {
        this.buyRemoveAction();
      }
    },

    // 🟡 Important: This function call externally!
    buyAddAction() {
      if (typeof this.AddToBasket !== "function") {
        // safe to use the function
        return;
      }

      this.busy = true;

      //  let variant_id = this.currentVariant ? this.currentVariant.id : null;

      let preferences = this.preferences;

      // Update preferences: (Used in physical order price input types)
      if (this.area_mode || this.volume_mode) {
        this.dim_1 = this.dim_1 ? this.dim_1 : 1;
        this.dim_2 = this.dim_2 ? this.dim_2 : 1;
        this.dim_3 = this.dim_3 ? this.dim_3 : 1;

        if (!preferences || Array.isArray(preferences)) preferences = {};
        preferences.dim_1 = this.dim_1;
        preferences.dim_2 = this.dim_2;
        preferences.dim_3 = this.dim_3;

        if (this.area_mode) {
          this.selected_order_count = this.dim_1 * this.dim_2;
        } else if (this.volume_mode) {
          this.selected_order_count = this.dim_1 * this.dim_2 * this.dim_3;
        }
      }

      this.AddToBasket(
        this.shop_name,
        this.product,
        this.currentVariant,
        this.selected_order_count,
        (error) => {
          // ❌ Error Callback

          this.busy = false;
        },
        (basket) => {
          // ✅ Success Callback
          this.busy = false;

          if (this.is_express) {
            // Redirect user to the checkout page after click add to cart
            this.$router.push({
              name: window.$storefront.routes.BASKET_PAGE,
              params: { type: this.product.type },
            });
          } else {
            this.show_success_save = true;
            delay(() => {
              this.show_success_save = false;
            }, 1000);

            if (this.quickBuyMode) {
              // Show basket on side menu
              this.OpenCartSideMenu(true, basket.type);
            }
          }
        },
        preferences,
        this.vendorProduct, // 🟣 Marketplace 🟣
        this.selectedSubscriptionPrice, // 🎗️ Subscription
      );
    },
    buyRemoveAction() {
      this.busy = true;

      let variant_id = this.currentVariant ? this.currentVariant.id : null;

      this.RemoveFromBasket(
        this.product.id,
        variant_id,
        (error) => {
          this.busy = false;
        },
        (basket) => {
          this.busy = false;
        },
      );
    },

    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Physical ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬
    // 🞇 If change found item in basket change => set select order count
    setSelectedOrderCountByItemInBasket(found) {
      this.lock = true; // Prevent set anything by sending request to the server!

      //console.log('setSelectedOrderCountByItemInBasket',found)
      this.pre_order_count = found ? found.count : 0;
      this.selected_order_count = found ? found.count : 0;

      // console.log("found", found);
      if (found && found.preferences) {
        this.dim_1 = found.preferences.dim_1 ? found.preferences.dim_1 : 1;
        this.dim_2 = found.preferences.dim_2 ? found.preferences.dim_2 : 1;
        this.dim_3 = found.preferences.dim_3 ? found.preferences.dim_3 : 1;
      }

      this.$nextTick(() => {
        this.lock = false; // Unlock!
      });
    },

    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Inform when available ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬

    put_to_waiting_when_available() {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }

      this.busy = true;
      axios
        .put(
          window.XAPI.PUT_TO_WAITING_FOR_BE_AVAILABLE(
            this.getShop().name,
            this.product.id,
          ),
          {
            variant_id: this.currentVariant ? this.currentVariant.id : null,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              this.$t("global.notification.congratulation"),
              this.$t("buy_button.notifications.inform_add_success"),
            );
            this.product.informs = data.informs;
          } else {
            this.showErrorAlert(
              this.$t("global.notification.error"),
              data.error_msg,
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    delete_from_waiting_when_available() {
      this.busy = true;

      axios
        .delete(
          window.XAPI.DELETE_FROM_WAITING_FOR_BE_AVAILABLE(
            this.getShop().name,
            this.product.id,
          ),
          {
            params: {
              variant_id: this.currentVariant ? this.currentVariant.id : null,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              this.$t("global.notification.confirm"),
              this.$t("buy_button.notifications.inform_remove_success"),
            );
            this.product.informs = data.informs;
          } else {
            this.showErrorAlert(
              this.$t("global.notification.error"),
              data.error_msg,
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
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

.s--shop-buy-button {
  font-size: 18px !important;
  font-weight: 500;
  min-height: 54px !important;
  //  min-width: 164px !important;

  transition: all 0.4s;

  &.waiting-mode {
    box-shadow:
      20px 5px 40px #cf77f3,
      0px 5px 40px #009bff,
      -20px 5px 40px #2ac9db !important;
    background-image: linear-gradient(
      -90deg,
      #cf77f3 0%,
      #009bff 47%,
      #2ac9db 100%
    );
  }
}

.select-order-count {
  font-size: 18px;
  font-weight: 500;
}

.options {
  margin: 8px 6px;
  font-size: 1.2rem;
}
</style>
