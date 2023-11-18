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
  <div :class="{ rtl: $vuetify.rtl }">
    <p
      v-if="editMode || (faqs && faqs.length)"
      class="hr-text my-10"
      :data-content="$t('global.commons.faq')"
      :style="{
        '--bg-color': color,
        '--text-color': dark ? '#fff' : '#818078',
      }"
    ></p>

    <v-expansion-panels
      v-model="panel"
      accordion
      multiple
      flat
      class="justify-content-start mb-12"
      :readonly="editMode"
      :dark="dark"
    >
      <v-expansion-panel
        v-for="(faq, i) in faqs"
        :key="i"
        class="faq-item fadeInUp bg-transparent"
        :style="{ 'animation-delay': 100 + i * 50 + 'ms' }"
      >
        <v-expansion-panel-header class="question mb-1" hide-actions>
          <div
            v-text="faq.question"
            :contenteditable="editMode"
            :class="{ editable: editMode }"
            @blur="
              (e) => {
                innerUpdate(e, 'question', faq);
                onChange();
              }
            "
          ></div>
          <div
            v-if="editMode"
            class="flex-grow-0"
            style="min-width: max-content"
          >
            <v-btn
              class="sub-caption -hover mx-1"
              caption="Move Down"
              @click="moveDown(faq)"
              icon
              :disabled="i === faqs.length - 1"
            >
              <v-icon>keyboard_arrow_down</v-icon></v-btn
            >
            <v-btn
              class="sub-caption -hover mx-1 flex-grow-0"
              caption="Move Up"
              @click="moveUp(faq)"
              icon
              :disabled="i === 0"
            >
              <v-icon>keyboard_arrow_up</v-icon></v-btn
            >
            <v-btn
              icon
              color="red"
              class="mx-1 flex-grow-0 sub-caption -hover"
              :caption="$t('global.actions.delete')"
              @click.stop="remove(faqs, faq)"
              ><v-icon>delete</v-icon></v-btn
            >
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="answer">
          <div
            v-if="editMode"
            v-text="faq.answer"
            :contenteditable="true"
            class="editable"
            @blur="
              (e) => {
                innerUpdate(e, 'answer', faq, true);
                onChange();
              }
            "
          ></div>
          <div v-else v-html="faq.answer"></div>
        </v-expansion-panel-content>
      </v-expansion-panel>
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
      ></v-text-field>
      <v-textarea
        v-model="answer"
        rows="3"
        auto-grow
        :label="$t('global.commons.answer')"
        messages="Allowed: <h1>...<h6>, <br>, <ol>, <ul>, <li>, <a>, <p>, <div>, <b>, <strong>, <i>"
      ></v-textarea>

      <div class="d-flex">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          large
          depressed
          @click="add"
          :disabled="!question || !answer"
        >
          <v-icon class="me-1">add</v-icon> {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import {InlineEditorMixin} from "@components/mixin/InlineEditorMixin";

export default {
  name: "FaqSection",
  mixins:[InlineEditorMixin],
  props: {
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
      if (this.$vuetify.breakpoint.mdAndUp)
        // Expand in large screens
        this.panel = [...this.faqs.keys()];
      //     console.log('this.panel',this.panel)
    },

    add() {
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
      this.$emit("change");
    },

    moveDown(faq) {
      const index = this.faqs.indexOf(faq);
      this.faqs.splice(index, 1);

      this.faqs.splice(index + 1, 0, faq);
    },
    moveUp(faq) {
      const index = this.faqs.indexOf(faq);
      this.faqs.splice(index, 1);

      this.faqs.splice(index - 1, 0, faq);
    },
  },
};
</script>

<style scoped lang="scss">
.question {
  font-size: 17px;
  padding: 12px;
  line-height: normal;
  font-weight: 500;
  border-left: solid medium #544d4d;
  border-radius: 0;
  min-height: 44px;

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
  ::v-deep > div {
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

  ::v-deep ul,::v-deep ol{
    margin: 8px 4px;
  }
  ::v-deep li{
    padding: 0;
    &:before{
      margin: 0 8px;
      color: #222;
      position:relative;
      border: none;
      width: unset;
      height: unset;
      line-height: unset;
      background: unset;
      left: unset;
      right: unset;
    }


  }
  ::v-deep ol{
    li{
      &:before{
        content: counter(li) '.';
      }
    }
  }
}


</style>
