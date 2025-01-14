<!--
  - Copyright (c) 2025. Selldone® Business OS™
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
  <div class="d-flex overflow-auto pt-5 pb-2">
    <v-badge
      v-for="item in items"
      :key="item.id"
      :color="
        deliveryState === PhysicalOrderStates.CheckQueue.code && !item.check
          ? 'amber'
          : readonly || item.check
            ? 'green'
            : 'red'
      "
      class="m-2"
    >
      <template v-slot:badge
        >{{
          numeralFormat(
            item.count + (item.count_adjustment ? item.count_adjustment : 0),
            item.product?.unit_float ? "0,0.[000]" : "0,0",
          )
        }}

        <i
          v-if="
            !item.check && deliveryState === PhysicalOrderStates.CheckQueue.code
          "
          class="fa fa-spinner fa-pulse fa-fw ms-1"
          title="Waiting to confirm by seller..."
        />
      </template>
      <v-avatar color="#fff" style="border: solid thin #999">
        <img :src="getProductImage(item.product_id)" />
      </v-avatar>
    </v-badge>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Basket } from "@selldone/core-js";
import PhysicalOrderStates = Basket.PhysicalOrderStates;

export default defineComponent({
  name: "BOrderCartItemsCircle",
  props: {
    deliveryState: {
      required: true,
    },
    items: {
      required: true,
      type: Array,
    },
    readonly: Boolean,
  },
  data() {
    return {
      PhysicalOrderStates: PhysicalOrderStates,
    };
  },
});
</script>

<style scoped lang="scss"></style>
