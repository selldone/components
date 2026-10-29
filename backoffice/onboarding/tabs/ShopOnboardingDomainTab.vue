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
  <section v-if="modern" class="s-onboarding-domain text-start">
    <p class="s-onboarding-domain__description">
      {{ $t("onboarding.modern.domain.description") }}
    </p>

    <div v-if="domains.length" class="s-onboarding-domain__domains">
      <div v-for="domain in domains" :key="domain.id || domain.domain" class="s-onboarding-domain__domain">
        <div>
          <v-icon size="18" aria-hidden="true">public</v-icon>
          <span dir="ltr">{{ domain.domain }}</span>
        </div>
        <span class="sd-modern-status sd-modern-status--plain">
          <span class="sd-modern-status__dot" :class="{ 's-onboarding-domain__dot--active': domain.enable }" />
          {{ $t(domain.enable ? 'global.active' : 'global.inactive') }}
        </span>
      </div>
      <v-btn
        :to="{ name: 'BPageShopSettingDomain' }"
        target="_blank"
        rel="noopener noreferrer"
        :active="false"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        variant="text"
      >
        {{ $t("onboarding.modern.domain.manage_domains") }}
        <v-icon end size="16">north_east</v-icon>
      </v-btn>
    </div>

    <div class="s-onboarding-domain__guidance">
      <h3>{{ $t("onboarding.modern.domain.dns_title") }}</h3>
      <p>{{ $t("onboarding.modern.domain.dns_description") }}</p>
    </div>

    <b-domain-add
      v-if="!domains.length"
      :domain="{}"
      :shop="shop"
      class="s-onboarding-domain__form"
      inline
    />

    <aside class="s-onboarding-domain__note">
      <v-icon size="17" aria-hidden="true">info_outline</v-icon>
      <p>{{ $t("onboarding.modern.domain.purchase_note") }}</p>
    </aside>
  </section>
  <v-card v-else color="transparent" flat>
    <v-card-text>
      <u-widget-header
        :title="$t('onboarding.domain.buy_domain_step.title')"
        icon="domain_add"
      ></u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.domain.buy_domain_step.msg") }}
        </p>
        <v-img
          :src="require('../assets/add-domain.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>

      <u-widget-header
        :title="$t('onboarding.domain.set_dns_step.title')"
        icon="dns"
        class="mt-5"
      ></u-widget-header>

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

<script lang="ts">
import BDomainAdd from "../../domain/add/BDomainAdd.vue";

export default {
  name: "ShopOnboardingDomainTab",
  components: {
    BDomainAdd,
  },
  props: {
    modern: { type: Boolean, default: false },
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

<style lang="scss" scoped>
.s-onboarding-domain {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.6;

  &__description { max-width: 66ch; margin: 0; color: var(--sd-modern-muted); }
  &__domains { margin-block-start: 18px; }
  &__domain {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    padding-block: 14px;
    border-block-start: 1px solid var(--sd-modern-border);

    > div { display: flex; align-items: center; gap: 8px; min-width: 0; }
    > div > span { overflow-wrap: anywhere; }
    .v-icon { color: var(--sd-modern-muted); }
  }
  &__dot--active { background: rgb(var(--v-theme-success)); }
  &__guidance {
    margin-block: 20px 14px;
    h3 { margin: 0 0 6px; font-size: 14px; font-weight: 500; line-height: 1.45; }
    p { margin: 0; color: var(--sd-modern-muted); }
  }
  &__note {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-start: 18px;
    color: var(--sd-modern-muted);
    font-size: 12px;

    .v-icon { flex: 0 0 17px; margin-block-start: 2px; }
    p { margin: 0; }
  }
  &__form {
    color: inherit;
    font: inherit;

    :deep(> .v-card-text) { padding: 0; font: inherit; }
    :deep(> .v-card-text > .text-black) { color: inherit !important; }
    :deep(.widget-box) { max-width: none; padding: 16px 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; }
    :deep(.s--widget-header), :deep(.widget-box h2) { font-size: 14px; font-weight: 500; line-height: 1.45; }
    :deep(.s--widget-header .--icon), :deep(.widget-box > h2 > .v-icon) { width: 18px; height: 18px; font-size: 18px !important; }
    :deep(.widget-box p) { font-size: 13px; line-height: 1.6; }
    :deep(.v-list-subheader) { padding-inline: 0; font-size: 13px; font-weight: 400; line-height: 1.6; }
    :deep(.v-alert) { background: var(--sd-modern-inset) !important; color: rgb(var(--v-theme-on-surface)) !important; font-size: 13px; font-weight: 400 !important; }
    :deep(.v-field__input) { font-family: inherit; font-size: 14px; font-weight: 400; }
    :deep(> .v-card-actions) { padding: 0; }
    :deep(> .v-card-actions > .widget-buttons) { justify-content: flex-start; }
    :deep(> .v-card-actions > .widget-buttons > .v-btn) {
      --v-btn-height: 36px;
      min-height: 36px;
      height: auto;
      padding: 7px 12px;
      border-radius: 8px;
      box-shadow: none;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0;
      text-transform: none;
    }
    :deep(> .v-card-actions > .widget-buttons > .v-btn > .v-btn__content) { font: inherit; letter-spacing: inherit; }
    :deep(> .v-card-actions > .widget-buttons > .v-btn .v-icon) { font-size: 18px; }
    @media (max-width: 600px), (pointer: coarse) {
      :deep(> .v-card-actions > .widget-buttons > .v-btn) { --v-btn-height: 44px; min-height: 44px; }
      :deep(.v-field__input) { font-size: 16px; }
    }
  }
}
</style>
