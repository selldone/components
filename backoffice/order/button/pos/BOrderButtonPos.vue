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
  <v-btn
    :small="small"
    :text="text"
    :to="
      vewOnly
        ? undefined
        : {
            name: 'BPageOrderPosDashboard',
            params: { basket_id: order.id },
          }
    "
    class="shadow-hover"
    variant="flat"
    :target="openNewTab?'_blank':undefined"    :append-icon="openNewTab?'open_in_new':undefined"

  >
    <img
      :src="require('../../../../assets/icons/pos-order-type.svg')"
      class="me-2"
      height="16"
      width="16"
    />

    {{ $t("global.commons.order") }} {{ getBasketOrderCode(order) }}
  </v-btn>
</template>

<script>
export default {
  name: "BOrderButtonPos",
  props: {
    order: {},
    small: {
      type: Boolean,
      default: false,
    },
    text: {
      type: Boolean,
      default: false,
    },
    vewOnly: {
      type: Boolean,
      default: false,
    },
    openNewTab:Boolean,

  },
};
</script>

<style scoped></style>
