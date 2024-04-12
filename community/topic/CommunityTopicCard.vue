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
  <v-col
    :class="{ 'border-top-thick -red': topic.private }"
    class="c-container -force-rounded"
    cols="12"
  >
    <v-icon
      v-if="topic.pin"
      class="absolute-top-end ma-3"
      size="small"
      title="Pinned"
      >push_pin
    </v-icon>

    <router-link
      :class="{ 'flex-column': $vuetify.display.xs }"
      :to="{
        name: window.$community.routes.COMMUNITY_TOPIC_PAGE,
        params: {
          category_slug:
            $route.params
              .category_slug /*BUG in VUe3 Route. Not replace 'category_slug' optional params*/,
          topic_id: topic.id,
          topic_slug: slugify(topic.title),
        },
      }"
      class="c-widget -hover d-flex text-black"
    >
      <c-image-view
        v-if="topic.image"
        :height="$vuetify.display.xs ? '100px' : 'auto'"
        :min-height="$vuetify.display.xs ? 100 : 200"
        :src="getShopImagePath(topic.image)"
        :width="$vuetify.display.xs ? '100%' : 200"
      ></c-image-view>

      <div
        class="ms-2 px-2 flex-grow-1 py-2 overflow-hidden d-flex flex-column"
      >
        <b class="d-block text-capitalize t-title"
          >{{ topic.title }}
          <v-chip
            v-if="topic.private"
            class="ms-1"
            color="red"
            variant="flat"
            pill
            size="x-small"
            >Private
          </v-chip>
          <v-chip
            v-if="topic.community_id !== community.id"
            class="ms-1"
            color="green"
            variant="flat"
            pill
            size="x-small"
            >Cross topic
          </v-chip>
        </b>

        <p class="single-line d-block m-0 typo-body my-1">
          {{ topic.desc }}
        </p>

        <!-- Monetization -->
        <p v-if="subscription" class="my-1 text-success text-subtitle-2">
          <v-icon class="me-1 mb-1" color="success" size="small"
            >monetization_on
          </v-icon>
          <u-price
            :amount="topic.price"
            :currency="topic.currency"
            class="mx-1"
          ></u-price>
          / {{ subscription_title }} + {{ trial_title }}
        </p>

        <!-- Statistics -->
        <div v-if="timeSeries && show_reports" class="my-2 fadeIn delay_2s">
          <v-row dense>
            <v-col v-for="item in keys" :key="item.key" cols="6" sm="3">
              <div class="d-flex single-line">
                <b class="x-small">{{ item.title }}</b>
                <v-spacer></v-spacer>
                <h3>{{ timeSeries.totalOf(item.key) }}</h3>
                <small class="ms-1"> / w</small>
              </div>

              <trend-sparkline
                :auto-draw="false"
                :value="timeSeries.arrayOfForceInterpolateZero(item.key)"
                fill
                height="32"
              ></trend-sparkline>
            </v-col>
          </v-row>
        </div>

        <v-spacer></v-spacer>

        <u-dense-circles-users
          v-if="topic.contributors"
          :ids="topic.contributors"
          :size="32"
        ></u-dense-circles-users>

        <div class="text-subtitle-2 d-flex align-center op-0-7">
          <v-spacer></v-spacer>

          <div v-if="topic.total_polls" class="me-2">
            {{ topic.total_polls }}
            <v-icon size="small">poll</v-icon>
          </div>

          <div class="me-2" title="Posts">
            {{ topic.total_posts }}

            <v-badge
              :content="
                todayData && todayData.posts
                  ? todayData.posts > 9
                    ? '+9'
                    : todayData.posts
                  : null
              "
              :model-value="todayData && todayData.posts > 0"
              color="#D32F2F"
            >
              <v-icon size="small">person</v-icon>
            </v-badge>
          </div>

          <span class="mx-2 op-0-4"> </span>

          <div class="me-4" title="Comments">
            {{ topic.total_comments }}

            <v-badge
              :content="
                todayData && todayData.comments
                  ? todayData.comments > 9
                    ? '+9'
                    : todayData.comments
                  : null
              "
              :model-value="todayData && todayData.comments > 0"
              bordered
              color="#D32F2F"
            >
              <v-icon size="small">comment</v-icon>
            </v-badge>
          </div>
        </div>
      </div>
    </router-link>

    <!-- Trend -->
    <u-ribbon v-if="topic.trend" red>
      <v-icon dark size="small">local_fire_department</v-icon>
      {{ $t("community.commons.trend") }}
    </u-ribbon>
  </v-col>
</template>

<script>
import UDenseCirclesUsers from "@components/ui/dense-circles/users/UDenseCirclesUsers.vue";
import CImageView from "@components/community/image/view/CImageView.vue";
import { TopicSubscriptionType } from "@core/enums/community/TopicSubscriptionType";
import { TopicTrialType } from "@core/enums/community/TopicTrialType";
import URibbon from "@components/ui/ribbon/URibbon.vue";
import TrendSparkline from "../statistics/TrendSparkline.vue";
import { TimeSeries } from "@core/timeserie/TimeSeries";

export default {
  name: "CommunityTopicCard",
  components: {
    TrendSparkline,
    URibbon,
    CImageView,
    UDenseCirclesUsers,
  },
  props: {
    community: {
      type: Object,
      required: true,
    },
    topic: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      timeSeries: null,

      keys: [
        { key: "posts", title: this.$t("community.commons.posts") },
        { key: "comments", title: this.$t("community.commons.comments") },
        { key: "impressions", title: this.$t("community.commons.impressions") },
        { key: "reactions", title: this.$t("community.commons.reactions") },
      ],
    };
  },

  computed: {
    access() {
      return this.community.access;
    },
    show_reports() {
      return this.access && (this.access.admin || this.access.moderator);
    },

    todayData() {
      return this.timeSeries && this.timeSeries.todayData();
    },

    subscription() {
      return this.topic.subscription;
    },
    trial() {
      return this.topic.trial;
    },
    subscription_title() {
      return (
        this.subscription &&
        this.$t(TopicSubscriptionType[this.subscription].name)
      );
    },
    trial_title() {
      return this.trial && this.$t(TopicTrialType[this.trial].name);
    },
  },
  created() {
    if (this.topic.data)
      this.timeSeries = new TimeSeries(this.topic.data, null, 0, 7);
  },
};
</script>

<style lang="scss" scoped>
.badge-circle {
  background-color: red;
  color: #fff;
  font-size: 8px;
  font-weight: 500;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.t-title {
  font-size: 140%;
}
</style>
