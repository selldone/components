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
    :density="dense ? 'compact' : undefined"
    :items="gift_card_types"
    :label="$t('gift_card_types_list.label')"
    :loading="busy"
    :messages="$t('gift_card_types_list.message')"
    :return-object="returnObject"
    :rounded="rounded"
    :variant="variant"
    item-title="title"
    item-value="id"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item :title="item.raw.title" class="text-start" v-bind="props">
        <template v-slot:prepend>
          <b-giftcard-type-icon
            :color="item.raw.color"
            :image="getShopImagePath(item.raw.bg)"
            height="36"
          ></b-giftcard-type-icon>
        </template>

        <template v-slot:append>
          <v-icon
            v-if="
              returnObject
                ? item.raw === gift_type_selected
                : item.raw.id === gift_type_selected
            "
            class="mx-1"
            color="green"
          >
            check
          </v-icon>
        </template>
      </v-list-item>
    </template>

    <template v-slot:selection="{ item }">
      <v-chip v-if="chip" color="#fafafa" variant="flat">
        <b>{{ item.raw.title }}</b>

        <v-avatar :color="item.raw.color" end size="20">
          <v-img :src="getShopImagePath(item.raw.bg)" />
        </v-avatar>
      </v-chip>
      <span v-else class="small">
        <b>{{ item.raw.title }}</b>

        <v-avatar :color="item.raw.color" class="mx-1" size="20">
          <img :src="getShopImagePath(item.raw.bg)" />
        </v-avatar>
      </span>
    </template>
  </v-select>
</template>

<script>
import BGiftcardTypeIcon from "../icon/BGiftcardTypeIcon.vue";

export default {
  name: "BGiftcardTypeInput",
  components: { BGiftcardTypeIcon },

  props: {
    shop: {
      require: true,
    },
    modelValue: {},
    returnObject: {
      default: false,
      type: Boolean,
    },

    variant: {
      default: "underlined",
    },
    dense: {
      type: Boolean,
      default: false,
    },
    rounded: {
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
    modelValue(account) {
      this.gift_type_selected = account;
    },
  },
  created() {
    this.fetchGiftCardTypesList();
    this.gift_type_selected = this.modelValue;
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
