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
  <section v-if="modern" class="s-onboarding-business text-start">
    <p class="s-onboarding-business__description">
      {{ $t("onboarding.modern.business.description") }}
    </p>

    <header class="s-onboarding-business__model">
      <div>
        <span>{{ $t("onboarding.modern.business.current_model") }}</span>
        <h3>{{ shop.model ? $t(`business_model.modern.models.${shop.model}.title`) : $t('global.commons.not_set') }}</h3>
      </div>
      <v-btn
        :to="{ name: 'BPageShopSettingBusinessModel', hash: '#add' }"
        target="_blank"
        rel="noopener noreferrer"
        :active="false"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        variant="text"
      >
        {{ $t("onboarding.modern.business.change_model") }}
        <v-icon end size="16">north_east</v-icon>
      </v-btn>
    </header>

    <business-model-view
      v-if="shop.model"
      :business-model="shop.model"
      :shop="shop"
      modern
      class="s-onboarding-business__flow"
    />

    <footer class="s-onboarding-business__actions">
      <v-btn
        :to="{ name: 'BPageShopSettingBusinessModel', hash: '#add' }"
        target="_blank"
        rel="noopener noreferrer"
        :active="false"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        variant="text"
      >
        <v-icon start size="17">settings</v-icon>
        {{ $t("onboarding.modern.business.manage_model") }}
        <v-icon end size="16">north_east</v-icon>
      </v-btn>
      <span>{{ $t("onboarding.modern.business.review_note") }}</span>
    </footer>
  </section>
  <v-card v-else color="transparent" flat>
    <v-card-text>

      <u-widget-header :title="$t('onboarding.business.step1.title')" icon="work"> </u-widget-header>



      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.business.step1.msg") }}
        </p>

        <v-img
          :src="require('../assets/strategy.svg')"
          class="m-2 imgi"

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

<script lang="ts">
import BusinessModelView from "../../business-model/BusinessModelView.vue";

export default {
  name: "ShopOnboardingSetupBusinessTab",
  components: { BusinessModelView },
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

  data: () => ({
    dialog_sample: false,
  }),

  computed: {},

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped>
.s-onboarding-business {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.6;

  &__description { max-width: 66ch; margin: 0; color: var(--sd-modern-muted); }
  &__model {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-block-start: 21px;
    padding-block: 13px;
    border-block: 1px solid var(--sd-modern-border);

    span { color: var(--sd-modern-muted); font-size: 11px; }
    h3 { margin: 3px 0 0; font-size: 14px; font-weight: 500; line-height: 1.45; }
  }
  &__flow {
    :deep(.s-business-model-modern__node) { width: 100%; max-width: 105px; justify-self: center; border-radius: 10px; }
    :deep(.s-business-model-modern__node-title) { font-size: 11px; font-weight: 400; }
    :deep(.s-business-model-modern__steps) { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-block-start: 16px; gap: 12px 20px; }
    :deep(.s-business-model-modern__step-title) { font-weight: 500; }
    :deep(.s-business-model-modern__step-caption) { font-weight: 400; }
  }
  &__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-block-start: 20px;

    span { max-width: 40ch; color: var(--sd-modern-muted); font-size: 11px; }
  }
  @media (max-width: 600px) {
    &__flow :deep(.s-business-model-modern__steps) { grid-template-columns: minmax(0, 1fr); }
  }
}
</style>
