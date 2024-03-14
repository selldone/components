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
  <v-dialog
    v-model="show_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">import_contacts</v-icon>
        {{ $t("global.commons.catalog") }}

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
          <v-icon class="me-1">delete </v-icon>
          {{ $t("global.actions.delete") }}
        </v-btn>
        <v-tabs
          v-model="tab"
          align-tabs="title"
          bg-color="transparent"
          slider-color="primary"
        >
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
        <v-window v-model="tab" class="bg-transparent">
          <v-window-item>
            <div class="widget-box -large mb-5" dir="ltr">
              <s-widget-header icon="image" title="Images"></s-widget-header>
              <v-list-subheader>
                <div>Add images here. Each image will be shown as a page.</div>
              </v-list-subheader>

              <v-row dense>
                <v-col cols="12" md="6">
                  <s-image-uploader
                    :max-files="20"
                    :server="uploadUrl"
                    allow-multiple
                    contenteditable="false"
                    dense
                    label="Select image"
                    @new-url="(url) => addNewPage(url)"
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
          </v-window-item>

          <v-window-item>
            <div class="widget-box -large mb-5">
              <s-widget-header
                icon="fit_screen"
                title="Relative image size"
              ></s-widget-header>
              <v-list-subheader>
                <div>
                  <b>Unit: em</b>, An em is a unit in the field of typography,
                  equal to the currently specified point size. For example, one
                  em in a 16-point typeface is 16 points. Therefore, this unit
                  is the same for all typefaces at a given point size.
                </div>
              </v-list-subheader>

              <v-slider
                v-model="pack.max_height"
                :max="100"
                :min="10"
                :tick-size="12"
                :step="0.1"
                class="mt-12"
                density="compact"
                thumb-color="primary"
                thumb-label="always"
                track-fill-color="primary"
                @update:model-value="onChange"
              >
                <template v-slot:prepend>
                  <small class="single-line"> Height em </small>
                </template>
              </v-slider>
            </div>
          </v-window-item>
        </v-window>
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
            variant="flat"
            @click="setValue"
          >
            <v-icon class="me-1">check </v-icon>
            {{ $t("global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SImageUploader from "@components/ui/uploader/SImageUploader.vue";
import DraggableImagesList from "@components/ui/image/draggableImagesList.vue";
import { EventName } from "@core/events/EventBus";

export default {
  name: "SArticleFlipBookGlobalDialog",
  components: { DraggableImagesList, SImageUploader },

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
      },
    );
  },
  beforeUnmount() {
    this.EventBus.$off(EventName.ARTICLE_FLIP_BOOK_SHOW);
  },

  methods: {
    addNewPage(path) {

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
