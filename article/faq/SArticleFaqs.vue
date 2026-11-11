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
  <div :class="{ rtl: $vuetify.locale.isRtl, 's-article-faqs--guidebook': guidebook && (editMode || (faqs && faqs.length)) }">
    <h2 v-if="guidebook && (editMode || (faqs && faqs.length))" class="s-article-faqs__heading">{{ $t('global.commons.faq') }}</h2>
    <p
      v-if="!guidebook && (editMode || (faqs && faqs.length))"
      :data-content="$t('global.commons.faq')"
      :style="{
        '--bg-color': color,
        '--text-color': dark ? '#fff' : '#818078',
      }"
      class="hr-text my-10"
    ></p>

    <v-expansion-panels
      v-model="panel"
      :dark="dark"
      :readonly="editMode"
      :class="guidebook ? 's-article-faqs__panels' : 'justify-start mb-12'"
      multiple
      variant="accordion"
    >
      <v-slide-y-reverse-transition group hide-on-leave>
        <v-expansion-panel
          v-for="(faq, i) in faqs"
          :key="i"
          class="faq-item bg-transparent"
          elevation="0"
          bg-color="transparent"
        >
          <v-expansion-panel-title class="question" :hide-actions="!guidebook || editMode">
            <v-text-field
              v-if="editMode"
              v-model="faq.question"
              @update:model-value="workspace && onChange()"
              flat
              hide-details
              placeholder="Write question..."
              single-line
              variant="solo"
            ></v-text-field>
            <div v-else :dir="guidebook ? 'auto' : undefined" v-text="faq.question"></div>
            <div v-if="editMode" style="min-width: max-content">
              <v-btn
                :disabled="i === faqs.length - 1"
                class="mx-1"
                icon
                title="Move Down"
                variant="text"
                @click="moveDown(faq)"
              >
                <v-icon>keyboard_arrow_down</v-icon>
              </v-btn>
              <v-btn
                :disabled="i === 0"
                class="mx-1"
                icon
                title="Move Up"
                variant="text"
                @click="moveUp(faq)"
              >
                <v-icon>keyboard_arrow_up</v-icon>
              </v-btn>
              <v-btn
                :title="$t('global.actions.delete')"
                class="mx-1"
                color="red"
                icon
                variant="text"
                @click.stop="removeFaq(faq)"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="answer">
            <div
              v-if="editMode"
              :contenteditable="true"
              class="editable"
              @blur="
                (e) => {
                  innerUpdate(e, 'answer', faq, true);
                  onChange();
                }
              "
              v-text="faq.answer"
            ></div>
            <div v-else :dir="guidebook ? 'auto' : undefined" v-html="faq.answer"></div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-slide-y-reverse-transition>
    </v-expansion-panels>

    <!--- Add New --->
    <div v-if="editMode" class="widget-box -large mb-5">
      <h3 class="my-2 widget-title">
        <v-icon class="me-1" color="#333">live_help</v-icon>
        {{ $t("global.commons.faq") }}
      </h3>
      <v-text-field
        v-model="question"
        :label="$t('global.commons.question')"
        variant="underlined"
      ></v-text-field>
      <v-textarea
        v-model="answer"
        :label="$t('global.commons.answer')"
        auto-grow
        messages="Allowed: <h1>...<h6>, <br>, <ol>, <ul>, <li>, <a>, <p>, <div>, <b>, <strong>, <i>"
        rows="3"
        variant="underlined"
      ></v-textarea>

      <div class="widget-buttons">
        <v-btn
          :disabled="!question || !answer"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="add"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { InlineEditorMixin } from "../../mixin/InlineEditorMixin";

/**
 * <s-article-faqs>
 */
export default {
  name: "SArticleFaqs",
  mixins: [InlineEditorMixin],
  props: {
    guidebook: { type: Boolean, default: false },
    workspace: { type: Boolean, default: false },
    editMode: {
      type: Boolean,
      default: false,
    },
    faqs: {},
    color: {
      default: "#fff",
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      question: null,
      answer: null,

      panel: [],
    };
  },

  computed: {},
  watch: {
    faqs() {
      this.all();
    },
    editMode() {
      this.all();
    },
  },

  created() {
    if (!this.faqs || !Array.isArray(this.faqs)) {
      this.$emit("update:faqs", []);
    }

    this.all();
  },
  methods: {
    all() {
      if (!this.faqs) return;
      if (this.$vuetify.display.mdAndUp)
        // Expand in large screens
        this.panel = [...this.faqs.keys()];
      //     console.log('this.panel',this.panel)
    },

    add() {
      if (this.workspace && !this.editMode) return;
      let out = this.faqs;
      if (!out || !Array.isArray(out)) out = [];

      out.push({ question: this.question, answer: this.answer });
      this.$emit("update:faqs", out);

      this.all();
      this.question = null;
      this.answer = null;

      this.onChange();
    },

    onChange() {
      if (this.workspace && !this.editMode) return;
      this.$emit("change");
    },
    removeFaq(faq) {
      if (this.workspace && !this.editMode) return;
      this.remove(this.faqs, faq);
      if (this.workspace) this.onChange();
    },

    moveDown(faq) {
      if (this.workspace && !this.editMode) return;
      const index = this.faqs.indexOf(faq);
      this.faqs.splice(index, 1);

      this.faqs.splice(index + 1, 0, faq);
      if (this.workspace) this.onChange();
    },
    moveUp(faq) {
      if (this.workspace && !this.editMode) return;
      const index = this.faqs.indexOf(faq);
      this.faqs.splice(index, 1);

      this.faqs.splice(index - 1, 0, faq);
      if (this.workspace) this.onChange();
    },
  },
};
</script>

