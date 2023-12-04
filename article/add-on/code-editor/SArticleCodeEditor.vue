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
    class="code-editor editor-window"
    :data="json_data"
    spellcheck="false"
    :class="{ '-dark': dark }"
  >
    <s-article-editor-component-toolbar
      v-if="editable"
      @click:edit="showEdit()"
      :element="element"
      :title="$t('global.commons.code')"
    ></s-article-editor-component-toolbar>

    <div class="text-left py-1 d-flex align-center" dir="ltr">
      <v-btn-toggle
        v-model="selected_lang"
        rounded
        active-class="blue-flat"
        dense
        mandatory
        borderless
        class="widget-toggle flex-grow-0"
      >
        <v-btn
          v-for="lang in tabs_active"
          :key="lang"
          :value="lang"
          depressed
          @click="setLanguageCode(lang)"
        >
          {{ lang.toUpperCase() }}
        </v-btn>
      </v-btn-toggle>
      <v-spacer></v-spacer>
      <v-btn @click="dark = !dark" icon class="mx-1"
        ><v-slide-y-reverse-transition leave-absolute>
          <v-icon v-if="dark" color="blue" key="1">dark_mode</v-icon>
          <v-icon v-else color="amber" key="2">light_mode</v-icon>
        </v-slide-y-reverse-transition>
      </v-btn>
    </div>

    <div class="hover-open-edit-dialog" @click="showEdit()">
      <prism-editor
        v-model="codes[selected_lang]"
        contenteditable="false"
        class="scrollable-element-light"
        :class="{ 'light-code': !dark, 'prism-dark dark-code-theme': dark }"
        :language="selected_lang"
        line-numbers
        readonly
        :highlight="highlighter"
      />
    </div>
  </div>
</template>

<script>
import SArticleEditorComponentToolbar from "../toolbar/SArticleEditorComponentToolbar.vue";
export default {
  name: "SArticleCodeEditor",
  components: { SArticleEditorComponentToolbar },
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
      selected_lang: null,

      loaded: true,
      lang_code: null,

      tabs: ["html", "js", "css", "c", "C++", "php", "python"],

      languages_pack: {
        html: "markup",
        js: "js",
        css: "css",
        "C++": "cpp",
        php: "php",
        python: "python",
      },
      //---------------
      time: null,

      dark: false,

      element: null,
    };
  },
  computed: {
    tabs_active() {
      if (this.editable) {
        return this.tabs;
      }

      let out = [];
      this.tabs.forEach((item) => {
        if (this.codes[item]) {
          out.push(item);
        }
      });

      return out;
    },

    json_data() {
      let time = this.time;

      return JSON.stringify(this.codes);
    },
  },

  created() {
    // Fix bug: (important)
    if (!this.$vuetify.theme) this.$vuetify.theme = {};
    if (!this.$vuetify.icons) this.$vuetify.icons = {};
    if (!this.$vuetify.breakpoint) this.$vuetify.breakpoint = {};
  },
  mounted() {
    this.element = this.$el;

    if (!this.lang_code && this.tabs_active.length > 0)
      this.lang_code = this.tabs_active[0];

    const available = Object.keys(this.codes).find((x) => this.codes[x]);
    // console.log("available", available, this.selected_lang, this.codes);
    if (available) {
      this.lang_code = available;
      this.selected_lang = available;
    }
  },
  methods: {
    setLanguageCode(lang_code) {
      this.lang_code = lang_code;
    },
    highlighter(code) {
      //console.log('-------------------highlighter--------------------',code)
      // js highlight example
      return Prism.highlight(
        code,
        Prism.languages.js,
        this.lang ? this.lang : "js"
      );
    },

    showEdit() {
      if (!this.editable) return;
      this.ShowCodeEditorGlobalDialog(
        this.codes[this.selected_lang],
        this.selected_lang,
        (code) => {
          this.codes[this.selected_lang] = code;
          this.time = new Date(); //Force update data!
          this.$forceUpdate();
        },
        () => {
          this.$el.remove();
        },
        this.masterId
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
      line-height: 1.2em !important;
      padding-top: 14px;
      font-size: 0.8em;
      border-right: #0288d1 solid thick;
      padding-right: 8px;
      user-select: none;
    }

    .prism-editor__container {
      min-height: 100%;
      textarea {
        line-height: 1.2em !important;
        &::selection {
          background: #c0d9ef;
        }
      }
      pre {
        border: none !important;
        // background: #fcfcfc !important;
        line-height: 1.2em !important;

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
