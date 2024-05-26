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
      <s-widget-header
        :title="$t('onboarding.domain.buy_domain_step.title')"
        icon="domain_add"
      ></s-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.domain.buy_domain_step.msg") }}
        </p>
        <v-img
          :src="require('../assets/add-domain.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>

      <s-widget-header
        :title="$t('onboarding.domain.set_dns_step.title')"
        icon="dns"
        class="mt-5"
      ></s-widget-header>

      <p class="typo-body">
        {{ $t("onboarding.domain.set_dns_step.msg") }}
      </p>

      <v-alert v-if="domains.length" type="success" class="my-5">
        {{ domains[0].domain }}
      </v-alert>

      <template v-else>
        <hr class="my-5" />
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
