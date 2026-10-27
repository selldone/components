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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Container ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

  <div
    class="s-articles-timeline"
    :class="{
      's-articles-timeline--modern sd-modern-widget text-start': modern,
    }"
    :aria-busy="busy"
  >
    <template v-if="modern">
      <header class="s-articles-timeline__header">
        <div class="s-articles-timeline__heading">
          <v-icon
            class="s-articles-timeline__section-icon"
            icon="pending_actions"
            size="20"
            aria-hidden="true"
          />
          <div>
            <h1>{{ $t("blog_timeline.modern.title") }}</h1>
            <p class="s-articles-timeline__subtitle">
              {{ $t("blog_timeline.modern.subtitle") }}
            </p>
          </div>
        </div>
        <v-tooltip
          :text="$t('blog_timeline.modern.refresh')"
          content-class="sd-modern-tooltip text-start"
          location="top"
          :open-on-focus="true"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button s-articles-timeline__icon-button"
              icon
              variant="text"
              :disabled="busy"
              :loading="busy"
              :aria-label="$t('blog_timeline.modern.refresh')"
              @click="fetchData"
            >
              <v-icon icon="refresh" size="15" aria-hidden="true" />
            </v-btn>
          </template>
        </v-tooltip>
      </header>

      <div v-if="busy" class="s-articles-timeline__loading" role="status">
        <v-icon icon="hourglass_empty" size="18" aria-hidden="true" />
        <span>{{ $t("blog_timeline.modern.loading") }}</span>
      </div>
      <div
        v-else-if="load_error"
        class="s-articles-timeline__error sd-modern-notice"
        role="alert"
      >
        <v-icon
          icon="error_outline"
          size="18"
          color="warning"
          aria-hidden="true"
        />
        <div>
          <strong>{{ $t("blog_timeline.modern.error_title") }}</strong>
          <p>{{ $t("blog_timeline.modern.error_body") }}</p>
        </div>
        <v-btn
          class="sd-modern-button sd-modern-button--inline s-articles-timeline__retry"
          variant="text"
          @click="fetchData"
          >{{ $t("blog_timeline.modern.retry") }}</v-btn
        >
      </div>
      <div
        v-else-if="!timeline.length"
        class="s-articles-timeline__empty sd-modern-empty-state"
        role="status"
      >
        <v-icon icon="pending_actions" size="29" aria-hidden="true" />
        <h2>{{ $t("blog_timeline.modern.empty_title") }}</h2>
        <p>{{ $t("blog_timeline.modern.empty_body") }}</p>
      </div>
      <template v-else>
        <div class="s-articles-timeline__context">
          <span aria-live="polite">{{
            $t("blog_timeline.modern.count", { count: $n(timeline.length) })
          }}</span>
          <span class="s-articles-timeline__timezone"
            ><v-icon icon="schedule" size="12" aria-hidden="true" />{{
              $t("blog_timeline.modern.timezone")
            }}</span
          >
        </div>
        <section
          v-for="group in timelineGroups"
          :key="group.key"
          class="s-articles-timeline__day"
          :aria-label="getLocalTimeString(group.date, false, false, true)"
        >
          <h2 class="s-articles-timeline__day-label">
            <span class="s-articles-timeline__weekday sd-modern-list-header">{{
              formatTimelineDate(group.date, { weekday: "long" })
            }}</span>
            <span class="s-articles-timeline__date">{{
              formatTimelineDate(group.date, { month: "long", day: "numeric" })
            }}</span>
            <span class="s-articles-timeline__year">{{
              formatTimelineDate(group.date, { year: "numeric" })
            }}</span>
          </h2>
          <div class="s-articles-timeline__rail" aria-hidden="true">
            <span class="s-articles-timeline__dot" />
          </div>
          <div class="s-articles-timeline__entries">
            <article
              v-for="article in group.articles"
              :key="article.id"
              class="s-articles-timeline__entry"
              :aria-current="
                article.id === currentArticleId ? 'true' : undefined
              "
            >
              <span class="s-articles-timeline__cover" aria-hidden="true">
                <v-img
                  v-if="
                    article.image ||
                    (article.parent_type === 'product' && article.parent_id)
                  "
                  :src="article.image || getProductImage(article.parent_id)"
                  class="hover-scale force-top"
                  width="44"
                  height="48"
                  cover
                  alt=""
                />
                <v-icon
                  v-else
                  :icon="getArticleIcon(article.parent_type)"
                  size="20"
                />
              </span>
              <div class="s-articles-timeline__copy">
                <router-link
                  v-if="
                    getArticleLink(article) && article.id !== currentArticleId
                  "
                  class="s-articles-timeline__title"
                  :to="getArticleLink(article)"
                  target="_blank"
                  rel="noopener"
                  >{{ article.title }}</router-link
                >
                <span v-else class="s-articles-timeline__title">{{
                  article.title
                }}</span>
                <p class="s-articles-timeline__description">
                  {{ article.description }}
                </p>
                <div class="s-articles-timeline__meta">
                  <span class="s-articles-timeline__kind">
                    <v-img
                      v-if="
                        article.parent_type === 'product' && article.parent_id
                      "
                      :src="getProductImage(article.parent_id)"
                      class="s-articles-timeline__product-image hover-scale force-top"
                      width="12"
                      height="12"
                      cover
                      alt=""
                    />
                    <v-icon
                      v-else
                      :icon="getArticleIcon(article.parent_type)"
                      size="12"
                      aria-hidden="true"
                    />
                    {{ getArticleKind(article.parent_type)
                    }}<template v-if="article.parent_type === 'product'">
                      · <bdi>P-{{ article.parent_id }}</bdi></template
                    >
                  </span>
                  <span
                    >{{ $t("blog_timeline.modern.edited") }}
                    <time :datetime="article.updated_at">{{
                      formatTimelineDate(article.updated_at, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hourCycle: "h23",
                      })
                    }}</time></span
                  >
                </div>
              </div>
              <div class="s-articles-timeline__time">
                <time
                  :datetime="article.schedule_at"
                  :aria-label="getLocalTimeString(article.schedule_at)"
                  >{{
                    formatTimelineDate(article.schedule_at, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23",
                    })
                  }}</time
                >
                <small>{{ $t("blog_timeline.modern.publish") }}</small>
              </div>
              <v-tooltip
                :text="
                  article.id === currentArticleId
                    ? $t('global.article.schedule_dialog.current_article')
                    : $t('blog_timeline.modern.open_editor')
                "
                content-class="sd-modern-tooltip text-start"
                location="top"
                :open-on-focus="true"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :to="getArticleLink(article)"
                    :disabled="
                      article.id === currentArticleId ||
                      !getArticleLink(article)
                    "
                    class="sd-modern-icon-button s-articles-timeline__icon-button s-articles-timeline__open"
                    icon
                    variant="text"
                    target="_blank"
                    rel="noopener"
                    :aria-label="
                      article.id === currentArticleId
                        ? $t('global.article.schedule_dialog.current_article')
                        : $t('blog_timeline.modern.open_editor') +
                          ': ' +
                          article.title
                    "
                  >
                    <v-icon icon="open_in_new" size="15" aria-hidden="true" />
                  </v-btn>
                </template>
              </v-tooltip>
            </article>
          </div>
        </section>
        <footer class="s-articles-timeline__footer">
          <v-icon icon="info_outline" size="13" aria-hidden="true" />
          <p>{{ $t("blog_timeline.modern.footer") }}</p>
        </footer>
      </template>
    </template>

    <template v-else>
      <u-loading-progress v-if="busy"></u-loading-progress>
      <v-timeline
        v-else-if="!load_error"
        :density="$vuetify.display.mdAndDown ? 'compact' : undefined"
      >
        <v-timeline-item
          v-for="_article in timeline"
          :key="_article.id"
          :dot-color="getArticleTypeColor(_article.parent_type)"
          :size="_article.id !== currentArticleId ? 'small' : undefined"
        >
          <template v-slot:icon>
            <v-avatar
              :class="{
                'avatar-gradient -thin -current':
                  _article.id === currentArticleId,
                'avatar-gradient -thin -gray': _article.id !== currentArticleId,
              }"
              :image="_article.image"
              :size="_article.id !== currentArticleId ? 48 : 76"
              class="hover-scale"
              icon="circle"
            >
            </v-avatar>
          </template>

          <template v-slot:opposite>
            <u-text-value-dashed>
              <template v-slot:label>
                <v-icon class="me-1" size="small">schedule</v-icon>
                {{ $t("global.article.schedule_dialog.publish_at") }}
              </template>
              <b v-text="getLocalTimeString(_article.schedule_at)" />
            </u-text-value-dashed>

            <u-text-value-dashed>
              <template v-slot:label>
                <v-icon class="me-1" size="small">edit_note</v-icon>
                {{ $t("global.article.schedule_dialog.last_edit") }}
              </template>
              <b>{{ getLocalTimeString(_article.updated_at, true) }}</b>
            </u-text-value-dashed>
          </template>
          <div class="widget-box">
            <h2 class="mb-2">
              <v-icon
                :color="getArticleTypeColor(_article.parent_type)"
                class="me-1"
              >
                {{
                  _article.parent_type === "blog"
                    ? "sticky_note_2"
                    : _article.parent_type === "help"
                      ? "support"
                      : _article.parent_type === "product"
                        ? "storefront"
                        : _article.parent_type === "shop-blog"
                          ? "sticky_note_2"
                          : _article.parent_type === "company"
                            ? "business"
                            : ""
                }}
              </v-icon>
              {{ _article.title }}
            </h2>
            <div>
              {{ _article.description }}
            </div>

            <div v-if="$vuetify.display.mdAndDown" class="mt-2">
              <u-text-value-dashed>
                <template v-slot:label>
                  <v-icon class="me-1" size="small">schedule</v-icon>
                  {{ $t("global.article.schedule_dialog.publish_at") }}
                </template>
                <b v-text="getLocalTimeString(_article.schedule_at)" />
              </u-text-value-dashed>

              <u-text-value-dashed>
                <template v-slot:label>
                  <v-icon class="me-1" size="small">edit_note</v-icon>
                  {{ $t("global.article.schedule_dialog.last_edit") }}
                </template>
                <b>{{ getLocalTimeString(_article.updated_at, true) }}</b>
              </u-text-value-dashed>
            </div>

            <p v-if="_article.parent_type === 'product'" class="m-2">
              <v-avatar class="hover-scale" size="24" start>
                <v-img
                  v-if="_article.parent_id"
                  :src="getProductImage(_article.parent_id)"
                  cover
                />
              </v-avatar>
              {{ $t("global.article.schedule_dialog.article_for_product") }}
              : P-{{ _article.parent_id }}
            </p>

            <div class="text-end mt-4">
              <v-btn
                :disabled="_article.id === currentArticleId"
                :to="getArticleLink(_article)"
                class="nbt"
                target="_blank"
                variant="outlined"
              >
                {{
                  _article.id === currentArticleId
                    ? $t("global.article.schedule_dialog.current_article")
                    : $t("global.article.schedule_dialog.view_action")
                }}
                <v-icon class="ms-2" size="small"
                  >{{ $t("icons.navigate_next") }}
                </v-icon>
              </v-btn>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>

      <div v-if="!busy && load_error" class="text-center py-5" role="alert">
        <v-icon icon="error_outline" aria-hidden="true" />
        <p>{{ $t("blog_timeline.modern.error_title") }}</p>
        <v-btn variant="outlined" @click="fetchData">{{
          $t("blog_timeline.modern.retry")
        }}</v-btn>
      </div>
      <div v-else-if="!busy && !timeline.length" class="text-center">
        <v-timeline
          :density="$vuetify.display.mdAndDown ? 'compact' : undefined"
        >
          <v-timeline-item v-for="i in 3" :key="i" dot-color="#eee">
            <template v-slot:icon>
              <v-icon>blur_on</v-icon>
            </template>

            <template v-slot:opposite></template>
            <div class="widget-box text-center">
              <h2 class="op-0-3">
                <v-icon class="me-1">sticky_note_2</v-icon>
                ...
              </h2>
            </div>
          </v-timeline-item>
        </v-timeline>
        <h2 class="text-h3 font-weight-thin px-2 py-6">
          {{ $t("global.article.schedule_dialog.no_article") }}
        </h2>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import UTextValueDashed from "../../ui/text/value-dashed/UTextValueDashed.vue";
