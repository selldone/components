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
  <div class="position-relative d-flex flex-column">
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
                  {{ numeralFormat(timeSeries.totalOf(type.code), "0,0.[0]a") }}
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
        ></b-session-devices-pie>
      </v-col>
    </v-row>

    <u-time-span
      v-if="!externalFeed"
      v-model:days="days"
      v-model:offset="offset"
      :loading="busy"
      :max-days="90"
      trigger-on-end
      @onChange="fetchShopSessions(offset, days)"
    ></u-time-span>
  </div>
</template>

<script>
import UMapCountriesHeatmap from "../../../ui/map/countries/heatmap/UMapCountriesHeatmap.vue";
import ULoadingEllipsis from "../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import { TimeSeries } from "@selldone/core-js/timeserie/TimeSeries";
import TimeSeriesInlineChart from "../../chart/TimeSeriesInlineChart.vue";
import { DeviceType } from "@selldone/core-js/enums/campaign/DeviceType";
import UTimeSpan from "../../../ui/time/span/UTimeSpan.vue";
import BSessionDevicesPie from "../../session/devices/pie/BSessionDevicesPie.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BSessionsMap",
  components: {
    USmartToggle,
    BSessionDevicesPie,
    UTimeSpan,
    TimeSeriesInlineChart,
    ULoadingEllipsis,
    UMapCountriesHeatmap,
  },
  props: {
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
    types: DeviceType,

    timeSeries: null,

    offset: 0,
    days: 30,

    service_countries: false,

    custom_selected_day: -1,

    play: false,
  }),

  computed: {
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
    this.fetchCountries();

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

<style lang="scss" scoped></style>
