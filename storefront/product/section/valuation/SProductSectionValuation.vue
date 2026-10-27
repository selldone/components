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
    class="s-product-section-valuation pricing-form text-start"
  >
    <u-loading-progress v-if="busy_save"></u-loading-progress>
    <div
      v-for="(item, index) in structure"
      :key="index"
      class="s-product-section-valuation__field"
      :class="{
        's-product-section-valuation__field--next-required':
          next_required_index === index,
      }"
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
          class="s-product-section-valuation__input"
          variant="outlined"
          rounded="lg"
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
          :dark="$vuetify.theme.current.dark"
          class="s-product-section-valuation__input"
          variant="outlined"
          rounded="lg"
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
          aria-required="true"
          bg-color="transparent"
          class="s-product-section-valuation__input"
          clearable
          variant="outlined"
          rounded="lg"
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
          :dark="$vuetify.theme.current.dark"
          class="s-product-section-valuation__switch"
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
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { FileHelper } from "@selldone/core-js/utils/file/FileHelper.ts";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import { debounce } from "lodash-es";

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

    next_required_index() {
      if (this.readonly || !this.structure || !this.preferences_valuation)
        return -1;

      // Checkout requires available Select choices; text, numbers and switches are optional.
      return this.structure.findIndex((row) => {
        if (row.type !== "select" || !this.hasOptions(row)) return false;
        const value = this.preferences_valuation[row.name];
        return (
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && !value.length)
        );
      });
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

    debounceSavePreferences: debounce(
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

            NotificationService.showSuccessAlert(
              null,
              this.$t("global.basket_item_message.notifications.success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
.s-product-section-valuation {
  position: relative;
  width: 100%;
  max-width: 580px;
  min-width: 0;
  margin-block-start: 20px;
  margin-inline: auto;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));

  &__field {
    position: relative;
    min-width: 0;
    margin-block-end: 16px;

    &:last-of-type {
      margin-block-end: 0;
    }

    &:empty {
      display: none;
    }
  }

  &__input {
    margin: 0;
    font-size: 15px;
  }

  &__input :deep(.v-field__input) {
    min-width: 0;
    font-size: 15px;
    font-weight: 400;
  }

  &__switch {
    margin: 0;
  }

  &__switch :deep(h3) {
    margin-block: 0 8px !important;
    font-size: 14px;
    font-weight: 600;
  }

  &__switch :deep(.border-between-vertical > .row-hover) {
    background-color: transparent !important;
  }

  &__field--next-required
    :deep(.v-field:not(.v-field--error) .v-field__outline) {
    --v-field-border-width: 2px;
    --v-field-border-opacity: 1;
    color: rgb(var(--v-theme-primary));
  }

  @media (max-width: 600px) {
    padding: 16px;
  }
}
</style>
