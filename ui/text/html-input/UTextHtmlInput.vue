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
    v-once
    ref="textarea"
    :data-placeholder="placeholder ? placeholder : label"
    class="s--html-input html-style"
    contenteditable="true"
    :messages="messages"
    @blur="updateMentions"
    @input="updateHTML"
    @paste="onPast"
  ></div>
</template>

<script>
import $ from "jquery";

window.$ = $;
window.jQuery = $;

import { StripTags } from "@selldone/core-js/helper/html/HtmlHelper";

export default {
  name: "UTextHtmlInput",
  emits: ["update:modelValue", "update:text", "update:mentions"],
  props: {
    modelValue: {},
    label: {},
    placeholder: {},
    mentions: {},
    messages: {},
  },

  watch: {
    modelValue(value) {
      if (!value) {
        console.log("Change mention text value", value);
        this.$el.innerHTML = value;
      }
    },
  },
  mounted() {
    this.$el.innerHTML = this.modelValue;

    $(this.$el).on("click", (evt) => {
      // console.log('click',evt.target)

      if ($(evt.target).is("i")) {
        // console.log("CLOSE");
        $(evt.target).parent().remove();
        return;
      }

      const type = $(evt.target).attr("type");
      const value = $(evt.target).attr("value");

      if (type === "user") {
        console.log("click user", "type", type, "value", value);
      }

      this.updateHTML();
    });
  },
  methods: {
    onPast(e) {
      let paste = (e.clipboardData || window.clipboardData).getData("text");
      //console.log('past',e)
      // 1. Pure text:
      let html = StripTags(paste);
      // 2. Add to selection:
      this.$el.insertAtCaret(html);
      this.updateHTML();
      e.preventDefault();
    },
    updateHTML() {
      if (this.$refs.textarea.innerHTML === "<br>")
        this.$refs.textarea.innerHTML = ""; // Show empty place holder!
      // trim html output:
      this.$emit("update:modelValue", this.$refs.textarea.innerHTML);
      this.$emit("update:text", this.$refs.textarea.innerText);
    },
    updateMentions() {
      let mentions = {};

      $(this.$el)
        .find(".chip-user") // Find code editors:
        .each(function () {
          // console.log('target', $(this))

          const type = $(this).attr("type");
          const value = $(this).attr("value");

          // console.log('===>','type',type,'value',value)

          if (!mentions.users) mentions.users = [];

          if (!mentions.users.includes(value)) mentions.users.push(value);
        });
      this.$emit("update:mentions", mentions);
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--html-input {
  min-height: 128px;
  //background-color: #fafafa;
  padding: 8px 8px 20px;
  position: relative;
  border-radius: 4px;

  &:before {
    content: attr(label);
    font-size: 10px;
    font-weight: 500;
    display: block;
    margin-bottom: 4px;
    animation: all 0.3s ease;
  }

  &:empty::before {
    content: attr(data-placeholder);
    font-size: 16px;
    opacity: 0.3;
    pointer-events: none;
  }

  &:after {
    position: absolute;
    content: attr(messages);
    opacity: 0.5;
    font-size: 10px;
    font-weight: 500;
    bottom: 0;

    display: block;
    max-width: 90%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .chip-user {
    i {
      // CLOSE BUTTON FOR CHIP
      margin-left: 4px;
      margin-right: 4px;
      display: inline-block;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      text-align: center;
      cursor: pointer;
      line-height: normal;

      &:after {
        font-family: fontawesome;
        content: "\f00d";
        font-style: normal;
        font-weight: normal;
        text-decoration: inherit;
      }

      &:hover {
        color: #fff;
        background-color: red;
      }
    }
  }
}
</style>
