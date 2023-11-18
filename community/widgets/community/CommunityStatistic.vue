<template>
  <div>
    <community-statistic-view
      v-if="timeseries"
      :title="$t('community.community.statistics')"
      :community="community"
      :timeSeries="timeseries"
      is-community
    ></community-statistic-view>
    <progress-loading v-if="busy"></progress-loading>
  </div>
</template>

<script>
import CommunityStatisticView from "../statistics/CommunityStatisticView.vue";
import { TimeSeries } from "@core/timeserie/TimeSeries";

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
                this.days
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
