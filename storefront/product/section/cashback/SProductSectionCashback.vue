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
    v-if="cashback"
    class="s--product-section-cashback px-2 mb-2 flex-grow-0"
  >
    <v-icon class="me-2">wallet</v-icon>
    <b>{{ $t("global.commons.cashback") }} </b>
    <b class="mx-2"
      >%{{ cashback.percent }} {{ cashback.boosted ? "🞫2" : "" }}</b
    >
    <v-chip
      v-if="cashback.boosted"
      label
      size="x-small"
      class="ms-2"
      variant="flat"
      color="#D32F2F"
      prepend-icon="local_fire_department"
    >
      {{ $t("global.commons.boosted") }}
    </v-chip>
  </div>
</template>

<script>
export default {
  name: "SProductSectionCashback",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
    currency: {
      required: true,
    },
    amount: {
      required: true,
    },
  },

  data: () => ({
    cashback: null,
  }),

  created() {
    this.fetchEligibleCashback();
  },

  methods: {
    fetchEligibleCashback() {
      this.busy = true;

      const handleSuccessResponse = ({ cashback }) => {
        this.cashback = cashback;
      };

      window.$storefront.cashback
        .optimize(600)
        .get(this.currency, this.amount)
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)

        .catch((error) => {
          this.showLaravelError(error);
        })

        .then(() => {
          this.busy = false;
        });
    },
  },

  watch: {},
};
</script>

<style lang="scss" scoped>
.s--product-section-cashback {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
