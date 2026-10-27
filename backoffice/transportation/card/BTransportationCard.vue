<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <section v-if="modern" class="b-transportation-card b-transportation-card--modern text-start">
    <header class="b-transportation-card__header">
      <v-avatar
        class="b-transportation-card__avatar hover-scale-small"
        :class="{ 'img-grayscale': !transportation.enable }"
        size="40"
        rounded="lg"
      >
        <v-img
          :src="transportation.logo ? getShopImagePath(transportation.logo) : transportationObj.icon"
          alt=""
        >
          <template #error><v-img :src="transportationObj.icon" alt="" /></template>
        </v-img>
      </v-avatar>
      <div class="b-transportation-card__identity">
        <h3 class="b-transportation-card__title">
          {{ $t(transportationObj.name) }}
        </h3>
        <p v-if="transportation.title" class="b-transportation-card__label">{{ transportation.title }}</p>
        <div class="b-transportation-card__states">
          <span class="sd-modern-status sd-modern-status--plain">
            <span class="sd-modern-status__dot b-transportation-card__dot" :class="{ 'b-transportation-card__dot--inactive': !transportation.enable }" aria-hidden="true"></span>
            {{ $t(transportation.enable ? 'global.commons.active' : 'global.commons.inactive') }}
          </span>
          <span v-if="transportationObj.pickup" class="sd-modern-status sd-modern-status--plain">
            <v-icon size="14" aria-hidden="true">add_location_alt</v-icon>{{ $t('global.commons.pickup') }}
          </span>
          <span v-if="transportation?.marketplace" class="sd-modern-status sd-modern-status--plain">
            {{ $t('global.commons.marketplace') }}
          </span>
        </div>
      </div>
      <v-btn
        :to="{ name: 'BPageTransportationDashboard', params: { transportation_id: transportation.id } }"
        class="sd-modern-button sd-modern-button--small b-transportation-card__manage"
        variant="outlined"
      >
        {{ $t('global.commons.manage') }}
        <v-icon size="16" end>{{ $t('icons.chevron_next') }}</v-icon>
      </v-btn>
    </header>
    <p class="b-transportation-card__description">{{ $t(transportationObj.description) }}</p>
    <b-transportation-overview
      :modern="modern"
      :outlined="outlined"
      :shop="shop"
      :transportation="transportation"
      class="b-transportation-card__overview"
      :class="{ 'img-grayscale': !transportation.enable }"
    />
  </section>
  <div v-else class="c-container -force-rounded ma-1 pa-3 min-width-100">
    <s-widget
      :class="{ 'widget-hover pp': true }"
      :title="
        `
<span class='circle ${
          transportation.enable ? 'bg-success' : 'bg-red'
        } me-1' style='font-size: 6px;'></span>
<span>${$t(transportationObj.name)}</span>` +
        (transportation.title
          ? ` <span class='typo-body'> / ${transportation.title}</span>`
          : '') +
        (transportation.enable
          ? ''
          : ` <span class='typo-body'> / ${$t('global.commons.disable')}</span>`)
      "
      class="text-start elevation-3"
      color="#fff"
      custom-header
      @click="
        $router.push({
          name: 'BPageTransportationDashboard',
          params: { transportation_id: transportation.id },
        })
      "
    >
      <u-ribbon v-if="transportationObj.pickup" green>
        <v-icon size="small">add_location_alt</v-icon>
        {{ $t("global.commons.pickup") }}
      </u-ribbon>

      <p>
        <v-chip
          v-if="transportation?.marketplace"
          color="#6548cc"
          label
          size="x-small"
          class="me-1"
          variant="flat"
        >
          {{ $t("global.commons.marketplace") }}
        </v-chip>
        {{ $t(transportationObj.description) }}
      </p>

      <b-transportation-overview
        :outlined="outlined"
        :shop="shop"
        :transportation="transportation"
        :class="{ 'img-grayscale': !transportation.enable }"
      >
      </b-transportation-overview>
    </s-widget>
  </div>
</template>

<script lang="ts">
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";

import BTransportationOverview from "../../transportation/overview/BTransportationOverview.vue";
import URibbon from "../../../ui/ribbon/URibbon.vue";

export default {
  name: "BTransportationCard",
  components: {
    URibbon,
    BTransportationOverview,
  },
  props: {
    shop: { require: true },
    transportation: { require: true },
    outlined: { type: Boolean, default: false },
    modern: { type: Boolean, default: false },
  },

  data() {
    return {};
  },

  computed: {
    transportationObj() {
      return ShopTransportations[this.transportation.type];
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.b-transportation-card--modern {
  min-width: 0;
  height: 100%;
  padding: 22px 24px;
  border-block-end: 1px solid var(--sd-modern-border);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.45;

  .b-transportation-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .b-transportation-card__avatar { flex: 0 0 40px; }

  .b-transportation-card__identity { flex: 1; min-width: 0; overflow-wrap: anywhere; }

  .b-transportation-card__title {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }

  .b-transportation-card__label {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
  }

  .b-transportation-card__states {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 12px;
    margin-block-start: 5px;

    .sd-modern-status { gap: 5px; font-size: 11px; font-weight: 400; }
  }

  .b-transportation-card__dot { background: rgb(var(--v-theme-success)); }

  .b-transportation-card__dot--inactive {
    background: var(--sd-modern-muted);
  }

  .b-transportation-card__description {
    margin: 12px 0 18px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 1.45;
  }

  .b-transportation-card__manage {
    flex: 0 0 auto;
    border-color: var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
}

@media (max-width: 599px) {
  .b-transportation-card--modern { padding: 20px 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .b-transportation-card--modern .b-transportation-card__avatar {
    transform: none !important;
    transition: none;
  }
}
</style>
