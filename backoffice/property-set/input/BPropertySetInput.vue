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
  <v-combobox
    v-model:search="search"
    :customFilter="() => true"
    :items="property_sets"
    :label="$t('global.commons.property_set')"
    :loading="busy"
    :messages="description ? description : undefined"
    :model-value="modelValue"
    :variant="variant"
    clearable
    item-title="title"
    item-value="id"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    @click:clear="
      $emit('click:clear');
      getPropertySets();
    "
    :return-object="returnObject"
  >
    <template v-slot:selection="{ item }">
      {{ item.raw.title }}
      <img v-for="it in         item.raw.products?.map((x) => getShopImagePath(x.icon, 64))" :src="it" width="20" height="20" class="ms-1 border rounded-sm">

    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item
        :subtitle="item.raw.description"
        class="text-start"
        v-bind="props"
      >
        <template v-slot:title>
          {{item.raw.title}}
          <img v-for="it in         item.raw.products?.map((x) => getShopImagePath(x.icon, 64))" :src="it" width="20" height="20" class="ms-1 border rounded-sm">

        </template>
        <template v-if="item.raw.variants">
          <v-chip
            v-for="it in item.raw.variants"
            :key="it.code"
            size="x-small"
            :prepend-icon="
              GetVariantIconByCode(it.code, { property_set: item })
            "
            style="margin: 1px"
            color="#fff"
            variant="flat"
          >
            {{ $t(GetVariantNameByCode(it.code, { property_set: item })) }}
          </v-chip>
        </template>
        <small v-else>{{ $t("global.commons.empty") }}</small>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { throttle } from "lodash-es";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
} from "@selldone/core-js/enums/product/ProductVariants.ts";

export default {
  name: "BPropertySetInput",
  emits: ["update:modelValue"],
  components: {},
  inject: ["$shop"],
  props: {
    modelValue: {},

    variant: {
      default: "underlined",
    },
    returnObject: Boolean,
  },

  data() {
    return {
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,

      property_sets: [],
      total: false,

      busy: false,
      search: null,
    };
  },

  computed: {
    description(val) {
      if (!this.modelValue) return undefined;

      if (this.modelValue?.description) return this.modelValue.description;

      const obj = this.property_sets.find((it) => it.id === this.modelValue);

      return obj?.description;
    },
  },

  watch: {
    search: throttle(function (newVal, oldVal) {
      this.getPropertySets();
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.getPropertySets();
  },

  methods: {
    getPropertySets() {
      this.busy = true;
      axios
        .get(window.API.GET_PROPERTY_SETS(this.$shop.id), {
          params: {
            // Must contain this id:
            contain:
              this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
            search: this.search,

            offset: 0,
            count: 20,

            with_samples:3
          },
        })
        .then(({ data }) => {
          this.property_sets = data.property_sets;
          this.total = data.total;

          const val = this.property_sets.find((it) => {
            return (
              it.id ===
              (this.modelValue && this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue)
            );
          });

          if (this.returnObject) {
            this.$emit("update:modelValue", val);
          } else {
            this.$emit("update:modelValue", val?.id);
          }
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
