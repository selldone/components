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
  <div class="s--shop-hyper-add-order-form">
    <!-- ................ Show Hyper Details ................ -->
    <div class="text-start">
      <h1>{{ $t("hyper.title") }}</h1>
      <p class="subtitle-2 my-1">
        {{ $t("hyper.message") }}
      </p>



      <s-shop-hyper-product-view
        :shop="shop"
        :hyper="hyper"
        @click:add="addHyperItem"
        :busy-add="busy_add"
        class="mb-3"
      ></s-shop-hyper-product-view>


      <currency-list
          v-if="shop.currencies.length > 1"
          class="mt-2 mb-3 max-width-field-mini"
          :shop="shop"
          v-model="currency"
          solo
          @change="setCurrencyHyper"
          :loading="busy_currency"
          :return-object="false"
          :label="$t('global.commons.currency')"
          :messages="$t('hyper.currency_msg')"
      >
      </currency-list>


      <hr />

      <h2 class="my-2 text-muted font-weight-light">
        {{ $t("global.commons.cart_list") }}
      </h2>

      <s-shop-hyper-items-list
        :hyper="hyper"
        @update:hyper="(val) => $emit('update:hyper', val)"
        :items="items"
        class="my-3"
        :view-only="!isOpen"
      >
      </s-shop-hyper-items-list>

      <hr />

      <div class="d-flex">
        <p class="flex-grow-1">{{ $t("global.commons.net_price") }}</p>

        <price-view
          :amount="hyper.price"
          :currency="hyper.currency"
          not-show-zero
        >
        </price-view>
      </div>

      <div class="d-flex">
        <p class="flex-grow-1">{{ $t("global.commons.tax") }}</p>

        <price-view
          :amount="hyper.tax"
          :currency="hyper.currency"
          :line-through="hyper.tax_included"
          not-show-zero
        >
        </price-view>
      </div>

      <hr />
      <div class="py-3">
        <price-view
          large
          :amount="sum"
          :currency="hyper.currency"
          not-show-zero
        >
        </price-view>
        <stamp v-if="isPayed" is-approved class="float-end">
          {{ $t("global.status.paid") }}
        </stamp>
        <stamp v-if="isCanceled" is-declined class="float-end">
          {{ $t("global.status.canceled") }}
        </stamp>
      </div>

      <h2 class="mb-6 text-muted font-weight-light">
        {{ $t("global.commons.payment") }}
      </h2>



      <v-btn
        :class="{ disabled: !can_submit }"
        color="#03A9F4"
        class="-delivery-btn"
        dark
        rounded
        x-large
        @click="goToPaymentBasket"
        :loading="busy_submit"
      >
        <v-icon small class="me-1 blink-me">lens</v-icon>
        {{ $t("hyper.order_action") }}
      </v-btn>
    </div>

    <v-progress-linear
      v-if="busy_add"
      indeterminate
      class="loader-to-bar"
      color="success"
    ></v-progress-linear>
  </div>
</template>

<script>
import CurrencyList from "@components/ui/currency/CurrencyList.vue";
import SShopHyperItemsList from "./SShopHyperItemsList.vue";
import SShopHyperProductView from "./SShopHyperProductView.vue";
import GtagEcommerce from "../../../Applications/Storefront/plugins/gtag/GtagEcommerce";
import { BasketStatus } from "@core/enums/basket/BasketStatus";
import Stamp from "@components/ui/stamp/Stamp.vue";
import _ from "lodash-es";

export default {
  name: "SShopHyperAddOrderForm",
  components: {
    Stamp,
    SShopHyperProductView,
    SShopHyperItemsList,
    CurrencyList,
  },
  props: {
    shop: { required: true },
    hyper: { required: true },
  },

  data: () => ({
    //-----------------------
    busy_submit: false,

    //-----------------------
    currency:null,

    busy_add: false,

    random: 0,

    busy_currency:false,

  }),
  computed: {
    items() {
      return this.hyper.items;
    },

    user() {
      return this.$store.getters.getUser;
    },
    can_submit() {
      return (
        !this.busy_add && !this.busy_submit && this.items && this.items.length
      );
    },

    sum() {
      return this.hyper.price + (this.hyper.tax_included ? 0 : this.hyper.tax);
    },
    isOpen() {
      return this.hyper.status === BasketStatus.Open.code;
    },
    isReserved() {
      return this.hyper.status === BasketStatus.Reserved.code;
    },
    isPayed() {
      return this.hyper.status === BasketStatus.Payed.code;
    },
    isCanceled() {
      return this.hyper.status === BasketStatus.Canceled.code;
    },
  },

  created() {
    this.currency=this.hyper.currency;
    if(!this.currency)this.currency=this.shop.currencies[0];
  },
  methods: {
    setCurrencyHyper(currency) {
      console.log("setCurrencyHyper");
      this.busy_currency = true;
      axios
        .get(window.XAPI.GET_CUSTOMER_OPEN_HYPER(this.shop_name), {
          params: {
            currency: currency,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.hyper.currency=data.hyper.currency;
            this.$emit("update:hyper", data.hyper);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_currency = false;
        });
    },

    addHyperItem: _.throttle(function (
      { product_id, variant_id, count },
      oldVal
    ) {
      this.addHyperItemNow(product_id, variant_id, count);
    },
    1000),

    addHyperItemNow(product_id, variant_id, count) {
      //console.log("********************* Add Item **********************");
      this.busy_add = true;
      axios
        .post(window.XAPI.POST_ADD_OPEN_HYPER_ITEM(this.shop_name), {
          currency: this.hyper.currency,

          product_id: product_id,
          variant_id: variant_id,
          count: count,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update:hyper", data.hyper);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = false;
        });
    },

    //―――――――――――――――――――――― Final Step > Go to payment bill (Service) ――――――――――――――――――――

    goToPaymentBasket() {
      this.ShowPaymentDialogHyper(this.hyper, () => {
        this.$router.push({name:'HyperOrderPage',params:{basket_id:this.hyper.id}})
      });
      GtagEcommerce.MeasuringCheckoutSteps( this.hyper, 2, null);
    },
  },
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-hyper-add-order-form{

}


/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-hyper-add-order-form{

}
</style>
