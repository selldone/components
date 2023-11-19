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
    v-if="comment"
    v-model="dialog"
    max-width="560"
    scrollable
    :fullscreen="$vuetify.breakpoint.mdAndDown"
  >
    <v-card min-height="220">
      <v-card-title>
        Comment reports

        <v-spacer></v-spacer>
        <v-btn icon large @click="dialog = false"><v-icon>close</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="text-start">
        <v-row>
          <v-col v-for="item in reports" :key="item.report" cols="12">
            <div class="d-flex align-center">
              <h3 class="display-1">
                {{ item.count | numeralFormat("0.[00]a") }}
              </h3>
              <users-dense-images-circles
                :ids="item.users"
                :size="$vuetify.breakpoint.xsOnly ? 32 : 42"
              ></users-dense-images-circles>
            </div>
            <p class="d-block m-0">
              {{ $t(ArticleReport[item.report].title) }}
            </p>
          </v-col>
          <v-col
            v-if="!busy && (!reports || !reports.length)"
            cols="12"
            class="text-center display-1"
          >
            No report!
          </v-col>
        </v-row>
      </v-card-text>

      <progress-loading v-if="busy"></progress-loading>
    </v-card>
  </v-dialog>
</template>

<script>
import { ArticleReport } from "@core/enums/article/ArticleReport";
import UsersDenseImagesCircles from "@app-backoffice/components/user/UsersDenseImagesCircles.vue";

export default {
  name: "CommunityCommentReportsDialog",
  components: { UsersDenseImagesCircles },
  props: {
    community: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      dialog: false,
      comment: null,

      ArticleReport: ArticleReport,

      reports: null,
      busy: false,
    };
  },

  computed: {},

  watch: {},

  methods: {
    //――――――――――――――――――――――――― Get Reports ―――――――――――――――――――――――――

    getCommentReports() {
      this.busy = true;

      axios
        .get(
          window.CAPI.GET_COMMUNITY_COMMENT_REPORTS(
            this.community.id,
            this.comment.id
          )
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
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    this.EventBus.$on("community:show-comment-reports", ({ comment }) => {
      this.comment = comment;
      this.dialog = true;
      this.reports = null;
      this.getCommentReports();
    });
  },
  beforeDestroy() {
    this.EventBus.$off("community:show-comment-reports");
  },
};
</script>

<style lang="scss"></style>
