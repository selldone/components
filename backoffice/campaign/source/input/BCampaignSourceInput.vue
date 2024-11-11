<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    :density="dense ? 'compact' : undefined"
    :items="items_fixed"
    :label="$t('global.commons.source')"
    :model-value="modelValue"
    :return-object="false"
    :rounded="rounded"
    :variant="variant"
    item-title="name"
    item-value="name"
    messages="Use source to identify a search engine, newsletter name, or other source."
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:prepend-inner>
      <img :src="findIcon(modelValue)" class="me-1" height="16" width="16" />
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item :title="item.raw.name" class="text-start" v-bind="props">
        <template v-slot:prepend>
          <v-avatar
            v-if="item.raw.icon"
            :image="item.raw.icon"
            rounded="0"
            size="24"
          />
          <v-icon v-else>add_box</v-icon>
        </template>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { Brands } from "@selldone/core-js/enums/social/Brands";

export default {
  name: "BCampaignSourceInput",
  emits: ["update:modelValue"],
  props: {
    modelValue: {},

    messages: {},

    rounded: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    variant: {
      default: "underlined",
    },
  },
  data() {
    return {
      search: null,

      sources: Brands,
    };
  },

  watch: {},

  computed: {
    items_fixed() {
      return [...this.sources, { name: this.search }];
    },
  },

  methods: {
    findIcon(source) {
      const found = source
        ? this.sources.find(
            (item) => item.name.toLowerCase() === source.toLowerCase(),
          )
        : null;

      return found?.icon
        ? found.icon
        : require("../../../../assets/trademark/default.svg");
    },
  },
};
</script>

<style scoped></style>
