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

  <div>
    <s-progress-loading v-if="busy"></s-progress-loading>
    <v-timeline v-else :density="$vuetify.display.mdAndDown ? 'compact':undefined">
      <v-timeline-item
        v-for="_article in timeline"
        :key="_article.id"
        :dot-color="getArticleTypeColor(_article.parent_type)"
        :size="_article.id !== currentArticleId ? 'small':undefined"
      >
        <template v-slot:icon>
          <v-avatar
            :size="_article.id !== currentArticleId ? 48 : 76"
            class="hover-scale"
            :class="{
              'avatar-gradient -thin -current':_article.id === currentArticleId,
              'avatar-gradient -thin -gray': _article.id !== currentArticleId,
            }"
            :image="_article.image"
            icon="circle"
          >
          </v-avatar>
        </template>

        <template v-slot:opposite>
          <s-value-dashed>
            <template v-slot:label>
              <v-icon size="small" class="me-1">schedule</v-icon>
              {{ $t("global.article.schedule_dialog.publish_at") }}
            </template>
            <b v-text="getLocalTimeString(_article.schedule_at)" />
          </s-value-dashed>

          <s-value-dashed>
            <template v-slot:label>
              <v-icon size="small" class="me-1">edit_note</v-icon>
              {{ $t("global.article.schedule_dialog.last_edit") }}
            </template>
            <b>{{ getLocalTimeString(_article.updated_at, true) }}</b>
          </s-value-dashed>
        </template>
        <div class="widget-box">
          <h2 class="mb-2">
            <v-icon
              class="me-1"
              :color="getArticleTypeColor(_article.parent_type)"
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
            <s-value-dashed>
              <template v-slot:label>
                <v-icon size="small" class="me-1">schedule</v-icon>
                {{ $t("global.article.schedule_dialog.publish_at") }}
              </template>
              <b v-text="getLocalTimeString(_article.schedule_at)" />
            </s-value-dashed>

            <s-value-dashed>
              <template v-slot:label>
                <v-icon size="small" class="me-1">edit_note</v-icon>
                {{ $t("global.article.schedule_dialog.last_edit") }}
              </template>
              <b>{{ getLocalTimeString(_article.updated_at, true) }}</b>
            </s-value-dashed>
          </div>

          <p v-if="_article.parent_type === 'product'" class="m-2">
            <v-avatar start class="hover-scale" size="24">
              <v-img
                v-if="_article.parent_id"
                :src="getProductImage(_article.parent_id)" cover
              />
            </v-avatar>
            Article For Product : P-{{ _article.parent_id }}
          </p>

          <div class="text-end mt-4">
            <v-btn
              target="_blank"
              variant="outlined"
              class="nbt"
              :to="getArticleLink(_article)"
              :disabled="_article.id === currentArticleId"
            >
              {{_article.id === currentArticleId?'Current Article': $t("global.article.schedule_dialog.view_action") }}
              <v-icon size="small" class="ms-2">{{
                $t("icons.navigate_next")
              }}</v-icon>
            </v-btn>
          </div>
        </div>
      </v-timeline-item>
    </v-timeline>

    <div v-if="!busy && !timeline.length" class="text-center">
      <v-timeline :density="$vuetify.display.mdAndDown ? 'compact':undefined">
        <v-timeline-item v-for="i in 3" :key="i" dot-color="#eee">
          <template v-slot:icon>
            <v-icon>blur_on</v-icon>
          </template>

          <template v-slot:opposite> </template>
          <div class="widget-box text-center">
            <h2 class="op-0-3">
              <v-icon class="me-1">sticky_note_2 </v-icon>
              ...
            </h2>
          </div>
        </v-timeline-item>
      </v-timeline>
      <h2 class="text-h3 font-weight-thin px-2 py-6">No scheduled article!</h2>
    </div>
  </div>
</template>

<script>
import { ArticleTypes } from "@core/enums/article/ArticleTypes";
import SValueDashed from "@components/ui/text/SValueDashed.vue";

export default {
  name: "SArticlesTimeline",
  components: { SValueDashed },
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
  },
  data: () => ({
    timeline: [],
    busy: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {},

  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.busy = true;

      let url = null;
      if (
        this.articleType === ArticleTypes.Blog.code ||
        this.articleType === ArticleTypes.Product.code
      )
        url = this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.GET_MY_VENDOR_SHOP_ARTICLES_TIMELINE(
              this.$route.params.vendor_id,
            )
          : window.ARTICLE_API.GET_SHOP_ARTICLES_TIMELINE(this.shopId);
      else if (
        this.articleType === ArticleTypes.SelldoneHelp.code ||
        this.articleType === ArticleTypes.SelldoneBlog.code
      )
        url = window.ADMIN_API.GET_SAMIN_ARTICLES_TIMELINE();

      axios
        .get(url)
        .then(({ data }) => {
          if (!data.error) {
            this.timeline = data.timeline;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .finally(() => {
          this.busy = false;
        });
    },

    getArticleTypeColor(type) {
      if (!type) return "#333";

      let obj = Object.values(ArticleTypes).find((val) => {
       // console.log("type", type);
        return val.code === type;
      });
      return obj ? obj.color : "#eee";
    },
    getArticleLink(article) {
      if (article.parent_type === ArticleTypes.Product.code)
        return {
          name: "ProductAdmin_EditArticle",
          params: { product_id: article.parent_id },
        };
      else if (article.parent_type === ArticleTypes.Blog.code)
        return {
          name: "BPageShopBlogsEdit",
          params: { blog_id: article.parent_id }, // Shop blog param is article_id!
        };
      else if (article.parent_type === ArticleTypes.SelldoneBlog.code)
        return {
          name: "Blog",
          params: { blog_id: article.parent_id },
        };
      else if (article.parent_type === ArticleTypes.SelldoneHelp.code)
        return {
          name: "Help",
          params: { help_id: article.parent_id },
        };

      return null;
    },
  },
};
</script>

<style scoped lang="scss"></style>
