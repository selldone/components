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
    class="b-sessions-map position-relative d-flex flex-column"
    :class="{
      'b-sessions-map--summary': summary,
      'b-sessions-map--modern': modern,
    }"
  >
    <template v-if="summary">
      <u-loading-ellipsis
        v-if="busy && !timeSeries"
        class="ma-auto"
        style="min-height: 180px"
      />
      <template v-if="timeSeries">
        <div class="b-sessions-map__summary-total">
          <span class="sd-modern-eyebrow">{{
            $t("shop_session_widget.total_sessions")
          }}</span>
          <strong>{{ numeralFormat(total_sessions_map, "0,0.[0]a") }}</strong>
        </div>
        <dl class="b-sessions-map__devices">
          <div
            v-for="type in types"
            :key="type.code"
            class="b-sessions-map__device"
          >
            <dt>
              <v-icon :icon="type.icon" size="17" aria-hidden="true" />
              {{ $t(type.title) }}
            </dt>
            <dd>
              <strong>{{
                numeralFormat(timeSeries.totalOf(type.code), "0,0.[0]a")
              }}</strong>
              <span
                >{{
                  (total_sessions_keys
                    ? (100 * timeSeries.totalOf(type.code)) /
                      total_sessions_keys
                    : 0
                  ).toFixed(1)
                }}%</span
              >
            </dd>
            <div class="b-sessions-map__device-track" aria-hidden="true">
              <span
                :style="{
                  width: `${total_sessions_keys ? (100 * timeSeries.totalOf(type.code)) / total_sessions_keys : 0}%`,
                  backgroundColor: type.color,
                }"
              />
            </div>
          </div>
        </dl>
      </template>
    </template>
    <template v-else-if="modern">
      <u-loading-ellipsis
        v-if="busy && !timeSeries"
        class="ma-auto"
        style="min-height: 260px"
      />
      <template v-if="timeSeries">
        <div class="b-sessions-map__overview">
          <div>
            <span class="sd-modern-label">{{
              $t("shop_session_widget.total_sessions")
            }}</span>
            <strong>{{ numeralFormat(total_sessions_map, "0,0.[0]a") }}</strong>
          </div>
          <div>
            <span class="sd-modern-label">{{
              $t("global.commons.countries")
            }}</span>
            <strong>{{ numeralFormat(countries_count, "0,0") }}</strong>
          </div>
        </div>
        <div class="b-sessions-map__geography" :class="{ disabled: busy }">
          <section class="b-sessions-map__map-panel">
            <header class="b-sessions-map__section-header">
              <h3 class="sd-modern-eyebrow">
                {{ $t("admin_shop.dashboard.modern.session_geography") }}
              </h3>
              <u-smart-toggle
                v-if="shop"
                v-model="service_countries"
                :true-description="$t('global.commons.service_area')"
                class="b-sessions-map__coverage"
                color="success"
                false-gray
                role="switch"
                tabindex="0"
                :aria-checked="service_countries"
                :aria-label="$t('global.commons.service_area')"
                @change="play = false"
                @keydown.space.prevent="
                  service_countries = !service_countries;
                  play = false;
                "
                @keydown.enter.prevent="
                  service_countries = !service_countries;
                  play = false;
                "
              />
            </header>
            <u-map-countries-heatmap
              :country-data="
                service_countries
                  ? map_data_service
                  : ma_data_selected_day || map_data
              "
              :high-color="h_color"
              :low-color="modern_map_colors.low"
              :country-stroke-color="modern_map_colors.stroke"
              :default-country-fill-color="modern_map_colors.empty"
              has-tooltip
              class="b-sessions-map__world"
            >
              <template v-slot="{ country }">
                <slot :country="country" />
                <div v-if="country" class="text-start">
                  <p class="mb-1">
                    {{ $t("global.commons.sessions") }}:
                    <strong>{{
                      numeralFormat(getCountrySessions(country), "0,0.[0]a")
                    }}</strong>
                  </p>
                  <time-series-inline-chart
                    v-if="fullDetails"
                    :colors="['#1976D2']"
                    :days="days"
                    :height="30"
                    :keys="[country]"
                    :offset_day="offset"
                    :time-series="timeSeries"
                    :value-titles="[getCountryName(country)]"
                    flat-color
                    type="line"
                  />
                </div>
              </template>
            </u-map-countries-heatmap>
            <div v-if="fullDetails" class="b-sessions-map__playback">
              <v-slider
                v-model="custom_selected_day"
                :max="timeSeries.days"
                :min="-1"
                :readonly="play"
                :aria-label="$t('admin_shop.dashboard.modern.session_map_day')"
                :messages="
                  ma_data_selected_day
                    ? getLocalDateString(ma_data_selected_day.created_at)
                    : $t('global.commons.all')
                "
                color="on-surface"
                density="compact"
                step="1"
                @update:model-value="service_countries = false"
              >
                <template v-slot:prepend>
                  <v-btn
                    icon
                    variant="text"
                    class="sd-modern-icon-button"
                    :aria-pressed="play"
                    :aria-label="
                      $t(
                        play
                          ? 'admin_shop.dashboard.modern.session_pause'
                          : 'admin_shop.dashboard.modern.session_play',
                      )
                    "
                    @click="play = !play"
                  >
                    <v-icon :icon="play ? 'pause' : 'play_arrow'" size="20" />
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-on-focus
                      content-class="sd-modern-tooltip text-start"
                    >
                      {{
                        $t(
                          play
                            ? "admin_shop.dashboard.modern.session_pause"
                            : "admin_shop.dashboard.modern.session_play",
                        )
                      }}
                    </v-tooltip>
                  </v-btn>
                </template>
              </v-slider>
            </div>
          </section>
          <section class="b-sessions-map__country-panel">
            <header class="b-sessions-map__section-header">
              <h3 class="sd-modern-eyebrow">
                {{ $t("admin_shop.dashboard.modern.session_top_countries") }}
              </h3>
              <span class="sd-modern-label">{{
                $t("admin_shop.dashboard.modern.session_period")
              }}</span>
            </header>
            <div
              class="b-sessions-map__country-head"
              :class="{ 'b-sessions-map__country-head--compact': !fullDetails }"
              aria-hidden="true"
            >
              <span>{{ $t("global.commons.country") }}</span>
              <span v-if="fullDetails">{{
                $t("admin_shop.dashboard.modern.session_daily_trend")
              }}</span>
              <span>{{ $t("admin_shop.dashboard.modern.session_share") }}</span>
              <span>{{ $t("global.commons.sessions") }}</span>
            </div>
            <div
              v-for="item in top_countries"
              :key="item[0]"
              class="b-sessions-map__country"
              :class="{ 'b-sessions-map__country--compact': !fullDetails }"
            >
              <div class="b-sessions-map__identity">
                <flag v-if="item[0]" :iso="item[0]" :squared="false" />
                <div>
                  <span>{{ getCountryName(item[0]) }}</span
                  ><small dir="ltr">{{ item[0] }}</small>
                </div>
              </div>
              <time-series-inline-chart
                v-if="fullDetails"
                :colors="['#1976D2']"
                :days="days"
                :height="30"
                :keys="[item[0]]"
                :offset_day="offset"
                :time-series="timeSeries"
                :value-titles="[getCountryName(item[0])]"
                class="b-sessions-map__country-trend"
                dir="ltr"
                flat-color
                type="line"
              />
              <span class="b-sessions-map__share"
                >{{
                  total_sessions_map
                    ? Number((100 * item[1]) / total_sessions_map).toFixed(2)
                    : "0.00"
                }}%</span
              >
              <strong class="b-sessions-map__count">{{
                numeralFormat(item[1], "0,0.[0]a")
              }}</strong>
            </div>
            <p v-if="!top_countries.length" class="sd-modern-empty-state">
              {{ $t("global.commons.no_data") }}
            </p>
          </section>
        </div>
        <section
          class="b-sessions-map__device-section"
          :class="{ disabled: busy }"
        >
          <header class="b-sessions-map__section-header">
            <h3 class="sd-modern-eyebrow">
              {{ $t("admin_shop.dashboard.modern.session_devices") }}
            </h3>
            <span class="sd-modern-label">{{
              $t("admin_shop.dashboard.modern.session_period")
            }}</span>
          </header>
          <div class="b-sessions-map__device-layout">
            <div>
              <div
                class="b-sessions-map__country-head"
                :class="{
                  'b-sessions-map__country-head--compact': !fullDetails,
                }"
                aria-hidden="true"
              >
                <span>{{
                  $t("admin_shop.dashboard.modern.session_devices")
                }}</span>
                <span v-if="fullDetails">{{
                  $t("admin_shop.dashboard.modern.session_daily_trend")
                }}</span>
                <span>{{
                  $t("admin_shop.dashboard.modern.session_share")
                }}</span>
                <span>{{ $t("global.commons.sessions") }}</span>
              </div>
              <div
                v-for="type in types"
                :key="type.code"
                class="b-sessions-map__device-row"
                :class="{ 'b-sessions-map__device-row--compact': !fullDetails }"
              >
                <span class="b-sessions-map__identity"
                  ><v-icon :icon="type.icon" size="18" aria-hidden="true" />{{
                    $t(type.title)
                  }}</span
                >
                <time-series-inline-chart
                  v-if="fullDetails"
                  :chart-id="`sessions_device_${type.code}`"
                  :colors="[type.color]"
                  :days="days"
                  :height="40"
                  :keys="[type.code]"
                  :offset_day="offset"
                  :time-series="timeSeries"
                  :value-titles="[$t(type.title)]"
                  class="b-sessions-map__device-trend"
                  chart-group="sessions-device"
                  dir="ltr"
                  flat-color
                  type="line"
                />
                <span class="b-sessions-map__share"
                  >{{
                    (total_sessions_keys
                      ? (100 * timeSeries.totalOf(type.code)) /
                        total_sessions_keys
                      : 0
                    ).toFixed(2)
                  }}%</span
                >
                <strong class="b-sessions-map__count">{{
                  numeralFormat(timeSeries.totalOf(type.code), "0,0.[0]a")
                }}</strong>
              </div>
            </div>
            <b-session-devices-pie
              :desktop="desktop"
              :full-details="fullDetails"
              :mobile="mobile"
              :tablet="tablet"
              :tick-amount="2"
              modern
              small
              type="polarArea"
              class="b-sessions-map__device-composition"
            />
          </div>
        </section>
      </template>
    </template>
    <template v-else>
      <div v-if="shop" class="absolute-top-start z2 px-2">
        <u-smart-toggle
          v-model="service_countries"
          :true-description="$t('global.commons.service_area')"
          class="m-0"
          color="success"
          false-gray
          @change="play = false"
        >
        </u-smart-toggle>
      </div>
      <u-loading-ellipsis
        v-if="busy && !timeSeries"
        :style="`height: ${fullDetails ? 274 : 200}px`"
        class="ma-auto"
      ></u-loading-ellipsis>

      <v-row v-if="timeSeries" :class="{ disabled: busy }" no-gutters>
        <v-col :lg="fullDetails ? 6 : 12" cols="12">
          <u-map-countries-heatmap
            :country-data="
              service_countries
                ? map_data_service
                : ma_data_selected_day
                  ? ma_data_selected_day
                  : map_data
            "
            :high-color="h_color"
            :style="`height: ${fullDetails ? 250 : 200}px`"
            class="mx-2 my-3"
            country-stroke-color="#ddd"
            default-country-fill-color="#fafafa"
            has-tooltip
            low-color="#eee"
          >
            <template v-slot="{ country }">
              <slot :country="country"></slot>
              <div v-if="timeSeries && country" class="text-start">
                <p>
                  <small>{{ $t("global.commons.sessions") }}:</small>
                  <b class="font-weight-black mx-1">{{
                    numeralFormat(getCountrySessions(country), "0,0.[0]a")
                  }}</b>
                </p>
                <time-series-inline-chart
                  v-if="fullDetails"
                  :colors="['#1976D2']"
                  :days="days"
                  :height="24"
                  :keys="[country]"
                  :offset_day="offset"
                  :time-series="timeSeries"
                  :value-titles="[country]"
                  type="line"
                ></time-series-inline-chart>
              </div>
            </template>
          </u-map-countries-heatmap>

          <v-slider
            v-if="fullDetails"
            v-model="custom_selected_day"
            :max="timeSeries.days"
            :messages="
              ma_data_selected_day
                ? getLocalDateString(ma_data_selected_day.created_at)
                : 'All'
            "
            :min="-1"
            :readonly="play"
            color="blue"
            step="1"
            track-color="#B3E5FC"
            @update:model-value="service_countries = false"
          >
            <template v-slot:prepend>
              <v-btn icon variant="plain" @click="play = !play">
                <v-icon>{{ !play ? "play_arrow" : "pause" }}</v-icon>
              </v-btn>
            </template>
          </v-slider>
        </v-col>

        <v-col :lg="fullDetails ? 6 : 12" cols="12">
          <v-table
            class="bg-transparent"
            density="compact"
            style="min-height: 125px"
          >
            <template v-slot:default>
              <tbody>
                <tr
                  v-for="item in top_countries"
                  :key="item[0]"
                  :title="getCountryName(item[0])"
                >
                  <td class="text-start">
                    <flag v-if="item[0]" :iso="item[0]" :squared="false" />
                  </td>
                  <td class="text-start">
                    <small>{{
                      fullDetails ? item[0] : getCountryName(item[0])
                    }}</small>
                  </td>

                  <td v-if="fullDetails" class="min-width-300">
                    <time-series-inline-chart
                      v-if="timeSeries"
                      :colors="['#1976D2']"
                      :days="days"
                      :height="24"
                      :keys="[item[0]]"
                      :offset_day="offset"
                      :time-series="timeSeries"
                      :value-titles="[item[0]]"
                      class="w-100"
                      type="line"
                    ></time-series-inline-chart>
                  </td>

                  <td class="text-end">
                    <small v-if="total_sessions_map"
                      >{{
                        Number((100 * item[1]) / total_sessions_map).toFixed(2)
                      }}%</small
                    >
                  </td>

                  <td class="text-end font-weight-bold">
                    {{ numeralFormat(item[1], "0,0.[0]a") }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-col>
      </v-row>

      <v-list-subheader
        >{{ $t("shop_session_widget.total_sessions") }}
      </v-list-subheader>
      <h5 class="text-start mx-5">
        {{ numeralFormat(total_sessions_map, "0,0.[0]a") }}
      </h5>

      <v-row dense no-gutters>
        <v-col cols="12" sm="8">
          <v-table
            v-if="timeSeries"
            :density="!fullDetails ? 'compact' : undefined"
            class="bg-transparent"
          >
            <template v-slot:default>
              <tbody>
                <tr v-for="type in types" :key="type.code">
                  <td class="text-start">
                    <i
                      :style="`color: ${type.color}`"
                      class="fas fa-circle fa-xs me-1"
                    ></i>
                    {{ $t(type.title) }}
                  </td>
                  <td class="text-end">
                    <v-icon class="float-start" size="small"
                      >{{ type.icon }}
                    </v-icon>
                  </td>
                  <td class="text-end">
                    <small v-if="total_sessions_keys" class="mx-2">
                      {{
                        (
                          (100 * timeSeries.totalOf(type.code)) /
                          total_sessions_keys
                        ).toFixed(2)
                      }}%</small
                    >
                  </td>
                  <td v-if="fullDetails" class="min-width-300 w-100">
                    <time-series-inline-chart
                      v-if="timeSeries"
                      :chart-id="`sessions_device_${type.code}`"
                      :colors="[type.color]"
                      :days="days"
                      :height="40"
                      :keys="[type.code]"
                      :offset_day="offset"
                      :time-series="timeSeries"
                      :value-titles="[$t(type.title)]"
                      chart-group="sessions-device"
                      type="line"
                    ></time-series-inline-chart>
                  </td>

                  <td class="text-end font-weight-bold">
                    {{
                      numeralFormat(timeSeries.totalOf(type.code), "0,0.[0]a")
                    }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-col>
        <v-col cols="12" sm="4">
          <b-session-devices-pie
            :desktop="desktop"
            :full-details="fullDetails"
            :mobile="mobile"
            :tablet="tablet"
            :tick-amount="2"
            small
            type="polarArea"
          ></b-session-devices-pie>
        </v-col>
      </v-row>
    </template>
    <u-time-span
      v-if="!externalFeed"
      v-model:days="days"
      v-model:offset="offset"
      :loading="busy"
      :max-days="90"
      :color="modern ? 'on-surface' : undefined"
      :class="{ 'b-sessions-map__period': modern && !summary }"
      trigger-on-end
      @onChange="fetchShopSessions(offset, days)"
    ></u-time-span>
  </div>
</template>

<script lang="ts">
import UMapCountriesHeatmap from "../../../ui/map/countries/heatmap/UMapCountriesHeatmap.vue";
import ULoadingEllipsis from "../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import { TimeSeries } from "@selldone/core-js/timeserie/TimeSeries";
import TimeSeriesInlineChart from "../../chart/TimeSeriesInlineChart.vue";
import UTimeSpan from "../../../ui/time/span/UTimeSpan.vue";
import BSessionDevicesPie from "../../session/devices/pie/BSessionDevicesPie.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import { Analytics } from "@selldone/core-js";
import { CountriesResourceHelper } from "@selldone/components-vue/utils/country/CountriesResourceHelper.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { mix } from "chroma-js";

export default {
  name: "BSessionsMap",
  mixins: [DateMixin],

  components: {
    USmartToggle,
    BSessionDevicesPie,
    UTimeSpan,
    TimeSeriesInlineChart,
    ULoadingEllipsis,
    UMapCountriesHeatmap,
  },
  props: {
    modern: Boolean,
    summary: Boolean,
    shop: {
      required: false,
      type: Object,
    },

    //-------- Fetch Mode ------------

    fullDetails: {
      type: Boolean,
      default: false,
    },
    url: {
      required: false,
    },
    datKey: {
      required: false,
    },
    //-------- External Feed ------------
    externalFeed: {
      type: Boolean,
      default: false,
    },
    externalTimeSeries: {},
  },
  data: () => ({
    busy: false,
    types: Analytics.DeviceType,

    timeSeries: null,

    offset: 0,
    days: 30,

    service_countries: false,

    custom_selected_day: -1,

    play: false,
  }),

  computed: {
    countries_count() {
      return Object.keys(this.map_data).filter(
        (key) => key !== "base" && key !== "id" && this.map_data[key] > 0,
      ).length;
    },
    modern_map_colors() {
      const theme = this.$vuetify.theme;
      const colors =
        theme.computedThemes?.[theme.name]?.colors || theme.current.colors;
      const surface =
        colors.surface || (theme.current.dark ? "#22242a" : "#ffffff");
      const onSurface =
        colors["on-surface"] || (theme.current.dark ? "#f1f2f6" : "#24272e");
      return {
        low: mix(surface, onSurface, 0.045).hex(),
        empty: mix(surface, onSurface, 0.035).hex(),
        stroke: mix(surface, onSurface, 0.12).hex(),
      };
    },
    desktop() {
      if (!this.timeSeries) return 0;
      return this.timeSeries.totalOf("desktop");
    },
    tablet() {
      if (!this.timeSeries) return 0;
      return this.timeSeries.totalOf("tablet");
    },
    mobile() {
      if (!this.timeSeries) return 0;
      return this.timeSeries.totalOf("mobile");
    },

    h_color() {
      return this.service_countries ? "#388E3C" : "#1976D2";
    },

    total_sessions_map() {
      let out = 0;
      const values = Object.values(this.map_data);
      values.forEach((item) => {
        out += item;
      });

      return out;
    },

    total_sessions_keys() {
      if (!this.timeSeries) return 0;

      return this.desktop + this.tablet + this.mobile;
    },
    map_data_service() {
      let out = { base: 0 };

      if (!this.shop) return out;

      const countries = this.shop.countries
        ? this.shop.countries
        : this.$store.getters.getCountries;

      if (this.shop.countries) {
        this.shop.countries.forEach((item) => {
          out[item] = 100;
        });
      } else {
        this.$store.getters.getCountries.forEach((item) => {
          out[item.alpha2] = 100;
        });
      }

      return out;
    },

    ma_data_selected_day() {
      if (this.custom_selected_day >= 0) {
        const item = this.timeSeries.findDataOnDay(
          this.timeSeries.offset + this.custom_selected_day,
        );
        // console.log('find:',this.custom_selected_day,item)
        return item ? item : { base: 0 };
      }
      return null;
    },

    devices_data() {
      return this.timeSeries?.getTotalAllKeys(["mobile", "tablet", "pc"]);
    },

    map_data() {
      if (!this.timeSeries) return {};

      const sum_array =
        this.timeSeries.getTotalAllKeys(/*[
        "uid",
        "mobile",
        "desktop",
        "tablet",
        "shop_id",
        "created_at",
        "updated_at"
      ]*/);

      sum_array.base = 0;

      return sum_array;
    },

    top_countries() {
      let sortable = [];
      for (const item in this.map_data) {
        if (item !== "base") sortable.push([item, this.map_data[item]]);
      }
      let out = sortable.sort(function (a, b) {
        return b[1] - a[1];
      });

      return out.splice(0, this.fullDetails ? 10 : 5);
    },
  },

  watch: {
    play(play) {
      if (play) this.startAnimate();
      else this.stopAnimate();
    },
  },
  created() {
    CountriesResourceHelper.FetchCountries(this);

    if (this.externalFeed) this.timeSeries = this.externalTimeSeries;
  },
  beforeUnmount() {
    this.stopAnimate();
  },
  methods: {
    startAnimate() {
      this.stopAnimate();

      this.interval = setInterval(() => {
        ++this.custom_selected_day;
        if (this.custom_selected_day >= this.timeSeries.days)
          this.custom_selected_day = 0;
      }, 250);
    },
    stopAnimate() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    },

    getCountrySessions(country) {
      return this.map_data[country] ? this.map_data[country] : 0;
    },

    fetchShopSessions(offset, days) {
      this.busy = true;
      this.offset = offset;
      this.days = days;

      axios
        .get(this.url, {
          params: {
            offset: offset,
            days: days,
            details: this.fullDetails,
          },
        })
        .then(({ data }) => {
          if (this.fullDetails)
            this.timeSeries = new TimeSeries(
              data[this.datKey],
              "Sessions",
              offset,
              days,
            );
          else
            this.timeSeries = new TimeSeries(
              [data[this.datKey]],
              "Sessions",
              offset,
              days,
            );
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-sessions-map--modern:not(.b-sessions-map--summary) {
  min-width: 0;

  .b-sessions-map__overview {
    display: flex;
    flex-wrap: wrap;
    gap: 24px 40px;
    margin-block-end: 28px;
  }

  .b-sessions-map__overview strong {
    display: block;
    margin-block-start: 5px;
    font-size: 26px;
    font-weight: 500;
    line-height: 1.35;
    font-variant-numeric: tabular-nums;
  }

  .b-sessions-map__geography {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
    align-items: start;
    gap: 32px;
  }

  .b-sessions-map__map-panel,
  .b-sessions-map__country-panel,
  .b-sessions-map__device-layout > * {
    min-width: 0;
  }

  .b-sessions-map__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-block-end: 14px;
  }

  .b-sessions-map__section-header .sd-modern-label {
    font-size: 12px;
  }

  .b-sessions-map__section-header .sd-modern-eyebrow {
    font-weight: 500;
  }

  .b-sessions-map__coverage {
    margin-block: -8px;
  }

  .b-sessions-map__coverage:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 8px;
  }

  .b-sessions-map__world {
    height: 332px;
    margin: 0;
  }

  .b-sessions-map__world :deep(.map-tooltip) {
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(var(--v-theme-on-surface), 0.12);
    filter: none;
    font-size: 13px;
    text-shadow: none;
  }

  .b-sessions-map__world :deep(.land:hover) {
    fill: rgb(var(--v-theme-primary)) !important;
    filter: none !important;
  }

  .b-sessions-map__world :deep(.map-tooltip strong) {
    font-weight: 500;
  }

  .b-sessions-map__playback {
    margin-block-start: 12px;
  }

  .b-sessions-map__playback :deep(.v-input__details) {
    color: var(--sd-modern-muted);
    font-size: 12px;
    padding-inline: 0;
  }

  .b-sessions-map__country-head,
  .b-sessions-map__country,
  .b-sessions-map__device-row {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(100px, 1fr) 56px 68px;
    align-items: center;
    gap: 12px;
  }

  .b-sessions-map__country-head {
    padding-block-end: 8px;
    border-block-end: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-sessions-map__country-head > :nth-last-child(-n + 2) {
    text-align: end;
  }

  .b-sessions-map__country {
    min-height: 44px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 13px;
  }

  .b-sessions-map__country:last-child,
  .b-sessions-map__device-row:last-child {
    border-block-end: 0;
  }

  .b-sessions-map__identity {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    line-height: 1.45;
  }

  .b-sessions-map__identity > div {
    min-width: 0;
  }

  .b-sessions-map__identity :deep(.fi),
  .b-sessions-map__identity > .v-icon {
    flex: 0 0 20px;
  }

  .b-sessions-map__identity small {
    display: block;
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-sessions-map__country-trend,
  .b-sessions-map__device-trend {
    width: 100%;
    min-width: 0;
  }

  .b-sessions-map__country-trend :deep(.bottom-bar),
  .b-sessions-map__device-trend :deep(.bottom-bar) {
    display: none;
  }

  .b-sessions-map__share,
  .b-sessions-map__count {
    font-variant-numeric: tabular-nums;
    text-align: end;
    white-space: nowrap;
  }

  .b-sessions-map__share {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }

  .b-sessions-map__count {
    font-size: 13px;
    font-weight: 400;
  }

  .b-sessions-map__device-section {
    margin-block-start: 28px;
    padding-block-start: 28px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-sessions-map__device-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(230px, 1fr);
    align-items: center;
    gap: 32px;
  }

  .b-sessions-map__device-row {
    min-height: 44px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 13px;
  }

  .b-sessions-map__country-head--compact,
  .b-sessions-map__country--compact,
  .b-sessions-map__device-row--compact {
    grid-template-columns: minmax(0, 1fr) 56px 68px;
  }

  .b-sessions-map__period {
    margin-block-start: 28px;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  @media (max-width: 1050px) {
    .b-sessions-map__geography {
      grid-template-columns: minmax(0, 1fr);
    }
    .b-sessions-map__world {
      height: 300px;
    }
  }

  @media (max-width: 700px) {
    .b-sessions-map__device-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }
    .b-sessions-map__country-head,
    .b-sessions-map__country,
    .b-sessions-map__device-row {
      grid-template-columns: minmax(0, 1fr) minmax(68px, 0.9fr) 48px 54px;
      gap: 8px;
    }
    .b-sessions-map__country-head--compact,
    .b-sessions-map__country--compact,
    .b-sessions-map__device-row--compact {
      grid-template-columns: minmax(0, 1fr) 48px 54px;
    }
    .b-sessions-map__world {
      height: 230px;
    }
    .b-sessions-map__device-composition {
      width: 100%;
      max-width: 360px;
      margin-inline: auto;
    }
  }

  @media (max-width: 600px) {
    .b-sessions-map__country-head:not(.b-sessions-map__country-head--compact),
    .b-sessions-map__country:not(.b-sessions-map__country--compact),
    .b-sessions-map__device-row:not(.b-sessions-map__device-row--compact) {
      grid-template-columns: minmax(0, 1fr) 48px 54px;
    }

    .b-sessions-map__country-head:not(.b-sessions-map__country-head--compact)
      > :first-child {
      display: none;
    }

    .b-sessions-map__country:not(.b-sessions-map__country--compact),
    .b-sessions-map__device-row:not(.b-sessions-map__device-row--compact) {
      row-gap: 4px;
      padding-block: 10px;
    }

    .b-sessions-map__country:not(.b-sessions-map__country--compact)
      > .b-sessions-map__identity,
    .b-sessions-map__device-row:not(.b-sessions-map__device-row--compact)
      > .b-sessions-map__identity {
      grid-column: 1 / -1;
    }

    .b-sessions-map__identity > div {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 4px 6px;
    }

    .b-sessions-map__identity small {
      margin-block-start: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-sessions-map__world :deep(.land) {
      transition: none !important;
    }
  }
}

.b-sessions-map--summary {
  .b-sessions-map__summary-total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-block-end: 24px;

    strong {
      font-size: 26px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  }

  .b-sessions-map__devices {
    display: grid;
    gap: 20px;
    margin: 0 0 12px;
  }

  .b-sessions-map__device {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 16px;
    font-size: 13px;

    dt {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    dd {
      display: flex;
      gap: 12px;
      margin: 0;
      font-variant-numeric: tabular-nums;

      span {
        min-width: 44px;
        color: var(--sd-modern-muted);
        text-align: end;
      }
    }
  }

  .b-sessions-map__device-track {
    grid-column: 1 / -1;
    height: 4px;
    overflow: hidden;
    border-radius: 4px;
    background: var(--sd-modern-inset);

    span {
      display: block;
      height: 100%;
      border-radius: inherit;
    }
  }
}

.b-sessions-map--modern.b-sessions-map--summary {
  .b-sessions-map__summary-total strong {
    font-weight: 500;
  }

  .b-sessions-map__device dd strong {
    font-weight: 400;
  }
}
</style>
