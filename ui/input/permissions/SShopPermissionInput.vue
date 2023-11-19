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
    :value="value"
    @input="(val) => $emit('input', val)"
    :label="label"
    :items="permissions_list"
    :rounded="rounded"
    :filled="filled"
    :return-object="returnObject"
    item-value="code"
    :item-text="(item) => $t(item.text)"
    :success-messages="successMessages"
    :messages="messages"
    :outlined="outlined"
    :solo="solo"
    :flat="flat"
    :multiple="multiple"
    :chips="chips"
  >
    <template v-slot:item="{item}" >
      <span v-if="item" class="options text-start">
        <img :src="item.src" class="me-1" height="32" />
        {{ $t(item.text) }}
      </span>
    </template>

    <template  v-slot:selection="{item}" >
      <span v-if="item" class="text-start me-2">
        <img :src="item.src" class="me-1" height="26" />
        {{ $t(item.text) }}
      </span>
    </template>
  </v-select>
</template>

<script>
import { ShopPermissions } from "@core/enums/permission/ShopPermissions";

export default {
  name: "SShopPermissionInput",
  props: {
    value: {},
    label: {},
    rounded: { type: Boolean, default: false },
    filled: { type: Boolean, default: false },
    returnObject: { type: Boolean, default: false },

    successMessages: {},
    messages: {},

    outlined: { type: Boolean, default: false },
    solo: { type: Boolean, default: false },
    flat: { type: Boolean, default: false },

    multiple: { type: Boolean, default: false },
    chips: { type: Boolean, default: false },
  },
  data: () => ({
    permissions_list: Object.values(ShopPermissions),
  }),

  computed: {},
};
</script>

<style scoped></style>
