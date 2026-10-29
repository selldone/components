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
  <component
    :is="modern ? 'section' : 'div'"
    class="b-dashboard-sessions text-start"
    :class="{
      'sd-modern-widget b-dashboard-sessions--modern': modern,
      'b-dashboard-sessions--report': report,
    }"
  >
    <header v-if="modern && !report" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain" aria-hidden="true">
          <v-icon :icon="summary ? 'devices' : 'public'" size="20" />
        </span>
        <div>
          <div class="d-flex align-center ga-1">
            <h2 class="sd-modern-title-text">
              {{
                $t(
                  summary
                    ? "admin_shop.dashboard.modern.device_summary"
                    : "global.commons.sessions",
                )
              }}
            </h2>
            <v-btn
              class="sd-modern-icon-button sd-modern-info-button"
              icon
              variant="text"
              :aria-label="
                $t(
                  summary
                    ? 'admin_shop.dashboard.modern.device_summary'
                    : 'global.commons.sessions',
                )
              "
            >
              <v-icon icon="info_outline" size="16" aria-hidden="true" />
              <v-tooltip
                activator="parent"
                location="top"
                :max-width="360"
                open-on-click
                open-on-focus
                interactive
                content-class="sd-modern-tooltip text-start"
              >
                {{ $t("admin_shop.dashboard.modern.session_help") }}
              </v-tooltip>
            </v-btn>
          </div>
          <p v-if="!summary" class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.modern.sessions_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <b-sessions-map
      :modern="modern || report"
      :report="report"
      :full-details="fullDetails"
      :summary="summary"
      :shop="shop"
      :url="window.API.GET_SHOP_STATISTIC_SESSIONS(shop.id)"
      dat-key="sessions"
    ></b-sessions-map>
  </component>
</template>

<script lang="ts">
import BSessionsMap from "../../../session/map/BSessionsMap.vue";

export default {
  name: "BDashboardShopSessions",
  components: {
    BSessionsMap,
  },
  props: {
    modern: Boolean,
    report: Boolean,
    summary: Boolean,
    shop: {
      required: true,
      type: Object,
    },
    fullDetails: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({}),

  computed: {},

  watch: {},
  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.b-dashboard-sessions--modern {
  min-width: 0;

  .sd-modern-title-text {
    font-weight: 500;
  }

  :deep(.b-sessions-map .min-width-300) {
    min-width: 140px !important;
  }

  :deep(.b-sessions-map .v-table__wrapper) {
    max-width: 100%;
    overflow-x: auto;
  }

  :deep(.b-sessions-map .v-table__wrapper td) {
    padding-inline: 10px;
    font-size: 13px;
  }

  :deep(.b-sessions-map .apexcharts-text) {
    fill: rgb(var(--v-theme-on-surface));
  }

  :deep(.b-sessions-map .apexcharts-legend-text) {
    color: rgb(var(--v-theme-on-surface)) !important;
  }
}

.b-dashboard-sessions--report.sd-modern-widget {
  padding: 22px;
  font-size: 13px;
}
</style>
