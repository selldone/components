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
  <v-bottom-sheet
    v-model="show_dialog"
    width="98vw"
    max-width="860"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">compare</v-icon>
        {{ $t("global.commons.images_compare") }}

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
          <v-icon class="me-1">delete</v-icon>
          {{ $t("global.actions.delete") }}
        </v-btn>
      </v-card-title>
      <v-card-text>
        <u-tabs-rounded
          v-model="tab"
          :tabs="[
            {
              value: 'image',
              title: $t('global.commons.image'),
              icon: 'image',
            },
            {
              value: 'size',
              title: $t('global.commons.size'),
              icon: 'fit_screen',
            },
          ]"
          class="mb-5"
        >
        </u-tabs-rounded>

        <v-window v-model="tab" class="bg-transparent">
          <v-window-item value="image">
            <div class="widget-box -large mb-5" dir="ltr">
              <s-widget-header icon="image" title="Images"></s-widget-header>
              <v-list-subheader>
                <div>
                  You have the option to upload a pair of images to form a
                  comparative element in your article. The system takes care of
                  automatically adjusting the size of the images. If you wish to
                  establish a default width, navigate to the 'size' tab. Please
                  select your two images here.
                </div>
              </v-list-subheader>

              <v-row dense>
                <v-col cols="12" md="6">
                  <s-image-uploader
                    :image="original_image"
                    :server="uploadUrl"
                    contenteditable="false"
                    label="Select image A"
                    max-file-size="2MB"
                    @new-url="(url) => setOriginal(url)"
                    auto-compact
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <s-image-uploader
                    :image="compared_image"
                    :server="uploadUrl"
                    contenteditable="false"
                    label="Select image B"
                    max-file-size="2MB"
                    @new-url="(url) => setCompare(url)"
                    auto-compact
                  />
                </v-col>
              </v-row>
            </div>
          </v-window-item>
          <v-window-item value="size">
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
                v-model="pack.max_width"
                :max="max_slider"
                :min="10"
                :step="0.1"
                :tick-size="16"
                class="mt-12"
                thumb-color="primary"
                thumb-label="always"
                track-fill-color="primary"
              >
                <template v-slot:prepend>
                  <small class="single-line"> Width {{ pack.dim }} </small>
                </template>
              </v-slider>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show_dialog = false">
            <v-icon start>close</v-icon>

            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="setValue"
          >
            <v-icon start>check</v-icon>
            {{ $t("global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import { EventName } from "@selldone/core-js/events/EventBus";
import UTabsRounded from "../../../../ui/tab/rounded/UTabsRounded.vue";

export default {
  name: "AAddonComparisonDialog",
  components: { UTabsRounded, SImageUploader },

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
    tab: "image",
    // ---------------------------------

    callback: null,
    deleteCallback: null,

    // ---------------------------------
    show_dialog: false,

    pack: {
      max_width: 100,
      dim: "em",
    },
  }),
  computed: {
    original_image() {
      return this.pack ? this.pack.original : null;
    },
    compared_image() {
      return this.pack ? this.pack.compare : null;
    },

    max_slider() {
      return 100;
    },
  },

  watch: {
    show_dialog(val) {
      if (!val)
        // Reset after close!
        this.$nextTick(() => {
          this.resetToDefault(); // 🞇 Reset to default
        });
    },
  },

  mounted() {
    this.EventBus.$on(
      EventName.ARTICLE_COMPARE_IMAGES_SHOW,

      ({ pack, callback, deleteCallback, tab, masterId }) => {
        // Check master ID (For prevent duplicated open dialog - in the page builder)
        if (this.masterId !== masterId) {
          return;
        }

        this.pack = pack;

        this.callback = callback;
        this.deleteCallback = deleteCallback;

        this.tab = tab;

        this.showDialog();
      },
    );
  },
  beforeUnmount() {
    this.EventBus.$off(EventName.ARTICLE_COMPARE_IMAGES_SHOW);
  },

  methods: {
    setOriginal(path) {
      // console.log("setOriginal", path);
      this.pack.original = path;
    },

    setCompare(path) {
      // console.log("setCompare", path);
      this.pack.compare = path;
    },

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
