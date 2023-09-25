<template>
  <div>
    <!-- image -->

    <v-fade-transition hide-on-leave>
      <div
        v-if="!local_src"
        style="width: 240px; height: 240px"
        class="my-2 dashed d-flex align-center justify-center mx-auto"
      >
        <v-btn
          icon
          tile
          class="m-2"
          @click="showSelectImage()"
          x-large
          depressed
          width="90%"
          height="90%"
        >
          <v-icon>add_a_photo</v-icon>
        </v-btn>
      </div>

      <div v-else class="my-2">
        <v-img
          width="240"
          height="240"
          :src="local_src"
          class="position-relative rounded-18px zoomIn anim-fast mx-auto"
        >
          <v-btn
            class="absolute-top-end fadeIn delay_200"
            depressed
            @click="clear()"
            fab
            small
            ><v-icon>close</v-icon></v-btn
          >
        </v-img>
      </div>
    </v-fade-transition>

    <input
      type="file"
      ref="image_input"
      hidden="hidden"
      @change="onSelectImage"
      accept="image/*"
    />
  </div>
</template>

<script>
export default {
  name: "ImageInput",
  components: {},

  props: {
    src: {},
    value: {},
  },

  data() {
    return {
      local_src:null,
    };
  },

  computed: {

  },
  watch:{
    src(src){
      this.local_src=src
    }
  },

  created() {
    this.local_src=this.src
  },
  mounted() {},

  methods: {
    clear() {
      this.local_src=null;
      this.$emit("input", null);
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
          t.local_src= this.result
          t.$emit("input", file);
        });
        fileReader.readAsDataURL(file);
      }
    },
  },
};
</script>

<style scoped lang="scss"></style>
