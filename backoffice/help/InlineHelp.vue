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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-if="content">
    <v-btn
      :loading="busy_fetch"
      :small="small"
      class="fadeIn help-btn"
      color="#fff"
      variant="flat"
      @click.stop="showHelp"
    >
      <v-icon :class="{ 'ms-n2': small }" class="me-1">smart_display</v-icon>
      {{ $t("global.commons.help") }}
    </v-btn>
    <!--- ======= Dialog ======= --->

    <v-dialog
      v-model="dialog"
      :max-width="1080"
      content-class="no-shadow-dialog"
      dark
      scrim="#000"
      scrollable
    >
      <v-card
        v-if="dialog"
        class="dialog-shadow"
        color="#000"
        style="border-radius: 40px"
      >
        <v-card-text v-if="content.video" class="text-start py-6 hide-scroll">
          <div class="mb-5">
            <video
              v-if="
                content.video.startsWith('http') ||
                content.video.startsWith('/cdn')
              "
              class="rounded-2rem"
              controls
              height="auto"
              width="100%"
            >
              <source
                :src="content.video"
                :type="VideoHelper.GetMime(content.video)"
              />
            </video>
            <div v-else class="iframe-wrap" v-html="content.video"></div>
          </div>

          <div v-if="content.voice" class="mb-5">
            <audio class="my-4 rounded w-100" controls>
              <source :src="content.voice" type="audio/mpeg" />
            </audio>
          </div>

          <div
            v-if="content.blogs && content.blogs.length"
            class="widget-box -large mb-5"
          >
            <h2>
              <v-icon class="me-1">bookmark_border</v-icon>
              {{ $t("global.commons.blog") }}
            </h2>
            <v-list-subheader>
              {{ $t("inline_help.helps_title") }}
            </v-list-subheader>

            <v-row align="start" justify="start" no-gutters>
              <selldone-blog-card
                v-for="blog_id in content.blogs"
                :key="'b-' + blog_id"
                :blog-id="blog_id"
                auto-fetch
                class="m-2"
                max-width="320"
                small
                target="_blank"
              >
              </selldone-blog-card>
            </v-row>
          </div>

          <div
            v-if="content.helps && content.helps.length"
            class="widget-box -large mb-5"
          >
            <h2>
              <v-icon class="me-1">help_outline</v-icon>

              {{ $t("global.commons.help") }}
            </h2>
            <v-list-subheader>
              {{ $t("inline_help.blogs_title") }}
            </v-list-subheader>

            <v-row align="start" justify="start" no-gutters>
              <selldone-help-card
                v-for="help_id in content.helps"
                :key="'b-' + help_id"
                :help-id="help_id"
                auto-fetch
                class="m-2"
                max-width="320"
                small
                target="_blank"
              >
              </selldone-help-card>
            </v-row>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
//―――――――――――――――――――――― Scrollbar Styler ――――――――――――――――――――

import { VideoHelper } from "@selldone/core-js/helper/video/VideoHelper";
import SelldoneHelpCard from "../support/help-card/SelldoneHelpCard.vue";
import SelldoneBlogCard from "../support/blog-card/SelldoneBlogCard.vue";

export default {
  name: "InlineHelp",
  components: { SelldoneHelpCard, SelldoneBlogCard },
  props: {
    code: {
      required: true,
      type: String,
    },
    small: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    VideoHelper: VideoHelper,

    dialog: false,

    //--------------
    busy_fetch: false,
  }),
  computed: {
    helps() {
      return this.$store.getters.getInlineHelp;
    },

    content() {
      // Help center corresponding tips by code!
      return this.helps && this.helps[this.code];
    },

    language() {
      return this.getCurrentLanguage().code;
    },
  },
  watch: {
    language() {
      this.fetchHelps();
    },
  },

  created() {
    if (!this.helps) this.fetchHelps();
  },
  methods: {
    fetchHelps() {
      this.busy_fetch = true;
      axios
        .get(window.GAPI.GET_INLINE_HELPS(this.language))
        .then(({ data }) => {
          this.$store.commit("setInlineHelp", data);
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy_fetch = false;
        });
    },

    showHelp() {
      this.dialog = true;
    },
  },
};
</script>
<style lang="scss" scoped>
.help-btn {
  color: #000 !important;
  transition: all 0.4s;
  border: solid 3px #f44336 !important;
  border-radius: 6px;
  text-transform: unset;

  box-shadow: 0 2px 15px 2px rgb(246, 244, 255) !important;

  &:hover {
    background-color: #f44336 !important;
    color: #fff !important;
    transform: translateY(-2px);
    box-shadow: 0 3px 15px 4px #aaa !important;

    .v-icon {
      color: #fff;
    }
  }

  .v-icon {
    color: #f44336;
  }
}

::v-deep(.iframe-wrap) {
  iframe {
    width: 100%;
    aspect-ratio: 2;
    height: auto;
    border-radius: 18px;
    overflow: hidden;
  }
}
</style>
