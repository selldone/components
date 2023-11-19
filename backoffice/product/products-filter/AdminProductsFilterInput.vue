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
  <v-select
    :value="value"
    @input="(val) => $emit('input', val)"
    :items="[
      ...Object.values(ProductType).map((t) => {
        return { value: t.code, obj: t };
      }),
      ...Object.values(ProductStatus).map((t) => {
        return { value: t.code, obj: t };
      }),
    ]"
    item-value="value"
    multiple
    chips
    small-chips
    solo
    flat
    placeholder="Select Filter *.*"
    prepend-icon="filter_alt"
    background-color="transparent"
    hide-details
    @change="  $nextTick(() => {$emit('change')})"
    clearable
    append-icon=""
    :dense="dense"
  >
    <template v-slot:item="{ item }">
      <div class="d-flex align-center">
        <v-img
          v-if="item.obj.image"
          :src="item.obj.image"
          width="16"
          height="16"
          class="me-2"
        ></v-img>
        <v-icon v-else class="me-2" small>{{ item.obj.icon }}</v-icon>
        {{ $t(item.obj.name) }}
      </div>
    </template>

    <template v-slot:selection="{ attrs, item, parent, selected }">
      <v-chip
        class="ma-1 font-weight-bold"
        close
        :input-value="selected"
        v-bind="attrs"
        @click:close="parent.selectItem(item)"
        color="#fafafa"
        :x-small="dense"
      >
        <v-img
          v-if="item.obj.image"
          :src="item.obj.image"
          width="16"
          height="16"
          class="me-1"
        ></v-img>
        <v-icon v-else left small class="me-1">{{ item.obj.icon }}</v-icon>
        {{ $t(item.obj.name) }}
      </v-chip>
    </template>
  </v-select>
</template>

<script>
import { ProductStatus } from "@core/enums/product/ProductStatus";

export default {
  name: "AdminProductsFilterInput",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },
    value: {},
    dense:{type:Boolean}
  },
  data: function () {
    return {
      ProductStatus: ProductStatus,
    };
  },

  watch: {},
  created() {},
  methods: {},
};
</script>

<style scoped lang="scss"></style>
