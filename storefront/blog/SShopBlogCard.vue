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
  <v-card
    :class="{ '-flat': flat, '-rect': rect }"
    :color="color"
    :dark="dark"
    :rounded="rect && '0'"
    :to="
      !window.ExternalWidget
        ? is_product
          ? {
              name: window.$storefront.routes.PRODUCT_PAGE,
              params: { product_id: article.parent_id },
            }
          : {
              name: window.$storefront.routes.SHOP_BLOG_PAGE,
              params: { blog_id: article.parent_id },
            }
        : undefined
    "
    class="s--shop-blog-card d-flex flex-column"
    v-bind="
      window.ExternalWidget
        ? {
            href: is_product
              ? getProductLink(shop, article.parent_id)
              : getBlogLink(shop, article.parent_id),
            target: '',
          }
        : {}
    "
  >
    <div style="min-height: 180px">
      <v-img
        v-if="article.image"
        :src="getShopImagePath(article.image)"
        class="blog-card-header"
        height="180"
      >
        <template v-slot:placeholder>
          <v-progress-circular
            :size="60"
            class="center-absolute"
            indeterminate
          />
        </template>
      </v-img>
    </div>
    <v-icon v-if="is_product" class="absolute-top-end" dark
      >shopping_bag
    </v-icon>

    <v-card-title>
      {{ article.title }}
    </v-card-title>
    <v-card-text class="text-start">
      <s-blog-user-category-view
        :categories="categories"
        :category-name="article.parent ? article.parent.category_id : null"
        :dark="dark"
        :user="article.user"
      ></s-blog-user-category-view>
    </v-card-text>

    <v-card-text
      class="flex-grow-1 text-justify text-subtitle-2 pt-0"
      v-text="article.description"
    >
    </v-card-text>

    <p class="text-end mx-3 mb-2 x-small op-0-6">
      {{ getLocalTimeString(article.created_at, false, true, true) }}

      <v-tooltip location="bottom">
        <template
          v-if="article.created_at !== article.updated_at"
          v-slot:activator="{ props }"
        >
          <v-icon class="mx-2" size="small" v-bind="props">refresh</v-icon>
        </template>
        <span>{{
          getLocalTimeString(article.updated_at, false, true, true)
        }}</span>
      </v-tooltip>
    </p>
  </v-card>
</template>

<script>
import SBlogUserCategoryView from "./SBlogUserCategoryView.vue";

export default {
  name: "SShopBlogCard",
  components: { SBlogUserCategoryView },
  props: {
    article: {
      type: Object,
      require: true,
    },
    categories: {},

    flat: {},
    rect: {},
    dark: {},
    color: {},
  },
  computed: {
    shop() {
      return this.getShop();
    },
    is_blog() {
      return this.article.parent_type === "blog";
    },
    is_product() {
      return this.article.parent_type === "product";
    },
  },
};
</script>

<style lang="scss" scoped>
.s--shop-blog-card {
  --shadow: 0px 2px 40px 0px rgba(0, 0, 0, 0.1);
  --radius: 14px;

  position: relative;
  min-height: 100%;
  border-radius: var(--radius) !important;
  box-shadow: var(--shadow) !important;

  transition: all 0.45s !important;
  cursor: pointer;

  &:hover {
    box-shadow: 5px 10px 20px 5px rgba(0, 0, 0, 0.13) !important;
    transition: all 0.35s !important;
    background-color: #fff !important;
    z-index: 3;
    transform: translateY(-2px);
  }

  .blog-card-header {
    border-radius: var(--radius) var(--radius) 0 0;
  }

  &.-flat {
    --shadow: none;
  }

  &.-rect {
    --radius: 0;
  }
}

.blog-category-title {
  text-align: start;
  color: var(--theme-dark);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 12px 18px 0 18px;
}

.title-blog {
  min-height: 4em;
  @media (max-width: 1320px) {
    font-size: 1.3rem;
  }
  @media (max-width: 400px) {
    font-size: 1.1rem;
  }
}
</style>
