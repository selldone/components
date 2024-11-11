<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-col class="c-container" cols="12">
    <div class="c-widget bg-white">
      <!-- Post Message -->
      <small class="mx-2 mt-4 d-block">Context:</small>
      <div
        class="mx-4 c-body html-style"
        v-html="smartText(comment.post.body)"
      ></div>

      <!-- My Comment -->

      <small class="mx-2 mt-4 d-block"
        >Your comment: {{ getFromNowString(comment.created_at) }}</small
      >

      <p class="mx-4 c-body font-weight-bold">{{ comment.body }}</p>

      <div class="d-flex mx-4">
        <v-spacer></v-spacer>
        <div class="m-1 p-2">
          <v-icon class="me-1" size="small">thumb_down</v-icon>
          {{ numeralFormat(comment.disagrees, "0.[0]a") }}
        </div>
        <div class="m-1 p-2">
          <v-icon class="me-1" size="small">thumb_up</v-icon>
          {{ numeralFormat(comment.agrees, "0.[0]a") }}
        </div>
      </div>

      <c-comments-list
        :parent="comment"
        :post="comment.post"
        :shop="shop"
        class="mx-4"
        show
      >
      </c-comments-list>
    </div>
  </v-col>
</template>

<script lang="ts">
import CCommentsList from "../list/CCommentsList.vue";
import { SmartConvertTextToHtmlHashtags } from "@selldone/core-js/helper/html/HtmlHelper.ts";

export default {
  name: "CCommentWidget",
  components: { CCommentsList },
  props: {
    community: {
      required: true,
      type: Object,
    },

    shop: {},

    comment: {
      required: true,
      type: Object,
    },
  },

  data() {
    return {};
  },

  computed: {},

  mounted() {},

  methods: {
    smartText(text) {
      return SmartConvertTextToHtmlHashtags(text);
    },
  },
};
</script>

<style lang="scss"></style>
