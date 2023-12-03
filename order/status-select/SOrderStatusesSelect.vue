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
  <div class="c-container -force-rounded p-2 m-0 d-inline-block w-auto">
    <v-btn-toggle
      v-model="toggle_multiple"
      dense
      mandatory
      multiple
      rounded
      class="rounded-group c-widget"
      active-class="blue-flat"
      @change="
        () => {
          $emit('input', toggle_multiple);
          $emit('change', toggle_multiple);
        }
      "
    >
      <v-btn :value="item.code" v-for="item in list" :key="item.code">
        <v-icon>{{ item.icon }}</v-icon>
        <span class="hide-on-small-600 mx-1">{{ $t(item.title) }}</span>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
import { BasketStatus } from "@core/enums/basket/BasketStatus";

export default {
  name: "SOrderStatusesSelect",

  props: {
    value: {},

    hasCod: {
      default: false,
      type: Boolean,
    },
    hasReserved: {
      default: false,
      type: Boolean,
    },

    hasOpen: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      toggle_multiple: [],
    };
  },

  computed: {
    list() {
      const out = [];

      if (this.hasOpen) {
        out.push(BasketStatus.Open);
      }

      if (this.hasReserved) {
        out.push(BasketStatus.Reserved);
      }

      out.push(BasketStatus.Payed);

      if (this.hasCod) {
        out.push(BasketStatus.COD);
      }

      out.push(BasketStatus.Canceled);

      return out;
    },
  },
  watch: {},
  created() {
    this.toggle_multiple = this.value;
  },
};
</script>

<style scoped></style>
