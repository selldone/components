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
  <div :class="{ blurred: busy }" class="blur-animate">
    <v-btn
      v-if="statistic?.products > 0"
      :to="{
        name: 'BPageShopProductsList',
        query: { search: 'tax:' + profile.name },
      }"
      class="mx-2 tnt"
      color="primary"
      target="_blank"
      title="Show products with this tax profile."
      variant="text"
    >
      <v-icon start>inventory</v-icon>

      <b class="me-2">{{ numeralFormat(statistic?.products, "0,0") }}🞬 </b>
      {{ $t("global.commons.products") }}

      <v-icon end size="small">open_in_new</v-icon>
    </v-btn>
    <small v-else class="mx-2">
      <v-icon class="me-1" size="small">inventory</v-icon>
      {{ $t("global.commons.products") }}:
      {{ $t("global.commons.empty") }}!</small
    >
  </div>
</template>

<script lang="ts">

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BTaxProfileReport",
  mixins: [],
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
