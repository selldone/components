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
    :item-title="itemText"
    :itemValue="itemValue"
    :items="items_fixed"
    :label="label"
    :messages="messages"
    :model-value="value"
    :returnObject="returnObject"
    :rounded="rounded"
    :variant="solo?'solo':filled?'filled':'underlined'"
    @update:model-value="(val) => $emit('input', val)"
  >
    <template v-slot:prepend-inner>
      <img :src="findIcon(value)" class="me-1" height="16" width="16" />
    </template>
  </v-combobox>
</template>

<script>
export default {
  name: "SCombobox",
  props: {
    value: {},
    items: {},
    itemText: {},
    itemValue: {},
    returnObject: {
      type: Boolean,
      default: true,
    },
    label: {},
    messages: {},

    rounded: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    defaultIcon: {},
    iconKey: {
      default: "icon",
    },
  },
  data() {
    return {
      search: null,
    };
  },

  watch: {},

  computed: {
    items_fixed() {
      return [...this.items, { name: this.search }];
    },
  },

  methods: {
    findIcon(source) {
      const found = source
        ? this.items.find(
            (item) => item.name.toLowerCase() === source.toLowerCase(),
          )
        : null;

      return found && found[this.iconKey]
        ? found[this.iconKey]
        : this.defaultIcon;
    },
  },
};
</script>

<style scoped></style>
