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
      v-if="modern || timeseries"
      :community="community"
      :timeSeries="timeseries"
      :title="$t('community.community.statistics')"
      :modern="modern"
      :loading="busy"
      :load-error="load_error"
      is-community
      @retry="fetchCommunity"
    >
      <template v-if="$slots.aside" #aside><slot name="aside" /></template>
    </community-statistic-view>
    <u-loading-progress v-if="busy && !modern"></u-loading-progress>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import CommunityStatisticView from "../../community/statistics/CommunityStatisticView.vue";
import { TimeSeries } from "@selldone/core-js/timeserie/TimeSeries";

export default {
  name: "CommunityStatistic",
  mixins: [],
  components: { CommunityStatisticView },
  props: {
    modern: { type: Boolean, default: false },
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
      load_error: false,
      fetch_id: 0,
    };
  },

  created() {
    if (!this.timeSeries) {
      this.fetchCommunity();
    }
  },
  beforeUnmount() {
    this.fetch_id++;
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
      const fetch_id = ++this.fetch_id;
      const community_id = this.community.id;
      this.busy = true;
      this.load_error = false;
      return axios
        .get(window.CAPI.GET_COMMUNITY_DATA(this.community.id), {
          params: {
            offset: this.offset,
            days: this.days,
          },
        })
        .then(({ data }) => {
          if (fetch_id !== this.fetch_id || community_id !== this.community.id)
            return;
          if (!data.error) {
            // Statistics:
            if (Array.isArray(data.data)) {
              this.community_timeseries = new TimeSeries(
                data.data,
                "Community Data",
                this.offset,
                this.days,
              );
              // Register fetch callback (Use to refresh by change time span)
              this.community_timeseries.fetch = this.fetchCallback;
            } else {
              this.community_timeseries = null;
              this.load_error = true;
            }
          } else {
            this.load_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (fetch_id !== this.fetch_id || community_id !== this.community.id)
            return;
          this.load_error = true;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (fetch_id === this.fetch_id) this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
