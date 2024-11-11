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
  <u-pods-panel>
    <u-pod-node
      :image="
        transportation.logo
          ? getShopImagePath(transportation.logo)
          : transportationObj.icon
      "
      :title="
        transportation.title ? transportation.title : $t(transportationObj.name)
      "
    >
    </u-pod-node>
    <u-pod-wire forward></u-pod-wire>

    <template v-if="hasService">
      <u-pod-node icon="local_shipping" title="Service"></u-pod-node>
      <u-pod-wire forward>
        <template v-slot:forward>
          <v-icon size="14">shopping_bag</v-icon>
        </template>
      </u-pod-wire>
    </template>

    <template v-if="hasCourier">
      <u-pod-node icon="delivery_dining" title="Courier"></u-pod-node>
      <u-pod-wire forward>
        <template v-slot:forward>
          <v-icon size="14">shopping_bag</v-icon>
        </template>
      </u-pod-wire>
    </template>

    <u-pod-node icon="group" title="Customers"></u-pod-node>
  </u-pods-panel>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";

export default defineComponent({
  name: "BTransportationPods",
  components: { UPodWire, UPodsPanel, UPodNode },
  props: {
    transportation: {
      require: true,
      type: Object,
    },
    hasService: Boolean,
    hasCourier: Boolean,
  },

  computed: {
    transportationObj() {
      if (!this.transportation) return null;
      return ShopTransportations[this.transportation.type];
    },
  },
});
</script>

<style lang="scss" scoped></style>
