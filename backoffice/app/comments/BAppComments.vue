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
  <div class="b-app-comments text-start" :aria-busy="busy">
    <p class="b-app-comments__total">
      {{ $t("app_config.total_comments") }}: {{ numeralFormat(total, "0,0") }}
    </p>
    <div class="b-app-comments__list">
      <article
        v-for="comment in comments"
        :key="comment.id"
        class="b-app-comments__item"
      >
        <div class="b-app-comments__byline">
          <span>{{ comment.user.name }}</span>
          <span class="b-app-comments__date">
            {{ getLocalDateString(comment.created_at) }}
            <small
              v-if="comment.created_at !== comment.updated_at"
              :title="getLocalDateString(comment.updated_at)"
              >{{ $t("global.commons.edited") }}</small
            >
          </span>
        </div>
        <div
          class="b-app-comments__stars"
          role="img"
          :aria-label="
            $t('app_detail_modern.rating_value', { rate: comment.rate })
          "
        >
          <span v-for="star in 5" :key="star" aria-hidden="true">{{
            star <= comment.rate ? "★" : "☆"
          }}</span>
        </div>
        <p v-text="comment.message" />
      </article>
    </div>
    <v-pagination
      v-if="pageCount > 1"
      v-model="page"
      :length="pageCount"
      class="b-app-comments__pagination"
      @update:model-value="fetchAppReviews()"
    />
  </div>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAppComments",
  mixins: [DateMixin],

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
    loaded_page: 1,
    request_id: 0,
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
  beforeUnmount() {
    this.request_id++;
  },
  methods: {
    fetchAppReviews() {
      const requestId = ++this.request_id;
      const page = this.page;
      this.busy = true;
      return axios
        .get(window.GAPI.GET_APP_COMMENTS(this.appCode), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
          },
        })
        .then(({ data }) => {
          if (requestId !== this.request_id) return;
          if (!data.error) {
            this.comments = data.comments;
            this.total = data.total;
            this.loaded_page = page;
          } else {
            this.page = this.loaded_page;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (requestId !== this.request_id) return;
          this.page = this.loaded_page;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (requestId === this.request_id) this.busy = false;
        });
    },
  },
};
</script>

<style scoped>
.b-app-comments {
  min-inline-size: 0;
  color: var(--ad-ink, rgb(var(--v-theme-on-surface)));
}
.b-app-comments p {
  margin: 0;
}
.b-app-comments__total {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.b-app-comments__list {
  display: grid;
  gap: 16px;
}
.b-app-comments__item {
  display: grid;
  gap: 6px;
  padding-block: 14px;
  border-block-start: 1px solid
    var(--ad-border, rgba(var(--v-theme-on-surface), 0.12));
}
.b-app-comments__item:first-child {
  padding-block-start: 3px;
  border: 0;
}
.b-app-comments__byline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  line-height: 18px;
  font-weight: 400;
  overflow-wrap: anywhere;
}
.b-app-comments__date {
  color: var(--ad-muted, rgba(var(--v-theme-on-surface), 0.65));
  text-align: end;
}
.b-app-comments__date small {
  font-size: inherit;
  margin-inline-start: 5px;
}
.b-app-comments__stars {
  color: var(--ad-muted, rgba(var(--v-theme-on-surface), 0.65));
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 1px;
}
.b-app-comments__item > p {
  font-size: 12px;
  line-height: 20px;
  font-weight: 400;
  overflow-wrap: anywhere;
}
.b-app-comments__pagination {
  margin-block-start: 14px;
}
</style>
