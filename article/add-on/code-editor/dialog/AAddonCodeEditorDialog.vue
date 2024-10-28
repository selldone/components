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
    <v-card rounded="t-xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">code</v-icon>
        Code

        <v-spacer></v-spacer>
        <v-btn
          color="red"
          size="x-large"
          variant="text"
          @click="
            deleteCallback();
            show_dialog = false;
          "
        >
          <v-icon start>delete </v-icon>
          {{ $t("global.actions.delete") }}
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            :title="$t('global.commons.code')"
            icon="code"
          ></u-widget-header>
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
            :highlight="highlighter"
            :language="language"
            class="light-code scrollable-element-light"
            contenteditable="false"
            line-numbers
            style="min-height: 50vh"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show_dialog = false">
            <v-icon start>close </v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="setValue"
          >
            <v-icon start>check </v-icon>
            {{ $t("global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { EventName } from "@selldone/core-js/events/EventBus";
import { PrismEditor } from "vue-prism-editor";

export default {
  name: "AAddonCodeEditorDialog",
  components: { PrismEditor },
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
      },
    );
  },
  beforeUnmount() {
    this.EventBus.$off(EventName.ARTICLE_CODE_EDITOR_SHOW);
  },

  methods: {
    highlighter(code) {
      return Prism.highlight(
        code,
        Prism.languages.js,
        this.language ? this.language : "js",
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
