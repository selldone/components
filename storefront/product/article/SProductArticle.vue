<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <article-viewer
    v-if="has_article"
    :article-type="Article.Types.Product.code"
    :hide-title="hideTitle"
    :initial-article-pack="$product.article_pack"
    :need-create-new="$product.should_add_article && !$product.article_pack"
    :owner="$product.user_id === USER_ID()"
    :product-id="$product.id"
    :shop="$shop"
    :shop-id="$shop.id"
    :show-author-info="false"
    :show-share-buttons="false"
    :show-user-feedback-buttons="false"
    :tags="`${slugify(
      $product.category ? $product.category.title : null,
    )},${slugify($product.title)},${slugify($product.title_en)}`"
    :target-id="$product.article_pack ? $product.id : 'new'"
    class="s--product-section-article my-16"
    no-return-back-on-delete
    @delete="
      () => {
        $product.article_pack = null;
        show_article = false; //  force refresh!
        $nextTick(() => {
          show_article = true;
        });
      }
    "
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ArticleViewer from "@selldone/components-vue/article/ArticleViewer.vue";
import { Article } from "@selldone/core-js/models";

export default defineComponent({
  name: "SProductArticle",
  components: { ArticleViewer },
  inject: ["$shop", "$product"],

  data() {
    return {
      Article: Article,

      show_article: true, // For refresh article!
    };
  },
  props: {
    hideTitle: Boolean,
  },
  computed: {
    has_article() {
      return (
        this.$product?.article_pack?.article?.title &&
        this.$product?.article_pack?.article?.body
      );
    },
  },
});
</script>

<style scoped lang="scss">
.s--product-section-article {
  max-width: var(--max-width);
  margin-left: auto;
  margin-right: auto;
}
</style>
