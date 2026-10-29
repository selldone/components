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
  <div v-if="workspace" class="s-structure-input text-start">
    <details v-if="isArray && !isEnumsArray" class="s-structure-input__nested" :open="Array.isArray(modelValue) && modelValue.length > 0">
      <summary>{{ fieldLabel }} <span class="s-structure-input__count">{{ Array.isArray(modelValue) ? modelValue.length : 0 }}</span></summary>
      <div v-for="(value, index) in Array.isArray(modelValue) ? modelValue : []" :key="index" class="s-structure-input__entry">
        <div class="s-structure-input__entry-heading">
          <span>{{ fieldLabel }} {{ index + 1 }}</span>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.article.workspace.structure_remove_item')" @click="removeItem(index)">
            <v-icon>delete_outline</v-icon>
            <v-tooltip activator="parent" content-class="sd-modern-tooltip" location="top">{{ $t('global.article.workspace.structure_remove_item') }}</v-tooltip>
          </v-btn>
        </div>
        <s-structure-data-input :model-value="value" :name="name" :label="$t('global.article.workspace.structure_item', { index: index + 1 })" :type="type[0]" workspace inline-object @update:model-value="updateItem(index, $event)" />
      </div>
      <v-btn class="sd-modern-button sd-modern-button--compact s-structure-input__add" variant="text" prepend-icon="add" @click="addItem()">{{ $t('global.article.workspace.structure_add_item') }}</v-btn>
    </details>
    <component :is="inlineObject ? 'div' : 'details'" v-else-if="isObject" :class="{ 's-structure-input__nested': !inlineObject }" :open="inlineObject ? undefined : objectExpanded" @toggle="objectExpanded = $event.target.open">
      <summary v-if="!inlineObject">{{ fieldLabel }}</summary>
      <div v-if="inlineObject || objectExpanded" class="s-structure-input__object">
        <s-structure-data-input v-for="(childType, key) in editableBlueprint" :key="key" :model-value="modelValue?.[key]" :name="key" :type="childType" workspace @update:model-value="updateProperty(key, $event)" />
      </div>
    </component>
    <div v-else class="s-structure-input__field" @focusin="inputTouched = true" @pointerdown="inputTouched = true" @keydown="inputTouched = true">
      <label :for="inputId">{{ fieldLabel }}</label>
      <v-select v-if="isEnum || isEnumsArray" :id="inputId" :model-value="modelValue" :items="isEnumsArray ? type[0] : type" :multiple="isEnumsArray" :item-title="fineName" :aria-label="fieldLabel" class="sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="onInput" />
      <u-number-input v-else-if="type === 'number'" :id="inputId" :model-value="modelValue" :aria-label="fieldLabel" class="sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="onInput" />
      <u-price-input v-else-if="type === 'price'" :id="inputId" :model-value="modelValue" :decimal="2" :aria-label="fieldLabel" class="sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="onInput" />
      <u-currency-input v-else-if="type === 'currency'" :id="inputId" :model-value="modelValue" :return-object="false" :aria-label="fieldLabel" class="sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="onInput" />
      <u-date-input v-else-if="type === 'date'" :id="inputId" :model-value="modelValue" format="YYYY-MM-DDTHH:mm:ssZ" :aria-label="fieldLabel" class="sd-modern-underlined-field" variant="underlined" hide-details="auto" @update:model-value="onInput" />
      <v-textarea v-else-if="name === 'description' || name === 'text'" :id="inputId" :model-value="modelValue" :aria-label="fieldLabel" class="sd-modern-underlined-field" variant="underlined" rows="3" auto-grow hide-details="auto" @update:model-value="onInput" />
      <v-text-field v-else :id="inputId" :model-value="modelValue" :aria-label="fieldLabel" :type="type === 'url' ? 'url' : 'text'" :rules="type === 'url' ? [GlobalRules.url()] : undefined" :placeholder="type === 'duration' ? 'PT30M' : undefined" class="sd-modern-underlined-field" :class="{ 's-structure-input__technical': type === 'url' || type === 'duration' }" variant="underlined" hide-details="auto" @update:model-value="onInput" />
      <p v-if="type === 'duration'" class="s-structure-input__help">{{ $t('global.article.workspace.structure_duration_hint') }}</p>
    </div>
  </div>
  <div v-else class="px-4">
    <v-btn
      v-if="deletable"
      class="float-end"
      color="red"
      size="small"
      variant="flat"
      @click="$emit('delete', modelValue)"
      >{{ $t("global.actions.clear") }}
    </v-btn>

    <v-select
      v-if="isEnum"
      :items="type"
      :label="name"
      :model-value="modelValue"
      class="max-width-field"
      variant="underlined"
      @update:model-value="(val) => $emit('update:modelValue', val)"
      :item-title="(item) => fineName(item)"
    >
    </v-select>

    <v-select
      v-else-if="isEnumsArray"
      :items="type[0]"
      :label="name"
      :model-value="modelValue"
      chips
      multiple
      variant="underlined"
      @update:model-value="(val) => $emit('update:modelValue', val)"
      :item-title="(item) => fineName(item)"
    >
      <template v-slot:chip="{ item, props }">
        <v-chip v-bind="props">
          {{ fineName(item.raw) }}
        </v-chip>
      </template>
    </v-select>

    <v-text-field
      v-else-if="type === 'text'"
      :label="name"
      :model-value="modelValue"
      class="max-width-field"
      variant="underlined"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></v-text-field>
    <v-text-field
      v-else-if="type === 'url'"
      :label="name"
      :model-value="modelValue"
      :rules="[GlobalRules.url()]"
      class="max-width-field"
      prepend-icon="link"
      variant="underlined"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></v-text-field>
    <u-number-input
      v-else-if="type === 'number'"
      :label="name"
      :model-value="modelValue"
      class="max-width-field"
      filled
      variant="underlined"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></u-number-input>
    <u-price-input
      v-else-if="type === 'price'"
      :decimal="2"
      :label="name"
      :model-value="modelValue"
      class="max-width-field"
      variant="underlined"
      prepend-icon="attach_money"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></u-price-input>
    <u-currency-input
      v-else-if="type === 'currency'"
      :label="name"
      :returnObject="false"
      :model-value="modelValue"
      class="max-width-field"
      prepend-icon="account_balance_wallet"
      variant="underlined"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></u-currency-input>
    <u-date-input
      v-else-if="type === 'date'"
      :label="name"
      :model-value="modelValue"
      class="max-width-field mb-3"
      format="YYYY-MM-DDTHH:mm:ssZ"
      variant="underlined"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></u-date-input>

    <div v-else-if="type === 'duration'" class="mb-3">
      <v-text-field
        :label="name"
        :model-value="modelValue"
        class="max-width-field"
        density="compact"
        hide-details
        variant="underlined"
        @update:model-value="(val) => $emit('update:modelValue', val)"
      ></v-text-field>
      <v-chip
        v-for="it in Duration"
        :key="it"
        class="m-1"
        size="small"
        @click="$emit('update:modelValue', it)"
        >{{ it }}
      </v-chip>
    </div>

    <div v-else-if="Array.isArray(type)" class="border rounded mb-4">
      <div class="pa-1 mb-3">
        <b>{{ name }}</b>
        <v-chip color="green" size="small" label class="ma-1">Array</v-chip>
      </div>

      <s-structure-data-input
        v-for="(it_val, index) in modelValue"
        :key="index"
        :name="/*name +' '+*/ 'Item ' + index"
        :type="type[0]"
        :model-value="modelValue[index]"
        deletable
        @delete="(val) => remove(modelValue, val)"
        @update:model-value="(val) => (modelValue[index] = val)"
      ></s-structure-data-input>

      <div class="text-end">
        <v-btn
          class="ma-2"
          color="#000"
          size="small"
          variant="elevated"
          @click="modelValue.push(type[0]?.startsWith('@') ? {} : '')"
          prepend-icon="add"
        >
          Add Item
        </v-btn>
      </div>
    </div>

    <div v-else-if="type?.startsWith('@') && modelValue">
      <div class="pa-1 mb-3">
        <b>{{ name }}</b>
        <v-chip color="blue" size="small" label class="ma-1">Object</v-chip>
      </div>
      <s-structure-data-input
        v-for="(_type, key) in blueprint"
        :key="key"
        v-model="modelValue[key]"
        :name="/*name +' > '+*/ key"
        :type="_type"
      ></s-structure-data-input>
    </div>
  </div>
