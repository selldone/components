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
  <div class="text-start">
    <widget-header
      title="Augmentation"
      add-text
      add-caption="Add New Item"
      @click:add="show_add = true"
      icon="extension"
    >
      <template v-slot:append-title>
        <v-btn icon class="mx-1" @click="help_dialog=true">
          <v-icon>help</v-icon>
        </v-btn>
      </template>
    </widget-header>

    <v-subheader>
      Input the key that will be swapped with its corresponding value in the
      page content. Keys should be max 32 characters.
    </v-subheader>

    <v-simple-table class="bg-transparent min-height-10vh">
      <template v-slot:default>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in value" :key="i">
            <td>
              <v-text-field
                v-model="item.key"
                title="Key"
                solo
                flat
                :counter="32"
                dense
                hide-details
                :rules="[GlobalRules.counter(32)]"
                placeholder="Enter a key..."
                background-color="transparent"
                @change="$emit('change')"
              ></v-text-field>
            </td>
            <td>
              <s-image-uploader
                v-if="item.type === 'image'"
                dense
                auto-compact
                clearable
                param-name="photo"
                disable-past
                :server="upload_server"
                @new-path="
                  (path) => {
                    item.value = path;
                    $emit('change');
                  }
                "
                :image="item.value ? getShopImagePath(item.value) : undefined"
                max-file-size="2MB"
                min-height="110px"
              ></s-image-uploader>
              <v-text-field
                v-else
                v-model="item.value"
                title="Value"
                solo
                flat
                dense
                hide-details
                :counter="64"
                placeholder="Enter a value..."
                background-color="transparent"
                @change="$emit('change')"
              ></v-text-field>
            </td>

            <td>
              <v-btn icon color="red" @click="remove(value, item)">
                <v-icon>close</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-expand-transition>
      <progress-loading v-if="loading" relative></progress-loading>
    </v-expand-transition>

    <v-bottom-sheet
      v-model="show_add"
      scrollable
      max-width="680"
      width="96%"
      content-class="no-shadow-dialog"
    >
      <v-card class="rounded-t-xl text-start">
        <v-card-title> Select input type</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item @click="addTextItem">
              <v-list-item-icon><v-icon>title</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Text & Html</v-list-item-title>
                <v-list-item-subtitle
                  >The item's value can be designated as either text or
                  HTML.</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="addImageItem">
              <v-list-item-icon><v-icon>image</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Image</v-list-item-title>
                <v-list-item-subtitle
                  >You can upload an image.</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- █████████████████████ Help Dialog █████████████████████ -->
    <v-dialog
        v-model="help_dialog"
        fullscreen
        transition="dialog-bottom-transition"
        scrollable
    >
      <v-card class="text-start" >
        <v-card-title>
          <v-icon class="me-1" color="#111">help</v-icon>
          How to use dynamic content
        </v-card-title>

        <v-card-text>
          <v-container class="typo-body">

            <p>
              In the landing pages, you have the flexibility to designate dynamic placeholders for both text and images. These placeholders serve a significant role in customizing the content according to the context.
            </p>
            <p>
              The dynamic nature of these placeholders allows them to be populated by augmentation values, which can vary based on different factors. For example, the augmentation values might be different for each product or category.
            </p>
            <p>
              The real advantage of this feature comes into play when you have a variety of items with differing attributes. You can effectively utilize these dynamic placeholders to personalize and enhance the display of each item, thereby creating a unique and interactive experience on your landing pages.
            </p>
            <v-img :src="require('./assets/agument-1.png')" :aspect-ratio="2000/1290" class="mb-5"></v-img>
            <p>
              To assign dynamic values to images, click on the feeder button located on the left side of the section.
            </p>
            <v-img :src="require('./assets/agument-2.png')" :aspect-ratio="2000/1290" class="mb-5"></v-img>
            <p>
              You now have the ability to modify the image URL and assign it a dynamic value.
            </p>
            <v-img :src="require('./assets/agument-3.png')" :aspect-ratio="2000/1290" class="mb-5"></v-img>
            <p>
              For every product, you have the ability to assign dedicated key-value pairs.
            </p>
            <v-img :src="require('./assets/agument-4.png')" :aspect-ratio="2000/1290" class="mb-5"></v-img>
            <p>
              This is the final outcome of the page, where placeholders have been substituted with augmented values.
            </p>
            <v-img :src="require('./assets/agument-5.png')" :aspect-ratio="2000/1290" class="mb-5"></v-img>

          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn x-large @click="help_dialog = false" text>
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import SImageUploader from "@/Components/uploader/SImageUploader.vue";

export default {
  name: "AugmentForm",
  components: {SImageUploader },
  props: {
    value: {},
    loading:{type:Boolean}
  },

  data: function () {
    return {
      show_add: false,
      help_dialog:false,

    };
  },
  computed: {
    upload_server() {
      return window.API.POST_SHOP_AUGMENT_UPLOAD_IMAGE(
        this.$route.params.shop_id
      );
    },
  },

  watch: {},

  created() {
    this.init();
  },

  methods: {
    init() {
      if (!this.value || !Array.isArray(this.value)) this.$emit("input", []);
    },
    addTextItem() {
      this.value.push({ key: "", value: null, type: "text" });
      this.show_add = false;
      this.$forceUpdate();
      this.$emit("change");
    },
    addImageItem() {
      this.value.push({ key: "", value: null, type: "image" });
      this.show_add = false;
      this.$forceUpdate();
      this.$emit("change");
    },
  },
};
</script>

<style scoped lang="scss"></style>
