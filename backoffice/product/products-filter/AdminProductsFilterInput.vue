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
    :model-value="modelValue"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
         $nextTick(() => {
        $emit('change',val);
      })
      }
    "
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
    placeholder="Select Filter *.*"
    prepend-inner-icon="filter_alt"
    bg-color="transparent"
    hide-details
    clearable
    :density="dense?'compact':undefined"
    variant="solo"
    flat

  >
    <template v-slot:item="{ item,props }">
      <v-list-item v-bind="props" class="d-flex align-center text-start"  >
        <template v-slot:title>
          <span style="display: inline-block;min-width: 58px"><v-img
              v-if="item.raw.obj.image"
              :src="item.raw.obj.image"
              width="16"
              height="16"
              class="me-2"
          ></v-img>
          <v-icon v-else class="me-2" size="small">{{ item.raw.obj.icon }}</v-icon></span>

          {{$t(item.raw.obj.name)}}
        </template>

      </v-list-item>
    </template>

    <template v-slot:chip="{ attrs, item, parent, selected }">
      <v-chip
        class="ma-1 font-weight-bold"
        closable
        :model-value="selected"
        v-bind="attrs"
        @click:close="parent.selectItem(item)"
        color="#fafafa"
        theme="light" variant="flat"
        :size="dense ? 'x-small' : undefined"
      >
        <v-img
          v-if="item.raw.obj.image"
          :src="item.raw.obj.image"
          width="16"
          height="16"
          class="me-1"
        ></v-img>
        <v-icon v-else start size="small" class="me-1">{{
          item.raw.obj.icon
        }}</v-icon>
        {{ $t(item.raw.obj.name) }}
      </v-chip>
    </template>
  </v-select>
</template>

<script>
import { ProductStatus } from "@core/enums/product/ProductStatus";

export default {
  name: "AdminProductsFilterInput",
  components: {},
  emits: ["update:modelValue", "change"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {},
    dense: { type: Boolean },
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
