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
  <div class="blur-animate" :class="{ blurred: busy }">
    <v-btn
      v-if="statistic?.products > 0"
      color="primary"
      class="mx-2 tnt"
      variant="text"
      :to="{
        name: 'BPageShopProductsList',
        query: { search: 'tax:' + profile.name },
      }"
      target="_blank"
      title="Show products with this tax profile."
    >
      <v-icon start>inventory</v-icon>

      <b class="me-2">{{ numeralFormat(statistic?.products, "0,0") }}🞬 </b>
      {{ $t("global.commons.products") }}

      <v-icon size="small" end>open_in_new</v-icon>
    </v-btn>
    <small v-else class="mx-2">
      <v-icon size="small" class="me-1">inventory</v-icon>
      {{ $t("global.commons.products") }}:
      {{ $t("global.commons.empty") }}!</small
    >
  </div>
</template>

<script>
export default {
  name: "TaxProfileReport",
  props: {
    shop: {
      required: true,
      type: Object,
    },

    profile: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    busy: false,
    statistic: null,
  }),

  computed: {},

  watch: {
    profile() {
      this.fetchTaxProfileReport();
    },
  },

  created() {
    this.fetchTaxProfileReport();
  },

  methods: {
    //█████████████████████ Get Tax Profile Report █████████████████████

    fetchTaxProfileReport() {
      this.busy = true;

      axios
        .get(
          window.API.GET_SHOP_TAX_PROFILE_STATISTIC(
            this.shop.id,
            this.profile.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.statistic = data.statistic;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
