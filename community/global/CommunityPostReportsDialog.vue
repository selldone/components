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
  <v-dialog
    v-if="post"
    v-model="dialog"
    :fullscreen="$vuetify.display.mdAndDown"
    max-width="560"
    scrollable
  >
    <v-card min-height="220">
      <v-card-title>
        Post reports

        <v-spacer></v-spacer>
        <v-btn icon size="large" @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="text-start">
        <v-row>
          <v-col v-for="item in reports" :key="item.report" cols="12">
            <div class="d-flex align-center">
              <h3 class="text-h4">
                {{ numeralFormat(item.count, "0.[00]a") }}
              </h3>
              <u-dense-circles-users
                :ids="item.users"
                :size="$vuetify.display.xs ? 32 : 42"
              ></u-dense-circles-users>
            </div>
            <p class="d-block m-0">
              {{ $t(ArticleReport[item.report].title) }}
            </p>
          </v-col>
          <v-col
            v-if="!busy && (!reports || !reports.length)"
            class="text-center text-h4"
            cols="12"
          >
            No report!
          </v-col>
        </v-row>
      </v-card-text>

      <u-loading-progress v-if="busy"></u-loading-progress>
    </v-card>
  </v-dialog>
</template>

<script>
import { ArticleReport } from "@selldone/core-js/enums/article/ArticleReport";
import UDenseCirclesUsers from "@components/ui/dense-circles/users/UDenseCirclesUsers.vue";

export default {
  name: "CommunityPostReportsDialog",
  components: { UDenseCirclesUsers },
  props: {
    community: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      post: null,

      ArticleReport: ArticleReport,

      reports: null,
      busy: false,
    };
  },

  computed: {},

  watch: {},

  methods: {
    //――――――――――――――――――――――――― Get Reports ―――――――――――――――――――――――――

    getPostReports() {
      this.busy = true;

      axios
        .get(
          window.CAPI.GET_COMMUNITY_TOPIC_POST_REPORTS(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.reports = data.reports;
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

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――― Event Bus ――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    this.EventBus.$on("community:show-post-reports", ({ post }) => {
      this.post = post;
      this.dialog = true;
      this.reports = null;
      this.getPostReports();
    });
  },
  beforeUnmount() {
    this.EventBus.$off("community:show-post-reports");
  },
};
</script>

<style lang="scss"></style>
