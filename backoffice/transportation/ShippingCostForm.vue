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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ State ▃▃▃▃▃▃▃▃▃▃▃▃ -->
    <template v-if="states?.length">
      <v-select
        v-model="selected_state"
        :items="states"
        :messages="$t('global.address_info.state')"
        :return-object="false"
        bg-color="#fff"
        class="rounded-16px"
        clearable
        flat
        item-title="name"
        item-value="code"
        placeholder="Default ● Apply to all except modified states"
        variant="solo"
      >
        <template v-if="selected_state" v-slot:prepend-inner>
          <s-state-flag class="me-2" :country="country" :region="selected_state"
            >{{ selected_state }}
          </s-state-flag>
        </template>

        <template v-slot:selection="{ item }">
          {{ item.raw.name }}
          <v-chip
            v-if="modelValue.states && modelValue.states[item.raw.code]"
            class="mx-2"
            color="blue"
            variant="flat"
            label
            size="x-small"
            >override
          </v-chip>
        </template>
        <template v-slot:item="{ item, props }">
          <v-list-item v-bind="props" class="text-start">
            <template v-slot:title>
              <s-state-flag
                :country="country"
                :region="item.raw.code"
                class="me-2"
                height="20"
              ></s-state-flag>

              {{ item.raw.name }}
              <v-chip
                v-if="modelValue.states && modelValue.states[item.raw.code]"
                class="mx-2"
                color="blue"
                variant="flat"
                label
                size="x-small"
                >override
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </template>

    <v-expand-transition>
      <div v-if="current_value" key="a">
        <u-smart-select
          v-model="cost_mode"
          :items="COST_MODES"
          class="my-3"
          item-description="desc"
          item-text="title"
          item-value="value"
          @change="applyCostMode"
        ></u-smart-select>

        <!-- ━━━━━━━━━━━━━━ Fix ━━━━━━━━━━━━━━ -->

        <u-price-input
          v-model="current_value.const"
          :currency="currency"
          :label="$t('admin_shop.logistic.delivery.delivery_form.const_input')"
          class="strong-field"
        />

        <!-- ━━━━━━━━━━━━━━ Distance ━━━━━━━━━━━━━━ -->

        <u-number-input
          v-if="
            ['DISTANCE_WEIGHT_PRICE', 'DISTANCE_WEIGHT', 'DISTANCE'].includes(
              cost_mode,
            ) || current_value.distance_cof
          "
          v-model="current_value.distance_cof"
          :decimal="6"
          :label="
            $t('admin_shop.logistic.delivery.delivery_form.distance_cof_input')
          "
          :messages="
            $t(
              'admin_shop.logistic.delivery.delivery_form.distance_cof_input_dim',
              { dim: getDistanceDimension(shop) },
            )
          "
          :text-center="false"
          class="strong-field"
        >
          <template v-slot:append-inner>
            <div class="d-flex flex-column text-center">
              <small>{{ currency }}</small>
              <hr class="my-1" />
              <small>{{ getDistanceDimension(shop) }}</small>
            </div>
          </template>
        </u-number-input>
        <!-- ━━━━━━━━━━━━━━ Weight ━━━━━━━━━━━━━━ -->

        <u-number-input
          v-if="
            [
              'DISTANCE_WEIGHT_PRICE',
              'DISTANCE_WEIGHT',
              'WEIGHT',
              'WEIGHT_PRICE',
            ].includes(cost_mode) || current_value.weight_cof
          "
          v-model="current_value.weight_cof"
          :decimal="6"
          :label="
            $t('admin_shop.logistic.delivery.delivery_form.weight_cof_input')
          "
          :messages="
            $t(
              'admin_shop.logistic.delivery.delivery_form.weight_cof_input_dim',
              {
                dim: getWeightDimension(shop),
              },
            )
          "
          :text-center="false"
          class="strong-field"
        >
          <template v-slot:append-inner>
            <div class="d-flex flex-column text-center">
              <small>{{ currency }}</small>
              <hr class="my-1" />
              <small>{{ getWeightDimension(shop) }}</small>
            </div>
          </template>
        </u-number-input>

        <!-- ━━━━━━━━━━━━━━ Distance * Weight ━━━━━━━━━━━━━━ -->
        <u-number-input
          v-if="
            ['DISTANCE_WEIGHT_PRICE', 'DISTANCE_WEIGHT'].includes(cost_mode) ||
            current_value.distance_weight_cof
          "
          v-model="current_value.distance_weight_cof"
          :decimal="6"
          :label="
            $t(
              'admin_shop.logistic.delivery.delivery_form.distance_weight_cof_input',
            )
          "
          :messages="
            $t(
              'admin_shop.logistic.delivery.delivery_form.distance_weight_cof_input_dim',
              {
                weight: getWeightDimension(shop),
                distance: getDistanceDimension(shop),
              },
            )
          "
          :text-center="false"
          class="strong-field"
        >
          <template v-slot:append-inner>
            <div class="d-flex flex-column text-center">
              <small>{{ currency }}</small>
              <hr class="my-1" />
              <small
                >{{ getDistanceDimension(shop) }}🞬{{
                  getWeightDimension(shop)
                }}</small
              >
            </div>
          </template>
        </u-number-input>
        <!-- ━━━━━━━━━━━━━━ Price  ━━━━━━━━━━━━━━ -->

        <u-number-input
          v-if="
            ['DISTANCE_WEIGHT_PRICE', 'WEIGHT_PRICE'].includes(cost_mode) ||
            current_value.price_cof
          "
          v-model="current_value.price_cof"
          :decimal="6"
          :label="
            $t('admin_shop.logistic.delivery.delivery_form.price_cof_input')
          "
          :messages="
            current_value.price_cof
              ? $t(
                  'admin_shop.logistic.delivery.delivery_form.price_cof_input_dim',
                  { dim: currency },
                )
              : $t(
                  'admin_shop.logistic.delivery.delivery_form.price_cof_input_message',
                )
          "
          :text-center="false"
          class="strong-field"
        />

        <div v-if="selected_state" class="text-end">
          <v-btn
            class="tnt"
            variant="text"
            @click="removeOverrideState(selected_state)"
          >
            <v-icon start color="red">close</v-icon>
            Set default shipping for
            <b>{{ selected_state }}</b></v-btn
          >
        </div>
      </div>
      <div v-else key="b" class="d-flex align-center justify-space-between">
        <div class="text-green">● Default country profile</div>
        <v-btn
          class="nbt"
          @click="addOverrideState(selected_state)"
          variant="elevated"
        >
          <v-icon start>edit_square</v-icon>
          Override shipping for
          <b>{{ selected_state }}</b></v-btn
        >
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import UPriceInput from "../../ui/price/input/UPriceInput.vue";

