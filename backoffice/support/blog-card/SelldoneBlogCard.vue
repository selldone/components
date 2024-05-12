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
  <v-card
    v-if="!error"
    :caption="
      current_blog && current_blog.article.schedule_at
        ? getFromNowString(current_blog.article.schedule_at)
        : null
    "
    :class="{
      small: small,
      'is-draft':
        current_blog &&
        !current_blog.article.published &&
        !current_blog.article.schedule_at,
      'is-private':
        current_blog &&
        current_blog.article.published &&
        current_blog.article.private,
      'is-schedule-at':
        current_blog &&
        !current_blog.article.published &&
        current_blog.article.schedule_at,
    }"
    :max-width="maxWidth"
    :style="{ minHeight: minHeight, height: height }"
    :target="target"
    :to="
      current_blog
        ? {
            name: current_blog.article.slug ? 'BlogSlug' : 'Blog',
            params: {
              blog_id: current_blog.id,
              slug: current_blog.article.slug,
            },
          }
        : null
    "
    class="blog-card mx-auto text-start article-card-extra"
  >
    <div v-if="current_blog">
      <v-img
        v-if="current_blog.article.image"
        :height="imageHeight ? imageHeight : small ? 140 : 240"
        :src="getShopImagePath(current_blog.article.image)"
        class="blog-card-header border-bottom"
        cover
      >
        <v-chip
          v-if="current_blog.article.user"
          class="m-2 small font-weight-medium absolute-bottom-start"
          color="#fff" variant="flat"
        >
          <s-blog-card-author-category
            :user="current_blog.article.user"
          ></s-blog-card-author-category>
        </v-chip>
      </v-img>

      <v-card-subtitle
        v-if="!small || current_blog.category"
        class="pt-2 pb-0"
        style="min-height: 28px"
      >
        {{ current_blog.category }}
      </v-card-subtitle>

      <v-card-title class="title-blog">
        {{ current_blog.article.title }}
      </v-card-title>
      <v-card-title v-if="showDescription">
        {{ current_blog.article.description }}
      </v-card-title>
    </div>

    <v-skeleton-loader
      v-else
      :max-width="maxWidth"
      min-width="320"
      type="card"
    ></v-skeleton-loader>
  </v-card>
</template>

<script>

import SBlogCardAuthorCategory from "../../../storefront/blog/card/author-category/SBlogCardAuthorCategory.vue";

export default {
  name: "SelldoneBlogCard",
  components: { SBlogCardAuthorCategory },
  props: {
    blog: {},
    autoFetch: { type: Boolean, default: false },
    blogId: {},

    maxWidth: {
      default: 400,
    },
    small: { type: Boolean, default: false },

    target: {},

    minHeight: {},
    height: {},
    imageHeight: {},
    showDescription: { type: Boolean, default: false },
  },

  data: () => ({
    fetched_blog: null,
    error: false,
  }),

  computed: {
    current_blog() {
      return this.autoFetch ? this.fetched_blog : this.blog;
    },
  },

  watch: {
    blogId(blogId) {
      this.fetched_blog = null;

      if (!this.autoFetch || !blogId) return;
      this.fetchBlog();
    },
  },

  created() {
    if (this.autoFetch && this.blogId) {
      this.fetchBlog();
    }
  },

  methods: {
    fetchBlog() {
      axios
        .get(window.GAPI.GET_BLOG_DIGEST(this.blogId))
        .then(({ data }) => {
          if (!data.error) {
            this.fetched_blog = { article: data.article, id: this.blogId };
            this.$emit("update:blog", this.fetched_blog);
          } else {
            // this.showErrorAlert(null, data.error_msg);
            this.error = true;
          }
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {});
    },
  },
};
</script>

<style lang="scss">
.blog-card {
  letter-spacing: normal !important;
  min-height: 100%;
  border-radius: 18px !important;
  overflow: hidden;
  // box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.04);

  transition: all 0.45s !important;
  cursor: pointer;
  box-shadow: 3px 4px 20px 3px rgba(0, 0, 0, 0.05) !important;

  &:hover {
    border-radius: 28px !important;

    box-shadow: 5px 10px 20px 5px rgba(0, 0, 0, 0.13) !important;
    transition: all 0.35s !important;
    background-color: #fff !important;
    z-index: 3;
    transform: translateY(-2px);
  }

  .blog-card-header {
    border-radius: 8px 8px 0 0;

    /* .v-chip{
               position: relative;
               rigth: 8px;
               top: calc(100% - 44px);
             }*/
  }

  .title-blog {
    font-size: 1.45rem;
    color: #4f4f4f;
    line-height: 2.3rem;
    font-weight: 800;
    min-height: 8rem;
    @media (max-width: 1320px) {
      font-size: 1.3rem;
    }
  }

  &.small {
    .title-blog {
      font-size: 1rem;
      line-height: 1.8rem;
      min-height: 5rem;
    }
  }
}

.article-card-extra {
  &.is-draft {
    border: solid #ffa000 4px !important;

    &:after {
      font-weight: 600;
      position: absolute;
      bottom: 2px;
      font-size: 10px;
      left: 14px;
      content: "Draft";
      color: #ffa000;
    }
  }

  &.is-private {
    border: solid #d32f2f 4px !important;

    &:after {
      font-weight: 600;
      position: absolute;
      bottom: 2px;
      font-size: 10px;
      left: 14px;
      content: "Private";
      color: #d32f2f;
    }
  }

  &.is-schedule-at {
    border: solid #1976d2 4px !important;

    &:after {
      font-weight: 600;
      position: absolute;
      bottom: 2px;
      font-size: 10px;
      left: 14px;
      content: "Schedule at: " attr(caption);
      color: #1976d2;
    }
  }
}
</style>
