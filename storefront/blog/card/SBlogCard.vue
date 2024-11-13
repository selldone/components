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
    :elevation="flat ? 0 : elevation"
    :flat="flat"
    :color="color"
    :rounded="rounded"
    :theme="dark ? 'dark' : 'light'"
    :to="
      !window.ExternalWidget && !viewOnly
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
      window.ExternalWidget && !viewOnly
        ? {
            href: is_product
              ? ShopURLs.GetProductLink(shop, article.parent_id)
              : ShopURLs.GetBlogLink(shop, article.parent_id),
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
        cover
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
    <v-icon v-if="is_product" class="absolute-top-end">shopping_bag</v-icon>

    <v-card-title>
      {{ article.title }}
    </v-card-title>
    <v-card-text class="text-start">
      <s-blog-card-author-category
        :categories="categories"
        :category-name="article.parent ? article.parent.category_id : null"
        :dark="dark"
        :user="article.user"
      ></s-blog-card-author-category>
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

<script lang="ts">
import SBlogCardAuthorCategory from "../../../storefront/blog/card/author-category/SBlogCardAuthorCategory.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { ShopURLs } from "@selldone/core-js";

export default {
  name: "SBlogCard",
  mixins: [DateMixin],
  components: { SBlogCardAuthorCategory },
  props: {
    article: {
      type: Object,
      require: true,
    },
    categories: {},

    flat: {},
    elevation: {
      default: 5,
    },
    rounded: {},
    dark: {},
    color: {},

    viewOnly: Boolean,
  },
  data() {
    return {};
  },
  computed: {
    ShopURLs() {
      return ShopURLs;
    },
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

  methods: {},
};
</script>

<style lang="scss" scoped>
.s--shop-blog-card {
  text-align: start;

  position: relative;
  min-height: 100%;

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

  /*  &.-rect {
      --radius: 0;
    }*/
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
