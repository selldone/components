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
  <span :title="`Price per parcel : ${calculatePrice} ${currency}`">
    <price-view :amount="smart_per_unit" :currency="currency"></price-view>
    <span v-if="final_factor !== 1">/</span>
    {{ final_label }}
  </span>
</template>

<script>
export default {
  name: "SProductPrice",
  props: {
    shop: {
      required: true,
    },

    product: {
      required: true,
    },

    variant: {
      required: true,
    },
  },

  computed: {
    currency() {
      return this.GetUserSelectedCurrency().code;
    },
    calculatePrice() {
      return this.priceProductByCurrency(
        this.shop,
        this.product,
        this.variant,
        this.currency
      );
    },

    smart_per_unit() {
      return this.calculatePrice / this.final_factor;
    },

    final_factor() {
      let out = 1;

      if (this.weight_factor) out *= this.weight_factor;
      if (this.volume_factor) out *= this.volume_factor;
      if (this.pack_factor) out *= this.pack_factor;

      return out;
    },
    final_label() {
      let out = [];

      if (this.weight_label) out.push(this.weight_label);
      if (this.volume_label) out.push(this.volume_label);
      if (this.pack_label) out.push(this.pack_label);

      return out.join(" ˟ ");
    },

    weight_factor() {
      return this.variant.weight && Math.abs(parseFloat(this.variant.weight));
    },
    weight_label() {
      return (
        this.variant.weight && this.variant.weight.replace(/\d+([,.]\d+)?/g, "")
      );
    },

    volume_factor() {
      return this.variant.volume && Math.abs(parseFloat(this.variant.volume));
    },
    volume_label() {
      return (
        this.variant.volume && this.variant.volume.replace(/\d+([,.]\d+)?/g, "")
      );
    },

    pack_factor() {
      return this.variant.pack && Math.abs(parseFloat(this.variant.pack));
    },
    pack_label() {
      return (
        this.variant.pack && this.variant.pack.replace(/\d+([,.]\d+)?/g, "")
      );
    },
  },
};
</script>

<style scoped></style>