</template>

<script lang="ts">
import UPriceInput from "../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../ui/currency/input/UCurrencyInput.vue";
import UDateInput from "../ui/date/input/UDateInput.vue";
import UNumberInput from "../ui/number/input/UNumberInput.vue";

const ActionPlatform = [
  "http://schema.org/DesktopWebPlatform",
  "http://schema.org/IOSPlatform",
  "http://schema.org/AndroidPlatform",
  "http://schema.org/MobileWebPlatform",
];

const Availability = [
  "https://schema.org/InStock",
  "https://schema.org/Discontinued",
  "https://schema.org/InStoreOnly",
  "https://schema.org/LimitedAvailability",
  "https://schema.org/OnlineOnly",
  "https://schema.org/OutOfStock",
  "https://schema.org/PreOrder",
  "https://schema.org/PreSale",
  "https://schema.org/SoldOut",
];

const BookFormat = [
  "https://schema.org/EBook",
  "https://schema.org/Hardcover",
  "https://schema.org/Paperback",
  "https://schema.org/AudioBook",
];
const Duration = ["P1D", "P1H", "P1M", "P7D", "P1Y"];

function CheckEnum(type) {
  return [Availability, ActionPlatform, BookFormat, Duration].includes(type);
}

export default {
  name: "SStructureDataInput",
  components: {
    UNumberInput,
    UDateInput,
    UCurrencyInput,
    UPriceInput,
  },
  emits: ["update:modelValue", "delete"],
  props: {
    workspace: { type: Boolean, default: false },
    inlineObject: { type: Boolean, default: false },
    label: { type: String, default: '' },
    modelValue: {},
    type: {
      require: true,
    },
    name: {
      require: true,
    },
    deletable: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      Duration: Duration,
      inputTouched: false,
      objectExpanded: !!this.modelValue,

      blueprints: {
        "@Person": { "@type": "Person", name: "text" },
        "@Book": {
          "@type": "Book",
          isbn: "text",
          bookEdition: "text",
          bookFormat: BookFormat,
          potentialAction: "@ReadAction",
        },
        "@ReadAction": {
          "@type": "ReadAction",
          target: "@EntryPoint",
          expectsAcceptanceOf: "@Offer",
        },
        "@EntryPoint": {
          "@type": "EntryPoint",
          urlTemplate: "text",
          actionPlatform: [ActionPlatform],
        },
        "@Offer": {
          "@type": "Offer",
          priceCurrency: "currency",
          availability: Availability,
          price: "price",
          eligibleRegion: ["@Country"],
        },
        "@Country": { "@type": "Country", name: "text" },
        "@WebPage": { "@type": "WebPage", lastReviewed: "date" },
        "@MonetaryAmountDistribution": {
          "@type": "MonetaryAmountDistribution",
          name: "text",
          currency: "currency",
          duration: "duration",
          percentile10: "text",
          percentile25: "text",
          median: "text",
          percentile75: "text",
          percentile90: "text",
        },
        "@City": { "@type": "City", name: "text" },
        "@Organization": {
          "@type": "Organization",
          name: "text",
          sameAs: "url",
        },
        "@ImageObject": {
          "@type": "ImageObject",
          url: "url",
          height: "number",
          width: "number",
        },
        "@MonetaryAmount": {
          "@type": "MonetaryAmount",
          currency: "currency",
          value: "price",
        },
        "@HowToSupply": { "@type": "HowToSupply", name: "text" },
        "@HowToTool": { "@type": "HowToTool", name: "text" },
        "@HowToStep": {
          "@type": "HowToStep",
          url: "url",
          name: "text",
          text: "text",
          itemListElement: ["@HowToDirection"],
          image: "@ImageObject",
        },
        "@HowToDirection": { "@type": "HowToDirection", text: "text" },
        "@NutritionInformation": {
          "@type": "NutritionInformation",
          calories: "text",
        },
        "@AggregateRating": {
          "@type": "AggregateRating",
          ratingValue: "text",
          ratingCount: "text",
        },
        "@VideoObject": {
          "@type": "VideoObject",
          name: "text",
          description: "text",
          thumbnailUrl: ["url"],
          contentUrl: "url",
          embedUrl: "url",
          uploadDate: "date",
          duration: "duration",
          interactionStatistic: "@InteractionCounter",
        },
        "@InteractionCounter": {
          "@type": "InteractionCounter",
          interactionType: "@http://schema.org/WatchAction",
          userInteractionCount: "number",
        },
        "@http://schema.org/WatchAction": {
          "@type": "http://schema.org/WatchAction",
        },
      },
    };
  },
  computed: {
    inputId() { return `structure-field-${this.$.uid}`; },
    fieldLabel() { return this.label || this.$t(`global.article.workspace.structure_fields.${this.name}`); },
    editableBlueprint() {
      const entries = Object.entries(this.blueprint || {}).filter(([key]) => key !== '@type');
      if (this.type === '@HowToStep') entries.sort(([a], [b]) => ['name', 'text', 'url', 'itemListElement', 'image'].indexOf(a) - ['name', 'text', 'url', 'itemListElement', 'image'].indexOf(b));
      return Object.fromEntries(entries);
    },
    isArray() {
      return Array.isArray(this.type) && !this.isEnum; // Enums are array by default!
    },
    isObject() {
      return !Array.isArray(this.type) && this.type?.startsWith("@");
    },
    isEnum() {
      return CheckEnum(this.type);
    },
    isEnumsArray() {
      return this.isArray && CheckEnum(this.type[0]);
    },

    blueprint() {
      return this.blueprints[this.type];
    },
  },

  created() {
    // Workspace fields stay absent until the user edits them; opening a form is not a change.
    if (this.workspace) return;
    if (this.isArray) {
      if (!this.modelValue || !Array.isArray(this.modelValue))
        this.$emit(
          "update:modelValue",
          this.isEnumsArray ? [this.type[0][0]] : [],
        );
    } else {
      if (!this.modelValue || Array.isArray(this.modelValue))
        this.$emit(
          "update:modelValue",
          this.isEnum
            ? this.type[0]
            : this.isObject
              ? { "@type": this.blueprint["@type"] }
              : "",
        );
    }

    if (this.isObject && this.modelValue) {
      this.modelValue["@type"] = this.blueprint["@type"];
    }
  },

  methods: {
    onInput(value) {
      // Shared numeric/currency controls emit defaults on mount; only user editing changes this draft.
      if (!this.inputTouched || Object.is(value, this.modelValue) || (value == null && this.modelValue == null)) return;
      this.$emit('update:modelValue', value);
    },
    updateProperty(key, value) {
      this.$emit('update:modelValue', { ...(this.modelValue || {}), '@type': this.blueprint['@type'], [key]: value });
    },
    addItem() {
      const type = this.type[0];
      const value = typeof type === 'string' && type.startsWith('@') ? { '@type': this.blueprints[type]?.['@type'] || type.slice(1) } : '';
      this.$emit('update:modelValue', [...(Array.isArray(this.modelValue) ? this.modelValue : []), value]);
      this.$nextTick(() => {
        const entries = this.$el.querySelectorAll(':scope > details > .s-structure-input__entry');
        entries[entries.length - 1]?.querySelector('.s-structure-input__field input, .s-structure-input__field textarea, .s-structure-input__field select')?.focus();
      });
    },
    updateItem(index, value) {
      const values = [...this.modelValue];
      values[index] = value;
      this.$emit('update:modelValue', values);
    },
    removeItem(index) {
      this.$emit('update:modelValue', this.modelValue.filter((_, i) => i !== index));
    },
    fineName(val) {
      return val
        .replace("http://schema.org/", "")
        .replace("https://schema.org/", "");
    },
  },
};
</script>

