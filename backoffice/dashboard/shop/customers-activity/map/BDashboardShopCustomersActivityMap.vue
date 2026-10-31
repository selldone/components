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
  <div
    v-intersect.once="onIntersect"
    class="b-customer-activity-map text-start"
    :class="{ 'b-customer-activity-map--modern': modern }"
  >
    <label v-if="modern" class="b-customer-activity-map__filter">
      <img
        :src="keys.find((item) => item.code === key_selected)?.image"
        width="18"
        height="18"
        alt=""
      />
      <select
        v-model="key_selected"
        :aria-label="$t('shop_crm_report.country_activity')"
      >
        <option v-for="item in keys" :key="item.code" :value="item.code">
          {{ activityLabel(item) }}
        </option>
      </select>
    </label>
    <v-btn-toggle
      v-else
      v-model="key_selected"
      class="mb-3"
      rounded="xl"
      style="height: 64px"
      variant="flat"
    >
      <v-btn
        v-for="item in keys"
        :key="item.code"
        :title="$t(item.name)"
        :value="item.code"
        size="small"
        stacked
      >
        <img
          :class="{ 'img-grayscale': key_selected !== item.code }"
          :src="item.image"
          class="mx-2"
          width="24px"
        />
        <div class="mt-1 tnt">{{ $t(item.name) }}</div>
      </v-btn>
    </v-btn-toggle>

    <div v-if="modern && fetch_error" class="sd-modern-notice" role="alert">
      <v-icon size="18" aria-hidden="true">error_outline</v-icon>
      <span>{{ $t("shop_crm_report.activity_error") }}</span>
      <v-btn
        class="sd-modern-button"
        variant="text"
        @click="fetchActivityByCountry"
      >
        {{ $t("geo_map.live.retry") }}
      </v-btn>
    </div>
    <div v-else class="b-customer-activity-map__layout">
      <u-map-countries-heatmap
        v-if="!busy"
        :country-data="map_data"
        :high-color="color"
        :class="modern ? 'b-customer-activity-map__plot' : 'mx-2 my-3'"
        :country-stroke-color="modern ? map_colors.stroke : '#ddd'"
        :default-country-fill-color="modern ? map_colors.fill : '#fafafa'"
        has-tooltip
        :low-color="modern ? map_colors.low : '#eee'"
        :style="{ height: modern ? '280px' : '350px' }"
      >
        <template v-slot="{ country }">
          <div v-if="country">
            <div v-for="item in keys" :key="item.code" class="d-flex my-1">
              <small
                ><i
                  :style="{ color: item.color }"
                  class="fas fa-circle fa-xs mx-1"
                ></i>
                {{ activityLabel(item) }}:</small
              >
              <v-spacer></v-spacer>
              <span
                :class="
                  modern ? 'b-customer-activity-map__tooltip-value' : 'h4'
                "
                >{{ numeralFormat(getValue(country, item.code), "0,0") }}</span
              >
            </div>
          </div>
        </template>
      </u-map-countries-heatmap>

      <u-loading-ellipsis
        v-else
        class="ma-auto"
        height="350px"
      ></u-loading-ellipsis>
      <div
        v-if="modern && countries && !busy"
        class="b-customer-activity-map__countries"
      >
        <div class="b-customer-activity-map__row sd-modern-list-header">
          <span>{{ $t("geo_map.live.location") }}</span>
          <span>{{ $t("geo_map.live.share") }}</span>
          <span>{{ $t("shop_crm_report.activity_count") }}</span>
        </div>
        <button
          v-for="country in top_countries"
          :key="country.country_code"
          type="button"
          class="b-customer-activity-map__row sd-modern-clickable-item"
          :aria-pressed="selected_country === country.country_code"
          @click="selected_country = country.country_code"
        >
          <span class="b-customer-activity-map__country"
            ><flag :iso="country.country_code" :squared="false" />{{
              getCountryName(country.country_code)
            }}</span
          >
          <span>{{
            country_total
              ? $n(
                  getValue(country.country_code, key_selected) / country_total,
                  { style: "percent", maximumFractionDigits: 1 },
                )
              : "—"
          }}</span>
          <span>{{
            numeralFormat(
              getValue(country.country_code, key_selected),
              "0.[0]a",
            )
          }}</span>
        </button>
        <p v-if="!countries.length" class="sd-modern-help">
          {{ $t("geo_map.live.empty_events") }}
        </p>
      </div>
    </div>
    <div
      v-if="modern && countries && !fetch_error && !busy"
      class="b-customer-activity-map__detail"
    >
      <label class="b-customer-activity-map__filter">
        <select
          v-model="selected_country"
          :aria-label="$t('shop_crm_report.inspect_country')"
        >
          <option :value="null">
            {{ $t("shop_crm_report.inspect_country") }}
          </option>
          <option
            v-for="country in countries"
            :key="country.country_code"
            :value="country.country_code"
          >
            {{ getCountryName(country.country_code) }}
          </option>
        </select>
      </label>
      <template v-if="selected_country">
        <dl aria-live="polite">
          <div v-for="item in keys" :key="item.code">
            <dt>
              <img :src="item.image" width="16" height="16" alt="" />{{
                activityLabel(item)
              }}
            </dt>
            <dd>{{ $n(getValue(selected_country, item.code)) }}</dd>
          </div>
        </dl>
        <v-btn
          class="sd-modern-icon-button"
          variant="text"
          icon
          :aria-label="$t('geo_map.live.clear_location')"
          @click="selected_country = null"
        >
          <v-icon size="18" aria-hidden="true">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("geo_map.live.clear_location") }}</v-tooltip
          >
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import UMapCountriesHeatmap from "../../../../../ui/map/countries/heatmap/UMapCountriesHeatmap.vue";
import ULoadingEllipsis from "../../../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import { UserActivityKeys } from "@selldone/core-js/enums/user/UserActivityKeys";
import { mix } from "chroma-js";

