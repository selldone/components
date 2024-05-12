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
  <div
    :class="[hover ? 'widget-card' : 'widget', dashed ? 'dashed' : '']"

  >
    <v-btn
      v-if="editable"
      class="float-right"
      icon
      @click.stop="$emit('click:delete')"
    >
      <v-icon color="red" size="small"> delete</v-icon>
    </v-btn>
    <v-btn
      v-if="editable"
      class="float-left"
      icon
      @click.stop="$emit('click:edit')"
    >
      <v-icon>edit</v-icon>
    </v-btn>
    <circle-image
      :size="52"
      :src="getShopImagePath(giftCardType.bg, IMAGE_SIZE_SMALL)"
      class="mx-auto d-block hover-scale-small z1"
    >
    </circle-image>

    <h3 class="header-card">
      <v-icon :color="giftCardType.color" class="mx-1" size="small"
        >fa:fas fa-circle
      </v-icon>

      {{ giftCardType.title }}

      <BShopLicenseBlockIcon v-if="!canEditCard"></BShopLicenseBlockIcon>
    </h3>

    <p class="">
      <small>{{ $t("gift_cards.card.created") }}: </small>
      {{ getLocalTimeString(giftCardType.created_at) }}
    </p>
    <p class="">
      <small>{{ $t("gift_cards.card.lifetime") }}: </small>
      {{ giftCardType.life }}
      <small>{{ $t("gift_cards.card.lifetime_unit") }}</small>
    </p>

    <div class="d-flex border-between text-center">
      <div class="w-50">
        <small>{{ $t("gift_cards.card.initial_balance") }} </small><br />
        <b>
          <u-price
            :amount="giftCardType.amount"
            :currency="giftCardType.currency"
          ></u-price>
        </b>
      </div>

      <div class="w-50">
        <small> {{ $t("gift_cards.card.currency") }} </small><br />
        <u-currency-icon
          :currency="giftCardType.currency"
          caption
          flag
        ></u-currency-icon>
      </div>
    </div>

    <hr class="my-3" />

    <div class="d-flex border-between text-center">
      <div class="w-50">
        <small>{{ $t("gift_cards.card.count") }} </small><br />
        <b>{{ giftCardType.count }} {{ $t("gift_cards.card.count_unit") }}</b>
      </div>

      <div class="w-50">
        <small> {{ $t("gift_cards.card.used") }} </small><br />
        <b>{{ giftCardType.used }} {{ $t("gift_cards.card.count_unit") }}</b>
      </div>
    </div>

    <v-progress-linear
      :color="SaminColorLight"
      :model-value="(giftCardType.used * 100) / giftCardType.count"
      class="mt-3"
    />
  </div>
</template>

<script>
import CircleImage from "../../../../ui/image/CircleImage.vue";
import BShopLicenseBlockIcon from "../../../shop/license/block/icon/BShopLicenseBlockIcon.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";

export default {
  name: "BGiftcardTypeCard",
  components: { UCurrencyIcon, BShopLicenseBlockIcon, CircleImage },
  props: {
    giftCardType: {
      require: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    hover: {
      type: Boolean,
      default: false,
    },
    dashed: {
      type: Boolean,
      default: false,
    },
    canEditCard: {
      type: Boolean,
      default: true,
    },
  },

  computed: {},
};
</script>

<style scoped></style>