<style lang="scss" scoped>
.s-structure-input {
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  &__field { margin-block-end: 22px; min-width: 0; }
  &__field > label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 500; line-height: 20px; }
  &__nested { margin-block: 16px; padding: 18px; border: 1px solid var(--sd-modern-border); border-radius: 12px; min-width: 0; }
  &__nested > summary { font-size: 12px; font-weight: 500; line-height: 20px; cursor: pointer; }
  &__object { margin-top: 18px; min-width: 0; }
  &__object > .s-structure-input:last-child :deep(.s-structure-input__field) { margin-bottom: 0; }
  &__entry { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--sd-modern-border); }
  &__entry-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; font-size: 12px; font-weight: 500; }
  &__entry > .s-structure-input > .s-structure-input__object { margin-top: 0; }
  &__count { margin-inline-start: 6px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; }
  &__add { margin-top: 14px; }
  &__help { margin: 6px 0 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__technical :deep(input) { direction: ltr; text-align: start; }
  .sd-modern-underlined-field {
    --sd-modern-field-height: 36px;
    :deep(.v-field__input) { font-family: inherit; font-size: 13px !important; font-weight: 400; line-height: 20px !important; letter-spacing: 0; }
    // These fields have an external label, so the shared floating-label inset is unnecessary.
    :deep(.v-field.v-field--variant-underlined input.v-field__input),
    :deep(.v-field.v-field--variant-underlined div.v-field__input) { min-height: 36px; height: 36px; padding: 7px 0 8px; box-sizing: border-box; }
    :deep(.v-field.v-field--variant-underlined textarea.v-field__input) { min-height: 88px; padding: 7px 0 8px; box-sizing: border-box; }
    :deep(.v-field.v-field--variant-underlined .v-field__append-inner),
    :deep(.v-field.v-field--variant-underlined .v-field__prepend-inner) { padding-block: 0; align-items: center; }
    :deep(.v-input__details), :deep(.v-messages__message) { font-size: 11px !important; line-height: 18px !important; }
  }
}
@media (max-width: 580px), (pointer: coarse) {
  .s-structure-input .sd-modern-underlined-field :deep(.v-field__input) { font-size: 16px !important; }
}
</style>
