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
      <v-icon class="me-1" :color="dark ? '#fff' : '#111'">storefront</v-icon>
      {{ label }}
    </h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <v-slide-y-transition
      tag="div"
      group
      class="border-between-vertical rounded-card"
      :class="{ disabled: disabled, '-rounded-8px': items_show.length <= 1 }"
      hide-on-leave
    >
      <div
        v-for="plan in items_show"
        :key="plan.id"
        class="p-2 pp row-hover usn border mb-1"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          's--shadow-no-padding z1 my-2':
            plan.id === (returnObject ? value?.id : value),
        }"
        @click="
          $emit(
            'input',
            forceShowAll
              ? returnObject
                ? plan
                : plan.id
              : value
              ? null
              : returnObject
              ? plan
              : plan.id
          );
          $emit(
            'change',
            forceShowAll
              ? returnObject
                ? plan
                : plan.id
              : value
              ? null
              : returnObject
              ? plan
              : plan.id
          );
        "
      >
        <div class="d-flex align-center mnh">
          <div class="flex-grow-0 me-2">
            <v-icon
              color="primary"
              :large="plan.id === (returnObject ? value?.id : value)"
              >{{
                plan.id === (returnObject ? value?.id : value)
                  ? "lens"
                  : "radio_button_unchecked"
              }}</v-icon
            >
          </div>
          <div class="flex-grow-1">
            <b>
              {{ plan.title }}
            </b>
          </div>

          <div class="min-width-150 px-1">
            <price-view
              :currency="plan.currency"
              :amount="plan.price"
              medium
            ></price-view>

            <div>
              /
              {{ $t(getPeriod(plan.period)?.title) }}
            </div>
          </div>

          <v-icon :color="getPeriod(plan.period)?.color" small class="ms-1"
            >circle</v-icon
          >
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

<script>
import BillingPeriod from "@core/enums/subscription/BillingPeriod";

export default {
  name: "SSubscriptionPriceSelect",
  props: {
    value: {},
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
        (s) => s.currency === this.currency
      );
    },

    items_show() {
      if (this.forceShowAll) return this.subscriptionPricesForSelectedCurrency;
      if (!this.value) return this.subscriptionPricesForSelectedCurrency;
      const out = this.subscriptionPricesForSelectedCurrency.filter(
        (i) => i.id === (this.returnObject ? this.value.id : this.value)
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

<style scoped lang="scss">
.mnh {
  min-height: 40px;
}
</style>
