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
      style="overflow-x: auto"
      class="m-auto p-3 text-center"
      :class="{ 'disabled-no-filter': readonly }"
    >
      <v-btn-toggle
        v-model="transportation"
        :class="{vertical:vertical}"
        :rounded="!vertical"
        active-class="black-flat"
        borderless
        :multiple="multiple"
        :mandatory="mandatory"
        @change="(val) => $emit('change', val)"
        @blur="(val) => $emit('blur', val)"
        class="widget-toggle overflow-auto align-items-stretch"
      >
        <v-btn v-for="item in transportTypes" :key="item" :value="item">
          <img width="24px" :src="getShopTransportationObject(item).icon" />
          <span class="px-1">{{
            $t(getShopTransportationObject(item).name)
          }}</span>
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script>
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";

export default {
  name: "TransportationSelect",
  props: {
    transportTypes: {
      type: Array,
    },
    value: {},
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
    this.transportation = this.value;
  },
  watch: {
    transportation(value) {
      this.$emit("input", value);
    },
    value() {
      this.transportation = this.value;
    },
  },

  computed: {
    /*   calculated_distance() {
      if (
        !this.getShop() ||
        !this.getShop().warehouse ||
        !this.getShop().warehouse.location ||
        !this.receiver_info ||
        !this.receiver_info.location
      )
        return -1;
      return this.calculateDistanceBasket(
        this.getShop().warehouse.location,
        this.receiver_info.location
      );
    }*/
  },

  methods: {
    getShopTransportationObject(type) {
      return ShopTransportations[type];
    },
  },
};
</script>

<style scoped lang="scss">
.vertical{
  flex-direction: column;
  width: 100%;
  background: transparent !important;
  button{
    border-radius: 8px !important;
    margin: 2px 0;
    border: solid thin #eee !important;
  }
}
</style>
