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
  <tr :class="{ disabled: busy_delete }" class="text-start">
    <td>
      <v-icon v-if="color" :color="color" class="me-1" size="small"
        >circle
      </v-icon>
      <b>{{ numeralFormat(extraPricing.min, "0.[00]a") }}</b>
    </td>

    <td>
      <u-price
        :amount="calculatePrice"
        :class="{ 'text-danger': calculatePrice <= 0 }"
        :currency="currency"
      >
      </u-price>
      <span v-if="price_label" class="ms-2">{{ price_label }}</span>
    </td>

    <td>
      <div v-if="discount_percent" class="text-center mb-2">
        <b>{{ discount_percent }}%</b>

        <u-time-progress-bar
          v-if="extraPricing.dis_start || extraPricing.dis_end"
          :class="{ 'text-white': !light }"
          :created-time="
            extraPricing.created_at
              ? extraPricing.created_at
              : product.created_at
          "
          :end-time="extraPricing.dis_end"
          :start-time="extraPricing.dis_start"
          class="my-2 max-w-400 mx-auto"
          small
        />
      </div>
    </td>

    <td class="text-end">
      <template v-if="!readonly">
        <v-btn rounded variant="text" @click="showEdit">
          <v-icon class="me-1" size="small">edit</v-icon>
          {{ $t("global.actions.edit") }}
        </v-btn>
        <v-btn
          :loading="busy_delete"
          class="me-2"
          rounded
          title="Delete pricing"
          variant="text"
          @click="showDelete"
        >
          <v-icon class="me-1" size="small">delete</v-icon>
          {{ $t("global.actions.delete") }}
        </v-btn>
      </template>
      <slot name="action"></slot>
    </td>
  </tr>
  <tr v-if="error_msg">
    <td class="small" colspan="4">
      <v-icon class="me-1 blink-me-linear" size="small">warning_amber </v-icon>
      <span v-html="error_msg"></span>
    </td>
  </tr>
</template>

<script lang="ts">
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "BProductExtraPricingRow",
  mixins: [CurrencyMixin],

  components: {
    UTimeProgressBar,
  },

  props: {
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    vendorProduct: {
      /*🟢 Add extra pricing to product<->vendor in the Product > Vendors tab🟢*/ required: false,
    },

    product: {
      required: true,
      type: Object,
    },

    variant: {
      required: false,
      type: Object,
    },

    extraPricing: {
      required: true,
      type: Object,
    },
    allExtraPricings: {
      // Active extra pricing for current product / variant / vendor
      required: false,
      type: Array,
    },

    transparent: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },
    readonly: Boolean,

    color: {}, // Corresponding extra pricing color!
  },

  data: () => ({
    busy_delete: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    pricing() {
      return this.product.pricing;
    },
    price_label() {
      return this.product.price_label;
    },

    currency() {
      return this.product.currency;
    },
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
    currencyName() {
      return this.getCurrencyName(this.currency);
    },

    calculatePrice() {
      return this.priceProductByCurrency(
        this.shop,
        {
          price: this.extraPricing.price,
          currency: this.currency,
          commission: this.extraPricing.commission,
          discount: this.extraPricing.discount,
        },
        null,
        this.currency,
      );
    },
    discount_percent() {
      return this.discountProductPercent(this.shop, {
        price: this.extraPricing.price,
        currency: this.currency,
        commission: this.extraPricing.commission,
        discount: this.extraPricing.discount,
      });
    },

    error_msg() {
      if (
        this.allExtraPricings?.some(
          (x) =>
            x.min > this.extraPricing.min &&
            x.price + x.commission - x.discount >
              this.extraPricing.price +
                this.extraPricing.commission -
                this.extraPricing.discount,
        )
      )
        return "Double-check! The price appears to be <b>lower</b> than expected.";
      if (
        this.allExtraPricings?.some(
          (x) =>
            x.min < this.extraPricing.min &&
            x.price + x.commission - x.discount <
              this.extraPricing.price +
                this.extraPricing.commission -
                this.extraPricing.discount,
        )
      )
        return "Double-check! The price appears to be <b>higher</b> than expected.";
      return null;
    },
  },

  watch: {},

  created() {},

  methods: {
    showEdit() {
      this.$emit("select", this.extraPricing);
    },

    showDelete() {
      this.openDangerAlert(
        "Delete extra pricing",
        "Are you certain you want to permanently remove this additional pricing?",
        "Yes, Delete now",
        () => {
          this.deleteNow();
        },
      );
    },
    deleteNow() {
      this.busy_delete = true;

      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.$route.params.vendor_id,
                this.product.id,
                this.extraPricing.id,
              )
            : window.API.DELETE_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.shop.id,
                this.product.id,
                this.extraPricing.id,
              ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("onDelete", data.id);
            this.$emit("close");
            this.showSuccessAlert(
              null,
              "The product extra pricing has been deleted.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
