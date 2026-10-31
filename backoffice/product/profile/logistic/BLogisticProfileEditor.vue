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
  <div :class="{ 'b-logistic-profile-editor--modern text-start': modern }">
    <section v-if="modern" class="sd-modern-widget b-logistic-profile-editor__widget">
      <header class="b-logistic-profile-editor__header">
        <div class="b-logistic-profile-editor__heading">
          <b-product-edit-info-icon name="FileText" :size="18" />
          <h2>{{ $t('logistic_profile_editor.refined.title') }}</h2>
        </div>
        <div v-if="editable" class="b-logistic-profile-editor__actions">
          <v-btn class="sd-modern-button sd-modern-button--inline b-logistic-profile-editor__add-language" color="primary" variant="text" :disabled="!can_mutate || editing || !free_languages?.length" @click="addNew">
            <template #prepend><b-product-edit-info-icon name="Languages" :size="16" /></template>
            {{ $t('logistic_profile_editor.refined.add_language') }}
            <v-tooltip v-if="!free_languages?.length" activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('logistic_profile_editor.refined.all_languages') }}</v-tooltip>
          </v-btn>
          <v-menu v-if="article?.id" :disabled="!can_mutate || editing" location="bottom end">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-icon-button b-logistic-profile-editor__more" icon variant="text" :disabled="!can_mutate || editing" :aria-label="$t('logistic_profile_editor.refined.actions')">
                <b-product-edit-info-icon name="Ellipsis" :size="16" class="b-logistic-profile-editor__more-icon" />
                <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('logistic_profile_editor.refined.actions') }}</v-tooltip>
              </v-btn>
            </template>
            <v-list class="sd-modern-select-menu text-start">
              <v-list-item v-for="item in auto_translation_items" :key="item.title" :disabled="!can_mutate || editing" @click="item.click()">
                <template #prepend><b-product-edit-info-icon name="Languages" :size="16" class="me-3" /></template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
              <v-list-item :disabled="!can_mutate || editing || articles.length <= 1" @click="deleteArticle">
                <template #prepend><b-product-edit-info-icon name="Trash2" :size="16" class="me-3" /></template>
                <v-list-item-title>{{ $t('logistic_profile_editor.content.delete_article') }}</v-list-item-title>
                <v-tooltip v-if="articles.length <= 1" activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('logistic_profile_editor.refined.last_language') }}</v-tooltip>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </header>
      <p class="b-logistic-profile-editor__description">{{ $t('logistic_profile_editor.refined.subtitle') }}</p>
      <div v-if="articles.length" class="b-logistic-profile-editor__languages" role="group" :aria-label="$t('logistic_profile_editor.content.language_input')">
        <v-btn v-for="item in articles" :key="item.id" class="b-logistic-profile-editor__language" :class="{ 'b-logistic-profile-editor__language--selected': article?.id === item.id }" variant="text" :aria-pressed="article?.id === item.id" :disabled="editing || operation_busy" @click="selectArticle(item)">
          {{ getLanguageName(item.lang) }}
        </v-btn>
      </div>
      <p class="b-logistic-profile-editor__shared-note">
        <b-product-edit-info-icon name="Info" :size="15" />
        <span>{{ $t('logistic_profile_editor.refined.shared_scope') }}</span>
      </p>

      <template v-if="article">
        <u-language-input v-if="editing && languages?.length > 1" v-model="article.lang" class="sd-modern-underlined-field b-logistic-profile-editor__language-input" :available-languages="article_languages" :label="$t('logistic_profile_editor.content.language_input')" :disabled="operation_busy" variant="plain" hide-details @update:model-value="markChanged" />
        <div class="master-article-container b-logistic-profile-editor__article" :aria-busy="operation_busy" :inert="mutation_busy ? '' : undefined" @input.capture="markChanged">
          <s-article-editor
            :key="editor_revision"
            ref="editor"
            v-model:body="article.body"
            v-model:title="article.title"
            :upload-url="window.ARTICLE_API.UPLOAD_ARTICLE_BLOG_IMAGE(shop.id)"
            :suffix-id="`logistic-profile-${$.uid}-${editor_revision}`"
            :language="article.lang"
            :edit="editable && editing"
            :only-view="!editing"
            workspace
            class="article b-logistic-profile-editor__rich-editor"
            @change="markChanged"
            @workspace-busy="editor_busy = $event"
            @workspace-pending="editor_pending = $event"
          />
        </div>
        <div v-if="editing" class="b-logistic-profile-editor__edit-footer">
          <p>{{ $t('logistic_profile_editor.refined.save_scope') }}</p>
          <div class="b-logistic-profile-editor__edit-actions">
            <v-btn class="sd-modern-button b-logistic-profile-editor__cancel" variant="outlined" :disabled="mutation_busy || editor_busy || editor_pending" @click="cancelEdit">{{ $t('logistic_profile_editor.refined.cancel_edit') }}</v-btn>
            <v-btn class="sd-modern-button sd-modern-button--primary b-logistic-profile-editor__save" color="primary" variant="flat" :loading="busy_save" :disabled="!changed || !can_mutate || editor_pending" @click="saveArticle">
              <template #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>
              {{ $t('logistic_profile_editor.refined.save_content') }}
            </v-btn>
          </div>
        </div>
        <div v-else class="b-logistic-profile-editor__preview-footer">
          <span>{{ getLanguageName(article.lang) }}</span>
          <v-btn v-if="editable" class="sd-modern-button sd-modern-button--inline b-logistic-profile-editor__edit" variant="text" color="primary" :disabled="!can_mutate" @click="startEdit">
            <template #prepend><b-product-edit-info-icon name="SquarePen" :size="16" /></template>
            {{ $t('logistic_profile_editor.refined.edit') }}
          </v-btn>
        </div>
      </template>
      <div v-else class="b-logistic-profile-editor__empty">
        <b-product-edit-info-icon name="FileText" :size="28" />
        <h3>{{ $t('logistic_profile_editor.refined.no_content') }}</h3>
        <p>{{ $t(editable ? 'logistic_profile_editor.refined.no_content_body' : 'logistic_profile_editor.refined.read_only_empty') }}</p>
      </div>
    </section>
    <template v-else>
    <div v-if="languages?.length > 1" :class="modern ? 'sd-modern-widget mb-5' : 'widget-box -large mb-5'">
      <u-widget-header
        :title="$t('logistic_profile_editor.languages.title')"
        icon="language"
        :class="{ 'sd-modern-form-header': modern }"
        add-icon="translate"
        @click:add="addNew"
        :add-caption="!modern && editable ? $t('logistic_profile_editor.languages.add_caption') : undefined"
        :disabled="!free_languages || !free_languages.length || !editable"
        :disabled-reason="
          $t('logistic_profile_editor.languages.no_more_language')
        "
      >
        <template v-if="modern && editable" #append-actions>
          <div class="b-logistic-profile-editor__language-action">
            <v-btn
              class="sd-modern-button sd-modern-button--small"
              color="primary"
              variant="flat"
              prepend-icon="translate"
              :disabled="!free_languages || !free_languages.length"
              @click="addNew"
            >{{ $t('logistic_profile_editor.languages.add_caption') }}</v-btn>
            <p v-if="!free_languages || !free_languages.length" class="b-logistic-profile-editor__language-limit">
              {{ $t('logistic_profile_editor.languages.no_more_language') }}
            </p>
          </div>
        </template>
      </u-widget-header>
      <v-list-subheader :class="{ 'b-logistic-profile-editor__description': modern }">
        {{ $t("logistic_profile_editor.languages.subtitle") }}
      </v-list-subheader>
      <v-row align="center" class="px-3" no-gutters>
        <v-btn
          v-for="item in articles"
          :key="item.id"
          :class="{
            'bg-blue-soft text-white': !modern && article && item.id === article.id,
            'b-logistic-profile-editor__language--selected': modern && article && item.id === article.id,
            'b-logistic-profile-editor__language': modern,
          }"
          class="ma-1"
          variant="outlined"
          @click="selectArticle(item)"
          :aria-pressed="article && item.id === article.id"
          stacked
        >
          <b class="mb-1">{{ item.lang }}</b>
          <small
            >{{ getLanguageName(item.lang) }}
          </small>
        </v-btn>
        <v-spacer></v-spacer>
      </v-row>
    </div>

    <v-expand-transition>
      <div v-if="article">
        <div :class="modern ? 'sd-modern-widget sd-modern-form-actions mb-5' : 'widget-box -large mb-5'">
          <u-loading-progress v-if="busy_delete" color="red">
          </u-loading-progress>

          <u-widget-header
            :title="$t('logistic_profile_editor.content.title')"
            icon="article"
            :class="{ 'sd-modern-form-header': modern }"
          >
            <template v-slot:actions v-if="editable">
              <u-language-input
                v-if="languages && languages.length > 1"
                v-model="article.lang"
                :available-languages="languages"
                :label="$t('logistic_profile_editor.content.language_input')"
                prepend-inner-icon="translate"
                variant="plain"
                hide-details
              ></u-language-input>

              <u-smart-menu
                v-if="article.id /*Exclude new articles*/"
                :items="[
                  ...auto_translation_items,
                  {
                    title: $t('logistic_profile_editor.content.delete_article'),
                    icon: 'delete_outline',
                    click: () => deleteArticle(),
                    disabled: this.articles.length <= 1,
                  },
                ]"
              >
                <v-tooltip activator="parent" :location="modern ? 'top' : undefined" :content-class="modern ? 'sd-modern-tooltip text-start' : undefined" :open-on-focus="true">
                  {{ $t("logistic_profile_editor.content.menu_tooltip") }}
                </v-tooltip>
              </u-smart-menu>
            </template>
          </u-widget-header>
          <v-list-subheader :class="{ 'b-logistic-profile-editor__description': modern }">
            {{ $t("logistic_profile_editor.content.subtitle") }}
          </v-list-subheader>

          <div class="master-article-container">
            <s-article-editor
              ref="editor"
              v-model:body="article.body"
              v-model:title="article.title"
              :upload-url="
                window.ARTICLE_API.UPLOAD_ARTICLE_BLOG_IMAGE(shop.id)
              "
              class="article min-height-60vh"
              :edit="editable"
              @change="changed = true"
            ></s-article-editor>
          </div>

          <s-widget-buttons v-if="editable && changed" auto-fixed-position>
            <v-btn
              :loading="busy_save"
              :class="{ 'sd-modern-button': modern }"
              :color="modern ? 'primary' : '#000'"
              size="x-large"
              variant="elevated"
              @click="saveArticle"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save_changes") }}
            </v-btn>
          </s-widget-buttons>
        </div>
      </div>
    </v-expand-transition>
    </template>

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

