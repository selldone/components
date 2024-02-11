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
  <div>
    <community-statistic-view
      v-if="timeSeries && topic"
      :community="community"
      :timeSeries="timeSeries"
      :title="$t('community.topic.statistics')"
      :topic="topic"
      class="fadeIn"
      is-topic
    ></community-statistic-view>

    <community-statistic-view-skeleton
      v-else
    ></community-statistic-view-skeleton>

    <div style="height: 5vh"></div>
  </div>
</template>

<script>
import CommunityStatisticView from "../statistics/CommunityStatisticView.vue";
import { TimeSeries } from "@core/timeserie/TimeSeries";
import CommunityStatisticViewSkeleton from "../statistics/CommunityStatisticViewSkeleton.vue";

export default {
  name: "CommunityTopicStatistic",
  components: { CommunityStatisticViewSkeleton, CommunityStatisticView },
  props: {
    community: {
      required: true,
      type: Object,
    },
    topicId: { required: true },
  },

  data() {
    return {
      topic: null,
      data: null,
      busy: false,

      timeSeries: null,
      // ---------------------
      offset: 0,
      days: 7,
    };
  },

  created() {
    this.fetchTopicInfo();
  },
  methods: {
    fetchCallback: function (offset, days) {
      if (this.offset === offset && this.days === days) return; // No change!

      this.offset = offset;
      this.days = days;

      this.fetchTopicInfo();
    },

    //――――――――――――――――――――――― Topic full info ―――――――――――――――――――――――

    fetchTopicInfo() {
      this.busy = true;
      this.$emit("busy", true);

      axios
        .get(
          window.CAPI.GET_COMMUNITY_TOPIC_DATA(this.community.id, this.topicId),
          {
            params: {
              offset: this.offset,
              days: this.days,
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          this.topic = data.topic;
          this.data = data.data;
          // Statistics:
          if (data.data)
            this.timeSeries = new TimeSeries(
              data.data,
              "Topic Data",
              this.offset,
              this.days,
            );

          // Register fetch callback (Use to refresh by change time span)
          this.timeSeries.fetch = this.fetchCallback;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          this.$emit("busy", false);
        });
    },
  },
};
</script>

<style scoped></style>
