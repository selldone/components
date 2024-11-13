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
  <div class="text-start">
    <p class="small">
      {{ $t("app_config.total_comments") }}: {{ numeralFormat(total, "0,0") }}
    </p>

    <div class="border-between-vertical">
      <div v-for="comment in comments" :key="comment.id" class="d-flex pt-2">
        <v-avatar class="me-2" size="48">
          <img :src="getUserAvatar(comment.user_id)" />
        </v-avatar>
        <div class="flex-grow-1">
          <p class="font-weight-bold mb-1">{{ comment.user.name }}</p>
          <p class="mb-2">
            <v-rating
              :model-value="comment.rate"
              active-color="yellow-darken-3"
              class="inline-block me-2"
              color="grey-darken-1"
              density="compact"
              readonly
              size="x-small"
            ></v-rating>
            {{ getLocalDateString(comment.created_at) }}
            <small
              v-if="comment.created_at !== comment.updated_at"
              :title="getLocalDateString(comment.updated_at)"
              class="mx-2"
              small
              >{{ $t("global.commons.edited") }}</small
            >
          </p>
          <p v-text="comment.message"></p>
        </div>
      </div>
    </div>

    <v-pagination
      v-if="pageCount > 1"
      v-model="page"
      :length="pageCount"
      @change="fetchAppReviews()"
    />
  </div>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAppComments",
  mixins: [DateMixin ],

  props: {
    appCode: {
      require: true,
      type: String,
    },
  },
  data: () => ({
    busy: false,
    comments: [],
    page: 1,
    total: 0,
    itemsPerPage: 10,
  }),
  computed: {
    pageCount() {
      return Math.ceil(this.total / this.itemsPerPage);
    },
  },

  created() {
    this.fetchAppReviews();
  },
  methods: {
    fetchAppReviews() {
      this.busy = true;
      axios
        .get(window.GAPI.GET_APP_COMMENTS(this.appCode), {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.comments = data.comments;
            this.total = data.total;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
