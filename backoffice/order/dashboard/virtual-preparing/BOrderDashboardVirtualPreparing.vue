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
  <div class="widget shadow m-3">
    <div class="d-flex align-center">
      <h2>
        <v-icon class="me-1" color="#111">switch_access_shortcut_add</v-icon>
        {{ $t("process_center.preparing.title") }}
      </h2>
      <v-spacer></v-spacer>
    </div>
    <v-list-subheader class="px-0">
      <span v-html="$t('process_center.preparing.message')"></span>
    </v-list-subheader>
    <div class="text-start">
      <v-btn
        :class="{ disabled: !isActive }"
        :color="in_this_step ? 'primary' : '#000'"
        :loading="busy"
        :variant="!in_this_step ? 'outlined' : undefined"
        class="tnt"
        rounded
        @click="preparingOrder"
      >
        <v-icon v-if="checked" start>check</v-icon>
        {{ $t("process_center.preparing.action") }}
      </v-btn>

      <ul class="tips mt-4">
        <li
          v-for="item in $tm('process_center.preparing.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Basket } from "@selldone/core-js";

export default {
  name: "BOrderDashboardVirtualPreparing",
  components: {},
  emits: ["confirm-preparing"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      transportation: null,

      PhysicalOrderStates: Basket.PhysicalOrderStates,
      busy: false,
    };
  },
  watch: {},

  computed: {
    checked() {
      return [
        Basket.PhysicalOrderStates.PreparingOrder.code,
        Basket.PhysicalOrderStates.SentOrder.code,
        Basket.PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    in_this_step() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.OrderConfirm.code
      );
    },

    isActive() {
      return (
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.OrderConfirm.code ||
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },
  },
  methods: {
    preparingOrder() {
      this.busy = true;

      this.$emit("confirm-preparing", {
        callback: () => {
          this.busy = false;
        },
      });
    },
  },
  created() {},
};
</script>

<style scoped></style>
