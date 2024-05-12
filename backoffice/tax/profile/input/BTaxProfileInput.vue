<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    :bg-color="backgroundColor"
    :flat="flat"
    :items="tax_profiles"
    :messages="
      !modelValue
        ? 'The default tax rules will be applied to all products without a dedicated tax profile.'
        : undefined
    "
    :model-value="modelValue"
    :return-object="returnObject"
    :solo="solo"
    :variant="variant"
    clearable
    item-title="name"
    item-value="id"
    label="Tax profile"
    persistent-placeholder
    placeholder="Default"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:selection="{ item }">
      <v-icon v-if="item.raw.icon" class="me-2" color="#333"
        >{{ item.raw.icon }}
      </v-icon>
      <b>{{ item.raw.name }}</b>
      <span v-if="item.raw.fix" class="ms-2">
        | <small>Goods:</small> <b>{{ item.raw.fix_vat }}%</b>
        <template v-if="item.raw.fix_shipping">
          | <small>Shipping:</small>
          <b>{{ item.raw.fix_shipping }}%</b></template
        >
      </span>
      <span v-else class="ms-2">
        | <v-icon class="me-1" size="small">share_location</v-icon>
        <small>Location-Based Tax</small></span
      >
      <v-chip
        :color="item.raw.included ? '#FFC107' : '#8BC34A'"
        class="mx-2"
        label
        size="x-small"
        variant="flat"
        >{{ item.raw.included ? "inclusive" : "exclusive" }}
      </v-chip>
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props">
        <template v-slot:prepend>
          <v-icon v-if="item.raw.icon" class="me-2" color="#333"
            >{{ item.raw.icon }}
          </v-icon>
        </template>
        <template v-slot:title>
          <v-list-item-title class="text-start">
            <b>{{ item.raw.name }}</b>
            <span v-if="item.raw.fix" class="ms-2">
              | <small>Goods:</small> <b>{{ item.raw.fix_vat }}%</b>
              <template v-if="item.raw.fix_shipping">
                | <small>Shipping:</small>
                <b>{{ item.raw.fix_shipping }}%</b></template
              >
            </span>
            <span v-else class="ms-2">
              | <v-icon class="me-1" size="small">share_location</v-icon>
              <small>Location-Based Tax</small></span
            >
          </v-list-item-title>
        </template>
        <template v-slot:append>
          <v-chip
            :color="item.raw.included ? '#FFC107' : '#8BC34A'"
            class="mx-2"
            label
            size="x-small"
            variant="flat"
            >{{ item.raw.included ? "inclusive" : "exclusive" }}
          </v-chip>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script>
export default {
  name: "BTaxProfileInput",
  emits: ["update:modelValue"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    modelValue: {},
    returnObject: { type: Boolean },
    solo: { type: Boolean },
    flat: { type: Boolean },
    backgroundColor: {},
    variant: {
      default: "underlined",
    },
  },

  computed: {
    tax_profiles() {
      return this.shop.tax_profiles;
    },
  },
};
</script>

<style scoped></style>
