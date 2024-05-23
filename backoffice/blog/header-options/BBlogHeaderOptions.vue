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
  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Shop Blog Category ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

  <s-article-category-shop-blog-input
    :model-value="categoryId"
    :shop="shop"
    class="m-2 max-width-field s--shadow-no-padding rounded-28px pb-1 ps-1 bg-white"
    clearable
    flat
    rounded
    variant="solo"
    @update:model-value="(v) => setCategoryId(v)"
  >
  </s-article-category-shop-blog-input>

  <b-cluster-input
    :model-value="clusterId"
    :return-object="false"
    class="m-2 max-width-field s--shadow-no-padding rounded-28px pb-1 ps-1 bg-white"
    clearable
    flat
    icon="workspaces_outline"
    label="Resource Cluster"
    no-home
    placeholder="Select a cluster... (optional)"
    rounded
    solo
    @update:model-value="(v) => setClusterId(v)"
  ></b-cluster-input>
</template>

<script>
import { defineComponent } from "vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import SArticleCategoryShopBlogInput from "../../../article/category/shop-blog/SArticleCategoryShopBlogInput.vue";

export default defineComponent({
  name: "BBlogHeaderOptions",
  components: { SArticleCategoryShopBlogInput, BClusterInput },
  props: {
    shop: {
      required: true,
    },
    categoryId: {},
    clusterId: {},
    setCategoryId: { required: true },
    setClusterId: { required: true },
  },
});
</script>

<style lang="scss" scoped></style>
