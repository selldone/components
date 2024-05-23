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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <u-pods-panel color="#fff">
    <u-pod-node
      :image="getShopImagePath(shop.icon)"
      :title="shop.title"
    ></u-pod-node>
    <u-pod-wire forward></u-pod-wire>

    <u-pod-node icon="shopping_bag" title="Order"></u-pod-node>

    <u-pod-wire forward></u-pod-wire>

    <u-pod-node
      :color="highlightTransactions ? '#0061e0' : undefined"
      icon="swap_horiz"
      title="Transactions"
    ></u-pod-node>
    <u-pod-wire forward></u-pod-wire>

    <u-pod-node
      :color="highlightWallet ? '#0061e0' : undefined"
      :title="vendor ? `${vendor.name} Wallet` : `Vendor Wallet`"
      icon="wallet"
    ></u-pod-node>
    <u-pod-wire backward forward></u-pod-wire>

    <u-pod-node
      :color="highlightTransactions ? '#0061e0' : undefined"
      icon="swap_horiz"
      title="Transactions"
    ></u-pod-node>
    <u-pod-wire backward forward></u-pod-wire>

    <u-pod-node
      :color="highlightPayout ? '#0061e0' : undefined"
      :image="aut_payout_icon ? getShopImagePath(aut_payout_icon) : undefined"
      icon="payments"
      title="Payout"
    ></u-pod-node>

    <u-pod-wire forward></u-pod-wire>
    <u-pod-node icon="account_balance" title="Vendor Bank"></u-pod-node>
  </u-pods-panel>
</template>
<script>
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";

export default {
  name: "BVendorPayoutPods",
  components: { UPodWire, UPodNode, UPodsPanel },

  props: {
    shop: {
      type: Object,
      required: true,
    },
    vendor: {},
    highlightWallet: {
      default: false,
      type: Boolean,
    },

    highlightPayout: {
      default: false,
      type: Boolean,
    },

    highlightTransactions: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({}),
  computed: {
    connect_links() {
      return this.vendor?.connect_links;
    },
    aut_payout_icon() {
      return this.connect_links?.filter((x) => x.connected).length
        ? this.connect_links[0].icon
        : null;
    },
  },

  watch: {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
