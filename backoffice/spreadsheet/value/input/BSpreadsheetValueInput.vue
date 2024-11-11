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
      row != null &&
      col != null &&
      headers &&
      (!styler[headers[col]] ||
        !styler[headers[col]].onlyProduct ||
        !is_variant) &&
      (!styler[headers[col]] || !styler[headers[col]].onlyVariant || is_variant)
    "
    class="b--spreadsheet-value-input"
  >
    <!-- --------------- Enum --------------- -->
    <v-select
      v-if="stylerItem?.type === 'enum'"
      v-model="local_value"
      :clearable="stylerItem.nullable"
      :items="stylerItem.list"
      :label="label"
      :return-object="false"
      item-value="code"
      variant="outlined"
    >
      <template v-slot:item="{ item, props }">
        <v-list-item v-if="item?.raw" class="text-start" v-bind="props">
          <template v-slot:prepend>
            <img
              :src="
                item.raw.image
                  ? item.raw.image
                  : item.raw.src
                    ? item.raw.src
                    : item.raw.icon
              "
              class="me-3"
              height="16px"
            />
          </template>
          {{ item.raw.code ? item.raw.code : item.raw.name }}
        </v-list-item>
      </template>

      <template v-slot:selection="{ item }">
        <div v-if="item?.raw">
          <img
            :src="
              item.raw.image
                ? item.raw.image
                : item.raw.src
                  ? item.raw.src
                  : item.raw.icon
            "
            class="m-1"
            height="16px"
          />
          {{ item.raw.code ? item.raw.code : item.raw.name }}
        </div>
      </template>
    </v-select>
    <!-- --------------- Currency --------------- -->
    <u-currency-input
      v-else-if="stylerItem?.type === 'currency'"
      v-model="local_value"
      :items="stylerItem.list"
      :label="label"
      :return-object="false"
      variant="outlined"
    >
    </u-currency-input>
    <!-- --------------- Price --------------- -->
    <u-price-input
      v-else-if="stylerItem?.type === 'price'"
      v-model="local_value"
      :clearable="stylerItem.nullable"
      :currency="currency"
      :label="label"
      item-value="code"
      variant="outlined"
    >
    </u-price-input>

    <!-- --------------- Image --------------- -->
    <v-text-field
      v-else-if="stylerItem?.type === 'image'"
      v-model="local_value"
      :label="label"
      variant="outlined"
    >
      <template v-slot:append-inner>
        <v-avatar class="hover-scale force-top" size="32">
          <img v-if="local_value" :src="local_value" />
        </v-avatar>
      </template>
    </v-text-field>

    <!-- --------------- Images --------------- -->

    <v-textarea
      v-else-if="stylerItem?.type === 'images'"
      v-model="local_value"
      :label="label"
      variant="outlined"
    >
    </v-textarea>

    <!-- --------------- Date --------------- -->

    <u-date-input
      v-else-if="stylerItem?.type === 'date'"
      v-model="local_value"
      :label="label"
      variant="outlined"
    >
    </u-date-input>

    <!-- --------------- Color --------------- -->
    <div v-else-if="stylerItem?.type === 'color'"></div>

    <!-- --------------- Boolean --------------- -->

    <div v-else-if="stylerItem?.type === 'boolean'">
      <v-switch
        v-model="local_value"
        :label="label"
        class="mx-3"
        color="success"
        false-value="FALSE"
        hide-details
        inset
        true-value="TRUE"
      >
      </v-switch>
    </div>

    <!-- --------------- Json --------------- -->

    <v-textarea
      v-else-if="stylerItem?.type === 'json'"
      v-model="local_value"
      :label="label"
      variant="outlined"
    >
    </v-textarea>

    <!-- --------------- Html --------------- -->

    <!-- --------------- ID --------------- -->

    <u-number-input
      v-else-if="stylerItem?.type === 'id'"
      v-model="local_value"
      :label="label"
      :min="1"
      variant="outlined"
    >
    </u-number-input>

    <!-- --------------- Text --------------- -->

    <v-text-field
      v-else
      v-model="local_value"
      :label="label"
      variant="outlined"
    >
    </v-text-field>
  </div>
  <div
    v-else
    class="text-muted d-flex align-center justify-center"
    style="min-height: 66px"
  >
    Select a cell
  </div>
</template>

<script lang="ts">
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";

export default {
  name: "BSpreadsheetValueInput",
  emits: ["update:modelValue"],
  components: {
    UNumberInput,

    UCurrencyInput,

    UDateInput,
    UPriceInput,
  },
  props: {
    styler: { require: true, type: Object },
    headers: { require: true, type: Object },
    row: { require: true },
    col: { require: true },
    rowValue: {
      require: false,
      type: Object,
    },

    modelValue: {},

    label: {},
  },

  data: () => ({
    local_value: null,
  }),

  computed: {
    stylerItem() {
      return this.styler[this.headers[this.col]];
    },

    currency_col() {
      return this.headers && this.headers.indexOf("Currency");
    },

    /**
     * Find currency in the row.
     */
    currency() {
      return this.rowValue[this.currency_col];
    },

    is_variant() {
      if (!this.rowValue) return false;
      const index_type = this.headers.indexOf("Type");
      return this.rowValue[index_type] === "VARIANT";
    },
  },
  watch: {
    local_value(val) {
      if (this.rowValue) this.$emit("update:modelValue", val);
    },
  },

  created() {
    this.local_value = this.modelValue;
  },
  methods: {},
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.b--spreadsheet-value-input {
}
</style>
