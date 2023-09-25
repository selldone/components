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
  <div class="s--shop-basket-items border-between-vertical">


    <s-shop-basket-item    v-for="(item, index) in items"
            :key="index"
    :shop="shop"
                           :basket-item="item"

    >

    </s-shop-basket-item>

  </div>
</template>

<script>

import SShopBasketItem from "@/Components/storefront/order/basket/SShopBasketItem.vue";

export default {
  name: "SShopBasketItems",
  components: {
    SShopBasketItem,

  },
  props: {
    shop:{
      required: true,
      type: Object,

    },
    items: {
      required: true,
      type: Array,
    },
  },

  data: function () {
    return {

    };
  },
  computed: {},
  methods: {

  },
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-basket-items{


}

</style>
