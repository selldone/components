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
    <u-text-value-dashed>
      <template v-slot:label
        >{{ $t("global.commons.payment") }}
        <u-tooltip-tips>Total initial payment.</u-tooltip-tips>
      </template>
      <u-price
        :amount="payment.amount"
        :currency="payment.currency"
        large
      ></u-price>
    </u-text-value-dashed>

    <u-text-value-dashed
      v-for="(reversal_item, i) in payment.reversal_detail"
      :key="i"
    >
      <template v-slot:label
        >{{
          reversal_item.reason
            ? reversal_item.reason.limitWords(3)
            : $t("global.actions.reverse_fund")
        }}

        <u-tooltip-tips v-if="reversal_item.reason"
          >{{ reversal_item.reason }}
        </u-tooltip-tips>
      </template>

      <v-avatar
        v-if="reversal_item.user_id"
        :size="24"
        class="avatar-gradient -thin -staff me-2"
      >
        <v-img :src="getUserAvatar(reversal_item.user_id)" />
      </v-avatar>

      <u-price
        :amount="-reversal_item.amount"
        :currency="reversal_item.currency"
      ></u-price>
    </u-text-value-dashed>
  </div>
</template>

<script lang="ts">
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";

export default {
  name: "BVendorPayoutHistory",
  components: { UTextValueDashed },
  props: {
    payment: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped></style>
