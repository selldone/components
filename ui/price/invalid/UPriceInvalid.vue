<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <!-- ⛔ UPriceInvalid -->
  <b class="text-red d-inline-flex align-center" :class="{ 'x-small': small }">
    <u-currency-icon
      v-if="currency"
      :currency="currency"
      flag-only
      small
      style="width: auto"
    ></u-currency-icon>
    <u-currency-icon
      v-if="current_currency && current_currency !== currency"
      :currency="current_currency"
      flag-only
      small
      style="width: auto"
      class="ms-n3"
    ></u-currency-icon>

    {{ $t("global.commons.invalid") }}
  </b>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UCurrencyIcon from "@selldone/components-vue/ui/currency/icon/UCurrencyIcon.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default defineComponent({
  name: "UPriceInvalid",
  mixins: [CurrencyMixin],
  components: { UCurrencyIcon },
  props: {
    currency: {
      required: true,
    },
    small: Boolean,
  },
  computed: {
    current_currency() {
      return this.GetUserSelectedCurrency()?.code;
    },
  },
});
</script>

<style scoped lang="scss"></style>
