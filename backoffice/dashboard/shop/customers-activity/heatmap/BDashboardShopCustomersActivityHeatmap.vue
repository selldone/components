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
  <div v-intersect.once="onIntersect">
    <v-btn-toggle
      v-model="keys_selected"
      class="mb-3"
      multiple
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
        <img :src="item.image" class="mx-2" width="24px" />
        <div class="mt-1 tnt">
          <v-icon
            :color="keys_selected.includes(item.code) ? item.color : '#333'"
            class="me-1"
            size="10"
            >circle
          </v-icon>
          {{ $t(item.name) }}
        </div>
      </v-btn>
    </v-btn-toggle>
    <apexchart
      v-if="!busy && series"
      :options="chartOptions"
      :series="series"
      height="350"
      type="bubble"
    />
    <u-loading-ellipsis
      v-else
      class="ma-auto"
      height="350px"
    ></u-loading-ellipsis>
  </div>
</template>

<script>
import ULoadingEllipsis from "../../../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import { UserActivityKeys } from "@selldone/core-js/enums/user/UserActivityKeys";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";

export default {
  name: "BDashboardShopCustomersActivityHeatmap",
  components: {
    ULoadingEllipsis,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    timeline: null,
    busy: false,

    keys_selected: ["products_views", "add_baskets", "remove_baskets", "buys"],
    keys: UserActivityKeys,

    days: [
      { day: 0, name: WeekDays.Sunday.name },
      { day: 1, name: WeekDays.Monday.name },
      { day: 2, name: WeekDays.Tuesday.name },
      { day: 3, name: WeekDays.Wednesday.name },
      { day: 4, name: WeekDays.Thursday.name },
      { day: 5, name: WeekDays.Friday.name },
      { day: 6, name: WeekDays.Saturday.name },
    ],
  }),

  computed: {
    colors() {
      let out = [];
      UserActivityKeys.filter((item) =>
        this.keys_selected.includes(item.code),
      ).forEach((item) => out.push(item.color));
      return out;
    },
    chartOptions() {
      return {
        chart: {
          height: 350,
          type: "bubble",
          fontFamily: "var(--font)",
        },
        colors: this.colors,

        legend: {
          show: true,
          position: "bottom",
          horizontalAlign: "center",

          offsetX: 0,
          offsetY: 0,
        },

        dataLabels: {
          enabled: false,
        },
        fill: {
          opacity: 0.8,
        },
        grid: {
          borderColor: "rgba(0,0,0,0.3)",
          strokeDashArray: 7,

          xaxis: {
            lines: {
              show: true,
            },
          },

          padding: {
            top: 10,
            right: 10,
            bottom: 20,
            left: 10,
          },
        },

        xaxis: {
          min: -1,
          max: 24,
          rotate: -45,
          rotateAlways: false,
          type: "numeric",
          forceNiceScale: true,
          tickAmount: 12,
          labels: {
            hideOverlappingLabels: true,
            formatter: (value) => {
              if (value < 0 || value > 23) return "";
              let i = Math.round(value);
              return (i % 12 || 12) + (i < 12 ? "AM" : "PM");
            },

            offsetX: 0,
            offsetY: 0,
          },
        },

        yaxis: {
          type: "numeric",
          reversed: true,
          min: 0,
          max: 6,
          tickAmount: 7,
          decimalsInFloat: 0,
          floating: false,
          forceNiceScale: true,
          labels: {
            formatter: (value) => {
              value = Math.round(value);
              return this.days[value] ? this.$t(this.days[value].name) : value;
            },
          },
        },
      };
    },
    series() {
      if (!this.timeline) return null;

      let out = [];
      UserActivityKeys.filter((item) =>
        this.keys_selected.includes(item.code),
      ).forEach((item) => {
        out.push({
          name: this.$t(item.name),
          data: this.getDataSeries(item.code),
        });
      });

      return out;
    },
  },

  created() {},
  methods: {
    getDataSeries(key) {
      let series = [];
      this.days.forEach((item_day) => {
        let i = 0;
        while (i < 24) {
          const item = this.timeline.find(
            (item) => item.day === item_day.day && item.hour === i,
          );
          if (item && item[key]) series.push([item.hour, item.day, item[key]]);

          i++;
        }
      });

      return series;
    },

    onIntersect(isIntersecting) {
      if (isIntersecting) {
        this.fetchActivityTimeline();
      }
    },

    fetchActivityTimeline() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_STATISTIC_TIMELINE(this.shop.id))
        .then(({ data }) => {
          this.timeline = data.timeline;
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
