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
  <div class="s--mentionable-input">
    <v-avatar size="2.4em" color="#fafafa" class="me-2 mt-2">
      <v-img :src="getUserAvatar(USER_ID())"></v-img>
    </v-avatar>

    <s-html-input
      ref="area"
      class="flex-grow-1"
      :outlined="outlined"
      :label="label"
      :placeholder="placeholder"
      :value="value"
      @update:text="(val) => $emit('update:text', val)"
      @input="(val) => $emit('input', val)"
      :auto-grow="autoGrow"
      :messages="messages"
      :mentions="mentions"
      @update:mentions="(val) => $emit('update:mentions', val)"
      @focus.native="$emit('focus')"
      @blur.native="$emit('blur')"
    ></s-html-input>

    <v-menu offset-y top :close-on-content-click="false">
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on" retain-focus-on-click>
          <v-icon>sentiment_satisfied_alt</v-icon>
        </v-btn>
      </template>
      <VEmojiPicker @select="selectEmoji" :emojiWithBorder="false" />
    </v-menu>
  </div>
</template>

<script>
import Tribute from "tributejs";
import SHtmlInput from "./SHtmlInput.vue";
import { VEmojiPicker } from "v-emoji-picker";

export default {
  name: "SMentionableInput",
  components: { SHtmlInput, VEmojiPicker },

  props: {
    value: {},
    text: {},
    messages: { default: "**bold**    __italic__   @user" },
    autoGrow: { type: Boolean, default: false },
    outlined: { type: Boolean, default: false },
    label: {},
    shopId: {},
    mentions: {},
    placeholder: {},
  },

  data() {
    return {};
  },
  mounted() {
    let t = this;
    function remoteSearch(text, cb) {
      if (!text) return;
      axios
        .get(window.API.GET_SUGGESTION_MENTION_USERS(text), {
          params: {
            mention: true, // Not return email
            shop_id: t.shopId,
          },
        })
        .then(({ data }) => {
          cb(data);
        })
        .catch((e) => {
          cb([]);
        })
        .finally(() => {});
    }

    const tribute = new Tribute({
      collection: [
        {
          // symbol or string that starts the lookup
          trigger: "@",

          // element to target for @mentions
          iframe: null,

          // class added in the flyout menu for active item
          selectClass: "highlight",

          // class added to the menu container
          containerClass: "s--mentionable-input-menu",

          // class added to each list item
          itemClass: "",

          // function called on select that returns the content to insert
          selectTemplate: function (item) {
            return `<span value="${
              item.original.id
            }" type="user" class="chip-user" contenteditable="false"><img src="${t.getUserAvatar(
              item.original.id,
              64
            )}"> <span>@${item.original.name}</span><i></i></span>`;
          },

          // template for displaying item in menu
          menuItemTemplate: function (item) {
            return (
              '<img src="' +
              t.getUserAvatar(item.original.id, 64) +
              '" width="36" class="mx-2">' +
              "<div>" +
              "<span>" +
              item.original.name +
              "</span>" +
              (item.original.email
                ? "<small>" + item.original.email + "</small>"
                : "") +
              "</div>"
            );
          },

          // template for when no match is found (optional),
          // If no template is provided, menu is hidden.
          noMatchTemplate: null,

          // specify an alternative parent container for the menu
          // container must be a positioned element for the menu to appear correctly ie. `position: relative;`
          // default container is the body
          menuContainer: document.body,

          // column to search against in the object (accepts function or string)
          // lookup: 'name',

          lookup: function (person, mentionText) {
            return person.name + ` <small>${person.email}</small>`;
          },

          // column that contains the content to insert by default
          fillAttr: "email",

          // REQUIRED: array of objects to match
          /*  values: [
                            { key: "Phil Heartman", value: "pheartman",email:'111111111' },
                            { key: "Gordon Ramsey", value: "gramsey",email:'222222222222' }
                        ],*/

          values: (text, cb) => {
            remoteSearch(text, (users) => cb(users));
          },

          // specify whether a space is required before the trigger string
          requireLeadingSpace: true,

          // specify whether a space is allowed in the middle of mentions
          allowSpaces: false,

          // optionally specify a custom suffix for the replace text
          // (defaults to empty space if undefined)
          replaceTextSuffix: "\n",

          // specify whether the menu should be positioned.  Set to false and use in conjuction with menuContainer to create an inline menu
          // (defaults to true)
          positionMenu: true,

          // when the spacebar is hit, select the current match
          spaceSelectsMatch: false,

          // turn tribute into an autocomplete
          autocompleteMode: false,

          // Customize the elements used to wrap matched strings within the results list
          // defaults to <span></span> if undefined
          searchOpts: {
            pre: "<span>",
            post: "</span>",
            skip: false, // true will skip local search, useful if doing server-side search
          },

          // specify the minimum number of characters that must be typed before menu appears
          menuShowMinLength: 0,
        },
      ],
    });
    tribute.attach(t.$refs.area.$el);
  },

  methods: {
    selectEmoji(emoji) {
      this.$refs.area.$el.insertAtCaret(emoji.data);
      this.$emit("input", this.$refs.area.$el.innerHTML);
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
.s--mentionable-input{
  display: flex;
  font-size: 16px;
  line-height: 1.6em
}

.s--mentionable-input-menu {
  position: absolute;
  top: 0;
  left: 0;
  height: auto;
  max-height: 300px;
  max-width: 500px;
  overflow: auto;
  display: block;
  z-index: 999999;
  font-family: "Graphik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" ;
  border-radius: 8px;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    background: #fff;
    min-width: 210px;
    border: solid #e6e6e6 thin;
    display: grid;
   //// font-family: var(--font);
    font-size: 1.1rem;
    font-weight: 500;
  }

  li {
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    div {
      flex-grow: 1;
      padding: 0 4px;
    }

    &.highlight {
      background: #eee;
    }

    span {
      color: #333;
      font-size: 0.9em;
      font-weight: 500;
    }
    img {
      vertical-align: middle;
      margin-right: 4px;
      height: 30px;
      width: 30px;
      border-radius: 50%;
    }
    small {
      display: block;
    }

    &.no-match {
      cursor: default;
    }
  }

  .menu-highlighted {
    font-weight: bold;
  }
}
</style>
