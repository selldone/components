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
  <v-container class="text-start">
    <h2 class="fadeIn">{{ title }}</h2>

    <u-time-span
      ref="timespan"
      v-model:days="timeSeries.days"
      v-model:offset="timeSeries.offset"
      :loading="timeSeries.busy"
      :max-days="90"
      class="fadeIn delay_100"
      dense
      style="min-width: 300px; width: 50%"
      trigger-on-end
      @onChange="({ offset, days }) => timeSeries.fetch(offset, days)"
    ></u-time-span>

    <v-row>
      <v-col v-if="isCommunity" class="fadeIn delay_200" cols="6" md="3" sm="4">
        {{ $t("community.commons.categories") }}

        <small class="d-block">{{ $t("community.commons.total") }}</small>
        <h3>{{ numeralFormat(target.total_categories, "0.[0]a") }}</h3>
      </v-col>
      <v-col
        v-if="isCommunity || isCategory"
        class="fadeIn delay_300"
        cols="6"
        md="3"
        sm="4"
      >
        {{ $t("community.commons.topics") }}
        <small class="d-block">{{ $t("community.commons.total") }}</small>

        <h3>{{ numeralFormat(target.total_topics, "0.[0]a") }}</h3>
      </v-col>
      <v-col class="fadeIn delay_400" cols="6" md="3" sm="4">
        {{ $t("community.commons.posts") }}
        <small class="d-block">{{ $t("community.commons.total") }}</small>

        <h3>{{ numeralFormat(target.total_posts, "0.[0]a") }}</h3>
      </v-col>
      <v-col class="fadeIn delay_500" cols="6" md="3" sm="4">
        {{ $t("community.commons.comments") }}
        <small class="d-block">{{ $t("community.commons.total") }}</small>

        <h3>{{ numeralFormat(target.total_comments, "0.[0]a") }}</h3>
      </v-col>

      <v-col cols="12">
        <hr />
      </v-col>

      <v-col
        v-for="(item, i) in keys"
        :key="item.key"
        :style="{ 'animation-delay': 500 + i * 50 + 'ms' }"
        class="fadeIn"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        {{ item.title }}
        <small class="d-block">Total in {{ time_span_string }}</small>
        <h3>{{ timeSeries.totalOf(item.key) }}</h3>
        <trend-sparkline
          :auto-draw="false"
          :reverse="item.reverse"
          :value="timeSeries.arrayOfForceInterpolateZero(item.key)"
          fill
          height="32"
          smooth="10"
        ></trend-sparkline>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <div
          v-intersect.once="
            (isIntersecting) => OnIntersectLoad(isIntersecting, 1)
          "
          class="mh250 border rounded-18px p-2"
        >
          <u-chart-line
            v-if="IsLoaded(1)"
            :colors="['#C2185B', '#03A9F4', '#009688', '#FFC107', '#673AB7']"
            :keys="['likes', 'smiles', 'claps', 'ideas', 'disagrees']"
            :labels-data="[
              '❤ ' + $t('community.post_reaction.LIKE'),
              '😊 ' + $t('community.post_reaction.SMILE'),
              '👏 ' + $t('community.post_reaction.CLAP'),
              '💡 ' + $t('community.post_reaction.IDEA'),
              '😡 ' + $t('community.post_reaction.DISAGREE'),
            ]"
            :time-series="timeSeries"
            :y-label="$t('community.commons.user_reactions')"
            height="240px"
          />
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div
          v-intersect.once="
            (isIntersecting) => OnIntersectLoad(isIntersecting, 2)
          "
          class="mh250 border rounded-18px p-2"
        >
          <u-chart-area
            v-if="IsLoaded(2)"
            :colors="['#C2185B', '#03A9F4', '#009688', '#FFC107', '#673AB7']"
            :keys="['texts', 'videos', 'links', 'images', 'voices', 'products']"
            :labels-data="[
              $t('community.commons.text'),
              $t('community.commons.video'),
              $t('community.commons.link'),
              $t('community.commons.image'),
              $t('community.commons.voice'),
              $t('community.commons.product'),
            ]"
            :opacity="0.5"
            :time-series="timeSeries"
            class="fadeIn"
            height="240px"
            y-label="Media types"
          ></u-chart-area>
        </div>
      </v-col>
    </v-row>
    <div style="height: 5vh"></div>
  </v-container>
</template>

<script>
import UTimeSpan from "../../ui/time/span/UTimeSpan.vue";
import UChartArea from "@components/ui/chart/area/UChartArea.vue";
import UChartLine from "@components/ui/chart/line/UChartLine.vue";
import TrendSparkline from "./TrendSparkline.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import { IntersectMixin } from "@components/mixin/IntersectMixin";

export default {
  name: "CommunityStatisticView",
  mixins: [IntersectMixin],

  components: { UTimeSpan, UChartArea, UChartLine, TrendSparkline },
  props: {
    title: {},

    community: { required: true, type: Object },
    category: {},
    topic: {},

    timeSeries: {
      require: true,
    },

    isCommunity: {
      type: Boolean,
      default: false,
    },
    isCategory: {
      type: Boolean,
      default: false,
    },
    isTopic: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      intersects: [], // Intersects keeper.
    };
  },

  created() {},

  computed: {
    target() {
      return this.isCommunity
        ? this.community
        : this.isCategory
          ? this.category
          : this.isTopic
            ? this.topic
            : this.community;
    },

    time_span_string() {
      return (
        this.getFromNowString(
          DateConverter.GetStartOfDateBefore(this.timeSeries.offset),
        ) +
        " ~ " +
        this.getFromNowString(
          DateConverter.GetStartOfDateBefore(this.timeSeries.days),
        )
      );
    },
    keys() {
      const out = [
        { key: "posts", title: this.$t("community.commons.posts") },
        { key: "comments", title: this.$t("community.commons.comments") },
        { key: "impressions", title: this.$t("community.commons.impressions") },
        { key: "reactions", title: this.$t("community.commons.reactions") },
        { key: "saves", title: this.$t("community.commons.saves") },
        { key: "embeds", title: this.$t("community.commons.embeds") },
        { key: "shares", title: this.$t("community.commons.shares") },
        {
          key: "reports",
          title: this.$t("community.commons.reports"),
          reverse: true,
        },
      ];

      if (this.isCommunity || this.isCategory)
        out.unshift({
          key: "topics",
          title: this.$t("community.commons.topics"),
        });

      return out;
    },
  },
  methods: {},
};
</script>

<style scoped></style>
