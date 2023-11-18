<template>
  <v-col
    cols="12"
    class="c-container"
  >
    <div class="c-widget bg-white">

      <!-- Post Message -->
      <small class="mx-2 mt-4 d-block">Context:</small>
      <div class="mx-4 c-body html-style" v-html="smartText(comment.post.body)"></div>

      <!-- My Comment -->

      <small class="mx-2 mt-4 d-block">Your comment: {{getFromNowString(comment.created_at)}}</small>

      <p class="mx-4 c-body font-weight-bold">{{comment.body}}</p>


      <div class="d-flex mx-4">
        <v-spacer></v-spacer>
        <div class="m-1 p-2"><v-icon small class="me-1">thumb_down</v-icon> {{comment.disagrees | numeralFormat("0.[0]a") }}</div>
        <div class="m-1 p-2"><v-icon small class="me-1">thumb_up</v-icon> {{comment.agrees | numeralFormat("0.[0]a") }}</div>
      </div>


      <community-comments :shop="shop" :post="comment.post" :parent="comment" show class="mx-4">
      </community-comments>
    </div>



  </v-col>
</template>

<script>


import CommunityComments from "./CommunityComments.vue";
import {SmartConvertTextToHtmlHashtags} from "@core/helper/html/HtmlHelper";

export default {
  name: "CommunityCommentWidget",
  components: {CommunityComments },
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
    return {


    };
  },

  computed: {

  },

  mounted() {},

  methods: {
    smartText(text) {
      return SmartConvertTextToHtmlHashtags(text);
    },
  }
};
</script>

<style lang="scss">

</style>
