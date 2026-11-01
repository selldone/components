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
  <div
    :class="{ '-dark': dark, 'a-article-addon--editable': editable }"
    :data="json_data"
    class="code-editor editor-window a-article-code-surface text-start"
    spellcheck="false"
  >
    <a-addon-toolbar
      v-if="editable"
      :element="element"
      :title="$t('global.commons.code')"
      @click:edit="showEdit()"
    ></a-addon-toolbar>

    <div class="a-article-code__header">
      <div
        v-if="tabs_active?.length || editable"
        class="a-article-code__languages"
        role="group"
        :aria-label="$t('global.article.code_editor.language')"
      >
        <button
          v-for="lang in tabs_active"
          :key="lang"
          type="button"
          dir="ltr"
          class="a-article-code__language"
          :aria-pressed="selected_lang === lang"
          @click="selected_lang = lang"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>
      <v-btn
        class="a-article-code__theme sd-modern-icon-button"
        icon
        variant="text"
        :aria-label="$t('global.article.inline_tools.code_theme')"
        :aria-pressed="dark"
        @click="dark = !dark"
      >
        <v-icon>{{ dark ? "dark_mode" : "light_mode" }}</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip"
          >{{ $t("global.article.inline_tools.code_theme") }}</v-tooltip
        >
      </v-btn>
    </div>

    <div class="a-article-code__body" @click="showEdit()">
      <prism-editor
        :model-value="codes[selected_lang] || ''"
        :highlight="highlighter"
        :language="selected_lang"
        :aria-label="$t('global.article.code_editor.code_label')"
        class="a-article-code__prism scrollable-element-light"
        contenteditable="false"
        line-numbers
        readonly
        @vue:mounted="labelCodeInput"
      />
    </div>
  </div>
</template>

<script lang="ts">
//―――――――――――――――――――――― vue-prism-editor ――――――――――――――――――――
import "prismjs/themes/prism.css";

import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";

import AAddonToolbar from "../toolbar/AAddonToolbar.vue";
import { ArticleMixin } from "../../../mixin/article/ArticleMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { articleAddonContext } from "../toolbar/article-addon-context";
import { highlightArticleCode } from "./article-code-highlight";

export default {
  name: "AAddonCodeEditor",
  mixins: [ArticleMixin],
  components: { PrismEditor, AAddonToolbar },
  props: {
    codes: {},
    editable: {
      type: Boolean,
      default: false,
    },
    masterId: {
      /*Point which dialog open!*/
    },
  },

  data() {
    return {
      selected_lang: "html",

      tabs: ["html", "js", "css", "c", "C++", "php", "python"],

      //---------------
      time: null,

      dark: false,

      element: null,
    };
  },
  computed: {
    tabs_active() {
      const authored = Object.keys(this.codes).filter((key) => this.codes[key]);
      return this.editable
        ? [...new Set([...this.tabs, ...authored])]
        : [...new Set([...this.tabs, ...authored])].filter(
            (key) => this.codes[key],
          );
    },

    json_data() {
      let time = this.time;

      return JSON.stringify(this.codes);
    },
  },

  mounted() {
    this.element = this.$el;
    const available = Object.keys(this.codes).find((x) => this.codes[x]);
    this.selected_lang = available || this.tabs[0];
  },
  methods: {
    labelCodeInput(vnode) {
      vnode.el
        .querySelector("textarea")
        ?.setAttribute(
          "aria-label",
          this.$t("global.article.code_editor.code_label"),
        );
    },
    highlighter(code) {
      return highlightArticleCode(code, this.selected_lang);
    },

    showEdit() {
      if (!this.editable || !articleAddonContext(this.element)) return;
      if (!this.selected_lang) {
        NotificationService.showErrorAlert(
          null,
          "Please select a language to edit code!",
        );
        return;
      }
      const selectedLanguage = this.selected_lang;
      this.ShowCodeEditorGlobalDialog(
        this.codes[this.selected_lang],
        this.selected_lang,
        (code) => {
          const context = this.editable && articleAddonContext(this.element);
          if (!context) return;
          this.codes[selectedLanguage] = code;
          this.time = new Date(); //Force update data!
          this.$forceUpdate();
          this.$nextTick(() => context.core.triggerInput());
        },
        () => {
          const context = this.editable && articleAddonContext(this.element);
          if (!context) return;
          context.element.remove();
          context.core.triggerInput();
        },
        this.masterId,
      );
    },
  },
};
</script>

<style lang="scss">
.prism-editor-wrapper {
  font-size: 1rem;

  &.light-code,
  &.dark-code-theme {
    direction: ltr;
    max-height: 460px;
    min-height: 40px;

    .prism-editor__line-numbers {
      background: #fafafa !important;
      line-height: normal !important;
      padding-top: 14px;
      font-size: 0.8em;
      border-right: #0288d1 solid thick;
      padding-right: 8px;
      user-select: none;
    }

    .prism-editor__container {
      min-height: 100%;

      textarea {
        line-height: normal !important;

        &::selection {
          background: #c0d9ef;
        }
      }

      pre {
        border: none !important;
        // background: #fcfcfc !important;
        line-height: normal !important;

        code {
          background: none !important;

          box-shadow: none !important;
          //padding: 0 12px !important;

          font-family: var(--font) !important;
          font-weight: 500;
        }
      }
    }
  }

  &.dark-code-theme {
    background-color: #1a1a1a;

    .prism-editor__line-numbers {
      background: #000000 !important;
    }

    .prism-editor__container {
      textarea {
        &::selection {
          background: #1f1f1f;
        }
      }
    }

    // ---------------------------- Past form github ----------------------------

    //---------------------------------------------------------------------------------------
  }
}

.code-editor {
  &.editor-window {
    background-color: #fafafa;
    border-radius: 8px;
    padding-bottom: 24px;
  }

  &.-dark {
    background-color: #1a1a1a;
    color: #fff;
  }
}
</style>

<style lang="scss" scoped src="./article-code-editor.scss"></style>