<script lang="ts">
import { defineComponent } from "vue";
import USmartMenu from "../../../../ui/smart/menu/USmartMenu.vue";
import BAiAutoTranslate from "../../../ai/auto-translate/BAiAutoTranslate.vue";
import SArticleEditor from "../../../../article/SArticleEditor.vue";
import ULanguageInput from "../../../../ui/language/input/ULanguageInput.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default defineComponent({
  name: "BLogisticProfileEditor",
  mixins: [],
  components: {
    UWidgetHeader,
    SWidgetButtons,
    ULanguageInput,
    SArticleEditor,
    BAiAutoTranslate,
    USmartMenu,
    BProductEditInfoIcon,
  },
  emits: ["draft-state"],

  props: {
    shop: { type: Object, required: true },
    profile: { type: Object, required: true },
    articles: { type: Array, required: true },
    editable: Boolean,
    modern: Boolean,
  },

  data: () => ({
    article: null,
    busy_save: false,
    busy_delete: false,

    changed: false,
    editing: false,
    previous_article_id: null,
    editor_revision: 0,
    editor_busy: false,
    editor_pending: false,
    media_busy: false,
    context_revision: 0,
    disposed: false,

    //------------ Auto Translate ----------
    busy_translate: false,
    translate_to_lang: null,
    translate_dialog: false,
  }),
  computed: {
    mutation_busy() { return this.busy_save || this.busy_delete || this.busy_translate; },
    operation_busy() {
      return this.mutation_busy || this.editor_busy || this.media_busy;
    },
    can_mutate() {
      return this.editable && !!this.shop?.id && !!this.profile?.id && !this.operation_busy;
    },
    article_languages() {
      return this.languages?.filter((language) => !this.articles.some((item) => item.id !== this.article?.id && item.lang === language));
    },
    draft_state() {
      return { dirty: this.editing || this.editor_pending, busy: this.operation_busy };
    },
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
            title:
              this.$t("logistic_profile_editor.translate_to") +
              ` ${this.getLanguageName(language)}`,
            icon: "translate",
            click: () => this.showTranslate(language),
          });
        }
      });

      return out;
    },
  },

  watch: {
    profile() {
      if (this.modern) return this.resetContext();
      // Auto select first:
      if (this.articles.length) this.article = this.articles[0];
    },
    "shop.id"() { if (this.modern) this.resetContext(); },
    articles() { if (this.modern) this.resetContext(); },
    editable(value) { if (this.modern && !value) this.resetContext(); },
    draft_state: {
      immediate: true,
      deep: true,
      flush: "sync",
      handler(state) { if (this.modern) this.$emit("draft-state", state); },
    },
  },

  created() {},

  beforeUnmount() {
    this.disposed = true;
    this._mediaObserver?.disconnect();
  },
  updated() {
    if (this.modern) this.observeMedia();
  },
  mounted() {
    if (this.modern) return this.resetContext();
    // Auto select first:
    if (this.articles.length) this.article = this.articles[0];
  },
  methods: {
    detachedArticle(article) {
      return article ? JSON.parse(JSON.stringify(article)) : null;
    },
    resetContext() {
      this.context_revision++;
      this._translateContext = null;
      this.busy_save = this.busy_delete = this.busy_translate = false;
      this.editing = this.changed = this.editor_busy = this.editor_pending = this.media_busy = false;
      this.translate_dialog = false;
      this.article = this.detachedArticle(this.articles[0]);
      this.editor_revision++;
    },
    requestContext() {
      return { revision: this.context_revision, shop: this.shop.id, profile: this.profile.id, article: this.article, articles: this.articles };
    },
    isCurrent(context) {
      return !this.disposed && this.editable && context.revision === this.context_revision &&
        context.shop === this.shop.id && context.profile === this.profile.id &&
        context.article === this.article && context.articles === this.articles;
    },
    markChanged() {
      if (!this.modern) this.changed = true;
      else if (this.editable && this.editing && !this.mutation_busy) {
        const editor = this.$refs.editor;
        const fields = editor?.$refs;
        const title = fields?.editable_title;
        const body = fields?.editable_body;
        // The native rich editor also emits change while initializing an empty draft.
        if (!this.article?.id && !this.changed) {
          if (editor?.$props.onlyView) return;
          if ((!title || !body) && !this.article?.title && !this.article?.body) return;
          if (title && body && !title.textContent?.trim() && !body.textContent?.trim() &&
            !body.querySelector("img, video, audio, iframe, canvas, code-editor, images-compare, .code-editor, .images-compare, .flip-book, .image-overlay-canvas")) return;
        }
        this.changed = true;
      }
    },
    startEdit() {
      if (!this.modern || !this.can_mutate || !this.article || this.editing) return;
      this.article = this.detachedArticle(this.article);
      this.changed = false;
      this.editing = true;
      this.editor_revision++;
    },
    cancelEdit() {
      if (!this.modern || this.mutation_busy || this.editor_busy || this.editor_pending) return;
      const saved = this.articles.find((item) => item.id === (this.article?.id || this.previous_article_id)) || this.articles[0];
      this.article = this.detachedArticle(saved);
      this.editing = this.changed = this.media_busy = false;
      this.editor_revision++;
    },
    observeMedia() {
      const element = this.$refs.editor?.$el;
      if (!element || this._mediaTarget === element || typeof MutationObserver === "undefined") return;
      this._mediaObserver?.disconnect();
      this._mediaTarget = element;
      // Native image previews keep their blob URL until the authorized upload returns its stored URL.
      const sync = () => {
        if (this.disposed || this._mediaTarget !== this.$refs.editor?.$el) return;
        this.media_busy = !!(this.editing && element.querySelector('.medium-insert-images-progress, img[src^="blob:"]'));
      };
      this._mediaObserver = new MutationObserver(sync);
      this._mediaObserver.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
      sync();
    },
    showTranslate(lang) {
      if (!this.editable || this.operation_busy || (this.modern && (this.editing || !this.article?.id || !this.free_languages?.includes(lang)))) return;
      if (this.modern) this._translateContext = this.requestContext();
      this.translate_to_lang = lang;
      this.translate_dialog = true;
    },

    requestAutoTranslate(to_lang) {
      if (!this.editable || this.operation_busy || !this.article?.id ||
        (this.modern && (this.editing || !this.free_languages?.includes(to_lang) || !this._translateContext || !this.isCurrent(this._translateContext)))) return;
      const context = this.requestContext();

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
          if (this.modern && !this.isCurrent(context)) return;
          if (!data.error) {
            this.AddOrUpdateItemByID(this.articles, data.article);
            if (this.modern) this.busy_translate = false;
            this.selectArticle(data.article);
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "logistic_profile_editor.notifications.translate.message",
              ),
            );
            this.translate_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (this.modern && !this.isCurrent(context)) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!this.modern || this.isCurrent(context)) this.busy_translate = false;
        });
    },

    //-----------------------------------------------------------------

    selectArticle(article) {
      if (this.modern) {
        if (this.editing || this.operation_busy || !this.articles.some((item) => item.id === article?.id)) return;
        this.article = this.detachedArticle(article);
        this.changed = false;
        this.editor_revision++;
        return;
      }
      this.article = null;
      this.$nextTick(() => {
        this.article = article;
      });
    },
    addNew() {
      if (!this.editable || this.operation_busy || !this.free_languages?.length) return;
      if (this.modern) {
        if (this.editing) return;
        this.previous_article_id = this.article?.id;
        this.article = { lang: this.free_languages[0], title: null, body: null };
        this.changed = false;
        this.editing = true;
        this.editor_revision++;
        return;
      }
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
      if (!this.editable || this.operation_busy || !this.article ||
        (this.modern && (!this.editing || !this.changed || this.editor_pending || !this.article_languages?.includes(this.article.lang)))) return;
      let pure_title, pure_body;
      try {
        pure_title = this.$refs.editor.purifyTitle();
        pure_body = this.$refs.editor.purifyBody();
      } catch (error) {
        NotificationService.showLaravelError(error);
        return;
      }
      const context = this.requestContext();
      this.busy_save = true;

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
          if (this.modern && !this.isCurrent(context)) return;
          if (!data.error) {
            this.AddOrUpdateItemByID(this.articles, data.article);
            if (this.modern) {
              this.busy_save = false;
              this.editing = false;
              this.article = this.detachedArticle(data.article);
              this.editor_revision++;
            } else this.article = data.article;
            this.changed = false;

            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "logistic_profile_editor.notifications.save_article.message",
              ),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          if (this.modern && !this.isCurrent(context)) return;
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          if (!this.modern || this.isCurrent(context)) this.busy_save = false;
        });
    },

    deleteArticle() {
      if (!this.editable || this.operation_busy || !this.article?.id || (this.modern && (this.editing || this.articles.length <= 1))) return;
      const context = this.requestContext();
      NotificationService.openDangerAlert(
        this.$t("global.actions.delete") + " " + this.article.title,
        this.$t("logistic_profile_editor.delete_dialog.message"),
        this.$t("logistic_profile_editor.delete_dialog.action"),
        () => {
          if (this.modern && !this.isCurrent(context)) return;
          this.deleteArticleNow();
        },
      );
    },
    deleteArticleNow() {
      if (!this.editable || this.operation_busy || !this.article?.id || (this.modern && (this.editing || this.articles.length <= 1))) return;
      const context = this.requestContext();
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
          if (this.modern && !this.isCurrent(context)) return;
          if (!data.error) {
            this.DeleteItemByID(this.articles, data.id);
            if (this.modern) {
              this.busy_delete = false;
              this.article = this.detachedArticle(this.articles[0]);
              this.editor_revision++;
            } else this.article = this.articles[0];

            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "logistic_profile_editor.notifications.delete_article.message",
              ),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          if (this.modern && !this.isCurrent(context)) return;
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          if (!this.modern || this.isCurrent(context)) this.busy_delete = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.b-logistic-profile-editor--modern {
  --sd-modern-icon-button-size: 32px;
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 14px;
  line-height: 25px;

  .b-logistic-profile-editor__widget { margin: 0; padding: 21px; border-radius: 14px; }
  .b-logistic-profile-editor__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
  .b-logistic-profile-editor__heading { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .b-logistic-profile-editor__heading > svg { color: var(--sd-modern-muted); }
  .b-logistic-profile-editor__heading h2 { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: 0; }
  .b-logistic-profile-editor__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .b-logistic-profile-editor__description { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .b-logistic-profile-editor__add-language { font-size: 13px; }
  .b-logistic-profile-editor__more-icon { transform: rotate(90deg); }
  .b-logistic-profile-editor__languages { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding-block: 18px 15px; }
  .b-logistic-profile-editor__language {
    min-width: 0;
    min-height: 34px;
    height: auto;
    padding: 5px 11px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--sd-modern-muted);
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0;
    text-transform: none;
    :deep(.v-btn__content) { font: inherit; letter-spacing: inherit; }
    &.b-logistic-profile-editor__language--selected {
      background: rgb(var(--v-theme-surface));
      color: rgb(var(--v-theme-on-surface));
      border-color: var(--sd-modern-border);
      box-shadow: 0 2px 5px rgba(var(--v-theme-on-surface), .08);
      :deep(.v-btn__overlay) { opacity: 0; }
    }
  }
  .b-logistic-profile-editor__shared-note { display: flex; align-items: flex-start; gap: 8px; margin: 0; padding-block-end: 17px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .b-logistic-profile-editor__shared-note > svg { margin-block-start: 3px; }
  .b-logistic-profile-editor__article { min-width: 0; border-block-start: 1px solid var(--sd-modern-border); padding-block-start: 21px; overflow-wrap: anywhere; color: rgb(var(--v-theme-on-surface)); }
  .b-logistic-profile-editor__rich-editor {
    color: inherit;
    :deep(.s--article-editor-container), :deep(.review-style), :deep(.s-article-editor__title), :deep(.s-article-editor__body), :deep(.s-article-editor__body p) { color: inherit; }
    :deep(.review-style), :deep(.s--article-editor-container > .px-2) { padding-inline: 0 !important; }
    :deep(.s-article-editor__title) { margin: 0 0 14px; font-family: inherit; font-size: 21px !important; font-weight: 500 !important; line-height: 30px !important; letter-spacing: -.25px; }
    :deep(.s-article-editor__body) { padding-block-start: 0 !important; font-family: inherit; font-size: 14px; font-weight: 400; line-height: 25px; }
    :deep(.s-article-editor__body p) { margin-block: 0 12px; font-family: inherit; font-size: 14px; line-height: 25px; }
    :deep(.s-article-editor__body p:last-child) { margin-block-end: 0; }
    :deep(.s-article-editor__body img), :deep(.s-article-editor__body iframe) { max-width: 100%; }
  }
  .b-logistic-profile-editor__preview-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-block-start: 20px; }
  .b-logistic-profile-editor__preview-footer > span { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-logistic-profile-editor__language-input { margin-block-end: 20px; }
  .b-logistic-profile-editor__edit-footer { margin-block-start: 20px; }
  .b-logistic-profile-editor__edit-footer > p { margin: 0 0 12px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .b-logistic-profile-editor__edit-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 10px; }
  .b-logistic-profile-editor__save, .b-logistic-profile-editor__cancel { font-size: 13px; line-height: 20px; }
  .b-logistic-profile-editor__empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 4px 24px; text-align: center; }
  .b-logistic-profile-editor__empty > svg { color: var(--sd-modern-muted); }
  .b-logistic-profile-editor__empty h3 { max-width: 320px; margin: 0; font-size: 15px; font-weight: 500; line-height: 24px; }
  .b-logistic-profile-editor__empty p { max-width: 340px; margin: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 22px; }
}
@media (max-width: 600px), (pointer: coarse) {
  .b-logistic-profile-editor--modern {
    --sd-modern-icon-button-size: 44px;
    .b-logistic-profile-editor__language { min-height: 44px; }
    .b-logistic-profile-editor__rich-editor :deep([contenteditable="true"]) { font-size: 16px; }
    .b-logistic-profile-editor__rich-editor :deep(.s-article-editor__body[contenteditable="true"] p) { font-size: 16px; }
  }
}
@media (max-width: 600px) {
  .b-logistic-profile-editor--modern {
    .b-logistic-profile-editor__widget { padding: 18px; }
    .b-logistic-profile-editor__header { flex-wrap: wrap; gap: 7px; }
    .b-logistic-profile-editor__actions { margin-inline-start: auto; }
    .b-logistic-profile-editor__languages { gap: 4px; }
    .b-logistic-profile-editor__language { padding-inline: 10px; }
    .b-logistic-profile-editor__preview-footer { flex-wrap: wrap; }
    .b-logistic-profile-editor__rich-editor :deep(.s-article-editor__title) { font-size: 20px !important; line-height: 29px !important; }
  }
}
</style>
