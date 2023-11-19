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
  <div>
    <v-subheader
      >Shipping services available depend on the provided size and
      weight.</v-subheader
    >
    <v-row no-gutters class="py-3">
      <div
        v-for="transportation in eligible_transportations"
        :key="transportation.id"
        class="usn pp small -transportation-item"
        :class="{ 'img-grayscale': !transportation.enable }"
        @click.stop="(e) => setActivator(e.target, transportation)"
        :title="`Show detail of ${
          transportation.title
            ? transportation.title
            : $t(ShopTransportations[transportation.type]?.name)
        }`"
      >
        <v-avatar size="16" rounded left>
          <v-img
            :src="
              transportation.logo
                ? getShopImagePath(transportation.logo)
                : ShopTransportations[transportation.type]?.icon
            "
          />
        </v-avatar>
        <span class="px-1">{{
          transportation.title
            ? transportation.title
            : $t(ShopTransportations[transportation.type]?.name)
        }}</span>
      </div>
    </v-row>

    <v-menu
      v-model="menu"
      v-if="activator_item"
      :activator="activator"
      offset-y
      rounded="xl"
      bottom
    >
      <v-sheet dark color="#111" class="pa-3">
        <delivery-card-content
          :transportation="activator_item"
          :show-buttons="false"
        ></delivery-card-content>
      </v-sheet>
    </v-menu>
  </div>
</template>

<script>
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";
import DeliveryCardContent from "@app-backoffice/pages/shop/pages/logistic/widgets/DeliveryCardContent.vue";
import _ from "lodash-es";

export default {
  name: "TransportationsEligibleView",
  components: { DeliveryCardContent },
  props: {
    shop: {
      type: Object,
      required: true,
    },

    weight: {},

    width: {},
    length: {},
    height: {},
  },
  data: () => ({
    ShopTransportations: ShopTransportations,

    activator: null,
    activator_item: null,
    menu: false,
  }),
  created() {},
  watch: {},

  computed: {
    transportations() {
      return this.shop.transportations;
    },
    eligible_transportations() {
      return this.transportations?.filter((t) => {
        return (
          this.weight <= t.max_weight &&
          this.width <= t.max_w &&
          this.length <= t.max_l &&
          this.height <= t.max_h
        );
      });
    },
  },

  methods: {
    setActivator(node, item) {
      this.activator = node;
      this.menu = false;
      _.delay(() => {
        this.activator_item = item;
        this.menu = true;
      }, 300);
    },
  },
};
</script>

<style scoped lang="scss">
.-transportation-item{
  margin: 4px;
  transition:all 0.3s ease-in-out;
  &:hover{
    color: #000;
    font-weight: bolder;
  }
}
</style>