<style lang="scss" scoped>
.question {
  font-size: 17px;
  padding: 12px;
  line-height: normal;
  font-weight: 500;
  border-left: solid medium #544d4d;
  border-radius: 0;
  min-height: 44px;

  ::v-deep(.v-expansion-panel-title__overlay) {
    background: transparent !important;
  }

  @media only screen and (max-width: 900px) {
    font-size: 1.1rem;
    font-weight: 800;
  }
}

.answer {
  font-size: 17px;
  line-height: 1.7em;
  border-left: dashed thin #544d4d;
  border-radius: 0;
  @media only screen and (max-width: 900px) {
    font-size: 1.1rem;
    text-align: justify;
  }

  ::v-deep(> div) {
    padding: 12px !important;
  }
}

.rtl {
  .question {
    border-left: none;
    border-right: solid medium #544d4d;
  }

  .answer {
    border-left: none;
    border-right: dashed thin #544d4d;
  }
}

.editable {
  background: transparent;
  cursor: text;
  min-height: 30px;
  padding: 0;
}

.faq-item {
  text-align: start;
  margin: 12px auto;
  padding: 16px 0;
  box-shadow: none;

  &:after {
    content: none; // Remove top border in vuetiry!
  }

  &:before {
    box-shadow: none;
  }

  ::v-deep(ul),
  ::v-deep(ol) {
    margin: 8px 4px;
  }

  ::v-deep(li) {
    padding: 0;
    padding-inline-start: 8px;

    &:before {
      margin: 0 8px;
      color: #222;
      position: relative;
      border: none;
      width: unset;
      height: unset;
      line-height: unset;
      background: unset;
      left: unset;
      right: unset;
    }
  }

  /*::v-deep(ol) {
    li {
      &:before {
        content: counter(li) ".";
      }
    }
  }*/
}

.s-article-faqs--guidebook {
  max-width: 620px;
  margin-block: 40px 28px;
  color: var(--help-ink, rgb(var(--v-theme-on-surface)));
  font-family: inherit;
  .s-article-faqs__heading { margin: 0 0 16px; font-family: inherit; font-size: 20px !important; font-weight: 600; line-height: 1.4; letter-spacing: -0.02em; }
  .s-article-faqs__panels { margin: 0; }
  .faq-item { margin: 0; padding: 0; border-block-end: 1px solid var(--help-line, rgba(var(--v-theme-on-surface), 0.1)); border-radius: 0; }
  .faq-item:last-child { border-block-end: 0; }
  .question { min-height: 52px; padding: 16px 0; border: 0; border-radius: 0; color: inherit; font-family: inherit; font-size: 15px; font-weight: 500; line-height: 1.65; text-align: start; }
  .question > div { min-width: 0; overflow-wrap: anywhere; }
  .question :deep(.v-expansion-panel-title__icon) { margin-inline-start: 16px; color: var(--help-muted, rgba(var(--v-theme-on-surface), 0.64)); }
  .question:focus-visible { outline: 2px solid var(--help-accent, rgb(var(--v-theme-primary))); outline-offset: 4px; }
  .answer { padding: 0; border: 0; color: var(--help-muted, rgba(var(--v-theme-on-surface), 0.72)); font-family: inherit; font-size: 15px; line-height: 1.85; text-align: start; overflow-wrap: anywhere; }
  .answer :deep(.v-expansion-panel-text__wrapper) { padding: 0 0 18px !important; }
  .answer :deep(p), .answer :deep(div) { margin-block: 0 10px; font-size: inherit !important; line-height: inherit; }
  .answer :deep(p:last-child), .answer :deep(div:last-child) { margin-block-end: 0; }
  .answer :deep(h1), .answer :deep(h2), .answer :deep(h3), .answer :deep(h4), .answer :deep(h5), .answer :deep(h6) { margin-block: 16px 8px; color: var(--help-ink, rgb(var(--v-theme-on-surface))); font-size: 17px !important; font-weight: 600; line-height: 1.5; }
  .answer :deep(ol), .answer :deep(ul) { margin-block: 8px; margin-inline: 0; padding-inline-start: 22px; }
  .answer :deep(li) { padding-inline-start: 0; }
  &.rtl .s-article-faqs__heading { letter-spacing: 0; }
}
</style>
