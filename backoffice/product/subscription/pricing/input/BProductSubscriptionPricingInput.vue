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
  <v-autocomplete
    v-model:menu="menu"
    v-model:search="search"
    :bg-color="backgroundColor"
    :clearable="clearable"
    :customFilter="() => true"
    :density="dense ? 'compact' : undefined"
    :flat="flat"
    :hideDetails="hideDetails"
    :items="subscription_prices"
    :label="label ? label : $t('global.commons.subscription_plan')"
    :loading="busy"
    :messages="
      modelValue && modelValue.description ? modelValue.description : ''
    "
    :model-value="modelValue"
    :placeholder="placeholder"
    :singleLine="singleLine"
    :variant="variant"
    item-title="title"
    @focus="onFocus"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @click:clear="$emit('click:clear')"
  >
    <template v-slot:selection="{ item }">
      <v-list-item
        :class="{ 'img-grayscale': !item.raw.enable }"
        class="text-start"
      >
        <template v-slot:prepend>
          <v-avatar size="24">
            <img
              v-if="item.raw.product?.icon"
              :src="getShopImagePath(item.raw.product.icon, 64)"
            />
            <v-icon v-else color="#ddd">inventory</v-icon>
          </v-avatar>
        </template>

        <v-list-item-title class="single-line">
          <u-price
            :amount="item.raw.price"
            :currency="item.raw.currency"
          ></u-price>
          / {{ getPeriodTitle(item.raw.period) }}

          <span :style="{ color: getPeriodColor(item.raw.period) }" class="mx-1"
            >●</span
          >
          <b>{{ item.raw.title }}</b>
        </v-list-item-title>

        <v-list-item-subtitle v-if="item.raw.product" class="single-line mb-1">
          {{ item.raw.product.title }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item class="text-start" v-bind="props">
        <template v-slot:prepend>
          <v-avatar size="24">
            <img
              v-if="item.raw.product?.icon"
              :src="getShopImagePath(item.raw.product.icon, 64)"
            />
            <v-icon v-else color="#ddd">inventory</v-icon>
          </v-avatar>
        </template>

        <template v-slot:title>
          <v-list-item-title class="single-line">
            <u-price
              :amount="item.raw.price"
              :currency="item.raw.currency"
            ></u-price>
            / {{ getPeriodTitle(item.raw.period) }}

            <span
              :style="{ color: getPeriodColor(item.raw.period) }"
              class="mx-1"
              >●</span
            >
            <b>{{ item.raw.title }}</b>
          </v-list-item-title>
        </template>

        <div v-if="item.raw.product" class="single-line mb-1">
          {{ item.raw.product.title }}

          <v-chip
            v-if="!item.raw.enable"
            class="ms-2"
            color="red"
            label
            size="x-small"
            variant="flat"
            >{{ $t("global.commons.disable") }}
          </v-chip>
        </div>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import threads from "@selldone/core-js/utils/thread/threads";

export default {
  name: "BProductSubscriptionPricingInput",
  components: {},
  emits: ["update:modelValue", "click:clear"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    product: {
      // Only for this product
      require: false,
      type: Object,
    },

    modelValue: {},
    label: {},
    placeholder: {},
    dense: { type: Boolean },
    flat: { type: Boolean },
    hideDetails: { type: Boolean },
    singleLine: { type: Boolean },
    clearable: { type: Boolean },
    backgroundColor: {},
    variant: {
      default: "underlined",
    },
  },

  data() {
    return {
      subscription_prices: [],
      total: false,

      busy: false,
      search: "",
      menu: false,

      focused: false, // Prevent load in the first initialize!
    };
  },

  watch: {
    search: threads.debounceSearch(function (val) {
      if (
        !this.menu || // Search only if menu is open!
        (val &&
          val ===
            this.modelValue
              ?.title) /*Prevent search when user first focus on input!*/
      )
        return;

      this.fetchPrices();
    }),
  },

  created() {
    if (this.modelValue) {
      this.fetchPrices();
    }
  },

  methods: {
    onFocus() {
      if (!this.focused) {
        // Initial fetch!
        this.fetchPrices();
      }
      this.focused = true;
    },
    fetchPrices() {
      this.busy = true;

      const handleSuccessResponse = ({ subscription_prices, total }) => {
        this.subscription_prices = subscription_prices;
        this.total = total;

        const val = this.subscription_prices.find((price) => {
          return (
            price.id ===
            (this.modelValue && this.isObject(this.modelValue)
              ? this.modelValue.id
              : this.modelValue)
          );
        });

        this.$emit("update:modelValue", val);
        if (this.modelValue && !val) {
          // Value not found auto call click clear!
          this.$emit("click:clear");
        }
      };

      window.$backoffice.product.subscriptionPricing
        .optimize(60)
        .cancellation(true)

        .list(this.shop.id, 0, 20, {
          // Must contain this id:
          contain:
            this.modelValue && this.isObject(this.modelValue)
              ? this.modelValue.id
              : this.modelValue,
          search: this.search,

          compact: true,

          product_id: this.product?.id,

          with_product: true,
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    getPeriodTitle(period) {
      return this.$t(BillingPeriod[period]?.title);
    },
    getPeriodColor(period) {
      return BillingPeriod[period]?.color;
    },
  },
};
</script>

<style lang="scss" scoped></style>
