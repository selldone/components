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
  <v-bottom-sheet
    v-model="show_dialog"
    width="98vw"
    max-width="860"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card rounded="t-xl">
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
          <v-icon start>delete</v-icon>
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
              <u-widget-header icon="image" title="Images"></u-widget-header>
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

          <v-window-item value="size">
            <div class="widget-box -large mb-5">
              <u-widget-header
                icon="fit_screen"
                title="Relative image size"
              ></u-widget-header>
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

<script lang="ts">
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import DraggableImagesList from "../../../../ui/image/draggableImagesList.vue";
import { EventBus, EventName } from "@selldone/components-vue/utils/events/EventBus.ts";
import UTabsRounded from "../../../../ui/tab/rounded/UTabsRounded.vue";

export default {
  name: "AAddonCatalogDialog",
  components: { UTabsRounded, DraggableImagesList, SImageUploader },

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
    EventBus.$on(
      EventName.ARTICLE_FLIP_BOOK_SHOW,

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
    EventBus.$off(EventName.ARTICLE_FLIP_BOOK_SHOW);
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
