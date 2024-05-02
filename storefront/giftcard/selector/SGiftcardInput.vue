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
    :variant="variant"
    :items="giftCards"
    :label="$t('global.payment_form.gift_cards_input')"
    :model-value="modelValue"
    :multiple="multiple"
    :no-data-text="$t('global.payment_form.gift_cards_input_empty')"
    :return-object="returnObject"
    :rounded="rounded"
    item-title="number"
    prepend-inner-icon="card_giftcard"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:append-inner>
      <v-progress-circular v-if="loading" indeterminate></v-progress-circular>

      <v-btn icon variant="text" @click.prevent="dialog = true">
        <v-icon>add_box</v-icon>
        <v-tooltip
          activator="parent"
          location="bottom"
          content-class="bg-black"
        >
          {{ $t("global.actions.add_giftcard") }}
        </v-tooltip>
      </v-btn>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Add card  ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <s-giftcard-add
        v-model="dialog"
        @add="
          (gift_card) => {
            AddOrUpdateItemByID(giftCards, gift_card);
            dialog = false;
          }
        "
      ></s-giftcard-add>
    </template>
    <template v-slot:selection="{ item, index }">
      <v-chip
        v-if="index === 0"
        class="overflow-visible"
        closable
        color="#ffffff"
        theme="light"
        variant="flat"
        @click:close.stop="DeleteItemByID(modelValue, item.raw.id)"
      >
        <template v-slot:prepend>
          <v-avatar v-if="item.raw.gift_type.bg" class="me-2">
            <img
              :src="getShopImagePath(item.raw.gift_type.bg, IMAGE_SIZE_SMALL)"
              alt="trevor"
            />
          </v-avatar>
        </template>
        <span>{{ formatCard(item.raw.number) }}</span>
        <span class="ms-2 small">{{ item.raw.gift_type.title }}</span>
      </v-chip>
      <span v-if="index === 1" class="text-caption ms-2 mt-1"
        >(+{{ modelValue.length - 1 }}
        {{ $t("global.payment_form.more") }} )</span
      >
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" class="text-start">
        <template v-slot:prepend>
          <img
            v-if="item.raw.gift_type.bg"
            :src="getShopImagePath(item.raw.gift_type.bg, IMAGE_SIZE_SMALL)"
            class="rounded me-2"
            height="24"
            width="36"
          />
        </template>

        <template v-slot:title>
          <b>{{ formatCard(item.raw.number) }}</b>
        </template>
        <template v-slot:append>
          <u-price
            :amount="item.raw.balance"
            :currency="item.raw.gift_type.currency"
          ></u-price>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script>
import SGiftcardAdd from "@components/storefront/giftcard/add/SGiftcardAdd.vue";

export default {
  name: "SGiftcardInput",
  components: { SGiftcardAdd },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    giftCards: {},
    multiple: {
      default: false,
      type: Boolean,
    },
    returnObject: {
      default: false,
      type: Boolean,
    },

    rounded: {
      default: false,
      type: Boolean,
    },

    loading: {
      default: false,
      type: Boolean,
    },
    variant: {
      default: "underlined",
    },
  },
  data: () => ({
    dialog: false,
  }),
};
</script>

<style scoped></style>
