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
  <s-grid-draggable-view
    v-if="show_images"
    ref="grid_container"
    :style="{ 'background-color': bgColor }"
    class="b--gallery-grid rounded-18px"
    @dragEnd="dragEnd"
    @layoutEnd="updateOrder"
  >
    <div
      v-for="(image, index) in images"
      :key="image.id"
      ref="items"
      :image_id="image.id"
      :style="style_value"
      class="item-grid pa-2"
    >
      <v-img
        :aspect-ratio="$vuetify.display.smAndUp ? 1 : 2"
        :src="getShopImagePath(image.path)"
        cover
      >
        <template v-slot:placeholder>
          <v-progress-circular
            class="center-absolute"
            color="primary"
            indeterminate
          />
        </template>

        <div
          v-if="(image.width && image.height) || image.size"
          class="absolute-bottom-start x-small text-white text-nowrap usn rounded-lg pa-1 -spec"
        >
          <span v-if="image.width && image.height && image.size" class="me-1">{{
            `${image.width}px ✕ ${image.height}px`
          }}</span>
          <div v-if="image.size" class="d-flex align-center">
            <b>{{ numeralFormat(image.size, "0.[0] b") }} </b>

            <v-progress-linear
              :color="
                image.size > 1024 * 1024
                  ? 'red'
                  : image.size > 512 * 1024
                    ? 'amber'
                    : 'green'
              "
              :model-value="(100 * image.size) / (1024 * 1024)"
              bg-color="#000"
              class="mx-1"
              height="2"
              location="start"
              rounded
              style="max-width: 64px"
            ></v-progress-linear>
          </div>
        </div>

        <div class="absolute-bottom-end d-flex flex-column no-drag">
          <v-chip
            v-if="hasAiBackgroundRemove && isValidHttpUrl(image.path)"
            class="mb-1"
            color="rgba(10,20,60)"
            size="small"
            variant="flat"
            label
            title="External URL"
            prepend-icon="link"
            style="min-height: 28px"
          >
            URL
          </v-chip>

          <v-btn
            v-else-if="hasAiBackgroundRemove"
            class="mb-1"
            color="rgba(10,20,60)"
            size="small"
            title="AI Remove Background"
            variant="flat"
            @click.stop="$emit('click:bg-remove', image)"
          >
            <v-icon class="me-1" size="x-small"
              >{{
                image.path?.endsWith("--transparent.png")
                  ? "check_circle"
                  : "auto_fix_high"
              }}
            </v-icon>

            BGR
          </v-btn>

          <v-btn
            v-if="hasAlt"
            color="rgba(10,20,60)"
            size="small"
            title="Set Alt Text"
            variant="flat"
            @click.stop="$emit('click:alt', image)"
            prepend-icon="edit"

          >
            <v-icon v-if="image.alt" class="me-1" size="x-small"
              >check_circle
            </v-icon>
            ALT
          </v-btn>
        </div>
      </v-img>

      <v-btn
        :loading="busy_delete === index"
        :title="$t('global.actions.delete')"
        class="m-2 absolute-top-end no-drag"
        color="#D32F2F"
        icon=""
        size="small"
        variant="flat"
        @click="deleteAppImage(image, index)"
      >
        <v-icon>delete_outline</v-icon>
      </v-btn>
    </div>

    <div :style="style_value" class="pa-2 item-grid">
      <s-image-uploader
        :max-file-size="maxFileSize"
        :max-files="20"
        :server="uploadPath"
        allow-multiple
        class="marginal-center"
        dense
        disable-past
        @response="handleUploadAppImages"
        minHeight="190px"
        rounded="lg"