import { Article } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "SArticlesTimeline",
  mixins: [DateMixin],
  components: { UTextValueDashed },
  props: {
    shopId: {
      required: false,
    },

    articleType: {
      required: true,
      type: String,
    },
    currentArticleId: {
      required: false,
      type: Number,
    },
    modern: { type: Boolean, default: false },
  },
  data: () => ({
    timeline: [],
    busy: false,
    load_error: false,
    request_id: 0,
  }),

  computed: {
    timelineGroups() {
      const groups = [];
      for (const article of this.timeline) {
        const date = this.convertToLocalTime(article.schedule_at);
        // Group local calendar days without filtering or reordering the authorized response.
        const key =
          date && !Number.isNaN(date.getTime())
            ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            : `invalid-${article.id}`;
        let group = groups[groups.length - 1];
        if (group?.key !== key) {
          group = { key, date: article.schedule_at, articles: [] };
          groups.push(group);
        }
        group.articles.push(article);
      }
      return groups;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    shopId: "reloadTimeline",
    articleType: "reloadTimeline",
    "$route.params.vendor_id": "reloadTimeline",
  },

  created() {
    this.fetchData();
  },
  beforeUnmount() {
    this.request_id++;
  },
  methods: {
    reloadTimeline() {
      this.timeline = [];
      return this.fetchData();
    },
    formatTimelineDate(value, options: Intl.DateTimeFormatOptions) {
      const date = this.convertToLocalTime(value);
      if (!date || Number.isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat(window.$language?.full_locale, {
        calendar: window.$language?.calendar?.calendar,
        ...options,
      }).format(date);
    },
    getArticleIcon(type) {
      if (type === Article.Types.Product.code) return "storefront";
      if (type === Article.Types.SelldoneHelp.code) return "support";
      if (type === "company") return "business";
      return "sticky_note_2";
    },
    getArticleKind(type) {
      return this.$t(
        type === Article.Types.Product.code
          ? "blog_timeline.modern.product"
          : type === Article.Types.Blog.code ||
              type === Article.Types.SelldoneBlog.code
            ? "blog_timeline.modern.blog"
            : "blog_timeline.modern.article",
      );
    },
    fetchData() {
      const request = ++this.request_id;
      this.busy = true;
      this.load_error = false;

      let url = null;
      if (
        this.articleType === Article.Types.Blog.code ||
        this.articleType === Article.Types.Product.code
      )
        url = this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.GET_MY_VENDOR_SHOP_ARTICLES_TIMELINE(
              this.$route.params.vendor_id,
            )
          : window.ARTICLE_API.GET_SHOP_ARTICLES_TIMELINE(this.shopId);
      else if (
        this.articleType === Article.Types.SelldoneHelp.code ||
        this.articleType === Article.Types.SelldoneBlog.code
      )
        url = window.ADMIN_API.GET_SAMIN_ARTICLES_TIMELINE();

      if (!url) {
        this.busy = false;
        this.load_error = true;
        return Promise.resolve();
      }

      return axios
        .get(url)
        .then(({ data }) => {
          if (request !== this.request_id) return;
          if (!data.error) {
            if (!Array.isArray(data.timeline))
              throw new Error("Invalid timeline response");
            this.timeline = data.timeline;
          } else {
            this.load_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (request !== this.request_id) return;
          this.load_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request === this.request_id) this.busy = false;
        });
    },

    getArticleTypeColor(type) {
      if (!type) return "#333";

      let obj = Object.values(Article.Types).find((val) => {
        // console.log("type", type);
        return val.code === type;
      });
      return obj ? obj.color : "#eee";
    },
    getArticleLink(article) {
      if (article.parent_type === Article.Types.Product.code)
        return {
          name: "ProductAdmin_EditArticle",
          params: { product_id: article.parent_id },
        };
      else if (article.parent_type === Article.Types.Blog.code)
        return {
          name: "BPageShopBlogsEdit",
          params: { blog_id: article.parent_id }, // Shop blog param is article_id!
        };
      else if (article.parent_type === Article.Types.SelldoneBlog.code)
        return {
          name: "Blog",
          params: { blog_id: article.parent_id },
        };
      else if (article.parent_type === Article.Types.SelldoneHelp.code)
        return {
          name: "OPageHelp",
          params: { help_id: article.parent_id },
        };

      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
.s-articles-timeline.s-articles-timeline--modern {
  padding: 26px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  .s-articles-timeline__header {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    margin-block-end: 26px;
  }
  .s-articles-timeline__heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }
  .s-articles-timeline__section-icon {
    flex-shrink: 0;
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
  }
  h1 {
    margin: 0 0 4px;
    font-family: inherit;
    font-size: 18px;
    font-weight: 600;
    line-height: 25px;
    letter-spacing: 0;
  }
  .s-articles-timeline__subtitle {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  .s-articles-timeline__icon-button {
    --sd-modern-icon-button-size: 32px;
    border-radius: 8px;
  }
  .s-articles-timeline__context {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-block-end: 24px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  .s-articles-timeline__timezone {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .s-articles-timeline__day {
    display: grid;
    grid-template-columns: 116px 16px minmax(0, 1fr);
    gap: 0 16px;
  }
  .s-articles-timeline__day-label {
    margin: 0;
    padding-block-start: 14px;
    font-family: inherit;
    font-weight: 400;
  }
  .s-articles-timeline__weekday {
    display: block;
  }
  .s-articles-timeline__date {
    display: block;
    margin-block-start: 4px;
    font-size: 13px;
    line-height: 20px;
  }
  .s-articles-timeline__year {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  .s-articles-timeline__rail {
    position: relative;
    display: flex;
    justify-content: center;
    &::before {
      content: "";
      position: absolute;
      inset-block: 22px -22px;
      width: 1px;
      background: var(--sd-modern-border);
    }
  }
  .s-articles-timeline__day:last-of-type .s-articles-timeline__rail::before {
    inset-block-end: 34px;
  }
  .s-articles-timeline__dot {
    position: relative;
    z-index: 1;
    margin-block-start: 21px;
    width: 7px;
    height: 7px;
    flex: 0 0 7px;
    border-radius: 50%;
    background: rgb(var(--v-theme-on-surface));
    box-shadow: 0 0 0 5px rgb(var(--v-theme-surface));
  }
  .s-articles-timeline__entries {
    min-width: 0;
    padding-block-end: 12px;
  }
  .s-articles-timeline__entry {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 72px 32px;
    gap: 12px;
    align-items: start;
    padding: 12px 0;
    & + .s-articles-timeline__entry {
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
  .s-articles-timeline__cover {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 48px;
    margin-block-start: 2px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    color: var(--sd-modern-muted);
    background: var(--sd-modern-inset);
    > .v-img {
      border-radius: inherit;
    }
  }
  .s-articles-timeline__copy {
    min-width: 0;
  }
  .s-articles-timeline__title {
    display: block;
    margin: 0 0 4px;
    padding: 0;
    border: 0;
    color: rgb(var(--v-theme-on-surface));
    background: transparent;
    text-align: start;
    text-decoration: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  a.s-articles-timeline__title:hover {
    color: rgb(var(--v-theme-primary));
  }
  .s-articles-timeline__title:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 3px;
  }
  .s-articles-timeline__entry:focus-within
    .s-articles-timeline__cover
    > .hover-scale {
    position: relative;
    transform: scale(var(--scale));
    z-index: 20;
  }
  .s-articles-timeline__description {
    margin: 0 0 9px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
    overflow-wrap: anywhere;
  }
  .s-articles-timeline__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 10px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  .s-articles-timeline__kind {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    color: rgb(var(--v-theme-on-surface));
  }
  .s-articles-timeline__product-image {
    flex: 0 0 12px;
  }
  .s-articles-timeline__time {
    font-size: 13px;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
    text-align: end;
    white-space: nowrap;
    small {
      display: block;
      color: var(--sd-modern-muted);
      font-size: 10px;
      line-height: 16px;
      font-weight: 400;
      letter-spacing: 0.65px;
      text-transform: uppercase;
    }
  }
  .s-articles-timeline__open {
    margin-block-start: 4px;
  }
  .s-articles-timeline__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0;
    min-height: 310px;
    padding: 38px 18px 52px;
    text-align: center;
    > .v-icon {
      color: var(--sd-modern-muted);
      margin-block-end: 16px;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 500;
      line-height: 23px;
    }
    p {
      max-width: 330px;
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 20px;
    }
  }
  .s-articles-timeline__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 300px;
    color: var(--sd-modern-muted);
  }
  .s-articles-timeline__error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 16px;
    border-radius: 10px;
    > .v-icon {
      flex-shrink: 0;
      margin-block-start: 1px;
    }
    > div {
      flex: 1;
      min-width: 0;
    }
    strong {
      font-weight: 500;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      line-height: 19px;
    }
  }
  .s-articles-timeline__retry.v-btn {
    min-height: 32px;
    padding: 6px 10px;
    border-radius: 8px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    font-size: 12px;
    font-weight: 500;
  }
  .s-articles-timeline__footer {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
    > .v-icon {
      margin-block-start: 2px;
      flex-shrink: 0;
    }
    p {
      margin: 0;
    }
  }
}
@media (max-width: 760px) {
  .s-articles-timeline.s-articles-timeline--modern {
    padding: 20px 18px;
    .s-articles-timeline__day {
      grid-template-columns: 14px minmax(0, 1fr);
      gap: 0 12px;
    }
    .s-articles-timeline__day-label {
      grid-column: 2;
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 6px;
      padding: 12px 0 2px;
    }
    .s-articles-timeline__date {
      margin: 0;
    }
    .s-articles-timeline__rail {
      grid-column: 1;
      grid-row: 1 / span 2;
      &::before {
        inset-block-start: 23px;
      }
    }
    .s-articles-timeline__dot {
      margin-block-start: 22px;
    }
    .s-articles-timeline__entries {
      grid-column: 2;
    }
    .s-articles-timeline__entry {
      grid-template-columns: 44px minmax(0, 1fr) 44px;
      gap: 10px;
    }
    .s-articles-timeline__open {
      grid-column: 3;
      grid-row: 1;
      margin: 0;
    }
    .s-articles-timeline__copy {
      grid-column: 2;
      grid-row: 1;
    }
    .s-articles-timeline__cover {
      grid-column: 1;
      grid-row: 1;
    }
    .s-articles-timeline__time {
      grid-column: 2 / -1;
      grid-row: 2;
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 6px;
      text-align: start;
      white-space: normal;
      > time,
      small {
        white-space: nowrap;
      }
      small {
        order: -1;
      }
    }
    .s-articles-timeline__icon-button {
      --sd-modern-icon-button-size: 44px;
    }
  }
}
@media (max-width: 480px) {
  .s-articles-timeline.s-articles-timeline--modern {
    padding: 20px 14px;
    .s-articles-timeline__heading {
      gap: 9px;
    }
    .s-articles-timeline__section-icon {
      display: none;
    }
    .s-articles-timeline__header {
      gap: 12px;
      margin-block-end: 22px;
    }
    .s-articles-timeline__copy {
      grid-column: 2 / -1;
    }
    .s-articles-timeline__open {
      grid-column: 3;
      grid-row: 2;
    }
    .s-articles-timeline__time {
      grid-column: 2;
    }
    .s-articles-timeline__title {
      font-size: 14px;
      line-height: 20px;
    }
    .s-articles-timeline__meta {
      gap: 4px 8px;
    }
    .s-articles-timeline__empty {
      min-height: 330px;
      padding-inline: 4px;
    }
    .s-articles-timeline__error {
      flex-wrap: wrap;
      .s-articles-timeline__retry {
        margin-inline-start: 28px;
      }
    }
  }
}
@media (pointer: coarse) {
  .s-articles-timeline.s-articles-timeline--modern {
    .s-articles-timeline__icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    .s-articles-timeline__entry {
      grid-template-columns: 48px minmax(0, 1fr) 72px 44px;
    }
    .s-articles-timeline__retry.v-btn {
      min-height: 44px;
    }
  }
}
@media (pointer: coarse) and (max-width: 760px) {
  .s-articles-timeline.s-articles-timeline--modern .s-articles-timeline__entry {
    grid-template-columns: 44px minmax(0, 1fr) 44px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .s-articles-timeline--modern .hover-scale {
    --duration: 0s;
    transition: none !important;
  }
}
</style>
