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
    v-model="gift_type_selected"
    :dense="dense"
    :filled="filled"
    :items="gift_card_types"
    :label="$t('gift_card_types_list.label')"
    :loading="busy"
    :messages="$t('gift_card_types_list.message')"
    :outlined="outlined"
    :return-object="returnObject"
    :rounded="rounded"
    class="m-2"
    item-title="account_number"
    item-value="id"
  >
    <template v-slot:item="{ item }">
      <span>{{ item.title }}</span>

      <v-avatar :color="item.color" class="mx-1" size="24">
        <img :src="getShopImagePath(item.bg)" />
      </v-avatar>

      <span class="mx-2"> </span>

      <v-icon
        v-if="
          returnObject
            ? item === gift_type_selected
            : item.id === gift_type_selected
        "
        class="mx-1"
        color="green"
      >
        check
      </v-icon>
    </template>

    <template v-slot:selection="{ item }">
      <v-chip v-if="chip" color="#fafafa" light>
        <b>{{ item.title }}</b>

        <v-avatar :color="item.color" end size="20">
          <img :src="getShopImagePath(item.bg)" />
        </v-avatar>
      </v-chip>
      <span v-else class="small">
        <b>{{ item.title }}</b>

        <v-avatar :color="item.color" class="mx-1" size="20">
          <img :src="getShopImagePath(item.bg)" />
        </v-avatar>
      </span>
    </template>
  </v-select>
</template>

<script>
export default {
  name: "SelectGiftCardType",

  props: {
    shop: {
      require: true,
    },
    value: {},
    returnObject: {
      default: false,
      type: Boolean,
    },

    outlined: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },

    chip: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    busy: false,

    gift_type_selected: null,

    gift_card_types: [],
  }),

  watch: {
    gift_type_selected(account) {
      this.$emit("input", account);
    },
    value(account) {
      this.gift_type_selected = account;
    },
  },
  created() {
    this.fetchGiftCardTypesList();
    this.gift_type_selected = this.value;
  },

  methods: {
    fetchGiftCardTypesList() {
      this.busy = true;

      axios
        .get(
          window.API.GET_GIFT_CARD_TYPES(this.shop.id),

          {
            params: {
              offset: 0,
              limit: 100,
              sortBy: "created_at",
              sortDesc: true,
              search: null,
            },
          },
        )
        .then(({ data }) => {
          this.gift_card_types = data.gift_card_types;
        })
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style scoped></style>
