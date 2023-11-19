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
  <span v-if="statusObject" class="position-relative text-center">
    <div class="inline-block position-relative">
      <img
        class="me-1"
        :src="
          gatewayProcessing
            ? require('@components/assets/icons/gateway-processing.svg')
            : statusObject.src
        "
        width="24"
        height="24"
      />

      <v-icon small v-if="processing" class="sup-icon fa-spin" color="blue"
        >fas fa-cog</v-icon
      >
      <v-icon small v-else-if="ticked" class="sup-icon" color="success"
        >check_circle</v-icon
      >
      <v-icon small v-else-if="canceled" class="sup-icon" color="red"
        >cancel</v-icon
      >
    </div>

    <small class="d-block text-ellipsis">{{ title }}</small>
    <time-progress-bar
      v-if="gatewayProcessing"
      class="min-width-100"
      small
      :created-time="gatewayProcessing.created_at"
      :start-time="gatewayProcessing.issued_at"
      :end-time="gatewayProcessing.expire_at"
    ></time-progress-bar>
  </span>
</template>

<script>
import { BasketStatus } from "@core/enums/basket/BasketStatus";
import TimeProgressBar from "../../ui/calendar/TimeProgressBar.vue";

export default {
  name: "OrderStatusView",
  components: { TimeProgressBar },
  props: {
    status: {
      require: true,
    },
    gatewayProcessing: {},
  },
  computed: {
    statusObject() {
      // Tips: For billing status is: PENDING , PAYED , CANCELED  (Is upper case!) TODO: Correct it!
      return Object.values(BasketStatus).find(
        (i) => i.code.toLowerCase() === this.status.toLowerCase()
      );
    },
    ticked() {
      return [
        BasketStatus.Payed.code.toLowerCase(),
        BasketStatus.COD.code.toLowerCase(),
      ].includes(this.status.toLowerCase());
    },

    canceled() {
      return this.status === BasketStatus.Canceled.code;
    },
    processing() {
      return !!this.gatewayProcessing;
    },
    title() {
      if (
        this.gatewayProcessing &&
        this.gatewayProcessing.transaction_type === "dir"
      )
        return this.$t("global.basket_status.receipt_added");
      else if (this.gatewayProcessing)
        return this.$t("global.basket_status.payment_processing");

      return this.$t(this.statusObject.title);
    },
  },
};
</script>

<style scoped lang="scss"></style>
