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
  <span v-if="basket" class="d-block mt-2 font-weight-black" dir="ltr"
    >{{ code }}-{{ basket.id }}
    <v-icon :color="status ? status.color : null" class="mt-n2" size="10"
      >lens</v-icon
    >
  </span>
</template>

<script>
import { BasketStatus } from "@core/enums/basket/BasketStatus";
import { ProductType } from "@core/enums/product/ProductType";

export default {
  name: "SOrderCodeView",
  props: {
    basket: {},
    isFulfilment: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    status() {
      return BasketStatus[this.basket.status];
    },
    code() {
      return this.basket.type === ProductType.PHYSICAL.code
        ? "SM"
        : this.basket.type === ProductType.VIRTUAL.code
          ? "SV"
          : this.basket.type === ProductType.FILE.code
            ? "SF"
            : this.basket.type === ProductType.SERVICE.code
              ? "SS"
              : this.basket.type === ProductType.SUBSCRIPTION.code
                ? "SN"
                : this.basket.type === "POS"
                  ? "POS"
                  : this.isFulfilment
                    ? "DS"
                    : this.basket.type === "AVO"
                      ? "SVO"
                      : this.basket.type === "HYP"
                        ? "HYP"
                        : null;
    },
  },
};
</script>

<style scoped></style>
