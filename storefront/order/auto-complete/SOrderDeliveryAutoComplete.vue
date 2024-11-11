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
  <div v-if="auto_complete_at" class="py-3 text-start small">
    <v-icon class="me-1" size="small">hourglass_top</v-icon>
    {{ $t("global.commons.auto_complete") }}:<br />
    <u-count-down
      :end="auto_complete_at"
      class="ms-2 inline-block vertical-align-middle"
    ></u-count-down>
  </div>
</template>

<script lang="ts">
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UCountDown from "../../../ui/count-down/UCountDown.vue";

export default {
  name: "SOrderDeliveryAutoComplete",
  components: { UCountDown },
  props: {
    basket: {
      required: true,
    },
  },
  computed: {
    auto_complete_at() {
      return (
        this.basket.auto_complete_at &&
        DateConverter.convertToLocalTime(this.basket.auto_complete_at)
      );
    },
  },
};
</script>

<style scoped></style>
