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
    <s-value-dashed class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.sub_total") }}
      </template>
      <price-view
        class="font-weight-bold ml-1"
        :amount="bill.items_price"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>

    <s-value-dashed v-if="bill.items_discount" class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.discount") }}
      </template>
      <price-view
        class="font-weight-bold"
        :amount="-bill.items_discount"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>

    <s-value-dashed v-if="bill.club" class="my-1">
      <template v-slot:label>
        <img
          src="../../assets/icons/customer-club.svg"
          width="20"
          height="20"
          class="me-1"
        />
        {{ $t("global.commons.customer_club") }}
      </template>
      <price-view
        class="font-weight-bold"
        :amount="-bill.club"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>

    <s-value-dashed v-if="bill.discount_code" class="my-1">
      <template v-slot:label>
        <img
          src="../../assets/icons/discount-code.svg"
          width="20"
          height="20"
          class="me-1"
        />
        {{ $t("global.commons.discount_code") }}
      </template>
      <price-view
        class="font-weight-bold"
        :amount="-bill.discount_code"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>

    <s-value-dashed v-if="bill.coupon" class="my-1">
      <template v-slot:label>
        <img
          src="../../assets/icons/coupon.svg"
          width="20"
          height="20"
          class="me-1"
        />

        {{ $t("global.commons.coupon") }}
      </template>
      <price-view
        class="font-weight-bold"
        :amount="-bill.coupon"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>

    <s-value-dashed v-if="bill.tax" class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.tax") }}
        <v-chip v-if="bill.tax_included" color="success" x-small class="mx-1">{{
          $t("global.commons.tax_included")
        }}</v-chip>
      </template>

      <price-view
        class="font-weight-bold"
        :amount="bill.tax"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>

    <s-value-dashed v-if="bill.delivery_price" class="my-1">
      <template v-slot:label>
        {{ $t("global.commons.delivery") }}
      </template>
      <span v-if="bill.delivery_price===-1" class="font-weight-bold">{{$t("process_center.payment_widget.delivery.not_paid")}}</span>
      <price-view
          v-else
        class="font-weight-bold"
        :amount="bill.delivery_price"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>

    <s-value-dashed v-if="bill.pay_by_giftcards" class="my-1">
      <template v-slot:label>
        <img
          src="../../assets/icons/gift-card.svg"
          width="20"
          height="20"
          class="me-1"
        />

        {{ $t("global.commons.gift_card") }}
      </template>

      <price-view
        class="font-weight-bold"
        :amount="-bill.pay_by_giftcards"
        :currency="bill.currency"
      ></price-view>
    </s-value-dashed>
  </div>
</template>

<script>
import SValueDashed from "@components/ui/text/SValueDashed.vue";
export default {
  name: "SPosBillView",
  components: { SValueDashed },
  props: {
    bill: {
      type: Object,
      require: true,
    },
  },
};
</script>

<style scoped></style>