import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import UNumberInput from "../../ui/number/input/UNumberInput.vue";
import SStateFlag from "../../ui/country/state-flag/SStateFlag.vue";

export default {
  name: "ShippingCostForm",
  components: {
    SStateFlag,
    UNumberInput,

    USmartSelect,

    UPriceInput,
  },
  emits: ["selectState"],
  props: {
    shop: { type: Object, required: true },
    currency: {},
    modelValue: { type: Object },
    autoSelectMode: { type: Boolean, default: false },
    country: {}, // Selected profile country (null: default)
  },

  data: () => ({
    current_value: null, // Keep current modify value can be main profile or state profile!

    cost_mode: "FLAT",

    selected_state: null,
  }),

  computed: {
    //▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Country / State ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
    countries() {
      return this.$store.getters.getCountries;
    },

    selected_country_detail() {
      return (
        this.country &&
        this.countries &&
        this.countries.find((v) => v.alpha2 === this.country)
      );
    },

    states() {
      // console.log('country',this.country)
      return (
        this.selected_country_detail && this.selected_country_detail.states
      );
    },

    COST_MODES() {
      const FLAT = {
        value: "FLAT",
        title: "Flat shipping cost",
        desc: "Flat shipping is a type of shipping rate that charges a fixed fee for all orders, regardless of the size, weight, or destination of the package. ",
      };

      const DISTANCE = {
        value: "DISTANCE",
        title: "By distance cost",
        desc: "Shipping cost by distance is a type of shipping rate that charges a fee based on the distance between the sender and the recipient.",
      };

      const WEIGHT = {
        value: "WEIGHT",
        title: "By weight cost",
        desc: "Shipping cost by weight is a type of shipping rate that charges a fee based on the weight of parcel.",
      };

      const DISTANCE_WEIGHT = {
        value: "DISTANCE_WEIGHT",
        title: "By distance and weight cost",
        desc: "To calculate shipping costs based on both distance and weight.",
      };

      const DISTANCE_WEIGHT_PRICE = {
        value: "DISTANCE_WEIGHT_PRICE",
        title: "By distance and weight cost + Insurance",
        desc: "To add shipping insurance based on wight and the price of the order.",
      };
      const WEIGHT_PRICE = {
        value: "WEIGHT_PRICE",
        title: "By weight cost + Insurance",
        desc: "To add shipping insurance based on weight, distance and the price of the order.",
      };

      if (this.selected_state) {
        return [FLAT, WEIGHT, WEIGHT_PRICE];
      }
      return [
        FLAT,
        DISTANCE,
        WEIGHT,
        DISTANCE_WEIGHT,
        WEIGHT_PRICE,
        DISTANCE_WEIGHT_PRICE,
      ];
    },
  },

  watch: {
    modelValue() {
      this.setCurrentValue();
      this.setMode();
    },
    country() {
      this.selected_state = null;
    },
    selected_state(state) {
      this.setCurrentValue();
      this.setMode();

      this.$emit("selectState", state);
    },
  },
  created() {
    this.setCurrentValue();
    this.setMode();
  },

  methods: {
    setCurrentValue() {
      if (!this.selected_state || !this.country)
        this.current_value = this.modelValue;
      else {
        this.current_value = this.modelValue.states
          ? this.modelValue.states[this.selected_state]
          : null; // Find state profile!
      }
    },

    setMode() {
      if (!this.autoSelectMode || !this.current_value) return;
      this.cost_mode = this.current_value.price_cof
        ? this.current_value.distance_cof
          ? "DISTANCE_WEIGHT_PRICE"
          : "WEIGHT_PRICE"
        : this.current_value.distance_weight_cof
          ? "DISTANCE_WEIGHT"
          : this.current_value.weight_cof
            ? "WEIGHT"
            : this.current_value.distance_cof
              ? "DISTANCE"
              : "FLAT";
    },

    applyCostMode(mode) {
      if (mode === "FLAT") {
        this.current_value.distance_cof = 0;
        this.current_value.weight_cof = 0;
        this.current_value.distance_weight_cof = 0;
        this.current_value.price_cof = 0;
      }
    },

    addOverrideState(state_code) {
      if (!this.modelValue.states || Array.isArray(this.modelValue.states))
        this.modelValue.states = {};

      this.modelValue.states[state_code] = { weight_cof: 0, price_cof: 0 };
      this.setCurrentValue();
      this.setMode();
    },
    removeOverrideState(state_code) {
      delete this.modelValue.states[state_code];
      this.setCurrentValue();
      this.setMode();
    },
  },
};
</script>

<style lang="scss" scoped></style>
