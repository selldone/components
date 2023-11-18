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
    :items="giftCards"
    :label="$t('global.payment_form.gift_cards_input')"
    :no-data-text="$t('global.payment_form.gift_cards_input_empty')"
    :multiple="multiple"
    item-text="number"
    :return-object="returnObject"
    prepend-inner-icon="card_giftcard"
    :rounded="rounded"
    :filled="filled"
  >
    <template v-slot:append-outer="">
      <v-btn
        @click.stop="dialog = true"
        icon
        :caption="$t('global.actions.add_giftcard')"
        class="sub-caption b-16px -hover margin-n7px"
        ><v-icon>add_box</v-icon></v-btn
      >

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Add card  ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <s-shop-gift-card-add-dialog
        v-model="dialog"
        @add="
          (gift_card) => {
            AddOrUpdateItemByID(giftCards, gift_card);
            dialog = false;
          }
        "
      ></s-shop-gift-card-add-dialog>
    </template>
    <template v-slot:selection="{ item, index }">
      <v-chip
        v-if="index === 0"
        color="#ffffff33"
        class="mt-2"
        close
        @click:close="DeleteItemByID(value, item.id)"
      >
        <v-avatar v-if="item.gift_type.bg" left>
          <img
            :src="
              (
                getShopImagePath(item.gift_type.bg, IMAGE_SIZE_SMALL)
              )
            "
            alt="trevor"
          />
        </v-avatar>

        <span>{{ formatCard(item.number) }}</span>
        <span class="ms-2 small">{{ item.gift_type.title }}</span>
      </v-chip>
      <span v-if="index === 1" class="caption ms-2 mt-1"
        >(+{{ value.length - 1 }} {{ $t("global.payment_form.more") }} )</span
      >
    </template>
    <template v-slot:item="{ parent, item }">
      <img
        v-if="item.gift_type.bg"
        :src="
          (
            getShopImagePath(item.gift_type.bg, IMAGE_SIZE_SMALL)
          )
        "
        height="24"
        width="36"
        class="rounded me-2"
      />

      <b>{{ formatCard(item.number) }}</b>

      <v-spacer></v-spacer>

      {{ FormatNumberCurrency(item.balance, item.gift_type.currency) }}
      {{ GetUserSelectedCurrencyName(item.gift_type.currency) }}
    </template>

    <template v-slot:append>
      <v-progress-circular
        v-if="loading"
        indeterminate
        class="mt-n1"
      ></v-progress-circular>
    </template>
  </v-select>
</template>

<script>
import SShopGiftCardAddDialog from "@components/storefront/incentives/giftcard/SShopGiftCardAddDialog.vue";
export default {
  name: "SelectGiftCards",
  components: { SShopGiftCardAddDialog },
  props: {
    value: {},
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
