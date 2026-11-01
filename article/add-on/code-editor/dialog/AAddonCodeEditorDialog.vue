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
  <v-bottom-sheet
    v-model="show_dialog"
    width="98vw"
    max-width="860"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card class="a-article-code-dialog text-start" rounded="t-xl">
      <v-card-title class="a-article-code-dialog__title">
        <v-icon size="20" aria-hidden="true">code</v-icon>
        <span>{{ $t("global.commons.code") }}</span>
        <v-spacer />
        <v-btn
          class="a-article-code-dialog__close sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="$t('global.actions.close')"
          @click="show_dialog = false"
        >
          <v-icon size="16">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </v-card-title>
      <v-card-text class="a-article-code-dialog__content">
        <p class="a-article-code-dialog__description">
          {{ $t("global.article.code_editor.description") }}
        </p>
        <div class="a-article-code-surface" :class="{ '-dark': dark }">
          <div class="a-article-code__header">
            <span class="a-article-code__label" dir="ltr">{{
              language?.toUpperCase()
            }}</span>
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
          <div class="a-article-code__body">
            <prism-editor
              v-model="code"
              :highlight="highlighter"
              :language="language"
              :aria-label="$t('global.article.code_editor.code_label')"
              class="a-article-code__prism scrollable-element-light"
              contenteditable="false"
              line-numbers
              @vue:mounted="labelCodeInput"
            />
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="a-article-code-dialog__actions">
        <v-btn
          v-if="deleteCallback"
          class="a-article-code-dialog__delete"
          variant="text"
          @click="deleteValue"
        >
          <v-icon size="18" start>delete_outline</v-icon>
          {{ $t("global.actions.delete") }}
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="show_dialog = false">
          {{ $t("global.actions.cancel") }}
        </v-btn>
        <v-btn color="primary" variant="flat" @click="setValue">
          <v-icon size="18" start>check</v-icon>
          {{ $t("global.actions.set") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
//―――――――――――――――――――――― vue-prism-editor ――――――――――――――――――――
import "prismjs/themes/prism.css";

import "vue-prism-editor/dist/prismeditor.min.css";

import {
  EventBus,
  EventName,
} from "@selldone/components-vue/utils/events/EventBus.ts";
import { PrismEditor } from "vue-prism-editor";
import { highlightArticleCode } from "../article-code-highlight";

export default {
  name: "AAddonCodeEditorDialog",
  components: { PrismEditor },
  props: {
    masterId: {
      /*Point which dialog open!*/
    },
  },
  data: () => ({
    code: "",
    language: null,
    dark: false,
    callback: null,
    deleteCallback: null,

    // ---------------------------------
    show_dialog: false,
  }),
  watch: {
    show_dialog(val) {
      if (!val) {
        this.code = "";
        this.language = null;
        this.dark = false;
        this.callback = null;
        this.deleteCallback = null;
      }
    },
  },

  mounted() {
    this._openAddonDialog = ({
      code,
      language,
      callback,
      deleteCallback,
      masterId,
    }) => {
      // Check master ID (For prevent duplicated open dialog - in the page builder)
      if (this.masterId !== masterId) {
        return;
      }

      this.code = code || "";
      this.language = language;

      this.callback = callback;
      this.deleteCallback = deleteCallback;

      this.showDialog();
    };
    EventBus.$on(EventName.ARTICLE_CODE_EDITOR_SHOW, this._openAddonDialog);
  },
  beforeUnmount() {
    EventBus.$off(EventName.ARTICLE_CODE_EDITOR_SHOW, this._openAddonDialog);
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
      return highlightArticleCode(code, this.language);
    },

    showDialog() {
      this.show_dialog = true;
    },
    setValue() {
      if (!this.show_dialog || typeof this.callback !== "function") return;
      this.callback(this.code);
      this.show_dialog = false;
    },
    deleteValue() {
      if (!this.show_dialog || typeof this.deleteCallback !== "function")
        return;
      this.deleteCallback();
      this.show_dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped src="../article-code-editor.scss"></style>

<style lang="scss" scoped>
.a-article-code-dialog {
  border-radius: 20px 20px 0 0;
  .a-article-code-dialog__title {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 24px 12px;
    font-size: 18px;
    line-height: 28px;
    font-weight: 600;
  }
  .a-article-code-dialog__close {
    width: 32px;
    min-width: 32px;
    height: 32px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.18);
    border-radius: 7px;
    color: rgb(var(--v-theme-on-surface));
  }
  .a-article-code-dialog__content {
    padding: 0 24px 24px;
  }
  .a-article-code-dialog__description {
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(var(--v-theme-on-surface), 0.72);
  }
  .a-article-code-surface:focus-within {
    outline: 2px solid rgba(var(--v-theme-primary), 0.65);
    outline-offset: 2px;
  }
  :deep(.a-article-code__prism) {
    min-height: min(40vh, 300px);
    max-height: 50vh;
  }
  .a-article-code-dialog__actions {
    gap: 8px;
    flex-wrap: wrap;
    padding: 16px 24px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    :deep(.v-btn) {
      min-height: 40px;
      padding-inline: 16px;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: normal;
      text-transform: none;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .a-article-code-dialog__title {
      padding: 16px;
    }
    .a-article-code-dialog__content {
      padding: 0 16px 20px;
    }
    .a-article-code-dialog__close {
      width: 44px;
      min-width: 44px;
      height: 44px;
    }
    .a-article-code-dialog__actions {
      padding: 12px 16px;
      gap: 4px;
      :deep(.v-btn) {
        min-height: 44px;
        padding-inline: 12px;
      }
    }
  }
}
</style>
