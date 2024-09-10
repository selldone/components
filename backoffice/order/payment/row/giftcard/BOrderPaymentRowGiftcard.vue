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
  <tr class="text-start">
    <td>
      <v-icon v-if="sub" class="ms-5 flip-ltr" color="black"
        >keyboard_return
      </v-icon>

      <img
        class="mx-2"
        height="24"
        src="../../../../../assets/icons/gift-card.svg"
      />
      {{ $t("process_center.payment_widget.gift_card") }}
    </td>
    <td class="text-left">
      <u-price
        :amount="-giftcard.amount"
        :currency="giftcard.currency"
      ></u-price>
    </td>
    <td>
      {{ formatCard(giftcard.number) }}

      <v-chip
        v-if="giftcard.vitem_id"
        color="#948"
        size="x-small"
        variant="tonal"
        prepend-icon="paid"
        class="ms-1"
      >
        {{$t('global.commons.purchased')}}
      </v-chip>
      <v-chip
        v-else-if="giftcard.vitem_id === null"
        color="#009688"
        size="x-small"
        variant="tonal"
        prepend-icon="card_giftcard"
        class="ms-1"
        >{{$t('global.commons.giveaway')}}
      </v-chip>
    </td>
    <td>
      <div :title="getFromNowString(giftcard.expire_at)">
        <small>
          {{ $t("global.commons.expire_at") }}
        </small>
        <span class="small ms-1">
          {{ getLocalDateString(giftcard.expire_at) }}</span
        >
      </div>
      <div class="my-1">
        <v-btn
          class="nbt"
          size="x-small"
          target="_blank"
          :to="{
            name: 'AdminGiftCardManagementPage',
            params: { gift_card_type_id: giftcard.type_id },
          }"
          >{{ $t("global.commons.management") }}

          <v-icon end size="small">launch</v-icon>
        </v-btn>
      </div>
    </td>
  </tr>
</template>

<script>
export default {
  name: "BOrderPaymentRowGiftcard",
  props: {
    giftcard: {
      require: true,
    },
    sub: {
      default: false,
      type: Boolean,
    },
  },
};
</script>

<style scoped></style>
