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
    :filled="filled"
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
    <template v-slot:append-outer="">
      <v-btn
        :caption="$t('global.actions.add_giftcard')"
        class="sub-caption b-16px -hover margin-n7px"
        icon
        @click.stop="dialog = true"
      >
        <v-icon>add_box</v-icon>
      </v-btn>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Add card  ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <s-storefront-giftcard-add-dialog
        v-model="dialog"
        @add="
          (gift_card) => {
            AddOrUpdateItemByID(giftCards, gift_card);
            dialog = false;
          }
        "
      ></s-storefront-giftcard-add-dialog>
    </template>
    <template v-slot:selection="{ item, index }">
      <v-chip
        v-if="index === 0"
        class="mt-2"
        closable
        color="#ffffff33"
        @click:close="DeleteItemByID(modelValue, item.id)"
      >
        <v-avatar v-if="item.gift_type.bg" start>
          <img
            :src="getShopImagePath(item.gift_type.bg, IMAGE_SIZE_SMALL)"
            alt="trevor"
          />
        </v-avatar>

        <span>{{ formatCard(item.number) }}</span>
        <span class="ms-2 small">{{ item.gift_type.title }}</span>
      </v-chip>
      <span v-if="index === 1" class="text-caption ms-2 mt-1"
        >(+{{ modelValue.length - 1 }} {{ $t("global.payment_form.more") }} )</span
      >
    </template>
    <template v-slot:item="{ item }">
      <img
        v-if="item.gift_type.bg"
        :src="getShopImagePath(item.gift_type.bg, IMAGE_SIZE_SMALL)"
        class="rounded me-2"
        height="24"
        width="36"
      />

      <b>{{ formatCard(item.number) }}</b>

      <v-spacer></v-spacer>

      <price-view
        :amount="item.balance"
        :currency="item.gift_type.currency"
      ></price-view>
    </template>

    <template v-slot:append-inner>
      <v-progress-circular
        v-if="loading"

        indeterminate
      ></v-progress-circular>
    </template>
  </v-select>
</template>

<script>
import SStorefrontGiftcardAddDialog from "@components/storefront/giftcard/add-dialog/SStorefrontGiftcardAddDialog.vue";

export default {
  name: "SStorefrontGiftcardSelector",
  components: { SStorefrontGiftcardAddDialog },
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
    filled: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    dialog: false,
  }),
};
</script>

<style scoped></style>
