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
  <div>
    <p v-if="title" class="m-0">
      {{ title }}
    </p>

    <div
      :class="{ 'disabled-no-filter': readonly }"
      class="ma-auto p-3 text-center"
      style="overflow-x: auto"
    >
      <v-btn-toggle
        v-model="transportation"
        :class="{ vertical: vertical }"
        :mandatory="mandatory"
        :multiple="multiple"
        :rounded="!vertical"
        class="widget-toggle overflow-auto align-items-stretch"
        selected-class="black-flat"
        @blur="(val) => $emit('blur', val)"
        @update:model-value="(val) => $emit('change', val)"
      >
        <v-btn
          v-for="item in transportTypes"
          :key="item"
          :value="item"
          min-height="38"
        >
          <img :src="getShopTransportationObject(item).icon" width="24px" />
          <span class="px-1">{{
            $t(getShopTransportationObject(item).name)
          }}</span>
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script>
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";

export default {
  name: "TransportationSelect",
  emits: ["change", "blur", "update:modelValue"],
  props: {
    transportTypes: {
      type: Array,
    },
    modelValue: {},
    title: {},
    readonly: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },

    mandatory: {
      type: Boolean,
      default: false,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    transportation: null,
  }),
  created() {
    this.transportation = this.modelValue;
  },
  watch: {
    transportation(value) {
      this.$emit("update:modelValue", value);
    },
    modelValue() {
      this.transportation = this.modelValue;
    },
  },

  computed: {},

  methods: {
    getShopTransportationObject(type) {
      return ShopTransportations[type];
    },
  },
};
</script>

<style lang="scss" scoped>
.vertical {
  flex-direction: column;
  width: 100%;
  background: transparent !important;

  button {
    border-radius: 8px !important;
    margin: 2px 0;
    border: solid thin #eee !important;
  }
}
</style>
