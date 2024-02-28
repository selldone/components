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
  <div class="px-4">
    <div v-if="debug" class="bg-success text-white">
      {{ name }}:{{ type }} | isEnum:{{ isEnum }} | isEnumsArray:{{
        isEnumsArray
      }}
    </div>
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
      density="compact"
      rounded
      variant="filled"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    >
      <template v-slot:item="{ item }">
        {{ fineName(item) }}
      </template>
      <template v-slot:selection="{ item }">
        {{ fineName(item) }}
      </template>
    </v-select>

    <v-select
      v-else-if="isEnumsArray"
      :items="type[0]"
      :label="name"
      :model-value="modelValue"
      chips
      class=""
      density="compact"
      multiple
      rounded
      variant="filled"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    >
      <template v-slot:item="{ item }">
        {{ fineName(item) }}
      </template>
      <template v-slot:chip="{ item }">
        <v-chip>
          {{ fineName(item) }}
        </v-chip>
      </template>
    </v-select>

    <v-text-field
      v-else-if="type === 'text'"
      :label="name"
      :model-value="modelValue"
      class="max-width-field"
      density="compact"
      rounded
      variant="filled"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></v-text-field>
    <v-text-field
      v-else-if="type === 'url'"
      :label="name"
      :model-value="modelValue"
      :rules="[GlobalRules.url()]"
      class="max-width-field"
      density="compact"
      prepend-icon="link"
      rounded
      variant="filled"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></v-text-field>
    <s-number-input
      v-else-if="type === 'number'"
      :label="name"
      :model-value="modelValue"
      class="max-width-field"
      dense
      filled
      rounded
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></s-number-input>
    <s-price-input
      v-else-if="type === 'price'"
      :decimal="2"
      :label="name"
      :model-value="modelValue"
      class="max-width-field"
      dense
      filled
      prepend-icon="attach_money"
      rounded
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></s-price-input>
    <s-currency-input
      v-else-if="type === 'currency'"
      :label="name"
      :returnObject="false"
      :model-value="modelValue"
      class="max-width-field"
      dense
      filled
      prepend-icon="account_balance_wallet"
      rounded
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></s-currency-input>
    <s-date-input
      v-else-if="type === 'date'"
      :label="name"
      :model-value="modelValue"
      class="max-width-field mb-3"
      filled
      format="YYYY-MM-DDTHH:mm:ssZ"
      rounded
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></s-date-input>

    <div v-else-if="type === 'duration'" class="mb-3">
      <v-text-field
        :label="name"
        :model-value="modelValue"
        class="max-width-field"
        density="compact"
        hide-details
        rounded
        variant="filled"
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
      <p class="bg-success text-white px-2 rounded">
        <b>{{ name }} (Array)</b>
      </p>

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

      <v-btn
        class="m-2"
        color="success"
        variant="flat"
        @click="modelValue.push(type[0].startsWith('@') ? {} : '')"
      >
        <v-icon>add</v-icon>
        Add
      </v-btn>
    </div>

    <div v-else-if="type.startsWith('@') && modelValue">
      <p class="bg-primary text-white px-2 rounded mb-4">
        <b>{{ name }}</b>
      </p>
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

<script>
import SPriceInput from "@components/ui/input/price/SPriceInput.vue";
import SCurrencyInput from "@components/ui/currency/input/SCurrencyInput.vue";
import SDateInput from "../ui/calendar/date-input/SDateInput.vue";
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";

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
    SNumberInput,
    SDateInput,
    SCurrencyInput,
    SPriceInput,
  },
  emits : ['update:modelValue', 'delete'],
  props: {
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

      debug: false,

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
          eligibleRegion: "[@Country",
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
    isArray() {
      return Array.isArray(this.type) && !this.isEnum; // Enums are array by default!
    },
    isObject() {
      return !Array.isArray(this.type) && this.type.startsWith("@");
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
    fineName(val) {
      return val
        .replace("http://schema.org/", "")
        .replace("https://schema.org/", "");
    },
  },
};
</script>

<style scoped></style>
