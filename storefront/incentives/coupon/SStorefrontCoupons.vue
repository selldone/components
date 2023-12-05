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
  <v-container
    v-if="(coupons && coupons.length) || forceShow"
    fluid
    class="s--storefront-coupons"
  >
    <p v-if="!forceShow" class="small font-weight-bold">
      <v-btn
        small
        @click="show_coupons = !show_coupons"
        depressed
        :outlined="show_coupons"
        :color="show_coupons ? '#666' : 'green'"
        dark
        ><i class="fas fa-ticket-alt me-2"></i>
        {{
          show_coupons
            ? $t("global.commons.hide_coupons")
            : $t("global.commons.show_coupons")
        }}
      </v-btn>
    </p>

    <v-expand-transition leave-absolute hide-on-leave>
      <s-fade-scroll v-if="show_coupons" show-arrow small-arrow>
        <div class="d-flex align-stretch">
          <div v-for="coupon in coupons" :key="coupon.id" class="coupon-slide">
            <s-coupon
              :coupon="coupon"
              class="-coupon"
              width="220px"
              @click="
                selectable
                  ? selectCoupon(
                      value?.id === coupon.id || value === coupon.id
                        ? null
                        : coupon
                    )
                  : undefined
              "
              :selectable="selectable"
              :disabled="!canUse(coupon)"
              @delete="deleteCoupon"
              :selected="
                returnObject ? value?.id === coupon.id : value === coupon.id
              "
            >
            </s-coupon>
          </div>

          <div key="new" class="coupon-slide">
            <v-btn
              class="slideInLeft"
              width="200"
              height="64px"
              @click="showAddMode"
              depressed
              rounded
              min-height="100%"
            >
              <v-icon small class="me-1">add_box</v-icon>
              {{ $t("coupons.add_coupon") }}
            </v-btn>
          </div>
        </div>
      </s-fade-scroll>
    </v-expand-transition>

    <v-dialog v-model="dialog" max-width="480" content-class="no-shadow-dialog">
      <v-card class="rounded-28px">
        <v-card-title
          ><v-icon class="me-1">confirmation_number</v-icon>
          {{ $t("coupons.add_coupon") }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="code_input"
            :label="$t('coupons.coupon_code')"
            @keydown.enter="addCoupon(code_input)"
            class="strong-field"
          >
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn class="m-1" x-large text @click="dialog = false">
              <v-icon class="me-1">close</v-icon>

              {{ $t("global.actions.close") }}</v-btn
            >

            <v-btn
              x-large
              outlined
              @click="addCoupon(code_input)"
              :loading="busy_add"
              :class="{ disabled: !code_input }"
              ><v-icon class="me-1">add</v-icon>
              {{ $t("global.actions.add") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import SCoupon from "./SCoupon.vue";
import { LocalStorages } from "@core/helper/local-storage/LocalStorages";
import SFadeScroll from "@components/ui/fade-scroll/SFadeScroll.vue";
import _ from "lodash-es";

export default {
  name: "SStorefrontCoupons",
  components: { SFadeScroll, SCoupon },
  props: {
    productId: {},
    VariantId: {},
    forceShow: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    value: {},

    // set coupons list! (not auto mode!)
    customCoupons: {},
    // -------- BASKET --------
    basket: {
      type: Object,
    },

    returnObject: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    show_coupons: true,


    // -------- Add coupon --------
    code_input: null,
    busy_add: false,
    dialog: false,
  }),

  watch: {
    show_coupons(new_val) {
      localStorage.setItem(
        LocalStorages.GetShopCouponsViewMode(this.$localstorage_base_path()),
        new_val
      );
    },


  },

  computed: {
    coupons() {
      if (this.customCoupons) return this.customCoupons;

      const coupons = this.$store.getters.getCoupons;

      if (!coupons) return null;

      // For one product:
      if (this.productId) {
        return coupons.filter((coupon) => {
          const product_id = "" + this.productId; // save as string!
          return (
            coupon.products &&
            coupon.products[product_id] &&
            (this.VariantId === null ||
              coupon.products[product_id].includes(this.VariantId))
          );
        });
      }

      // For products in basket:
      if (this.basket) {
        return coupons.filter((coupon) => {
          //console.log('========== coupon ===========',coupon)

          // Check no products constraints:
          if (!coupon.products || !Object.keys(coupon.products).length)
            return true;
          return this.basket.items.some((item) => {
            const product_id = "" + item.product_id; // save as string!
            const category_id = "" + item.product.category_id; // save as string!

            return (
              (coupon.products[product_id] &&
                (!item.variant_id ||
                  coupon.products[product_id].includes(
                    item.variant_id
                  ))) /* check product:*/ ||
              coupon.products["c-" + category_id] /* check category:*/
            );
          });
        });
      }

      return coupons;
    },
  },

  created() {

    if (!this.forceShow)
      this.show_coupons =
        localStorage.getItem(
          LocalStorages.GetShopCouponsViewMode(this.$localstorage_base_path())
        ) !== "false";


  },
  methods: {
    showAddMode() {
      this.code_input = null;
      this.dialog = true;
    },

    canUse(coupon) {
      if (this.basket) {
        let total = 0;
        this.basket.items.forEach((item) => {
          total += item.count * this.getBasketItemPrice(this.shop,item);
        });
        // Other constraints check in back-end (except products limitation that handle in above filter)
        return total >= coupon.min_purchase;
      }

      return true;
    },

    addCoupon(code) {
      const currency_obj = this.GetUserSelectedCurrency();
      if (!currency_obj) return;
      this.busy_add = true;
      axios
        .get(window.XAPI.GET_COUPONS_BY_CODE(this.shop_name, code), {
          params: {
            currency: currency_obj.code,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            // Add new coupon to list:
            let coupons = this.$store.getters.getCoupons;
            if (!coupons) coupons = [];
            data.coupons.forEach((coupon) => {
              this.AddOrUpdateItemByID(coupons, coupon);
            });
            this.$store.commit("setCoupons", coupons);

            // Save codes: (in local storage)
            window.$storefront.database.coupon.addCouponCode(code);

            // Auto select new added coupon:
            const current_coupon = coupons.find((i) => i.code === code);
            if (current_coupon) {
              this.$emit("input", current_coupon);
              this.setCouponForBasket(current_coupon);
            }

            this.dialog = false;
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

    deleteCoupon(code) {
      let coupons = this.$store.getters.getCoupons;
      if (coupons) {
        this.DeleteItemByID(coupons, code, "code");
      }

      window.$storefront.database.coupon.removeCouponCode(code);
    },

    selectCoupon(coupon) {
      if (coupon) {
        this.$emit("input", this.returnObject ? coupon : coupon.id);
      } else {
        this.$emit("input", null);
      }

      this.setCouponForBasket(coupon);
    },

    setCouponForBasket: _.throttle(function setCouponForBasket(coupon) {
      this.busy_set = true;
      // console.log("setCouponForBasket", coupon);
      this.$emit("loading", true);
      axios
        .put(window.XAPI.PUT_SET_BASKET_COUPON(this.shop_name), {
          type: this.basket.type,
          id: coupon ? coupon.id : null,
          code: coupon ? coupon.code : null,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.setBasketBill(this.basket, data.bill);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
          this.$emit("loading", false);
        });
    }, 3000),
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
.s--storefront-coupons {
  text-align: start;
  .coupon-slide {
    width: 220px;
    min-width: max-content;
    padding: 12px;
    .-coupon {
      min-height: 100%;
    }
  }
}
</style>
