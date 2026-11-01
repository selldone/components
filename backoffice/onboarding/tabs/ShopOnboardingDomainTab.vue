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
    <div v-if="!domains.length" class="s-onboarding-domain__intro">
      <div>
        <h4>{{ $t("onboarding.modern.domain.empty_title") }}</h4>
        <p class="s-onboarding-domain__description">
          {{ $t("onboarding.modern.domain.empty_description") }}
        </p>
      </div>
      <div class="s-onboarding-domain__flow" role="img" :aria-label="$t('onboarding.modern.domain.flow_label')">
        <div class="s-onboarding-domain__flow-node"><v-icon size="20" aria-hidden="true">language</v-icon></div>
        <span />
        <div class="s-onboarding-domain__flow-node"><v-icon size="20" aria-hidden="true">dns</v-icon></div>
        <span />
        <div class="s-onboarding-domain__flow-node"><v-icon size="20" aria-hidden="true">storefront</v-icon></div>
      </div>
    </div>
    <template v-else>
      <p class="s-onboarding-domain__description">{{ $t("onboarding.modern.domain.description") }}</p>
      <ul class="s-onboarding-domain__domains">
        <li v-for="domain in domains" :key="domain.id || domain.domain" class="s-onboarding-domain__domain">
          <div class="s-onboarding-domain__identity">
            <v-icon size="18" aria-hidden="true">language</v-icon>
            <bdi dir="ltr">{{ domain.domain }}</bdi>
          </div>
          <div class="s-onboarding-domain__statuses">
            <span class="sd-modern-status sd-modern-status--plain">
              <span class="sd-modern-status__dot" :class="domain.enable ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--error'" />
              {{ $t(domain.enable ? 'domains_modern.list.enabled' : 'domains_modern.list.disabled') }}
            </span>
            <span v-if="typeof domain.approved === 'boolean'" class="sd-modern-status sd-modern-status--plain">
              <span class="sd-modern-status__dot" :class="domain.approved ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--warning'" />
              {{ $t(domain.approved ? 'domains_modern.list.verified' : 'domains_modern.list.pending') }}
            </span>
          </div>
        </li>
      </ul>
    </template>

    <div class="s-onboarding-domain__actions">
      <v-dialog
        :model-value="dialog_domain"
        :persistent="domainBusy"
        fullscreen
        scrollable
        transition="dialog-bottom-transition"
        @update:model-value="setDomainDialog"
      >
        <template #activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" class="sd-modern-button" color="primary" variant="flat">
            <v-icon start size="17" aria-hidden="true">add_link</v-icon>
            {{ $t(domains.length ? 'onboarding.modern.domain.connect_another' : 'onboarding.modern.domain.connect_domain') }}
          </v-btn>
        </template>
        <b-domain-add
          v-if="dialog_domain"
          :key="shop.id"
          ref="domainAdd"
          :domain="{}"
          :shop="shop"
          modern
          @add="onDomainAdded"
          @click:close="dialog_domain = false"
        />
      </v-dialog>
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

    <aside class="s-onboarding-domain__note">
      <v-icon size="17" aria-hidden="true">info_outline</v-icon>
      <p>{{ $t(domains.length ? 'onboarding.modern.domain.ownership_note' : 'onboarding.modern.domain.purchase_note') }}</p>
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
import { shallowRef } from "vue";
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

  setup() {
    return { domainAdd: shallowRef(null) };
  },

  data: () => ({ dialog_domain: false }),

  computed: {
    domains() {
      return this.shop.domains || [];
    },
    domainBusy() {
      return !!this.domainAdd?.busy_add;
    },
  },

  watch: {
    "shop.id"() {
      this.dialog_domain = false;
    },
  },

  methods: {
    onDomainAdded(domain) {
      if (!this.shop.domains) this.shop.domains = [domain];
    },
    setDomainDialog(open) {
      if (!open && this.domainBusy) return;
      this.dialog_domain = open;
    },
  },
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

  &__intro {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 192px;
    align-items: center;
    gap: 26px;
    h4 { margin: 0 0 8px; font-size: 15px; font-weight: 500; line-height: 24px; }
  }
  &__description { max-width: 46ch; margin: 0; color: var(--sd-modern-muted); }
  &__flow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sd-modern-muted);
    > span { width: 17px; border-block-start: 1px solid var(--sd-modern-border); }
  }
  &__flow-node { display: flex; align-items: center; justify-content: center; flex: 0 0 42px; height: 42px; border: 1px solid var(--sd-modern-border); border-radius: 10px; }
  &__domains { margin: 18px 0 0; padding: 0; list-style: none; }
  &__domain {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    padding-block: 14px;
    border-block-start: 1px solid var(--sd-modern-border);

    bdi { overflow-wrap: anywhere; font-size: 15px; }
    .v-icon { color: var(--sd-modern-muted); }
  }
  &__identity, &__statuses { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 16px; min-width: 0; }
  &__identity { flex-wrap: nowrap; gap: 12px; }
  &__statuses .sd-modern-status { font-size: 12px; }
  &__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-block-start: 21px;
  }
  .s-onboarding-domain__actions .sd-modern-button { min-height: 42px; }
  &__note {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-start: 24px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);

    .v-icon { flex: 0 0 17px; margin-block-start: 2px; }
    p { margin: 0; }
  }
  @media (max-width: 600px) {
    &__intro { grid-template-columns: minmax(0, 1fr); gap: 0; }
    &__flow { display: none; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .s-onboarding-domain__actions .sd-modern-button { min-height: 44px; }
  }
}
</style>