border
      >
      </s-image-uploader>

      <v-btn
        v-if="allowUrlInput"
        block
        class="mt-3 no-drag text-none text-white justify-start"
        color="#111"
        height="72"
        prepend-icon="link"
        rounded="lg"
        size="x-large"
        variant="flat"
        @click.stop="showUrlDialog()"
      >
        <span
          class="d-flex flex-column text-start flex-grow-1 flex-shrink-1 overflow-hidden"
        >
          <b class="text-body-1 font-weight-bold text-truncate"
            >Add image URL</b
          >
          <small
            class="text-caption font-weight-regular opacity-60 mt-1 text-truncate"
            >Optional external link. No upload.</small
          >
        </span>
      </v-btn>
    </div>
  </s-grid-draggable-view>

  <v-dialog v-model="dialog_url" max-width="560" scrollable>
    <v-card class="text-start">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1" color="#111">link</v-icon>
        Add image URL
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="url_input"
          :disabled="busy_url"
          autofocus
          clearable
          label="Image URL"
          placeholder="https://example.com/product.jpg"
          prepend-inner-icon="link"
          variant="outlined"
          @keyup.enter="addImageUrl()"
        />

        <v-img
          v-if="isValidHttpUrl(url_input)"
          :src="url_input"
          class="bg-tiny-checkers rounded-lg mt-3"
          max-height="260"
        />
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_url = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy_url"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addImageUrl()"
          >
            <v-icon start>add</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SImageUploader from "./SImageUploader.vue";
import SGridDraggableView from "../../ui/grid/draggable-view/SGridDraggableView.vue";

export default {
  name: "SGalleryUploadGrid",
  components: { SGridDraggableView, SImageUploader },
  emits: [
    "update:images",
    "add:image",
    "delete:image",
    "click:alt",
    "click:bg-remove",
  ],
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
    hasAiBackgroundRemove: {
      type: Boolean,
      default: false,
    },
    allowUrlInput: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    selected_gallery: null,

    show_images: false,

    orders: [],

    orders_changed: false,

    busy_delete: false,
    dialog_url: false,
    url_input: null,
    busy_url: false,

    last_orders: null,
  }),

  watch: {
    orders() {
      this.orders_changed = true;
    },
  },

  computed: {
    style_value() {
      if (this.$vuetify.display.mdAndUp)
        return "width: 30%;height: auto;margin: 1.5%";
      if (this.$vuetify.display.smAndUp)
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

    showUrlDialog() {
      this.url_input = null;
      this.dialog_url = true;
    },

    isValidHttpUrl(url) {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch (e) {
        return false;
      }
    },

    addImageUrl() {
      const url = this.url_input?.trim();
      if (!this.isValidHttpUrl(url)) {
        return NotificationService.showErrorAlert(
          null,
          "Enter a valid image URL.",
        );
      }

      this.busy_url = true;
      axios
        .post(this.uploadPath, { url })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          if (!data.files?.item) {
            NotificationService.showErrorAlert(null, "Image was not created.");
            return;
          }

          this.handleUploadAppImages(data);
          this.dialog_url = false;

          NotificationService.showSuccessAlert(
            null,
            "Image URL added successfully.",
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_url = false;
        });
    },

    deleteAppImage(image_item, index) {
      //console.log('image_item',image_item,'index',index);

      this.busy_delete = index;
      axios
        .delete(this.deletePath(image_item))
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            const clone = this.images.slice();
            this.DeleteItemByID(clone, data.id);

            this.$emit("update:images", clone);
            this.$emit("delete:image", data.id);

            this.$refs.grid_container.remove(
              this.$refs.grid_container.getItems(index),
            );

            /* this.$nextTick( () =>{
                    this.$refs.grid_container.layout();
                  });*/

            NotificationService.showSuccessAlert(
              "Delete image",
              "Image removed successfully.",
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_delete = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b--gallery-grid {
  .item-grid {
    cursor: move;
    border-radius: 12px;

    display: block;
    position: absolute;
    z-index: 1;
    background: #fff;

    .v-img {
      border-radius: 12px;
    }
  }

  .-spec {
    background-color: rgba(10, 20, 60, 0.3);
    transition: all 0.4s;

    &:hover {
      background-color: rgba(10, 20, 60, 0.9);
    }
  }
}

</style>
