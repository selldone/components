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
    :density="dense ? 'compact' : undefined"
    :disabled="disabled"
    :items="shops"
    :label="label"
    :loading="loading"
    :messages="messages"
    :model-value="modelValue"
    :placeholder="placeholder"
    :return-object="returnObject"
    :rounded="rounded"
    :variant="
      variant
        ? variant
        : filled
          ? 'filled'
          : outlined
            ? 'outlined'
            : 'underlined'
    "
    item-title="title"
    item-value="id"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        :subtitle="`@${item.raw.name}`"
        :title="item.raw.title"
        class="text-start"
        v-bind="props"
      >
        <template v-slot:prepend>
          <v-avatar size="32" class="avatar-gradient -thin -shop">
            <v-img :src="getShopIcon(item.raw.id, 96)" />
          </v-avatar>
        </template>
        <template v-slot:append>
          <shop-license-view
            v-if="item.raw.license"
            :shop="item.raw"
            class="mx-1"
            small
            view-only
          />

          <v-icon
            v-if="
              !item.raw.shop_permissions || !item.raw.shop_permissions.length
            "
            color="amber"
            size="x-small"
            title="Owner"
            >fa:fas fa-crown
          </v-icon>
        </template>
      </v-list-item>
    </template>

    <template v-slot:selection="{ item }">
      <v-avatar class="avatar-gradient -thin -shop me-2" size="32">
        <v-img :src="getShopIcon(item.raw.id, 96)" />
      </v-avatar>
      <span class="mx-2 font-weight-bold">{{ item.raw.title }}</span>
      <span class="mx-2 op-0-6 small hide-on-small-600"
        >@ {{ item.raw.name }}</span
      >

      <v-icon
        v-if="!item.raw.shop_permissions || !item.raw.shop_permissions.length"
        color="amber"
        size="x-small"
        title="Owner"
        >fa:fas fa-crown
      </v-icon>
    </template>

    <template v-slot:append="">
      <v-btn
        v-if="to"
        :class="{ disabled: !modelValue }"
        :to="to"
        class=""
        color="#fff"
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
import ShopLicenseView from "../../shop/license/view/ShopLicenseView.vue";

export default {
  name: "BShopInput",
  components: { ShopLicenseView },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
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
    variant: {},
  },

  data: () => ({}),
};
</script>

<style scoped></style>
