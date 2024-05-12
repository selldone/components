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
  <div>
    <u-text-value-dashed class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.sub_total") }}
      </template>
      <u-price
        :amount="bill.items_price"
        :currency="bill.currency"
        class="font-weight-bold ms-1"
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed v-if="bill.items_discount" class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.discount") }}
      </template>
      <u-price
        :amount="-bill.items_discount"
        :currency="bill.currency"
        class="font-weight-bold"
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed v-if="bill.club" class="my-1">
      <template v-slot:label>
        <img
          class="me-1"
          height="20"
          src="../../../assets/icons/customer-club.svg"
          width="20"
        />
        {{ $t("global.commons.customer_club") }}
      </template>
      <u-price
        :amount="-bill.club"
        :currency="bill.currency"
        class="font-weight-bold"
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed v-if="bill.discount_code" class="my-1">
      <template v-slot:label>
        <img
          class="me-1"
          height="20"
          src="../../../assets/icons/discount-code.svg"
          width="20"
        />
        {{ $t("global.commons.discount_code") }}
      </template>
      <u-price
        :amount="-bill.discount_code"
        :currency="bill.currency"
        class="font-weight-bold"
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed v-if="bill.coupon" class="my-1">
      <template v-slot:label>
        <img
          class="me-1"
          height="20"
          src="../../../assets/icons/coupon.svg"
          width="20"
        />

        {{ $t("global.commons.coupon") }}
      </template>
      <u-price
        :amount="-bill.coupon"
        :currency="bill.currency"
        class="font-weight-bold"
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed v-if="bill.tax" class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.tax") }}
        <v-chip
          v-if="bill.tax_included"
          class="mx-1"
          color="success"
          size="x-small"
          >{{ $t("global.commons.tax_included") }}
        </v-chip>
      </template>

      <u-price
        :amount="bill.tax"
        :currency="bill.currency"
        class="font-weight-bold"
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed v-if="bill.delivery_price" class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.delivery") }}
      </template>
      <span v-if="bill.delivery_price === -1" class="font-weight-bold">{{
        $t("process_center.payment_widget.delivery.not_paid")
      }}</span>
      <u-price
        v-else
        :amount="bill.delivery_price"
        :currency="bill.currency"
        class="font-weight-bold"
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed v-if="bill.pay_by_giftcards" class="my-1">
      <template v-slot:label>
        <img
          class="me-1"
          height="20"
          src="../../../assets/icons/gift-card.svg"
          width="20"
        />

        {{ $t("global.commons.gift_card") }}
      </template>

      <u-price
        :amount="-bill.pay_by_giftcards"
        :currency="bill.currency"
        class="font-weight-bold"
      ></u-price>
    </u-text-value-dashed>
  </div>
</template>

<script>
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";

export default {
  name: "SPosBillView",
  components: { UTextValueDashed },
  props: {
    bill: {
      type: Object,
      require: true,
    },
  },
};
</script>

<style scoped></style>
