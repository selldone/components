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
    v-if="styler[headers[col]]"
    :class="{
      disabled:
        (styler[headers[col]].onlyProduct && isVariant(rowValue)) ||
        (styler[headers[col]].onlyVariant && !isVariant(rowValue)),
    }"
    class="b--spreadsheet-value-cell"
  >
    <!-- --------------- If null then like product! (For variants)--------------- -->

    <div
      v-if="
        styler[headers[col]].ifNullCol &&
        !getValue(rowValue, styler[headers[col]].ifNullCol) &&
        isVariant(rowValue)
      "
      class="small text-muted font-italic op-0-6 text-center"
    >
      {{ styler[headers[col]].ifNullMessage }}
    </div>

    <!-- --------------- Not enabled data! --------------- -->
    <div
      v-else-if="
        (styler[headers[col]].onlyProduct && isVariant(rowValue)) ||
        (styler[headers[col]].onlyVariant && !isVariant(rowValue))
      "
      class="text-muted text-center"
    >
      🞩
    </div>

    <!-- --------------- Enum --------------- -->
    <span v-else-if="styler[headers[col]]?.type === 'enum'">
      <img :src="findImageInList(col, modelValue)" class="m-1" height="16px" />
      <small>{{ modelValue }}</small>
    </span>
    <!-- --------------- Currency --------------- -->
    <span
      v-else-if="styler[headers[col]]?.type === 'currency'"
      class="d-inline-flex align-center"
    >
      <u-currency-icon :currency="modelValue" class="me-2" flag small />
      <b>{{ modelValue }}</b>
    </span>

    <!-- --------------- Price --------------- -->
    <span v-else-if="styler[headers[col]]?.type === 'price'">
      <u-price
        v-if="
          modelValue !== null && modelValue !== undefined && modelValue !== ''
        "
        :amount="modelValue"
        :currency="rowValue[currency_col]"
      ></u-price>
    </span>
    <!-- --------------- Image --------------- -->
    <v-avatar
      v-else-if="styler[headers[col]]?.type === 'image'"
      class="d-block ma-auto hover-scale pp"
      size="24"
    >
      <img v-if="modelValue" :src="modelValue" />
    </v-avatar>

    <!-- --------------- Images --------------- -->
    <div v-else-if="styler[headers[col]]?.type === 'images'">
      <v-avatar
        v-for="(img, i_im) in modelValue.split(',')"
        :key="i_im"
        class="m-1 hover-scale pp"
        size="24"
      >
        <img v-if="img" :src="img" />
      </v-avatar>
    </div>
    <!-- --------------- Date --------------- -->
    <span v-else-if="styler[headers[col]]?.type === 'date'" size="24">
      {{ getFromNowString(modelValue) }}<br />
      <small>{{ getLocalTimeString(modelValue) }}</small>
    </span>
    <!-- --------------- Color --------------- -->
    <template v-else-if="styler[headers[col]]?.type === 'color'">
      <v-btn
        v-if="!modelValue"
        variant="tonal"
        class="tnt"
        size="x-small"
        @click="(v) => $emit('update:modelValue', '#ffffff')"
      >
        Set Color
      </v-btn>
      <u-color-circle
        v-else-if="modelValue?.includes('/')"
        :color="modelValue"
        :size="30"
        class="ma-2"
      ></u-color-circle>
      <u-color-selector
        v-else
        :model-value="modelValue"
        default="#ffffff"
        nullable
        @update:model-value="(v) => $emit('update:modelValue', v)"
      ></u-color-selector>
    </template>

    <!-- --------------- Boolean --------------- -->
    <div
      v-else-if="styler[headers[col]]?.type === 'boolean'"
      class="text-center"
    >
      <u-check
        v-if="
          (!styler[headers[col]].onlyProduct || !isVariant(rowValue)) &&
          (!styler[headers[col]].onlyVariant || isVariant(rowValue))
        "
        :model-value="getBooleanValue(modelValue, styler[headers[col]].default)"
        size="24"
      >
      </u-check>
      {{ modelValue }}
    </div>
    <!-- --------------- Extra --------------- -->
    <div
      v-else-if="styler[headers[col]]?.type === 'extra'"
      :value="modelValue"
      size="24"
    >
      <div v-if="!modelValue && isVariant(rowValue)" class="text-muted">
        Same As Product
      </div>
      <div v-else class="text-start">
        <small class="fas fa-ruler-combined me-1" />
        {{ getJsonValue(modelValue, "width") }}
        <small class="fas fa-times mx-1" />{{
          getJsonValue(modelValue, "length")
        }}
        <small class="fas fa-times mx-1" />{{
          getJsonValue(modelValue, "height")
        }}
        <v-icon size="small">straighten</v-icon>

        <br />
        <small class="fas fa-weight-hanging me-1" />
        {{ getJsonValue(modelValue, "weight") }}
        <v-icon size="small">scale</v-icon>
      </div>
    </div>

    <!-- --------------- Html --------------- -->
    <div v-else-if="styler[headers[col]]?.type === 'html'">
      <v-btn
        v-if="modelValue"
        variant="flat"
        @click="showHtml(modelValue, row, col)"
      >
        <v-icon>preview</v-icon>
        View Html
      </v-btn>
    </div>

    <!-- --------------- FAQs --------------- -->
    <div v-else-if="styler[headers[col]]?.type === 'faqs'">
      <v-btn
        v-if="modelValue"
        variant="flat"
        @click="showFaqs(modelValue, row, col)"
      >
        <v-icon>contact_support</v-icon>
        FAQs
      </v-btn>
    </div>

    <!-- --------------- JsonLD --------------- -->
    <div v-else-if="styler[headers[col]]?.type === 'jsonld'">
      <v-btn
        v-if="modelValue"
        variant="flat"
        @click="showStructureData(modelValue, row, col)"
      >
        <v-icon>view_carousel</v-icon>
        Structure Data
      </v-btn>
    </div>
    <!-- --------------- ID --------------- -->
    <div v-else-if="styler[headers[col]]?.type === 'id'" dir="ltr">
      <v-chip
        v-if="modelValue"
        class="me-1 px-2"
        color="#000"
        label
        size="x-small"
        variant="flat"
        >ID
      </v-chip>
      {{ modelValue }}
    </div>
    <!-- --------------- Text --------------- -->
    <span v-else>
      {{ modelValue }}
    </span>

    <!-- ═════════ Start > Extra chips ═════════ -->

    <v-chip
      v-if="modelValue && styler[headers[col]]?.value_exist"
      :color="styler[headers[col]]?.value_exist.color"
      class="mt-1"
      label
      size="x-small"
      v-bind="props"
      variant="flat"
      :prepend-icon="styler[headers[col]]?.value_exist.icon"
    >
      {{ styler[headers[col]]?.value_exist.title }}

      <v-tooltip
        content-class="bg-black text-start"
        location="bottom"
        max-width="360"
        activator="parent"
      >
        {{ styler[headers[col]]?.value_exist.message }}
      </v-tooltip>
    </v-chip>

    <v-chip
      v-else-if="styler[headers[col]]?.value_empty"
      :color="styler[headers[col]]?.value_empty.color"
      class="mt-1"
      label
      size="x-small"
      v-bind="props"
      variant="flat"
      :prepend-icon="styler[headers[col]]?.value_empty.icon"
    >
      {{ styler[headers[col]]?.value_empty.title }}
      <v-tooltip
        content-class="bg-black text-start"
        location="bottom"
        max-width="360"
        activator="parent"
      >
        {{ styler[headers[col]]?.value_empty.message }}
      </v-tooltip>
    </v-chip>

    <!-- ═════════ End > Extra chips ═════════ -->
  </div>

  <span v-else-if="modelValue"> {{ ("" + modelValue).substring(0, 30) }}</span>
