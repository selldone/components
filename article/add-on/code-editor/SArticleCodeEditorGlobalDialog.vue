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
  <v-dialog
    v-model="show_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title>
        <v-spacer></v-spacer>
        <v-btn
          text
          color="red"
          dark
          @click="
            deleteCallback();
            show_dialog = false;
          "
          x-large
        >
          <v-icon class="me-1">delete</v-icon
          >{{ $t("global.actions.delete") }}</v-btn
        >
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <s-widget-header
            :title="$t('global.commons.code')"
            icon="code"
          ></s-widget-header>
          <v-list-subheader>
            <div>
              This section used to just show codes in your article. Use cases
              are in writing help, blog about programming, learning, etc. To
              embed code in your article use
              <b>Youtube / ULR / Embed</b> instead.
            </div>
          </v-list-subheader>
          <prism-editor
            v-model="code"
            contenteditable="false"
            class="light-code scrollable-element-light"
            style="min-height: 50vh"
            :language="language"
            line-numbers
            :highlight="highlighter"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn text @click="show_dialog = false" x-large>
            <v-icon class="me-1">close</v-icon
            >{{ $t("global.actions.close") }}</v-btn
          >
          <v-btn depressed color="primary" @click="setValue" x-large>
            <v-icon class="me-1">check</v-icon
            >{{ $t("global.actions.set") }}</v-btn
          >
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { EventName } from "@core/events/EventBus";

export default {
  name: "SArticleCodeEditorGlobalDialog",
  components: {},
  props: {
    masterId: {
      /*Point which dialog open!*/
    },
  },
  data: () => ({
    code: null,
    language: null,
    callback: null,
    deleteCallback: null,

    // ---------------------------------
    show_dialog: false,
  }),
  watch: {
    show_dialog(val) {
      if (!val)
        // Reset after close!
        this.$nextTick(() => {
          this.resetToDefault(); // 🞇 Reset to default
        });
    },
  },

  mounted() {
    this.EventBus.$on(
      EventName.ARTICLE_CODE_EDITOR_SHOW,

      ({ code, language, callback, deleteCallback, masterId }) => {
        // Check master ID (For prevent duplicated open dialog - in the page builder)
        if (this.masterId !== masterId) {
          return;
        }

        this.code = code;
        this.language = language;

        this.callback = callback;
        this.deleteCallback = deleteCallback;

        this.showDialog();
      }
    );
  },
  beforeDestroy() {
    this.EventBus.$off(EventName.ARTICLE_CODE_EDITOR_SHOW);
  },

  methods: {
    highlighter(code) {
      return Prism.highlight(
        code,
        Prism.languages.js,
        this.language ? this.language : "js"
      );
    },

    showDialog() {
      this.show_dialog = true;
    },
    setValue() {
      this.callback(this.code);
      this.show_dialog = false;
    },
  },
};
</script>

<style scoped></style>
