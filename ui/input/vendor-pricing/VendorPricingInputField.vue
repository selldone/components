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
  <v-combobox
    :value="value"
    @input="
      (val) => {
        $emit('input', val);
      }
    "
    :items="pricings"
    :loading="busy"
    label="Pricing model"
    placeholder="Select a pricing model ... (opt)"
    persistent-placeholder
    item-value="id"
    item-text="name"
    :return-object="false"
    clearable
    @change="$emit('change')"
    @click:clear="
      $emit('click:clear');
      getPricings();
    "
    :search-input.sync="search"
    :filter="() => true"
    :messages="selected_pricing && selected_pricing.description"
    :disabled="disabled || IS_VENDOR_PANEL"

  >
    <template v-slot:selection="{}">
      <template v-if="selected_pricing">
        <b>{{ selected_pricing.title }}</b>

        <b class="mx-2">{{ selected_pricing.commission }}%</b>
      </template>
      <small v-else-if="value">Loading...</small>
    </template>

    <template v-slot:item="{ item }">
      <v-row no-gutters align="center">
        {{ item.title }}
        <v-spacer></v-spacer>
        <b class="mx-2">{{ item.commission }}%</b>
      </v-row>
    </template>
  </v-combobox>
</template>

<script>
import _ from "lodash-es";

export default {
  name: "VendorPricingInputField",
  components: {},
  props: {
    shop: {
      require: true,
      type: Object,
    },

    value: {},
    defaultPricing: {}, // Default value object


    disabled : {
      default: false,
      type: Boolean,
    },

  },

  data() {
    return {
      // Pricings:
      pricings: [],
      total: false,

      busy: false,
      search: null,
    };
  },

  computed: {

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
          this.$route.params.vendor_id &&
          this.$route.matched.some((record) => record.meta.vendor)
      );
    },


    selected_pricing() {
      let out = this.pricings.find((vendor) => vendor.id === this.value);
      if (!out && this.value) return this.defaultPricing; // Return default value object
      return out;
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
      this.getPricings();
    }, window.SERACH_THROTTLE),

    selected_pricing(val) {
      this.$emit("update:defaultPricing", val);
    },
  },

  created() {
    if(!this.IS_VENDOR_PANEL) {
      // Just marketplace has access to list of vendors!
      this.getPricings();
    }
  },

  methods: {
    getPricings() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_VENDOR_PRICINGS(this.shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.value && this.isObject(this.value)
                ? this.value.id
                : this.value,
            search: this.search,

            offset: 0,
            count: 20,
          },
        })
        .then(({ data }) => {
          this.pricings = data.pricings;
          this.total = data.total;
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
