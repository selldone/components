<template>
  <v-col
    cols="12"
    class="c-container -force-rounded"
    :class="{ 'border-top-thick -red': topic.private }"
  >
    <v-icon v-if="topic.pin" class="absolute-top-end" small title="Pinned">push_pin</v-icon>

    <router-link
      class="c-widget -hover d-flex black--text"
      :class="{ 'flex-column': $vuetify.breakpoint.xs }"
      :to="{
        name: 'CommunityTopicPage',
        params: { topic_id: topic.id, topic_slug: slugify(topic.title) },
      }"
    >
      <community-image
        v-if="topic.image"
        :src="getShopImagePath(topic.image)"
        :height="$vuetify.breakpoint.xs ? '100px' : 'auto'"
        :width="$vuetify.breakpoint.xs ? '100%' : 200"
        :min-height="$vuetify.breakpoint.xs ? 100 : 200"
      ></community-image>

      <div
        class="ms-2 px-2 flex-grow-1 py-2 overflow-hidden d-flex flex-column"
      >

        <b class="d-block text-capitalize t-title"
          >{{ topic.title }}
          <v-chip
            class="ms-1"
            x-small
            pill
            v-if="topic.private"
            color="red"
            dark
            >Private</v-chip
          >
          <v-chip
            class="ms-1"
            x-small
            pill
            v-if="topic.community_id !== community.id"
            color="green"
            dark
            >Cross topic</v-chip
          >
        </b>


        <p class="single-line d-block m-0 typo-body my-1">
          {{ topic.desc }}
        </p>

        <!-- Monetization -->
        <p v-if="subscription" class="my-1 text-success subtitle-2">
          <v-icon small class="me-1 mb-1" color="success"
            >monetization_on</v-icon
          >
          <price-view
            :amount="topic.price"
            :currency="topic.currency"
            class="mx-1"
          ></price-view>
          / {{ subscription_title }} + {{ trial_title }}
        </p>

        <!-- Statistics -->
        <div v-if="timeSeries && show_reports" class="my-2 fadeIn delay_2s">
          <v-row dense>
            <v-col cols="6" sm="3" v-for="item in keys" :key="item.key">
              <div class="d-flex single-line">
                <b class="x-small">{{ item.title }}</b>
                <v-spacer></v-spacer>
                <h3>{{ timeSeries.totalOf(item.key) }}</h3>
                <small class="ms-1"> / w</small>
              </div>

              <trend-sparkline
                :value="timeSeries.arrayOfForceInterpolateZero(item.key)"
                fill
                height="32"
                :auto-draw="false"
              ></trend-sparkline>
            </v-col>
          </v-row>
        </div>

        <v-spacer></v-spacer>

        <users-dense-images-circles
          v-if="topic.contributors"
          :ids="topic.contributors"
          :size="32"
        ></users-dense-images-circles>

        <div class="subtitle-2 d-flex align-center op-0-7">
          <v-spacer></v-spacer>

          <div v-if="topic.total_polls" class="me-2">
            {{ topic.total_polls }} <v-icon small>poll</v-icon>
          </div>

          <div class="me-2" title="Posts">
            {{ topic.total_posts }}

            <v-badge
              :value="todayData && todayData.posts > 0"
              color="#D32F2F"
              :content="
                todayData && todayData.posts
                  ? todayData.posts > 9
                    ? '+9'
                    : todayData.posts
                  : null
              "
            >
              <v-icon small>person</v-icon>
            </v-badge>
          </div>

          <span class="mx-2 op-0-4"> </span>

          <div class="me-4" title="Comments">
            {{ topic.total_comments }}

            <v-badge
              :value="todayData && todayData.comments > 0"
              color="#D32F2F"
              :content="
                todayData && todayData.comments
                  ? todayData.comments > 9
                    ? '+9'
                    : todayData.comments
                  : null
              "
              bordered
            >
              <v-icon small>comment</v-icon>
            </v-badge>
          </div>
        </div>
      </div>
    </router-link>

    <!-- Trend -->
    <ribbon v-if="topic.trend" red>
      <v-icon small dark>local_fire_department</v-icon>
      {{ $t("community.commons.trend") }}
    </ribbon>
  </v-col>
</template>

<script>
import UsersDenseImagesCircles from "@/Applications/Backoffice/components/user/UsersDenseImagesCircles.vue";
import CommunityImage from "../image/CommunityImage.vue";
import { TopicSubscriptionType } from "@core/enums/community/TopicSubscriptionType";
import { TopicTrialType } from "@core/enums/community/TopicTrialType";
import Ribbon from "@components/ui/ribbon/Ribbon.vue";
import TrendSparkline from "../statistics/TrendSparkline.vue";
import { TimeSeries } from "@core/timeserie/TimeSeries";
export default {
  name: "CommunityTopicCard",
  components: {
    TrendSparkline,
    Ribbon,
    CommunityImage,
    UsersDenseImagesCircles,
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

<style scoped lang="scss">
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

.t-title{
  font-size: 140%;
}
</style>
