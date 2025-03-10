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
  <div class="text-start widget shadow m-3">
    <div class="d-flex align-center">
      <h2>
        <v-avatar class="hover-scale me-1" size="24">
          <img :src="getProductImage(item.product_id)" :alt="`${item.product.title} Image`" />
        </v-avatar>

        {{ item.product.title }}
      </h2>
      <variant-item-view-micro
        v-if="item.variant"
        :product-variant="item.variant"
        class="mx-2"
      ></variant-item-view-micro>

      <v-spacer></v-spacer>
      <small>
        <v-icon class="me-1" color="green">check</v-icon>
        Receive approved</small
      >
    </div>
    <v-list-subheader class="px-0">
      {{ $t("global.virtual_item_info.title") }} <span class="mx-2">|</span>
      <b>VIT-{{ virtualItem.id }}</b>
    </v-list-subheader>

    <!-- ================== OUTPUT VALUES (SECRETS) =========================-->

    <div v-if="hasOutputForm" class="max-width-field-large mx-auto pa-3 w-100">
      <u-text-value-dashed
        v-for="item_key in Object.keys(virtualItem.data)"
        :key="item_key"
        class="m-1"
      >
        <template v-slot:label>
          <v-icon class="me-1">lock_outline</v-icon>
          {{ findElementNameOutput(item_key) }}
        </template>
        <b>{{ virtualItem.data[item_key] }}</b>
      </u-text-value-dashed>
    </div>

    <!-- ================== USER ACCEPT =========================-->
  </div>
</template>

<script lang="ts">
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";
import VariantItemViewMicro from "../variant/VariantItemViewMicro.vue";

export default {
  name: "VirtualItemInfo",
  components: { VariantItemViewMicro, UTextValueDashed },
  props: {
    virtualItem: {
      required: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
    item: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    message: {},

    confirm_by_buyer: false,
  }),

  computed: {
    product() {
      return this.item.product;
    },

    hasOutputForm() {
      return this.product.outputs && this.product.outputs.length > 0;
    },
  },
  created() {
    this.message = this.item.message ? this.item.message : {};
  },

  methods: {
    findElementNameOutput(key) {
      for (let i = 0; i < this.product.outputs.length; i++)
        if (this.product.outputs[i].name === key)
          return this.product.outputs[i].title;
      return key;
    },
  },
};
</script>

<style lang="scss" scoped></style>
