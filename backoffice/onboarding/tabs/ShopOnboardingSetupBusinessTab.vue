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
  <v-card color="transparent" flat>
    <v-card-text>
      <h2 class="mb-2">
        {{ $t("onboarding.business.step1.title") }}
      </h2>
      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.business.step1.msg") }}
        </p>

        <v-img
          :src="require('../assets/strategy.svg')"
          class="m-2 imgi"
          contain
        ></v-img>
      </div>

      <business-model-view
        :business-model="shop.model"
        :shop="shop"
        class="mx-n4 mb-5"
      ></business-model-view>

      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopSettingBusinessModel', hash: '#add' }"
          color="#000"
          dark
          exact
          size="x-large"
        >
          <v-icon class="me-1" size="small">settings</v-icon>
          Change My Business Model
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import BusinessModelView from "../../business-model/BusinessModelView.vue";

export default {
  name: "ShopOnboardingSetupBusinessTab",
  components: { BusinessModelView },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    dialog_sample: false,
  }),

  computed: {},

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped></style>