</template>

<script lang="ts">
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import UColorSelector from "../../../../ui/color/selector/UColorSelector.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BSpreadsheetValueCell",
  mixins: [DateMixin],
  components: {
    UColorCircle,
    UColorSelector,
    UCurrencyIcon,
  },
  emits: ["showHtml", "showFaqs", "showStructureData"],
  props: {
    styler: { require: true, type: Object },
    headers: { require: true, type: Object },
    row: { require: true },
    col: { require: true },
    modelValue: {},
    rowValue: {
      require: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    currency_col() {
      return this.headers && this.headers.indexOf("Currency");
    },
  },
  watch: {},

  created() {},
  methods: {
    getJsonValue(val, key) {
      try {
        const json = JSON.parse(val);
        return json[key];
      } catch (e) {
        return "?";
      }
    },

    getBooleanValue(val, default_val) {
      val = ("" + val).toLowerCase();
      if (default_val) {
        return !["0", "false", "no", ""].includes(val); // CSV remove 0 and false value in the output!
      }
      return ["1", "true", "yes"].includes(val);
    },

    getValue(item, col_name) {
      if (!item || !col_name) return null;
      const index_type = this.headers.indexOf(col_name);
      if (index_type < 0) return null;
      return item[index_type];
    },

    showStructureData(structure_data, row, col) {
      this.$emit("showStructureData", { structure_data, row, col });
    },
    showHtml(html, row, col) {
      this.$emit("showHtml", { html, row, col });
    },

    showFaqs(faqs, row, col) {
      this.$emit("showFaqs", { faqs, row, col });
    },

    findImageInList(col, val) {
      const found = this.styler[this.headers[col]]?.list?.find(
        (it) => it.code === val,
      );
      if (!found) return null;
      return found.image ? found.image : found.src ? found.src : found.icon;
    },

    isVariant(item) {
      const index_type = this.headers.indexOf("Type");
      return item[index_type] === "VARIANT";
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.b--spreadsheet-value-cell {
}
</style>
