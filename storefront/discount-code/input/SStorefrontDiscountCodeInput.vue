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
  <div class="discount-code-row">
    <v-btn
      :loading="busy"
      class="mx-1 animated-all-normal"
      rounded
      depressed
      :fab="show_discount_code_input"
      :color="show_discount_code_input ? SaminColorLight : SaminColorDark"
      dark
      :small="show_discount_code_input"
      @click="
        show_discount_code_input
          ? setDiscountCode()
          : (show_discount_code_input = true)
      "
    >
      <v-icon v-if="!value || show_discount_code_input" class="mx-2">
        {{ show_discount_code_input ? "done" : "fa:fas fa-percentage" }}
      </v-icon>
      <span v-if="!show_discount_code_input">
        <span v-if="value">
          {{
            $t("global.discount_input.limit", {
              percent: value.percent,
              limit: FormatNumberCurrency(value.limit),
              currency: GetUserSelectedCurrencyName(),
            })
          }}

          <v-btn icon @click.stop="clearDiscountCodeFromBasket"
            ><v-icon>close</v-icon></v-btn
          >
        </span>
        <span v-else>{{ $t("global.discount_input.action") }} </span>
      </span>
    </v-btn>

    <v-btn
      v-if="show_discount_code_input"
      class="mx-1 animated-all-normal"
      small
      icon
      @click="show_discount_code_input = false"
    >
      <v-icon>close</v-icon>
    </v-btn>

    <v-slide-x-reverse-transition hide-on-leave>
      <v-text-field
        v-if="show_discount_code_input"
        v-model="discount_code_code"
        rounded
        flat
        filled
        :label="$t('global.discount_input.code_input')"
        style="max-width: 180px"
        class="font-weight-bold mx-1 animated-all-normal"
        hide-details
        @keydown.enter="setDiscountCode"
      />
    </v-slide-x-reverse-transition>
  </div>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "SStorefrontDiscountCodeInput",

  props: ["value", "basket", "loadId", "currency"],

  data: () => ({
    //-------------- Discount Code ---------------
    show_discount_code_input: false,
    discount_code_code: null,

    busy: false,
  }),

  computed: {},

  watch: {
    currency() {
      this.$emit("input", null);
      this.tryAssignByCampaign();
    },
    loadId() {
      this.value = this.loadId;
      this.setDiscountCode();
    },
  },
  mounted() {
    if (this.loadId) {
      this.value = this.loadId;
      this.setDiscountCode();
    }

    if (!this.value) {
      this.tryAssignByCampaign();
    }
  },

  methods: {
    clearDiscountCodeFromBasket() {
      //console.log('clearDiscountCodeFromBasket')
      this.discount_code_code = null;
      this.setDiscountCode(true, true);
    },
    setDiscountCode: _.throttle(function setDiscountCode(
      with_error_notification = true,
      force = false
    ) {
      if (
        !force &&
        this.basket.discount_id === null &&
        this.discount_code_code === null
      ) {
        return;
      }

      this.busy = true;
      this.$emit("input", null);
      this.$emit("loading", true);

      axios
        .put(window.XAPI.PUT_DISCOUNT_CODE(this.shop_name), {
          code: this.discount_code_code,
          currency: this.currency,
          type: this.basket.type, // Basket type
        })
        .then(({ data }) => {
          if (!data.error) {
            this.setBasketBill(this.basket, data.bill);

            if (data.discount_code) {
              this.basket.discount_id === data.discount_code
                ? data.discount_code.id
                : null;
              this.showSuccessAlert(
                null,
                this.$t("global.discount_input.notifications.add_success")
              );
            }

            this.show_discount_code_input = false;

            this.$emit("input", data.discount_code);
          } else {
            if (with_error_notification)
              this.showErrorAlert(null, data.error_msg);
          }
        })

        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
          this.$emit("loading", false);
        });
    },
    3000),

    tryAssignByCampaign() {
      if (this.getShop().campaign && this.getShop().campaign.discount_code) {
        // Only discount code for selected currency accepted:
        if (this.getShop().campaign.discount_code.currency === this.currency)
          this.discount_code_code = this.getShop().campaign.discount_code.code;
      }
      this.setDiscountCode(false);
    },
  },
};
</script>

<style scoped lang="scss">
.discount-code-row {
  display: flex;
  padding: 6px 0;
  align-items: center;

  p {
    margin: 0;
  }
}
</style>
