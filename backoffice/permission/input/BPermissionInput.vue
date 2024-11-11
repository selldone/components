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
  <v-select
    :chips="chips"
    :filled="filled"
    :flat="flat"
    :item-title="(item) => $t(item.text)"
    :items="permissions_list"
    :label="label"
    :messages="successMessages ? successMessages : messages"
    :model-value="modelValue"
    :multiple="multiple"
    :outlined="outlined"
    :return-object="returnObject"
    :rounded="rounded"
    :variant="variant"
    item-value="code"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    closable-chips
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        :prepend-avatar="item.raw.src"
        :title="$t(item.raw.text)"
        class="text-start"
        v-bind="props"
      >
      </v-list-item>
    </template>

    <template v-slot:chip="{ item,props }">
      <v-chip v-if="chips" :prepend-avatar="item.raw.src">
        {{ $t(item.raw.text) }}
      </v-chip>
      <div v-else v-bind="props" class="text-start text-subtitle-2">
        <img :src="item.raw.src" class="me-1" height="26" />
        {{ $t(item.raw.text) }}
      </div>
    </template>
  </v-select>
</template>

<script lang="ts">
import { ShopPermissions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BPermissionInput",
  props: {
    modelValue: {},
    label: {},
    rounded: { type: Boolean, default: false },
    filled: { type: Boolean, default: false },
    returnObject: { type: Boolean, default: false },

    successMessages: {},
    messages: {},

    outlined: { type: Boolean, default: false },
    flat: { type: Boolean, default: false },

    multiple: { type: Boolean, default: false },
    chips: { type: Boolean, default: false },
    variant: {
      default: "underlined",
    },
  },
  data: () => ({
    permissions_list: Object.values(ShopPermissions),
  }),

  computed: {},
};
</script>

<style scoped></style>
