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
  <div>
    <div class="widget-box -large mb-5">
      <v-row align="center" class="px-3" no-gutters>
        <v-btn
          v-for="item in articles"
          :key="item.id"
          :class="{
            'bg-blue-soft text-white': article && item.id === article.id,
          }"
          class="ma-1"
          icon
          @click="selectArticle(item)"
        >
          <b>{{ item.lang }}</b>
          <v-tooltip activator="parent" class="text-start" location="top"
            >{{ getLanguageName(item.lang) }}
          </v-tooltip>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="free_languages && free_languages.length > 0 && editable"
          color="primary"
          icon
          title="Add new article"
          @click="addNew"
        >
          <v-icon>add_circle</v-icon>
        </v-btn>
      </v-row>
    </div>

    <v-expand-transition>
      <div v-if="article">
        <div class="widget-box -large mb-5">
          <u-loading-progress v-if="busy_delete" color="red">
          </u-loading-progress>
          <v-row v-if="editable" no-gutters>
            <u-language-input
              v-if="languages && languages.length > 1"
              v-model="article.lang"
              :available-languages="languages"
              label="Current article language"
              prepend-inner-icon="translate"
              variant="plain"
            ></u-language-input>

            <v-spacer></v-spacer>

            <u-smart-menu
              v-if="article.id /*Exclude new articles*/"
              :items="[
                ...auto_translation_items,
                {
                  title: 'Delete Article',
                  icon: 'delete_outline',
                  click: () => deleteArticle(),
                  disabled: this.articles.length <= 1,
                },
              ]"
            >
              <v-tooltip activator="parent">
                Auto translate / Delete article
              </v-tooltip>
            </u-smart-menu>
          </v-row>

          <div class="master-article-container">
            <s-article-editor
              ref="editor"
              :body="article.body"
              :title="article.title"
              :upload-url="
                window.ARTICLE_API.UPLOAD_ARTICLE_BLOG_IMAGE(shop.id)
              "
              class="article min-height-60vh"
              edit
            ></s-article-editor>
          </div>

          <div v-if="editable" class="widget-buttons">
            <v-btn
              :loading="busy_save"
              color="primary"
              size="x-large"
              variant="flat"
              @click="saveArticle"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-expand-transition>

    <!-- ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ Dialog > Auto Translate ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ -->
    <b-ai-auto-translate
      v-if="article"
      v-model="translate_dialog"
      :busy="busy_translate"
      :from-language="article.lang"
      :shop="shop"
      :to-language="translate_to_lang"
      @requestTranslate="(lang) => requestAutoTranslate(lang)"
    ></b-ai-auto-translate>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import USmartMenu from "../../../../ui/smart/menu/USmartMenu.vue";
import BAiAutoTranslate from "../../../ai/auto-translate/BAiAutoTranslate.vue";
import SArticleEditor from "../../../../article/SArticleEditor.vue";
import ULanguageInput from "../../../../ui/language/input/ULanguageInput.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

export default defineComponent({
  name: "BLogisticProfileEditor",
  components: {
    ULanguageInput,
    SArticleEditor,
    BAiAutoTranslate,
    USmartMenu,
  },

  props: {
    shop: { type: Object, required: true },
    profile: { type: Object, required: true },
    articles: { type: Array, required: true },
    editable: Boolean,
  },

  data: () => ({
    article: null,
    busy_save: false,
    busy_delete: false,

    //------------ Auto Translate ----------
    busy_translate: false,
    translate_to_lang: null,
    translate_dialog: false,
  }),
  computed: {
    // ▃▃▃▃▃▃▃▃▃▃▃▃▃ Languages ▃▃▃▃▃▃▃▃▃▃▃▃▃
    languages() {
      // Available languages of shop!
      return this.shop && ShopOptionsHelper.GetLanguages(this.shop);
    },

    free_languages() {
      return (
        this.languages &&
        this.languages.filter(
          (lang) => !this.articles.some((a) => a.lang === lang),
        )
      );
    },

    auto_translation_items() {
      if (
        !this.languages ||
        !this.article ||
        !this.article.id /*Current article must be saved!*/
      )
        return [];
      const out = [];
      this.languages.forEach((language) => {
        if (!this.articles.some((a) => a.lang === language)) {
          out.push({
            title: `Translate to ${this.getLanguageName(language)}`,
            icon: "translate",
            click: () => this.showTranslate(language),
          });
        }
      });

      return out;
    },
  },

  watch: {},

  created() {},

  unmounted() {},
  mounted() {
    // Auto select first:
    if (this.articles.length) this.article = this.articles[0];
  },
  methods: {
    showTranslate(lang) {
      this.translate_to_lang = lang;
      this.translate_dialog = true;
    },

    requestAutoTranslate(to_lang) {
      console.log("Auto translate to", to_lang);

      this.busy_translate = true;

      axios
        .post(
          window.API.POST_SHOP_LOGISTIC_PROFILE_AUTO_TRANSLATE(
            this.shop.id,
            this.profile.id,
            this.article.id,
          ),
          {
            language: to_lang,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.articles, data.article);
            this.selectArticle(data.article);
            this.showSuccessAlert(
              null,
              "Article translation completed successfully.",
            );
            this.translate_dialog = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_translate = false;
        });
    },

    //-----------------------------------------------------------------

    selectArticle(article) {
      this.article = null;
      this.$nextTick(() => {
        this.article = article;
      });
    },
    addNew() {
      this.article = null;
      this.$nextTick(() => {
        this.article = {
          lang: this.free_languages[0],
          title: null,
          body: null,
        };
      });
    },

    saveArticle() {
      this.busy_save = true;

      const pure_title = this.$refs.editor.purifyTitle();
      const pure_body = this.$refs.editor.purifyBody();

      axios
        .post(
          window.API.POST_SHOP_LOGISTIC_PROFILE_SET_ARTICLE(
            this.shop.id,
            this.profile.id,
          ),
          {
            article_id: this.article.id,
            language: this.article.lang,
            title: pure_title,
            body: pure_body,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.articles, data.article);
            this.article = data.article;

            this.showSuccessAlert(null, "Article has been saved successfully.");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    deleteArticle() {
      this.openDangerAlert(
        "Delete " + this.article.title,
        "Are you sure to delete this article for ever?",
        "Yes, delete now",
        () => {
          this.deleteArticleNow();
        },
      );
    },
    deleteArticleNow() {
      this.busy_delete = true;
      axios
        .delete(
          window.API.DELETE_SHOP_LOGISTIC_PROFILE_ARTICLE(
            this.shop.id,
            this.profile.id,
            this.article.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.DeleteItemByID(this.articles, data.id);
            this.article = this.articles[0];

            this.showSuccessAlert(
              null,
              "Article has been deleted successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped></style>
