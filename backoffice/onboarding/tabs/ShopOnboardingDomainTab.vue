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
        {{ $t("onboarding.domain.step1.title") }}
      </h2>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.domain.step1.msg") }}
        </p>
        <v-img
          :src="require('../assets/add-domain.svg')"
          class="m-2 imgi"
          contain
        ></v-img>
      </div>

      <h2 class="mt-3 mb-2">
        {{ $t("onboarding.domain.step2.title") }}
      </h2>
      <p class="typo-body">
        {{ $t("onboarding.domain.step2.msg") }}
      </p>
      <h2 class="mt-12 mb-2">
        {{ $t("onboarding.domain.step3.title") }}
      </h2>
      <p class="typo-body">
        {{ $t("onboarding.domain.step3.msg") }}
      </p>

      <v-alert v-if="domains.length" type="success">
        {{ domains[0].domain }}
      </v-alert>

      <template v-else>
        <hr class="mt-12" />
        <b-domain-add :domain="{}" :shop="shop" inline></b-domain-add>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import BDomainAdd from "../../domain/add/BDomainAdd.vue";

export default {
  name: "ShopOnboardingDomainTab",
  components: {
    BDomainAdd,
  },
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

  data: () => ({}),

  computed: {
    domains() {
      return this.shop.domains ? this.shop.domains : [];
    },
  },

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped></style>
