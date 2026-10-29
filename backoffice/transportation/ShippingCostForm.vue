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
  <div
    class="b-shipping-cost-form text-start"
    :class="{ 'b-shipping-cost-form--modern sd-modern-underlined-field': modern }"
  >
    <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ State ▃▃▃▃▃▃▃▃▃▃▃▃ -->
    <template v-if="states?.length">
      <div v-if="modern" class="b-shipping-cost-form__states">
        <v-btn
          class="sd-modern-button sd-modern-button--small"
          :variant="!selected_state ? 'outlined' : 'text'"
          @click="selected_state = null"
          >{{ $t("transportation_manage.settings.country_default") }}</v-btn
        >
        <div
          v-for="(it, key) in modelValue.states"
          :key="key"
          class="b-shipping-cost-form__state"
        >
          <v-btn
            class="sd-modern-button sd-modern-button--small"
            :variant="selected_state === key ? 'outlined' : 'text'"
            @click="selected_state = selected_state === key ? null : key"
          >
            <s-state-flag
              :country="country"
              :region="key"
              class="me-2"
              height="16"
            />
            {{ key
            }}<u-price
              :amount="it.const || 0"
              :currency="currency"
              class="ms-2"
            />
          </v-btn>
          <v-tooltip
            :text="$t('transportation_manage.settings.remove_override')"
            location="top"
            content-class="sd-modern-tooltip text-start"
          >
            <template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                icon="close"
                variant="text"
                :aria-label="
                  $t('transportation_manage.settings.remove_override')
                "
                @click="removeOverrideState(key)"
            /></template>
          </v-tooltip>
        </div>
      </div>
      <v-row v-else dense class="my-1">
        <v-chip
          class="ma-1"
          size="small"
          label
          :color="!selected_state ? '#000' : '#fff'"
          variant="flat"
          @click="selected_state = null"
        >
          {{ $t("global.commons.default") }}
        </v-chip>
        <v-chip
          v-for="(it, _key) in modelValue.states"
          class="ma-1"
          :key="_key"
          size="small"
          label
          :color="selected_state === _key ? '#000' : '#fff'"
          variant="flat"
          @click="selected_state = selected_state === _key ? null : _key"
        >
          <s-state-flag
            :country="country"
            :region="_key"
            class="me-1"
            height="14"
          ></s-state-flag>
          <b>{{ _key }}</b>
          <span class="d-inline-flex align-center">
            <span class="ms-1"
              ><u-price
                :currency="currency"
                :amount="it.const ? it.const : 0"
                style="font-weight: 500"
              ></u-price
            ></span>
            <span v-if="it.distance_cof" class="ms-1"
              >🞤 {{ it.distance_cof }}🞫d</span
            >
            <span v-if="it.weight_cof" class="ms-1"
              >🞤 {{ it.weight_cof }}🞫w</span
            >
            <span v-if="it.price_cof" class="ms-1">🞤 {{ it.price_cof }}🞫p</span>
            <span v-if="it.distance_weight_cof" class="ms-1"
              >🞤 {{ it.distance_weight_cof }}🞫d🞫p</span
            >
          </span>

          <v-icon
            @click.stop="removeOverrideState(_key)"
            end
            class="hover-scale-small"
            >cancel
          </v-icon>
        </v-chip>
      </v-row>

      <v-select
        v-model="selected_state"
        :items="states"
        :return-object="false"
        :bg-color="modern ? undefined : '#fff'"
        rounded="lg"
        clearable
        flat
        :label="$t('global.commons.state')"
        persistent-placeholder
        item-title="name"
        item-value="code"
        :placeholder="
          (modern
            ? $t('transportation_manage.settings.country_default')
            : 'Default ● Apply to all except modified') +
          (!isEmpty(modelValue.states)
            ? `: ${Object.keys(modelValue.states).join(', ')}`
            : '')
        "
        :variant="modern ? 'underlined' : 'solo'"
        :class="{ 'sd-modern-underlined-field': modern }"
        :messages="
          modern
            ? $t('transportation_manage.settings.state_override_hint')
            : '⯅ Select a state to override shipping cost.'
        "
      >
        <template v-if="selected_state" v-slot:prepend-inner>
          <s-state-flag :country="country" :region="selected_state" class="me-2"
            >{{ selected_state }}
          </s-state-flag>
        </template>

        <template v-slot:selection="{ item }">
          {{ item.raw.name }}
          <span
            v-if="
              modern && modelValue.states && modelValue.states[item.raw.code]
            "
            class="sd-modern-status sd-modern-status--plain ms-2"
            ><span class="sd-modern-status__dot"></span
            >{{ $t("global.commons.override") }}</span
          >
          <v-chip
            v-if="
              !modern && modelValue.states && modelValue.states[item.raw.code]
            "
            class="mx-2"
            color="blue"
            label
            size="x-small"
            variant="flat"
            >override
          </v-chip>
        </template>
        <template v-slot:item="{ item, props }">
          <v-list-item class="text-start" v-bind="props">
            <template v-slot:title>
              <s-state-flag
                :country="country"
                :region="item.raw.code"
                class="me-2"
                height="20"
              ></s-state-flag>

              {{ item.raw.name }}
              <span
                v-if="
                  modern &&
                  modelValue.states &&
                  modelValue.states[item.raw.code]
                "
                class="sd-modern-status sd-modern-status--plain ms-2"
                ><span class="sd-modern-status__dot"></span
                >{{ $t("global.commons.override") }}</span
              >
              <v-chip
                v-if="
                  !modern &&
                  modelValue.states &&
                  modelValue.states[item.raw.code]
                "
                class="mx-2"
                color="blue"
                label
                size="x-small"
                variant="flat"
                >override
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </template>

    <v-expand-transition>
      <div
        v-if="current_value"
        key="a"
        :class="{ 'b-shipping-cost-form__fields': modern }"
      >
        <u-smart-select
          v-model="cost_mode"
          :accessible="modern"
          :border="modern"
          :items="COST_MODES"
          :class="modern ? 'b-shipping-cost-form__mode my-0' : 'my-3'"
          :label="modern ? $t('transportation_manage.settings.calculation_method') : undefined"
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
          :class="{ 'b-shipping-cost-form__base': modern }"
          suffix=" "
        >
          <template v-slot:append-inner>
            <small>{{ currency }}</small>
          </template>
        </u-price-input>

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
              { dim: distance_unit },
            )
          "
          :text-center="false"
          class="strong-field"
        >
          <template v-slot:append-inner>
            <div class="d-flex flex-column text-center small">
              <small>{{ currency }}</small>
              <div style="border-top: solid thin #999"></div>

              <small>{{ distance_unit }}</small>
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
                dim: mass_unit,
              },
            )
          "
          :text-center="false"
          class="strong-field"
        >
          <template v-slot:append-inner>
            <div class="d-flex flex-column text-center small">
              <small>{{ currency }}</small>
              <div style="border-top: solid thin #999"></div>
              <small>{{ mass_unit }}</small>
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
                weight: mass_unit,
                distance: distance_unit,
              },
            )
          "
          :text-center="false"
          class="strong-field"
        >
          <template v-slot:append-inner>
            <div class="d-flex flex-column text-center small">
              <small>{{ currency }}</small>
              <div style="border-top: solid thin #999"></div>

              <small>{{ distance_unit }}🞬{{ mass_unit }}</small>
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

        <div
          v-if="selected_state"
          class="text-end b-shipping-cost-form__revert"
        >
          <v-btn
            class="tnt"
            :class="{ 'sd-modern-button sd-modern-button--small': modern }"
            variant="text"
            @click="removeOverrideState(selected_state)"
          >
            <v-icon :color="modern ? undefined : 'red'" start>undo</v-icon>
            {{
              modern
                ? $t("transportation_manage.settings.revert_state")
                : "Set default shipping for"
            }}
            <span class="ms-1">{{ selected_state }}</span></v-btn
          >
        </div>
      </div>
      <div
        v-else
        key="b"
        class="d-flex align-center justify-space-between flex-wrap ga-3"
      >
        <div
          :class="
            modern
              ? 'sd-modern-status sd-modern-status--plain'
              : 'text-green text-subtitle-2'
          "
        >
          <span v-if="modern" class="sd-modern-status__dot"></span
          >{{
            modern
              ? $t("transportation_manage.settings.country_default")
              : "● Default country profile"
          }}
        </div>
        <v-btn
          class="my-1"
          :class="modern ? 'sd-modern-button sd-modern-button--small' : 'nbt'"
          variant="elevated"
          @click="addOverrideState(selected_state)"
        >
          <v-icon start>edit_square</v-icon>
          {{
            modern
              ? $t("transportation_manage.settings.override_state")
              : "Override shipping for"
          }}
          <span class="ms-1">{{ selected_state }}</span></v-btn
        >
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UPriceInput from "../../ui/price/input/UPriceInput.vue";

