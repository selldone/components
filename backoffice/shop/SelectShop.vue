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
    :clearable="clearable"
    :color="color"
    :dense="dense"
    :disabled="disabled"
    :filled="filled"
    :items="shops"
    :label="label"
    :loading="loading"
    :messages="messages"
    :model-value="value"
    :outlined="outlined"
    :placeholder="placeholder"
    :return-object="returnObject"
    :rounded="rounded"
    item-title="title"
    item-value="id"
    @update:model-value="(val) => $emit('input', val)"
  >
    <template v-slot:item="{ item }">
      <v-avatar size="32">
        <img :src="getShopIcon(item.id, 96)" />
      </v-avatar>
      <span class="mx-2">{{ item.title }}</span>
      <v-icon
        v-if="!item.shop_permissions || !item.shop_permissions.length"
        color="amber"
        size="x-small"
        title="Owner"
        >fa:fas fa-crown
      </v-icon>
    </template>

    <template v-slot:selection="{ item }">
      <v-avatar class="me-2" size="32">
        <img :src="getShopIcon(item.id, 96)" />
      </v-avatar>
      <span class="mx-2 font-weight-bold">{{ item.title }}</span>
      <span class="mx-2 op-0-6 small hide-on-small-600">@ {{ item.name }}</span>

      <v-icon
        v-if="!item.shop_permissions || !item.shop_permissions.length"
        color="amber"
        size="x-small"
        title="Owner"
        >fa:fas fa-crown
      </v-icon>
    </template>

    <template v-slot:append="">
      <v-btn
        v-if="to"
        :class="{ disabled: !value }"
        :to="to"
        class=""
        color="#fff"
        light
        ripple
        rounded
        style="margin-top: -7px"
        variant="flat"
        @click.stop
      >
        {{ actionText }}
        <v-icon class="ms-2">{{ $t("icons.long_end") }}</v-icon>
      </v-btn>
    </template>
  </v-select>
</template>

<script>
export default {
  name: "SelectShop",
  props: {
    value: {},
    shops: {
      type: Array,
    },
    label: {},
    messages: {},
    placeholder: {
      default: "Select your shop",
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    outlined: {
      default: false,
      type: Boolean,
    },
    dense: {
      default: false,
      type: Boolean,
    },
    filled: {
      default: false,
      type: Boolean,
    },
    returnObject: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },
    color: {},

    to: {},
    actionText: {},

    disabled: {
      default: false,
      type: Boolean,
    },
    clearable: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({}),
};
</script>

<style scoped></style>
