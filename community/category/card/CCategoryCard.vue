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
  <div class="c-container -force-rounded pa-2 pa-sm-3 d-flex flex-column">
    <v-card
      :to="{
        name: window.$community.routes.COMMUNITY_CATEGORY_PAGE,
        params: {
          category_id: category.id,
          category_slug: slugify(category.title),
        },
      }"
      class="c-widget -hover flex-grow-1"
    >
      <!-- Image -->
      <c-image-view
        :aspect-ratio="1"
        :src="getShopImagePath(category.image)"
        width="100%"
      >
        <v-fade-transition>
          <v-row v-if="showReport && timeSeries" class="sta">
            <!-- Value charts -->

            <v-col v-for="item in keys" :key="item.key" cols="6">
              <span class="text-subtitle-2"> {{ item.title }}</span>
              <small class="d-block">in last 7 days</small>

              <h3>{{ timeSeries.totalOf(item.key) }}</h3>
              <trend-sparkline
                :value="timeSeries.arrayOfForceInterpolateZero(item.key)"
                fill
                height="32"
              ></trend-sparkline>
            </v-col>

            <!-- background chart -->
            <u-sparkline
              :height="150"
              :line-width="2"
              :padding="0"
              :smooth="20"
              :value="timeSeries.arrayOfForceInterpolateZero('impressions')"
              auto-draw
              class="fadeIn delay_500"
              color="#29323977"
              fill
              stroke-linecap="round"
              style="
                position: absolute;
                left: 0;
                bottom: 0;
                z-index: -1;
                width: 100%;
              "
            >
            </u-sparkline>
          </v-row>
        </v-fade-transition>
      </c-image-view>

      <div
        v-if="todayData && todayData.topics"
        class="absolute-bottom-end text-subtitle-2 text-success"
        title="New topics today"
      >
        <v-icon color="#0ba360" size="x-small">lens</v-icon>
        {{ todayData.topics }}
      </div>

      <div
        v-if="todayData && todayData.comments"
        class="absolute-bottom-center text-subtitle-2 text-blue"
        title="New comments today"
      >
        <v-icon color="blue" size="x-small">comment</v-icon>
        {{ todayData.comments }}
      </div>

      <div
        v-if="todayData && todayData.posts"
        class="absolute-bottom-start text-subtitle-2 text-red"
        title="New posts today"
      >
        <v-icon color="red" size="x-small">person</v-icon>
        {{ todayData.posts }}
      </div>

      <v-card-title>{{ category.title }}</v-card-title>
      <v-card-subtitle style="min-height: 60px"
        >{{ category.desc }}
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script lang="ts">
import CImageView from "../../../community/image/view/CImageView.vue";
import TrendSparkline from "../../../community/statistics/TrendSparkline.vue";
import { TimeSeries } from "@selldone/core-js/timeserie/TimeSeries.ts";
import USparkline from "../../../ui/chart/sparkline/USparkline.vue";

export default {
  name: "CCategoryCard",
  components: { USparkline, TrendSparkline, CImageView },
  props: {
    category: {
      required: true,
      type: Object,
    },
    showReport: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      timeSeries: null,

      keys: [
        { key: "topics", title: this.$t("community.commons.topics") },
        { key: "posts", title: this.$t("community.commons.posts") },
        { key: "comments", title: this.$t("community.commons.comments") },
        { key: "reactions", title: this.$t("community.commons.reactions") },
      ],
    };
  },

  computed: {
    todayData() {
      return this.timeSeries && this.timeSeries.todayData();
    },
  },

  created() {
    if (this.category.data)
      this.timeSeries = new TimeSeries(this.category.data, null, 0, 7);
  },
};
</script>

<style lang="scss" scoped>
.sta {
  width: 100%;
  background: #ffffffd9;
  height: 100%;
  margin: 0;

  small {
    font-weight: 400;
  }
}
</style>
