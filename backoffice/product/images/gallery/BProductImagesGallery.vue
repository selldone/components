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
    <s-gallery-upload-grid
      v-if="show"
      :contain="style.contain"
      :deletePath="(image_item) => deletePath(image_item)"
      :has-alt="true"
      :images="images"
      :uploadPath="upload_path"
      has-ai-background-remove
      max-file-size="3MB"
      @add:image="
        (image) => {
          AddOrUpdateItemByID(product.images, image);
          refreshImages();
        }
      "
      @delete:image="
        (image_id) => {
          DeleteItemByID(product.images, image_id);
          refreshImages();
        }
      "
      @update:orders="saveOrders"
      @click:alt="(im) => showEditAlt(im)"
      @click:bg-remove="(im) => showBackgroundRemove(im)"
    ></s-gallery-upload-grid>

    <!-- █████████████████████ Alt Dialog █████████████████████ -->
    <v-dialog
      v-model="dialog_alt"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selected_image_alt">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1" color="#111">broken_image</v-icon>
          Set Alternate Text for Image
        </v-card-title>

        <v-card-text>
          <div class="max-widget-width mx-auto">
            <div class="text-center py-5">
              <v-avatar rounded size="256">
                <v-img :src="getShopImagePath(selected_image_alt.path)">
                </v-img>
              </v-avatar>
            </div>

            <v-textarea
              v-model="alt_input"
              :rows="2"
              auto-grow
              label="Alt"
              persistent-placeholder
              placeholder="Enter descriptive text for the image..."
              variant="underlined"
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_alt = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="busy_save"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="saveAlt()"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- █████████████████████ Background Remove Dialog █████████████████████ -->
    <v-dialog
      v-model="dialog_bg_remove"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selected_image_bg_remove">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1" color="#111">wallpaper</v-icon>
          Auto Remove Background
        </v-card-title>

        <v-card-text>
          <div class="max-widget-width mx-auto">
            <div class="text-center py-5">
              <v-avatar rounded="xl" size="256" class="bg-tiny-checkers">
                <v-img :src="getShopImagePath(selected_image_bg_remove.path)">
                </v-img>
              </v-avatar>
            </div>

            <u-button-ai-large
              :loading="busy_ai"
              sub-title="Create transparent background."
              title="Remove Background"
              @select="removeBackground(selected_image_bg_remove)"
            >
            </u-button-ai-large>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_bg_remove = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SGalleryUploadGrid from "../../../../ui/uploader/SGalleryUploadGrid.vue";
import UButtonAiLarge from "../../../../ui/button/ai/large/UButtonAiLarge.vue";

export default {
  name: "BProductImagesGallery",
  components: { UButtonAiLarge, SGalleryUploadGrid },
  props: {
    product: {
      required: true,
      type: Object,
    },

    variant: {
      required: false,
    },
  },

  data: () => ({
    images: [],
    show: true,

    dialog_alt: false,
    alt_input: null,
    selected_image_alt: null,
    busy_save: false,

    //----------------------
    dialog_bg_remove: false,
    selected_image_bg_remove: null,
    busy_ai: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    style() {
      return this.product.style ? this.product.style : { contain: false };
    },
    /*  images() {
      let last_time = this.last_time; //Force update!

      return this.product.images.filter(item => {
        return item.variant_id === (this.variant ? this.variant.id : null);
      });
    },*/

    upload_path() {
      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        return window.VAPI.POST_MY_VENDOR_UPLOAD_PRODUCT_COVER(
          this.$route.params.vendor_id,
          this.product.id,
          this.variant ? this.variant.id : null,
        );
      }

      return window.API.POST_UPLOAD_PRODUCT_COVER(
        this.product.shop_id,
        this.product.id,
        this.variant ? this.variant.id : null,
      );
    },
  },

  watch: {
    variant() {
      this.refreshImages();

      // Force recreate gallery grid layout!
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
  },

  created() {
    if (!this.product.images) this.product.images = [];
    this.refreshImages();

    // Sort images by order: (Client side for apply changes by drag & drop)
    this.images.sort(function (a, b) {
      return a.order - b.order;
    });
  },

  methods: {
    /**
     * IMPORTANT: Called externally!
     * this.$refs.images.forceInitializeImages()
     *
     */
    forceInitializeImages() {
      this.refreshImages();
      // Force recreate gallery grid layout!
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },

    refreshImages() {
      this.images = this.product.images.filter((item) => {
        return item.variant_id === (this.variant ? this.variant.id : null);
      });
    },

    deletePath(image_item) {
      return this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_IMAGE(
            this.$route.params.vendor_id,
            this.product.id,
            image_item.id,
          )
        : window.API.DELETE_PRODUCT_IMAGE(
            this.product.shop_id,
            this.product.id,
            image_item.id,
          );
    },

    saveOrders(orders) {
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_PRODUCT_IMAGES_ORDER(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.PUT_PRODUCT_IMAGES_ORDER(
                this.product.shop_id,
                this.product.id,
              ),
          {
            variant_id: this.variant ? this.variant.id : null,
            orders: orders,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            // Update live images order:
            orders.forEach((it) => {
              const im = this.images.find((i) => i.id === parseInt(it.id));
              if (im) im.order = it.order;
              else console.error("Image not found to set order!", it);
            });

            if (data.variant) {
              Object.assign(this.variant, data.variant); // Update variant (change in its main image)
            }

            this.showSuccessAlert(
              null,
              this.$t("product_images_list.notifications.update_sort_success"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        });
    },

    showEditAlt(image) {
      this.selected_image_alt = image;
      this.alt_input = image.alt;
      this.dialog_alt = true;
    },
    saveAlt() {
      this.busy_save = true;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_PRODUCT_IMAGE_ALT(
                this.$route.params.vendor_id,
                this.product.id,
                this.selected_image_alt.id,
              )
            : window.API.PUT_PRODUCT_IMAGE_ALT(
                this.product.shop_id,
                this.product.id,
                this.selected_image_alt.id,
              ),
          {
            alt: this.alt_input,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.images, data.image);
            this.AddOrUpdateItemByID(this.product.images, data.image);

            this.showSuccessAlert(
              null,
              "Successfully updated the image alt text.",
            );
            this.dialog_alt = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showBackgroundRemove(image) {
      this.selected_image_bg_remove = image;
      this.dialog_bg_remove = true;
    },
    removeBackground(image) {
      if (!this.USER().premium) return this.showNeedSubscribePremium();

      this.busy_ai = true;
      axios
        .post(
          window.API.POST_AI_REMOVE_BACKGROUND_PRODUCT_IMAGES(
            this.product.shop_id,
            this.product.id,
            image.id,
          ),
          {},
        )
        .then(({ data }) => {
          if (!data.error) {
            if (data.variant) Object.assign(this.variant, data.variant);

            this.AddOrUpdateItemByID(this.images, data.image);
            this.AddOrUpdateItemByID(this.product.images, data.image);

            this.dialog_bg_remove = false;
            this.$forceUpdate();

            this.showSuccessAlert(null, "Background removed successfully!");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
