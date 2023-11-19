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
  <v-select
    :value="value"
    @input="(val) => $emit('input', val)"
    :items="tax_profiles"
    label="Tax profile"
    item-value="id"
    item-text="name"
    :return-object="returnObject"
    clearable
    placeholder="Default"
    persistent-placeholder
    :messages="
      !value
        ? 'The default tax rules will be applied to all products without a dedicated tax profile.'
        : undefined
    "
    :solo="solo"
    :flat="flat"
    :background-color="backgroundColor"
  >
    <template v-slot:selection="{ item }">
      <v-icon class="me-2" v-if="item.icon" color="#333">{{
        item.icon
      }}</v-icon>
      <b>{{ item.name }}</b>
      <span v-if="item.fix" class="ms-2">
        | <small>Goods:</small> <b>{{ item.fix_vat }}%</b>
        <template v-if="item.fix_shipping">
          | <small>Shipping:</small> <b>{{ item.fix_shipping }}%</b></template
        >
      </span>
      <span v-else class="ms-2">
        | <v-icon small>share_location</v-icon> <small>Dynamic</small></span
      >
      <v-chip
        :color="item.included ? '#FFC107' : '#8BC34A'"
        x-small
        label
        class="mx-2"
        >{{ item.included ? "inclusive" : "exclusive" }}</v-chip
      >
    </template>
    <template v-slot:item="{ item }">
      <v-icon class="me-2" v-if="item.icon" color="#333">{{
        item.icon
      }}</v-icon>
      <b>{{ item.name }}</b>
      <span v-if="item.fix" class="ms-2">
        | <small>Goods:</small> <b>{{ item.fix_vat }}%</b>
        <template v-if="item.fix_shipping">
          | <small>Shipping:</small> <b>{{ item.fix_shipping }}%</b></template
        >
      </span>
      <span v-else class="ms-2">
        | <v-icon small>share_location</v-icon> <small>Dynamic</small></span
      >
      <v-spacer></v-spacer>
      <v-chip
        :color="item.included ? '#FFC107' : '#8BC34A'"
        x-small
        label
        class="mx-2"
        >{{ item.included ? "inclusive" : "exclusive" }}</v-chip
      >
    </template>
  </v-select>
</template>

<script>
export default {
  name: "ShopTaxProfileSelect",
  props: {
    shop: {
      required: true,
      type: Object,
    },

    value: {},
    returnObject: { type: Boolean },
    solo: { type: Boolean },
    flat: { type: Boolean },
    backgroundColor: {},
  },

  computed: {
    tax_profiles() {
      return this.shop.tax_profiles;
    },
  },
};
</script>

<style scoped></style>
