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
  <div v-if="subscriptionPrices" :class="{ dark: dark }" class="text-start">
    <h3 v-if="label" class="my-2">
      <v-icon :color="dark ? '#fff' : '#111'" class="me-1">storefront</v-icon>
      {{ label }}
    </h3>
    <v-list-subheader v-if="hint">{{ hint }}</v-list-subheader>

    <v-slide-y-transition
      :class="{ disabled: disabled, '-rounded-8px': items_show.length <= 1 }"
      class="border-between-vertical rounded-card"
      group
      hide-on-leave
      tag="div"
    >
      <div
        v-for="plan in items_show"
        :key="plan.id"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          's--shadow-no-padding z1 my-2':
            plan.id === (returnObject ? modelValue?.id : modelValue),
        }"
        class="p-2 pp row-hover usn border mb-1"
        @click="
          $emit(
            'update:modelValue',
            forceShowAll
              ? returnObject
                ? plan
                : plan.id
              : modelValue
                ? null
                : returnObject
                  ? plan
                  : plan.id,
          );
          $emit(
            'change',
            forceShowAll
              ? returnObject
                ? plan
                : plan.id
              : modelValue
                ? null
                : returnObject
                  ? plan
                  : plan.id,
          );
        "
      >
        <div class="d-flex align-center mnh">
          <div class="flex-grow-0 me-2">
            <v-icon
              :size="
                plan.id === (returnObject ? modelValue?.id : modelValue) &&
                'large'
              "
              color="primary"
              >{{
                plan.id === (returnObject ? modelValue?.id : modelValue)
                  ? "lens"
                  : "radio_button_unchecked"
              }}
            </v-icon>
          </div>
          <div class="flex-grow-1">
            <b>
              {{ plan.title }}
            </b>
          </div>

          <div class="min-width-150 px-1">
            <u-price
              :amount="plan.price"
              :currency="plan.currency"
              medium
            ></u-price>

            <div>
              /
              {{ $t(getPeriod(plan.period)?.title) }}
            </div>
          </div>

          <v-icon
            :color="getPeriod(plan.period)?.color"
            class="ms-1"
            size="small"
            >circle
          </v-icon>
        </div>
      </div>
    </v-slide-y-transition>

    <div v-if="!subscriptionPrices.length" class="text-center">
      <v-icon color="#333">mood_bad</v-icon>
      No subscription plan was found for <b>{{ currency }}</b
      >.
    </div>
  </div>
</template>

<script lang="ts">
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "SSubscriptionPriceSelect",
  mixins: [CurrencyMixin],
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},
    subscriptionPrices: { type: Array },

    itemIcon: {},
    label: {},
    hint: {},

    forceShowAll: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },

    returnObject: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    currency() {
      return this.GetUserSelectedCurrency().code;
    },

    subscriptionPricesForSelectedCurrency() {
      return this.subscriptionPrices.filter(
        (s) => s.currency === this.currency,
      );
    },

    items_show() {
      if (this.forceShowAll) return this.subscriptionPricesForSelectedCurrency;
      if (!this.modelValue) return this.subscriptionPricesForSelectedCurrency;
      const out = this.subscriptionPricesForSelectedCurrency.filter(
        (i) =>
          i.id === (this.returnObject ? this.modelValue.id : this.modelValue),
      );
      return out.length ? out : this.subscriptionPricesForSelectedCurrency;
    },
  },

  methods: {
    getPeriod(period) {
      return BillingPeriod[period];
    },
  },
};
</script>

<style lang="scss" scoped>
.mnh {
  min-height: 40px;
}
</style>