import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import UNumberInput from "../../ui/number/input/UNumberInput.vue";
import SStateFlag from "../../ui/country/state-flag/SStateFlag.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import { isEmpty } from "lodash-es";
import { ShopOptionsHelper } from "@selldone/core-js/helper";

export default {
  name: "ShippingCostForm",
  components: {
    UPrice,
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
    modern: { type: Boolean, default: false },
  },

  data: () => ({
    current_value: null, // Keep current modify value can be main profile or state profile!

    cost_mode: "FLAT",

    selected_state: null,
  }),

  computed: {
    distance_unit() {
      return ShopOptionsHelper.GetDistanceUnit(this.shop);
    },
    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

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
      if (this.modern)
        return [
          ["FLAT", "flat"],
          ["DISTANCE", "distance"],
          ["WEIGHT", "weight"],
          ["DISTANCE_WEIGHT", "distance_weight"],
          ["WEIGHT_PRICE", "weight_price"],
          ["DISTANCE_WEIGHT_PRICE", "distance_weight_price"],
        ].map(([value, key]) => ({
          value,
          title: this.$t(`transportation_manage.settings.rate_modes.${key}`),
          desc: this.$t("transportation_manage.settings.rate_mode_hint"),
        }));
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
      /*
      if (this.selected_state) {
        return [FLAT, WEIGHT, WEIGHT_PRICE];
      }*/
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
    isEmpty,
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
      const state_name = this.states?.find((v) => v.code === state_code)?.name;
      NotificationService.openDangerAlert(
        this.modern
          ? this.$t("transportation_manage.settings.remove_override")
          : `Remove Override for ${state_name ? state_name : state_code}`,
        this.modern
          ? this.$t("transportation_manage.settings.revert_state_hint", {
              state: state_name || state_code,
            })
          : `Are you sure you want to remove the override rule for ${state_name ? state_name : state_code}? This action cannot be undone.`,
        this.modern ? this.$t("global.actions.delete") : "Yes, Remove Override",
        () => {
          delete this.modelValue.states[state_code];
          this.setCurrentValue();
          this.setMode();
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shipping-cost-form--modern {
  width: 100%;
  max-width: 560px;
  margin-inline: 0;
  font-size: 12px;
  line-height: 1.5;

  .b-shipping-cost-form__states {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-block-end: 14px;
  }

  .b-shipping-cost-form__state {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .b-shipping-cost-form__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 20px;
    row-gap: 8px;
  }

  .b-shipping-cost-form__mode,
  .b-shipping-cost-form__base,
  .b-shipping-cost-form__revert {
    grid-column: 1 / -1;
  }

  .b-shipping-cost-form__mode {
    :deep(h3), :deep(b) {
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
    }
    :deep(.small) {
      font-size: 11px;
      line-height: 16px;
    }
  }

  :deep(.v-field__input) {
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }

  :deep(.v-messages) {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 16px;
  }

  @media (max-width: 600px) {
    .b-shipping-cost-form__fields {
      grid-template-columns: minmax(0, 1fr);
    }
    :deep(.v-field__input) {
      font-size: 16px;
    }
  }
}
</style>
