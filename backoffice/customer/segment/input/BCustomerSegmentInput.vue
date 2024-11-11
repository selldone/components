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
  <component
    :is="addAble ? 'v-combobox' : 'v-autocomplete'"
    :append-icon="appendIcon"
    :bg-color="backgroundColor"
    :clearable="clearable"
    :density="dense ? 'compact' : undefined"
    :flat="flat"
    :hide-details="hideDetails"
    :items="shop_segments"
    :label="label"
    :loading="busy_segments"
    :modelValue="modelValue"
    :placeholder="placeholder"
    :prepend-inner-icon="prependInnerIcon"
    :single-line="singleLine"
    :variant="variant ? variant : solo ? 'solo' : 'underlined'"
    chips
    closable-chips
    multiple
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:chip="{ props, item }">
      <v-chip
        :color="item.raw.toColor(true)"
        :size="small ? 'small' : undefined"
        class="ma-1"
        v-bind="props"
        variant="flat"
      >
        {{ item.raw }}
      </v-chip>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item :title="item.raw" class="text-start" v-bind="props">
        <template v-slot:prepend>
          <v-icon :color="item.raw.toColor(true)" class="me-1" size="small"
            >circle
          </v-icon>
        </template>
      </v-list-item>
    </template>
  </component>
</template>

<script lang="ts">
export default {
  name: "BCustomerSegmentInput",
  emits: ["update:modelValue"],
  props: {
    shop: { required: true },
    modelValue: {},
    variant: {},
    clearable: { default: false, type: Boolean },
    solo: { default: false, type: Boolean },
    hideDetails: { default: false, type: Boolean },
    flat: { default: false, type: Boolean },
    singleLine: { default: false, type: Boolean },
    placeholder: { default: "vip, local customer, ..." },
    label: {},

    addAble: { default: true, type: Boolean },
    dense: { default: false, type: Boolean },
    small: { default: false, type: Boolean },

    backgroundColor: {},

    prependInnerIcon: { default: "join_right" },
    appendIcon: {},
  },

  data: () => ({
    busy_segments: false,
    shop_segments: [],
  }),

  created() {
    // Keep last segments in shop object! Prevent multiple server calls!
    if (this.shop.CUSTOMER_SEGMENTS) {
      this.shop_segments = this.shop.CUSTOMER_SEGMENTS;
      return;
    }
    this.fetchSegments();
  },

  methods: {
    fetchSegments() {
      this.busy_segments = true;
      axios
        .get(window.API.GET_SHOP_CUSTOMERS_SEGMENTS(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.shop_segments = data.segments;
            this.shop.CUSTOMER_SEGMENTS = data.segments;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_segments = false;
        });
    },
  },
};
</script>

<style scoped></style>
