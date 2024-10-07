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
  <div
    v-if="
      structure && preferences_valuation && $product.price_input === 'custom'
    "
    :class="{ '-preview': previewMode }"
    class="widget-box w-100 py-3 mt-5 pricing-form strong-field"
  >
    <u-loading-progress v-if="busy_save"></u-loading-progress>
    <div
      v-for="(item, index) in structure"
      :key="index"
      class="position-relative"
    >
      <v-expand-transition group>
        <!-- Normal -->
        <v-text-field
          v-if="!item.type"
          v-model="preferences_valuation[item.name]"
          :label="item.title"
          :persistent-placeholder="!!item.placeholder"
          :placeholder="item.placeholder"
          :readonly="readonly"
          bg-color="transparent"
          class="mx-4"
          variant="underlined"
          @blur="debounceSavePreferences()"
          @update:model-value="
            $emit('update:preferences', preferences);
            $forceUpdate();
          "
        >
        </v-text-field>

        <!-- Number -->
        <u-number-input
          v-else-if="item.type === 'number'"
          v-model="preferences_valuation[item.name]"
          :label="item.title"
          :min="0"
          :readonly="readonly"
          background-color="transparent"
          class="mx-4"
          variant="underlined"
          @blur="debounceSavePreferences()"
          @update:model-value="$emit('update:preferences', preferences)"
        >
        </u-number-input>

        <!-- Select -->
        <v-select
          v-else-if="item.type === 'select' && hasOptions(item)"
          v-model="preferences_valuation[item.name]"
          :chips="item.multiple"
          :disabled="readonly"
          :items="filterSelects(item.selects, preferences_valuation[item.name])"
          :label="item.title"
          :multiple="item.multiple"
          :persistent-placeholder="!!item.placeholder"
          :placeholder="item.placeholder"
          :readonly="readonly"
          :return-object="false"
          bg-color="transparent"
          class="mx-4"
          clearable
          variant="underlined"
          @click:clear="preferences_valuation[item.name] = null"
          @update:model-value="
            $emit('update:preferences', preferences);
            $forceUpdate();
            debounceSavePreferences();
          "
        >
        </v-select>
        <!-- switch -->
        <u-smart-switch
          v-else-if="item.type === 'switch' && hasOptions(item)"
          v-model="preferences_valuation[item.name]"
          :false-description="item.false_desc"
          :false-disabled="!checkAvailable(`${item.name}-FALSE`)"
          :false-title="
            item.false_title ? item.false_title : $t('global.actions.no')
          "
          :label="item.title"
          :readonly="readonly"
          :true-description="item.true_desc"
          :true-disabled="!checkAvailable(`${item.name}-TRUE`)"
          :true-title="
            item.true_title ? item.true_title : $t('global.actions.yes')
          "
          class="mx-4 mb-5"
          false-icon="close"
          true-icon="check"
          @change="debounceSavePreferences"
          @update:model-value="
            $emit('update:preferences', preferences);
            $forceUpdate();
          "
        >
        </u-smart-switch>
      </v-expand-transition>

      <v-icon
        v-if="index_blink === index"
        class="blink-me-linear indic"
        color="#1976D2"
        size="x-small"
        >circle
      </v-icon>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { FileHelper } from "@selldone/core-js/helper/converters/FileHelper";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import _ from "lodash-es";

export default {
  name: "SProductSectionValuation",
  components: { UNumberInput, USmartSwitch },
  inject: ["$shop", "$product"],
  props: {
    currentVariant: {},
    preferences: {
      required: true,
      type: Object,
    },

    readonly: {
      type: Boolean,
      default: false,
    },

    correspondingBasketItem: {},

    previewMode: Boolean,
  },

  data: () => ({
    FileHelper: FileHelper,
    busy_delete: null,
    busy_download: null,

    preferences_valuation: {},

    busy_save: false,
  }),

  computed: {
    valuation() {
      return this.$product.valuation;
    },

    structure() {
      return this.valuation && this.valuation.structure;
    },

    conditions() {
      return this.valuation && this.valuation.conditions;
    },

    unavailable() {
      return this.conditions && this.conditions.unavailable;
    },

    selected_values() {
      if (!this.preferences_valuation) return [];

      return Object.values(this.preferences_valuation);
    },

    basket() {
      return this.getBasket(this.$product.type);
    },

    index_blink() {
      return this.structure.findIndex(
        (row) =>
          row.type !== "switch" &&
          !this.preferences_valuation[row.name] &&
          this.hasOptions(row),
      );
    },
  },

  watch: {
    preferences: {
      handler() {
        this.assignPreferences();
      },
      deep: true,
    },
  },

  created() {
    this.assignPreferences();
  },

  methods: {
    hasOptions(item) {
      if (item.type === "select") {
        return this.filterSelects(
          item.selects,
          this.preferences_valuation[item.name],
        ).length;
      } else if (item.type === "switch") {
        return (
          this.checkAvailable(`${item.name}-FALSE`) ||
          this.checkAvailable(`${item.name}-TRUE`)
        );
      }
      return true;
    },

    assignPreferences() {
      this.preferences_valuation = this.preferences.valuation;
    },

    filterSelects(items, ignore_current_val) {
      if (!items) return [];
      if (!this.unavailable || !this.unavailable.length) return items;
      return items.filter(
        (item) => item === ignore_current_val || this.checkAvailable(item),
      );
    },
    checkAvailable(item) {
      if (!this.unavailable || !this.unavailable.length) return true;

      return !this.unavailable.some((unval) => {
        const arr = unval.split(":"); // Extract two side of keys.
        //  console.log('split',arr,'item',item,'selected_values',this.selected_values,  arr.includes(item),this.selected_values.includes(arr[0]) || this.selected_values.includes(arr[1]))
        // Item + previously selected items not be in constraints:
        return (
          //1. Item included in the split array
          arr.includes(item) &&
          //2. Selected items included in the split array
          (this.selected_values.includes(arr[0]) ||
            this.selected_values.includes(arr[1]))
        );
      });
    },

    debounceSavePreferences: _.debounce(
      function () {
        // console.log("Auto get rates...");
        this.saveBasketItemPreferences();
      },
      1000,
      { maxWait: 3000, trailing: true },
    ),

    saveBasketItemPreferences() {
      if (this.previewMode) return;
      // Check item exist in the basket:
      if (!this.correspondingBasketItem || this.readonly) return;

      this.busy_save = true;

      axios
        .put(
          window.XAPI.PUT_BASKET_ITEM_PREFERENCES(
            this.$shop.name,
            this.$product.id,
          ),
          {
            basket_id: this.basket.id,
            variant_id: this.currentVariant ? this.currentVariant.id : null,
            preferences: this.preferences,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            let basket_item = this.basket.items.find(
              (item) => item.id === data.item.id,
            );
            // basket_item.preferences = data.item.preferences;

            Object.assign(basket_item, data.item);

            this.showSuccessAlert(
              null,
              this.$t("global.basket_item_message.notifications.success"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
          //     this.show = this.fill_percent < 95 || this.forceShow;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.pricing-form {
  .indic {
    position: absolute !important;
    top: 50%;
    right: unset;
    left: -4px;
    transform: translate(0, -50%);
  }

  &.-preview {
    border: dashed 2px #333;
    background: #fefefe !important;
  }
}
</style>
