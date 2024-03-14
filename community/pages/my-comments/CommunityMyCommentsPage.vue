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
  <v-container
    :class="{ 'opx-active': opx_active }"
    style="margin-bottom: 20vh"
  >
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <c-breadcrumb
      :community="community"
      :shop="shop"
      class="breadcrumb-max-w mb-12"
    ></c-breadcrumb>

    <v-container class="c-max-w">
      <v-row align="start" justify="center">
        <community-comment-widget
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :community="community"
          :shop="shop"
        >
        </community-comment-widget>

        <!-- Auto load more -->

        <v-col
          v-if="has_more"
          v-intersect.quiet="
            (isIntersecting) => {
              if (isIntersecting) fetchComments(page + 1);
            }
          "
          cols="12"
          style="height: 50vh"
        >
          <s-loading v-if="busy" css-mode light></s-loading>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import CBreadcrumb from "@components/community/breadcrumb/CBreadcrumb.vue";
import CommunityComments from "@components/community/comment/CommunityComments.vue";
import CommunityCommentWidget from "@components/community/comment/CommunityCommentWidget.vue";

export default {
  name: "CommunityMyCommentsPage",
  components: {
    CommunityCommentWidget,

    CBreadcrumb,
  },

  props: {
    shop: {},

    community: {
      required: true,
      type: Object,
    },
    categories: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      opx_active: false,

      //----------------------------------
      busy: false,
      comments: [],
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
    };
  },

  computed: {
    has_more() {
      return this.totalItems > this.comments.length;
    },
  },
  watch: {},

  created() {
    this.fetchComments(1);
  },
  mounted() {},

  methods: {
    refreshData() {
      this.fetchComments(1);
    },

    //――――――――――――――――――――――― Topics ―――――――――――――――――――――――

    fetchComments(page) {
      if (this.busy) return; // Prevent multiple fetching!

      this.busy = true;
      this.$emit("busy", true);

      this.page = page;

      if (page === 1) {
        // Reset values:
        this.comments = [];
        this.totalItems = 0;
      }

      axios
        .get(window.CAPI.GET_COMMUNITY_MY_COMMENTS(this.community.id), {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }
          this.comments.push(...data.comments);

          if (data.comments.length) {
            this.totalItems = this.comments.length + 1; // Maybe has mode!
          } else {
            this.totalItems = this.comments.length;
          }
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

<style lang="scss" scoped></style>
