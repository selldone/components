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
  <div>
    <muuri-grid
      v-if="show_images"
      :style="{ 'background-color': bgColor }"
      @layoutEnd="updateOrder"
      @dragEnd="dragEnd"
      ref="grid_container"
      class="rounded-18px"
    >
      <div
        v-for="(image, index) in images"
        :key="image.path"
        class="item-grid white"
        :style="style_value"
        ref="items"
        :image_id="image.id"
      >
        <v-img
          :src="getShopImagePath(image.path)"
          :aspect-ratio="$vuetify.breakpoint.smAndUp ? 1 : 2"
          class="m-2"
        >
          <template v-slot:placeholder>
            <v-layout fill-height align-center justify-center ma-0>
              <v-progress-circular indeterminate color="primary" />
            </v-layout>
          </template>

          <div
            v-if="(image.width && image.height) || image.size"
            class="absolute-bottom-start x-small white--text text-nowrap pen usn rounded-lg pa-1"
            style="background-color: rgba(10, 20, 60, 0.21)"
          >
            <span
              v-if="image.width && image.height && image.size"
              class="me-1"
              >{{ `${image.width}px ✕ ${image.height}px` }}</span
            >
            <div v-if="image.size" class="d-flex align-center">
              <b>{{ image.size | numeralFormat("0.[0] b") }} </b>

              <v-progress-linear
                :color="
                  image.size > 1024 * 1024
                    ? 'red'
                    : image.size > 512 * 1024
                    ? 'amber'
                    : 'green'
                "
                :value="(100 * image.size) / (1024 * 1024)"
                height="2"
                rounded
                style="max-width: 64px"
                class="mx-1"
              ></v-progress-linear>
            </div>
          </div>

          <v-btn
            v-if="hasAlt"
            title="Set Alt text"
            color="rgba(10,20,60)"
            depressed
            dark
            class="absolute-bottom-end"
            small
            @click.stop="$emit('click:alt', image)"
            ><v-icon v-if="image.alt" class="me-1" x-small>check_circle</v-icon
            >ALT</v-btn
          >
        </v-img>

        <v-btn
          :title="$t('global.actions.delete')"
          color="#D32F2F"
          depressed
          fab
          small
          dark
          class="m-2 absolute-top-end"
          @click="deleteAppImage(image, index)"
          :loading="busy_delete === index"
        >
          <v-icon>delete_outline</v-icon>
        </v-btn>
      </div>

      <div class="p-2 item-grid white" :style="style_value">
        <s-image-uploader
          class="marginal-center"
          label="Upload images"
          :server="uploadPath"
          :max-file-size="maxFileSize"
          @response="handleUploadAppImages"
          allow-multiple
          :max-files="20"
          dense
          disable-past
        >
        </s-image-uploader>
      </div>
    </muuri-grid>
  </div>
</template>

<script>
import SImageUploader from "./SImageUploader.vue";
import MuuriGrid from "@/Components/ui/grid/MurriGrid.vue";
export default {
  name: "SGalleryUploadGrid",
  components: { MuuriGrid, SImageUploader },
  props: {
    uploadPath: {
      required: true,
    },
    deletePath: {
      required: true,
    },
    images: {
      required: true,
    },

    contain: {
      default: true,
      type: Boolean,
    },
    bgColor: {
      default: "#fafafa",
    },
    hasAlt: {
      type: Boolean,
      default: false,
    },
    maxFileSize: {
      default: "2MB",
    },
  },

  data: () => ({
    selected_gallery: null,

    show_images: false,

    orders: [],

    orders_changed: false,

    busy_delete: false,

    last_orders: null,
  }),

  watch: {
    orders() {
      this.orders_changed = true;
    },
  },

  computed: {
    style_value() {
      if (this.$vuetify.breakpoint.mdAndUp)
        return "width: 30%;height: auto;margin: 1.5%";
      if (this.$vuetify.breakpoint.smAndUp)
        return "width: 44%;height: auto;margin: 2%";
      return "width: 94%;height: auto;margin: 3%";
    },
  },
  created() {
    this.orders = this.images.map((im) => {
      return { id: im.id, order: im.order };
    });
    this.last_orders = Object.assign([], this.orders);
  },

  mounted() {
    this.show_images = false;

    // Wait all animation ends! (Fix bug in dialog)
    setTimeout(() => {
      this.show_images = true;
    }, 400);
  },

  methods: {
    updateOrder(items) {
      //console.log("updateOrder");
      this.orders = [];
      let index = 0;

      items.forEach((item) => {
        //  console.log('updateOrder item',item)

        const id = item._element.getAttribute("image_id");
        if (id)
          // Not send uploader component!
          this.orders.push({ id: parseInt(id), order: index++ });
      });
    },

    dragEnd() {
      if (!this.orders_changed) return;

      // console.log(this.last_orders,this.orders)

      if (JSON.stringify(this.last_orders) === JSON.stringify(this.orders))
        return; // No order changes!

      this.last_orders = Object.assign([], this.orders);

      this.orders_changed = false;
      // console.log("dragEnd",this.orders,JSON.stringify(this.orders));

      this.$emit("update:orders", this.orders);
    },

    handleUploadAppImages(response) {
      const clone = this.images.slice();
      const index = clone.length;
      clone.push(response.files.item);
      this.$emit("update:images", clone);
      this.$emit("add:image", response.files.item);

      this.$nextTick(function () {
        this.$refs.grid_container.add(this.$refs.items[index], {
          index: index,
        });
      });
    },

    deleteAppImage(image_item, index) {
      //console.log('image_item',image_item,'index',index);

      this.busy_delete = index;
      axios
        .delete(this.deletePath(image_item))
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            const clone = this.images.slice();
            this.DeleteItemByID(clone, data.id);

            this.$emit("update:images", clone);
            this.$emit("delete:image", data.id);

            this.$refs.grid_container.remove(
              this.$refs.grid_container.getItems(index)
            );

            /* this.$nextTick( () =>{
              this.$refs.grid_container.layout();
            });*/

            this.showSuccessAlert(
              "Delete image",
              "Image removed successfully."
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy_delete = null;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.hover-image-gallery {
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(0.9, 0.9) !important;
  }
}

.item-grid {
  cursor: move;
  border-radius: 12px;
  .v-image {
    border-radius: 12px;
  }
}
</style>
