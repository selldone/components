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
  <c-image-view
    :aspect-ratio="aspectRatio"
    :height="height"
    :src="cover ? cover : src"
    :width="width"
    class="position-relative"
  >
    <v-btn
      v-if="edit"
      class="center-absolute dashed rounded z1"
      icon
      size="x-large"
      style="background-color: rgba(255, 255, 255, 0.7)"
      tile
      @click.stop="showSelectCover"
    >
      <v-icon>camera</v-icon>
    </v-btn>
    <input
      v-if="edit"
      ref="cover_input"
      accept="image/*"
      hidden="hidden"
      type="file"
      @change="onSelectCover"
    />
    <slot></slot>
  </c-image-view>
</template>

<script>
import CImageView from "@components/community/image/view/CImageView.vue";

export default {
  name: "SCommunityImageUploader",
  components: { CImageView },
  props: {
    src: {},
    edit: {
      type: Boolean,
      default: false,
    },
    aspectRatio: {},
    width: {},
    height: {},
  },

  data: () => ({
    cover: null,
    cover_file: null,
  }),

  methods: {
    //――――――――――――――――――――――― Post > Cover ―――――――――――――――――――――――

    showSelectCover() {
      const defaultFile = this.$refs.cover_input;
      defaultFile.click();
    },

    onSelectCover() {
      const defaultFile = this.$refs.cover_input;

      // Image Preview
      const file = defaultFile.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.showErrorAlert(null, "Max image size limit is 2Mb.");
        return;
      }

      if (file) {
        //Read File
        const fileReader = new FileReader();

        const t = this;
        fileReader.addEventListener("load", function () {
          // convert image to base64 encoded string
          t.cover = this.result;
          t.cover_file = file;
          t.$emit("input", file);
        });
        fileReader.readAsDataURL(file);
      }
    },
  },
};
</script>

<style scoped></style>
