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
      small
      color="red"
      dark
      @click="$emit('delete', value)"
      depressed
      >{{ $t("global.actions.clear") }}</v-btn
    >

    <v-select
      v-if="isEnum"
      class="max-width-field"
      :label="name"
      filled
      dense
      :value="value"
      @input="(val) => $emit('input', val)"
      :items="type"
      rounded
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
      class=""
      :label="name"
      filled
      dense
      :value="value"
      @input="(val) => $emit('input', val)"
      :items="type[0]"
      multiple
      chips
      rounded
    >
      <template v-slot:item="{ item }">
        {{ fineName(item) }}
      </template>
      <template v-slot:selection="{ item }">
        <v-chip>
          {{ fineName(item) }}
        </v-chip>
      </template>
    </v-select>

    <v-text-field
      v-else-if="type === 'text'"
      class="max-width-field"
      :label="name"
      filled
      dense
      :value="value"
      @input="(val) => $emit('input', val)"
      rounded
    ></v-text-field>
    <v-text-field
      v-else-if="type === 'url'"
      :rules="[GlobalRules.url()]"
      class="max-width-field"
      :label="name"
      filled
      dense
      :value="value"
      @input="(val) => $emit('input', val)"
      prepend-icon="link"
      rounded
    ></v-text-field>
    <s-number-input
      v-else-if="type === 'number'"
      class="max-width-field"
      :label="name"
      filled
      dense
      :value="value"
      @input="(val) => $emit('input', val)"
      rounded
    ></s-number-input>
    <s-price-input
      v-else-if="type === 'price'"
      class="max-width-field"
      :label="name"
      filled
      dense
      :value="value"
      @input="(val) => $emit('input', val)"
      :decimal="2"
      prepend-icon="attach_money"
      rounded
    ></s-price-input>
    <s-currency-input
      v-else-if="type === 'currency'"
      class="max-width-field"
      :label="name"
      filled
      dense
      :value="value"
      @input="(val) => $emit('input', val)"
      :returnObject="false"
      prepend-icon="account_balance_wallet"
      rounded
    ></s-currency-input>
    <s-date-input
      v-else-if="type === 'date'"
      class="max-width-field mb-3"
      :label="name"
      filled
      :value="value"
      @input="(val) => $emit('input', val)"
      format="YYYY-MM-DDTHH:mm:ssZ"
      rounded
    ></s-date-input>

    <div v-else-if="type === 'duration'" class="mb-3">
      <v-text-field
        class="max-width-field"
        hide-details
        :label="name"
        filled
        dense
        :value="value"
        @input="(val) => $emit('input', val)"
        rounded
      ></v-text-field>
      <v-chip
        v-for="it in Duration"
        :key="it"
        @click="$emit('input', it)"
        class="m-1"
        small
        >{{ it }}</v-chip
      >
    </div>

    <div v-else-if="Array.isArray(type)" class="border rounded mb-4">
      <p class="bg-success text-white px-2 rounded">
        <b>{{ name }} (Array)</b>
      </p>

      <s-structure-data-input
        v-for="(it_val, index) in value"
        :key="index"
        :type="type[0]"
        :value="value[index]"
        :name="/*name +' '+*/ 'Item ' + index"
        @input="(val) => (value[index] = val)"
        deletable
        @delete="(val) => remove(value, val)"
      ></s-structure-data-input>

      <v-btn
        @click="value.push(type[0].startsWith('@') ? {} : '')"
        depressed
        color="success"
        class="m-2"
        ><v-icon>add</v-icon> Add</v-btn
      >
    </div>

    <div v-else-if="type.startsWith('@') && value">
      <p class="bg-primary text-white px-2 rounded mb-4">
        <b>{{ name }}</b>
      </p>
      <s-structure-data-input
        v-for="(_type, key) in blueprint"
        :key="key"
        :type="_type"
        v-model="value[key]"
        :name="/*name +' > '+*/ key"
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
  props: {
    value: {},
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
      if (!this.value || !Array.isArray(this.value))
        this.$emit("input", this.isEnumsArray ? [this.type[0][0]] : []);
    } else {
      if (!this.value || Array.isArray(this.value))
        this.$emit(
          "input",
          this.isEnum
            ? this.type[0]
            : this.isObject
            ? { "@type": this.blueprint["@type"] }
            : ""
        );
    }

    if (this.isObject && this.value) {
      this.value["@type"] = this.blueprint["@type"];
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
