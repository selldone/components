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
      <v-card-title
        ><v-icon class="me-1">import_contacts</v-icon>
        {{ $t("global.commons.catalog") }}

        <v-spacer> </v-spacer>
        <v-btn
          text
          color="red"
          x-large
          @click="
            deleteCallback();
            show_dialog = false;
          "
          ><v-icon class="me-1">delete</v-icon
          >{{ $t("global.actions.delete") }}</v-btn
        >
        <v-tabs v-model="tab" align-with-title background-color="transparent">
          <v-tabs-slider color="primary"></v-tabs-slider>
          <v-tab>
            <v-icon class="me-1">image</v-icon>
            {{ $t("global.commons.image") }}
          </v-tab>
          <v-tab>
            <v-icon class="me-1">fit_screen</v-icon>
            {{ $t("global.commons.size") }}
          </v-tab>
        </v-tabs>
      </v-card-title>
      <v-card-text>
        <v-tabs-items v-model="tab" class="bg-transparent">
          <v-tab-item>
            <div dir="ltr" class="widget-box -large mb-5">
              <widget-header title="Images" icon="image"></widget-header>
              <v-subheader>
                <div>Add images here. Each image will be shown as a page.</div>
              </v-subheader>

              <v-row dense>
                <v-col cols="12" md="6">
                  <image-uploader
                    contenteditable="false"
                    :server="uploadUrl"
                    label="Select image"
                    @new-url="(url) => addNewPage(url)"
                    allow-multiple
                    :max-files="20"
                    dense
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <draggable-images-list
                    v-model="pack.pages"
                    :has-add="false"
                  />
                </v-col>
              </v-row>
            </div>
          </v-tab-item>

          <v-tab-item>
            <div class="widget-box -large mb-5">
              <widget-header
                title="Relative image size"
                icon="fit_screen"
              ></widget-header>
              <v-subheader>
                <div>
                  <b>Unit: em</b>, An em is a unit in the field of typography,
                  equal to the currently specified point size. For example, one
                  em in a 16-point typeface is 16 points. Therefore, this unit
                  is the same for all typefaces at a given point size.
                </div>
              </v-subheader>

              <v-slider
                v-model="pack.max_height"
                :min="10"
                :max="100"
                @change="onChange"
                :tick-size="12"
                thumb-label="always"
                dense
                thumb-color="primary"
                track-fill-color="primary"
                class="mt-12"
              >
                <template v-slot:prepend>
                  <small class="single-line"> Height em </small>
                </template>
              </v-slider>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn text @click="show_dialog = false" x-large
            ><v-icon class="me-1">close</v-icon
            >{{ $t("global.actions.close") }}</v-btn
          >
          <v-btn depressed color="primary" @click="setValue" x-large
            ><v-icon class="me-1">check</v-icon
            >{{ $t("global.actions.set") }}</v-btn
          >
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ImageUploader from "@/Components/uploader/ImageUploader.vue";
import DraggableImagesList from "@/Components/ui/image/draggableImagesList.vue";
import { EventName } from "../../../../../core/events/EventBus";
export default {
  name: "SArticleFlipBookGlobalDialog",
  components: { DraggableImagesList, ImageUploader },

  props: {
    masterId: {
      /*Point which dialog open!*/
    },

    uploadUrl: {
      required: false,
      default: "",
      type: String,
    },
  },

  data: () => ({
    tab: "images",
    // ---------------------------------

    callback: null,
    deleteCallback: null,

    // ---------------------------------
    show_dialog: false,

    pack: {
      pages: [],
    },
  }),
  watch: {
    show_dialog(val) {
      if (!val)
        // Reset after close!
        this.$nextTick(() => {
          // 🞇 Reset to default
          this.resetToDefault();
        });
    },
  },

  mounted() {
    this.EventBus.$on(
      EventName.ARTICLE_FLIP_BOOK_SHOW,

      ({ pack, callback, deleteCallback, tab, masterId }) => {
        // Check master ID (For prevent duplicated open dialog - in the page builder)
        if (this.masterId !== masterId) {
          return;
        }

        this.pack = pack;

        this.callback = callback;
        this.deleteCallback = deleteCallback;

        this.tab = tab ? ["image", "size"].indexOf(tab) : 0;

        this.showDialog();
      }
    );
  },
  beforeDestroy() {
    this.EventBus.$off(EventName.ARTICLE_FLIP_BOOK_SHOW);
  },

  methods: {
    addNewPage(path) {
      console.log("addNewPage", path);

      this.pack.pages.push(path);
      this.onChange();
    },
    onChange() {},

    showDialog() {
      this.show_dialog = true;
    },
    setValue() {
      this.callback(this.pack);
      this.show_dialog = false;
    },
  },
};
</script>

<style scoped></style>
