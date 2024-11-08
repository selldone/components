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
    class="s--storefront-coupons"
    fluid
  >
    <p v-if="!forceShow" class="small font-weight-bold">
      <v-btn
        :color="show_coupons ? '#666' : 'green'"
        :variant="show_coupons ? 'outlined' : 'flat'"
        size="small"
        @click="show_coupons = !show_coupons"
        ><i class="fas fa-ticket-alt me-2"></i>
        {{
          show_coupons
            ? $t("global.commons.hide_coupons")
            : $t("global.commons.show_coupons")
        }}
      </v-btn>
    </p>

    <v-expand-transition hide-on-leave leave-absolute>
      <u-fade-scroll v-if="show_coupons" show-arrow small-arrow>
        <div class="d-flex align-stretch">
          <div v-for="coupon in coupons" :key="coupon.id" class="coupon-slide">
            <s-storefront-coupon-view
              :coupon="coupon"
              :disabled="!canUse(coupon)"
              :selectable="selectable"
              :selected="
                returnObject
                  ? modelValue?.id === coupon.id
                  : modelValue === coupon.id
              "
              class="-coupon"
              width="220px"
              @delete="deleteCoupon"
              @select="
                selectable
                  ? selectCoupon(
                      modelValue?.id === coupon.id || modelValue === coupon.id
                        ? null
                        : coupon,
                    )
                  : undefined
              "
            >
            </s-storefront-coupon-view>
          </div>

          <div key="new" class="coupon-slide">
            <v-btn
              class="slideInLeft"
              height="64px"
              min-height="100%"
              rounded
              variant="flat"
              width="200"
              @click="showAddMode"
            >
              <v-icon start>add_box</v-icon>
              {{ $t("coupons.add_coupon") }}
            </v-btn>
          </div>
        </div>
      </u-fade-scroll>
    </v-expand-transition>

    <v-bottom-sheet
      v-model="dialog"
      content-class="rounded-t-xl"
      max-width="98vw"
      width="640"
    >
      <v-card class="text-start" rounded="t-xl">
        <v-card-title class="text-capitalize">
          <v-icon class="me-1">confirmation_number</v-icon>
          {{ $t("coupons.add_coupon") }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="code_input"
            :label="$t('coupons.coupon_code')"
            class="strong-field max-widget-width mx-auto"
            variant="outlined"
            @keydown.enter="addCoupon(code_input)"
          >
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              class="m-1"
              size="x-large"
              variant="text"
              @click="dialog = false"
            >
              <v-icon start>close</v-icon>

              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :class="{ disabled: !code_input }"
              :loading="busy_add"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="addCoupon(code_input)"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script lang="ts">
import SStorefrontCouponView from "../view/SStorefrontCouponView.vue";
import { StorefrontLocalStorages } from "@selldone/core-js/helper/local-storage/StorefrontLocalStorages";
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import { throttle } from "lodash-es";

export default {
  name: "SStorefrontCouponsList",
  components: { UFadeScroll, SStorefrontCouponView },
  emits: ["update:modelValue", "loading"],
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
    modelValue: {},

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
        StorefrontLocalStorages.GetShopCouponsViewMode(
          this.$localstorage_base_path(),
        ),
        new_val,
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
                    item.variant_id,
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
          StorefrontLocalStorages.GetShopCouponsViewMode(
            this.$localstorage_base_path(),
          ),
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
          total += item.count * this.getBasketItemPrice(this.shop, item);
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
              this.$emit("update:modelValue", current_coupon);
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
        this.$emit("update:modelValue", this.returnObject ? coupon : coupon.id);
      } else {
        this.$emit("update:modelValue", null);
      }

      this.setCouponForBasket(coupon);
    },

    setCouponForBasket: throttle(function setCouponForBasket(coupon) {
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

<style lang="scss" scoped>
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