export default {
  name: "BDashboardShopCustomersActivityMap",
  components: {
    ULoadingEllipsis,
    UMapCountriesHeatmap,
  },
  props: {
    modern: Boolean,
    report: Boolean,
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    countries: null,
    busy: false,
    fetch_error: false,
    selected_country: null,

    key_selected: "products_views",
    keys: UserActivityKeys,
  }),

  computed: {
    country_total() {
      return (
        this.countries?.reduce(
          (total, country) => total + (country[this.key_selected] || 0),
          0,
        ) ?? 0
      );
    },
    top_countries() {
      return [...(this.countries || [])]
        .sort(
          (a, b) => (b[this.key_selected] || 0) - (a[this.key_selected] || 0),
        )
        .slice(0, 6);
    },
    map_colors() {
      const theme = this.$vuetify.theme;
      // Vuetify generates on-surface in the resolved theme, not every raw theme.
      const colors =
        theme.computedThemes?.[theme.name]?.colors || theme.current.colors;
      const surface =
        colors.surface || (theme.current.dark ? "#212121" : "#FFFFFF");
      const onSurface =
        colors["on-surface"] || (theme.current.dark ? "#FFFFFF" : "#000000");
      return {
        stroke: surface,
        fill: mix(surface, onSurface, 0.045).hex(),
        low: mix(surface, onSurface, 0.035).hex(),
      };
    },
    color() {
      return this.keys?.find((item) => item.code === this.key_selected).color;
    },
    map_data() {
      if (!this.countries) return {};

      let out = {};

      this.countries.forEach((item) => {
        out[item.country_code] = item[this.key_selected];
      });
      return out;
    },
  },

  created() {},
  methods: {
    activityLabel(item) {
      return this.$t(
        this.modern && item.code === "buys"
          ? "shop_crm_report.purchase_actions"
          : item.name,
      );
    },
    onIntersect(isIntersecting, entries, observer) {
      if (isIntersecting) {
        this.fetchActivityByCountry();
      }
    },

    fetchActivityByCountry() {
      this.busy = true;
      this.fetch_error = false;

      axios
        .get(window.API.GET_SHOP_STATISTIC_COUNTRY(this.shop.id))
        .then(({ data }) => {
          this.countries = data.countries;
        })
        .catch(() => {
          this.fetch_error = true;
        })
        .finally(() => {
          this.busy = false;
        });
    },

    getValue(country_code, key) {
      const item = this.countries?.find(
        (item) => item.country_code === country_code,
      );
      return item && item[key] ? item[key] : 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-customer-activity-map--modern {
  min-width: 0;
  font-family: inherit;
  font-size: 13px;

  .b-customer-activity-map__filter {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    margin-block-end: 14px;
    width: fit-content;
    max-width: 100%;

    select {
      min-height: 36px;
      max-width: 100%;
      padding-inline-end: 20px;
      color: inherit;
      background: transparent;
      border: 0;
      font: inherit;
    }
    option {
      background: rgb(var(--v-theme-surface));
    }
  }

  .b-customer-activity-map__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    align-items: start;
    gap: 24px;
  }
  .b-customer-activity-map__plot {
    min-width: 0;
    width: 100%;
  }
  .b-customer-activity-map__countries {
    min-width: 0;
  }
  .b-customer-activity-map__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 55px 60px;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    min-height: 44px;
    width: 100%;
    text-align: start;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  button.b-customer-activity-map__row {
    color: inherit;
    font: inherit;
    font-size: 12px;
  }
  .b-customer-activity-map__row > span:nth-child(n + 2) {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }
  .b-customer-activity-map__row[aria-pressed="true"] {
    background: var(--sd-modern-inset);
  }
  .b-customer-activity-map__country {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-wrap: anywhere;
  }
  .b-customer-activity-map__detail {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 18px;
    border-block-start: 1px solid var(--sd-modern-border);
    margin-block-start: 18px;
    padding-block-start: 14px;
    font-size: 12px;
  }
  .b-customer-activity-map__detail .b-customer-activity-map__filter {
    margin: 0;
  }
  .b-customer-activity-map__detail dl {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    flex: 1;
    gap: 8px 16px;
    margin: 0;
  }
  .b-customer-activity-map__detail dl > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .b-customer-activity-map__detail dt {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--sd-modern-muted);
  }
  .b-customer-activity-map__detail dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  .b-customer-activity-map__tooltip-value {
    font-size: 13px;
    font-weight: 400;
  }
  :deep(.map-tooltip) {
    max-width: calc(100vw - 32px);
    padding: 12px 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    filter: none;
    box-shadow: 0 10px 30px rgba(var(--v-theme-on-surface), 0.1);
  }
  :deep(.land:hover) {
    fill: rgb(var(--v-theme-primary)) !important;
    filter: none;
  }

  @media (max-width: 780px) {
    .b-customer-activity-map__layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .b-customer-activity-map__filter select {
      min-height: 44px;
      font-size: 16px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :deep(.land) {
      transition: none;
    }
  }
}
</style>
