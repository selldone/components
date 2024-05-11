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
  <div>
    <community-statistic-view
      v-if="timeseries"
      :community="community"
      :timeSeries="timeseries"
      :title="$t('community.community.statistics')"
      is-community
    ></community-statistic-view>
    <u-loading-progress v-if="busy"></u-loading-progress>
  </div>
</template>

<script>
import CommunityStatisticView from "@components/community/statistics/CommunityStatisticView.vue";
import { TimeSeries } from "@selldone/core-js/timeserie/TimeSeries";

export default {
  name: "CommunityStatistic",
  components: { CommunityStatisticView },
  props: {
    community: { required: true, type: Object },
    timeSeries: {
      require: true,
    },
  },

  data() {
    return {
      // ---------------------
      community_timeseries: null,

      offset: 0,
      days: 7,

      busy: false,
    };
  },

  created() {
    if (!this.timeSeries) {
      this.fetchCommunity();
    }
  },

  computed: {
    timeseries() {
      return this.timeSeries ? this.timeSeries : this.community_timeseries;
    },
  },
  methods: {
    fetchCallback: function (offset, days) {
      if (this.offset === offset && this.days === days) return; // No change!

      this.offset = offset;
      this.days = days;

      this.fetchCommunity();
    },

    fetchCommunity() {
      this.busy = true;
      axios
        .get(window.CAPI.GET_COMMUNITY_DATA(this.community.id), {
          params: {
            offset: this.offset,
            days: this.days,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            // Statistics:
            if (data.data)
              this.community_timeseries = new TimeSeries(
                data.data,
                "Community Data",
                this.offset,
                this.days,
              );

            // Register fetch callback (Use to refresh by change time span)
            this.community_timeseries.fetch = this.fetchCallback;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
