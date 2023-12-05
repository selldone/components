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
  <v-chip-group
    v-model="selected_list"
    column
    multiple
    active-class="accent-chip"
  >
    <v-chip
      v-for="item in list"
      :key="item"
      :color="light ? '#fff' : SaminColorDark"
      small
      filter
      :value="item"
    >
      <s-color-circle v-if="isColor" :color="item" :size="16" class="ms-n2 me-1">
      </s-color-circle>

      <span v-if="isColor"> {{ coloName(item) }}</span>

      <template v-else>
        <variant-asset-view
          v-if="shop"
          :shop-id="shop.id"
          :value="item"
          class="pen me-1"
          :size="16"
        ></variant-asset-view>
        {{ item?.removeVariantAsset() }}</template
      >
    </v-chip>
  </v-chip-group>
</template>

<script>
import SColorCircle from "@components/ui/color/view/SColorCircle.vue";
import VariantAssetView from "@components/ui/variant/VariantAssetView.vue";

export default {
  name: "SelectionList",
  components: { VariantAssetView, SColorCircle },
  props: {
    isColor: {
      type: Boolean,
      default: false,
    },

    value: {},
    list: {
      require: true,
      type: Array,
    },
    light: {
      default: false,
    },
  },

  data() {
    return {
      selected_list: [],

      internal_change_value: false,
    };
  },
  computed: {
    shop() {
      return this.getShop();
    },
  },

  watch: {
    selected_list: {
      handler: function (val) {
        //console.log("watch > selected_list", this.internal_change_value);
        this.$emit("input", val);

        if (!this.internal_change_value)
          this.$emit("change", this.selected_list);

        this.internal_change_value = false;
      },
      deep: true,
    },
  },

  methods: {
    coloName(color) {
      return this.GetNameOfColor(color);
    },
  },

  created() {
    this.internal_change_value = true;

    this.selected_list = this.value;
  },
};
</script>

<style scoped></style>
