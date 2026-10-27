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
    :class="{ 'b-inventory-filter--modern': modern }"
    :menu-icon="modern ? '' : undefined"
    :menu-props="modern ? { contentClass: 'sd-modern-select-menu text-start' } : undefined"
    :density="dense ? 'compact' : undefined"
    :flat="flat"
    :items="[
      ...Object.values(ProductType).map((t) => {
        return { value: t.code, obj: t };
      }),
      ...Object.values(ProductStatus).map((t) => {
        return { value: t.code, obj: t };
      }),
    ]"
    :model-value="modelValue"
    :placeholder="$t(modern ? 'inventory_filter.all_products' : 'inventory_filter.placeholder')"
    :aria-label="$t('inventory_filter.placeholder')"
    :single-line="modern"
    :variant="variant"
    bg-color="transparent"
    chips
    clearable
    hide-details
    item-value="value"
    multiple
    :prepend-inner-icon="modern ? undefined : 'filter_alt'"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
        $nextTick(() => {
          $emit('change', val);
        });
      }
    "
  >
    <template v-if="modern" v-slot:prepend-inner><b-inventory-list-icon name="list-filter" /></template>
    <template v-if="modern" v-slot:append-inner><b-inventory-list-icon name="chevron-down" class="b-inventory-filter__chevron" /></template>
    <template v-slot:item="{ item, props }">
      <v-list-item class="d-flex align-center text-start" v-bind="props">
        <template v-slot:title>
          <span style="display: inline-block; min-width: 58px"
            ><v-img
              v-if="item.raw.obj.image"
              :src="item.raw.obj.image"
              class="me-2"
              height="16"
              width="16"
            ></v-img>
            <v-icon v-else class="me-2" size="small">{{
              item.raw.obj.icon
            }}</v-icon></span
          >

          {{ $t(item.raw.obj.name) }}
        </template>
      </v-list-item>
    </template>

    <template v-slot:chip="{ attrs, item, parent, selected }">
      <v-chip
        :model-value="selected"
        :size="dense ? 'x-small' : undefined"
        :class="modern ? 'ma-1 font-weight-regular' : 'ma-1 font-weight-bold'"
        closable
        :color="modern ? undefined : '#fafafa'"
        :theme="modern ? undefined : 'light'"
        v-bind="attrs"
        variant="flat"
        @click:close="parent.selectItem(item)"
      >
        <v-img
          v-if="item.raw.obj.image"
          :src="item.raw.obj.image"
          class="me-1"
          height="16"
          width="16"
        ></v-img>
        <v-icon v-else class="me-1" size="small" start
          >{{ item.raw.obj.icon }}
        </v-icon>
        {{ $t(item.raw.obj.name) }}
      </v-chip>
    </template>
  </v-select>
</template>

<script lang="ts">
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import {ProductType} from "@selldone/core-js/enums/product/ProductType.ts";
import BInventoryListIcon from "../list/icon/BInventoryListIcon.vue";

export default {
  name: "BInventoryFilter",
  components: { BInventoryListIcon },
  emits: ["update:modelValue", "change"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {},
    dense: { type: Boolean },
    variant: {
      default: "underlined",
    },
    flat: Boolean,
    modern: Boolean,
  },
  data: function () {
    return {
      ProductType: ProductType,

      ProductStatus: ProductStatus,
    };
  },

  watch: {},
  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.b-inventory-filter--modern.v-select--active-menu :deep(.b-inventory-filter__chevron) { transform: rotate(180deg); }
</style>
