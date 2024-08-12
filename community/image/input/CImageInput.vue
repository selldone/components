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
  <div>
    <!-- image -->

    <v-fade-transition hide-on-leave>
      <div
        v-if="!local_src"
        class="my-2 dashed d-flex align-center justify-center mx-auto"
        style="width: 240px; height: 240px"
      >
        <v-btn
          class="m-2"
          height="90%"
          icon
          size="x-large"
          tile
          variant="flat"
          width="90%"
          @click="showSelectImage()"
        >
          <v-icon>add_a_photo</v-icon>
        </v-btn>
      </div>

      <div v-else class="my-2">
        <v-img
          :src="local_src"
          class="position-relative rounded-18px zoomIn anim-fast mx-auto"
          height="240"
          width="240"
        >
          <v-btn
            class="absolute-top-end fadeIn delay_200"
            icon
            size="small"
            variant="flat"
            @click="clear()"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-img>
      </div>
    </v-fade-transition>

    <input
      ref="image_input"
      accept="image/*"
      hidden="hidden"
      type="file"
      @change="onSelectImage"
    />
  </div>
</template>

<script>
export default {
  name: "CImageInput",
  components: {},
  emits: ["update:modelValue"],
  props: {
    src: {},
  },

  data() {
    return {
      local_src: null,
    };
  },

  computed: {},
  watch: {
    src(src) {
      this.local_src = src;
    },
  },

  created() {
    this.local_src = this.src;
  },
  mounted() {},

  methods: {
    clear() {
      this.local_src = null;
      this.$emit("update:modelValue", null);
    },

    //――――――――――――――――――――――― Select image file ―――――――――――――――――――――――

    showSelectImage() {
      const defaultFile = this.$refs.image_input;
      defaultFile.click();
    },

    onSelectImage() {
      const defaultFile = this.$refs.image_input;

      // Image Preview
      const file = defaultFile.files[0]; //files[0] - For getting first file
      //   console.log(files);

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
          // load on success:
          t.local_src = this.result;
          t.$emit("update:modelValue", file);
        });
        fileReader.readAsDataURL(file);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
