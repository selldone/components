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
  <!-- ━━━━━━━━━━━━━ Pods ━━━━━━━━━━━━━ -->
  <u-pods-panel color="#fff" dense small>
    <u-pod-node
      :title="$t('global.commons.customer')"
      hover
      icon="person_outline"
    >
    </u-pod-node>

    <u-pod-wire forward></u-pod-wire>

    <u-pod-node
      hover
      icon="shopping_cart_checkout"
      title="Checkout"
    ></u-pod-node>

    <template v-if="type.code === ProductType.SERVICE.code">
      <u-pod-wire forward></u-pod-wire>

      <u-pod-node hover icon="price_change" title="Pricing"></u-pod-node>
    </template>

    <u-pod-wire forward></u-pod-wire>

    <u-pod-node hover icon="credit_card" title="Payment"></u-pod-node>

    <u-pod-wire :backward="type.code === ProductType.SUBSCRIPTION.code" forward>
    </u-pod-wire>
    <u-pod-node :image="order_image" hover title="Order"></u-pod-node>
  </u-pods-panel>
  <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
</template>

<script lang="ts">
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "OrderTypeMinimalFlow",
  components: { UPodWire, UPodNode, UPodsPanel },

  props: {
    type: { required: true },
  },
  data() {
    return {
      ProductType: ProductType,
    };
  },
  computed: {
    type_object() {
      return this.isObject(this.type) ? this.type : ProductType[this.type];
    },
    order_image() {
      return this.type_object?.basket;
    },
  },

  mounted() {},
};
</script>

<style lang="scss" scoped></style>
