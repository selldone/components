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
  <b-order-button-basket
    v-if="
      order &&
      (orderType === 'basket' ||
        ['PHYSICAL', 'VIRTUAL', 'FILE', 'SERVICE'].includes(order.type))
    "
    :order="order"
    :small="small"
    :text="text"
    :vew-only="vewOnly"
    :open-new-tab="openNewTab"
  >
  </b-order-button-basket>
  <b-order-button-pos
    v-else-if="order && (orderType === 'pos' || order.type === 'POS')"
    :order="order"
    :small="small"
    :text="text"
    :vew-only="vewOnly"
    :open-new-tab="openNewTab"
  >
  </b-order-button-pos>
  <b-order-button-bill
    v-else-if="order && (orderType === 'bill' || order.type === 'BILL')"
    :order="order"
    :small="small"
    :text="text"
    :vew-only="vewOnly"
    :open-new-tab="openNewTab"
  >
  </b-order-button-bill>

  <b-order-button-fulfillment
    v-else-if="
      order && (orderType === 'dropship-charge' || order.type === 'FUL')
    "
    :order="order"
    :small="small"
    :text="text"
    :vew-only="vewOnly"
    :open-new-tab="openNewTab"
  >
  </b-order-button-fulfillment>

  <b-order-button-avocado
    v-else-if="order && (orderType === 'avocado' || order.type === 'AVO')"
    :order="order"
    :small="small"
    :text="text"
    :vew-only="vewOnly"
    :open-new-tab="openNewTab"
  >
  </b-order-button-avocado>

  <b-order-button-hyper
    v-else-if="order && (orderType === 'hyper' || order.type === 'HYP')"
    :order="order"
    :small="small"
    :text="text"
    :vew-only="vewOnly"
    :open-new-tab="openNewTab"
  >
  </b-order-button-hyper>

  <small v-else class="text-uppercase">
    {{ orderType }}
  </small>
</template>

<script>
import BOrderButtonPos from "./pos/BOrderButtonPos.vue";
import BOrderButtonBill from "./bill/BOrderButtonBill.vue";
import BOrderButtonBasket from "./basket/BOrderButtonBasket.vue";
import BOrderButtonFulfillment from "./fulfillment/BOrderButtonFulfillment.vue";
import BOrderButtonAvocado from "./avocado/BOrderButtonAvocado.vue";
import BOrderButtonHyper from "./hyper/BOrderButtonHyper.vue";

export default {
  name: "BOrderButton",

  components: {
    BOrderButtonHyper,
    BOrderButtonAvocado,
    BOrderButtonFulfillment,
    BOrderButtonBasket,
    BOrderButtonBill,
    BOrderButtonPos,
  },
  props: {
    order: {},
    orderType: {},

    small: {
      type: Boolean,
      default: false,
    },
    openNewTab: Boolean,
    text: {
      type: Boolean,
      default: false,
    },
    vewOnly: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
