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
  <div :class="{ 'b-product-images-gallery--modern text-start': modern }">
    <s-gallery-upload-grid
      v-if="show"
      ref="gallery"
      :modern="modern"
      :contain="style.contain"
      :deletePath="(image_item) => deletePath(image_item)"
      :has-alt="true"
      :images="images"
      :uploadPath="upload_path"
      allow-url-input
      :has-ai-background-remove="!modern || !IS_VENDOR_PANEL"
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
      @activity="gallery_activity = $event"
      @click:alt="(im) => showEditAlt(im)"
      @click:bg-remove="(im) => showBackgroundRemove(im)"
    ></s-gallery-upload-grid>

    <!-- █████████████████████ Alt Dialog █████████████████████ -->
    <v-dialog
      v-model="dialog_alt"
      :fullscreen="!modern"
      :max-width="modern ? 560 : undefined"
      scrollable
      :transition="modern ? undefined : 'dialog-bottom-transition'"
    >
      <v-card v-if="modern && selected_image_alt" class="b-product-images-gallery__dialog sd-modern-widget text-start">
        <v-card-title>
          <b-product-edit-info-icon name="Text" :size="20" />
          {{ $t('add_product.images_modern.alt_title') }}
          <v-spacer />
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_alt = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" :text="$t('global.actions.close')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="b-product-images-gallery__alt-preview"><v-img :src="getShopImagePath(selected_image_alt.path)" alt="" width="64" height="64" cover /><span>{{ $t('add_product.images_modern.image_number', { index: selectedAltPosition }) }}</span></div>
          <p>{{ $t('add_product.images_modern.alt_help') }}</p>
          <v-textarea v-model="alt_input" :rows="2" :maxlength="256" :counter="256" :disabled="busy_save" auto-grow autofocus :label="$t('add_product.images_modern.alt_label')" :placeholder="$t('add_product.images_modern.alt_placeholder')" variant="underlined" class="sd-modern-underlined-field" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn class="sd-modern-button" variant="text" @click="dialog_alt = false">{{ $t('global.actions.cancel') }}</v-btn><v-btn class="sd-modern-button sd-modern-button--primary" variant="elevated" color="primary" :loading="busy_save" :disabled="String(alt_input || '').length > 256" prepend-icon="save" @click="saveAlt()">{{ $t('add_product.images_modern.save_alt') }}</v-btn></v-card-actions>
      </v-card>
      <v-card v-else-if="selected_image_alt">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1" color="#111">broken_image</v-icon>
          {{ $t("product_images_gallery.dialog_alt.title") }}
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
              :placeholder="$t('product_images_gallery.dialog_alt.placeholder')"
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
      :fullscreen="!modern"
      :max-width="modern ? 560 : undefined"
      scrollable
      :transition="modern ? undefined : 'dialog-bottom-transition'"
    >
      <v-card v-if="modern && selected_image_bg_remove" class="b-product-images-gallery__dialog sd-modern-widget text-start">
        <v-card-title>
          <b-product-edit-info-icon name="WandSparkles" :size="20" />
          {{ $t('add_product.images_modern.remove_background') }}
          <v-spacer />
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_bg_remove = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" :text="$t('global.actions.close')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn>
        </v-card-title>
        <v-card-text>
          <v-img :src="getShopImagePath(selected_image_bg_remove.path)" alt="" width="160" height="160" class="b-product-images-gallery__bg-preview bg-tiny-checkers" contain />
          <p>{{ $t('add_product.images_modern.gallery_bg_help') }}</p>
          <p class="b-product-images-gallery__quota">{{ $t('add_product.images_modern.ai_quota') }}</p>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn class="sd-modern-button" variant="outlined" @click="dialog_bg_remove = false">{{ $t('global.actions.close') }}</v-btn><v-btn class="sd-modern-button sd-modern-button--primary" variant="elevated" color="primary" :loading="busy_ai" @click="removeBackground(selected_image_bg_remove)"><b-product-edit-info-icon name="WandSparkles" :size="16" />{{ $t('add_product.images_modern.remove_background') }}</v-btn></v-card-actions>
      </v-card>
      <v-card v-else-if="selected_image_bg_remove">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1" color="#111">wallpaper</v-icon>
          {{ $t("product_images_gallery.dialog_bg_remove.title") }}
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
              :sub-title="
                $t('product_images_gallery.dialog_bg_remove.action.subtitle')
              "
              :title="
                $t('product_images_gallery.dialog_bg_remove.action.title')
              "
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

<script lang="ts">
import SGalleryUploadGrid from "../../../../ui/uploader/SGalleryUploadGrid.vue";
import UButtonAiLarge from "../../../../ui/button/ai/large/UButtonAiLarge.vue";
import { BEventBusMixin } from "../../../../utils/events/BEventBusMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default {
  name: "BProductImagesGallery",
  mixins: [BEventBusMixin ],
  components: { BProductEditInfoIcon, UButtonAiLarge, SGalleryUploadGrid },
  emits: ['activity'],
  props: {
    modern: { type: Boolean, default: false },
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
    pending_orders: 0,
    gallery_activity: { busy: false, dialog: false },
  }),

  computed: {
    selectedAltPosition() {
      if (!this.selected_image_alt) return 0;
      const index = this.images.findIndex(image => image.id === this.selected_image_alt.id);
      return this.$refs.gallery?.imagePosition(this.selected_image_alt, index) || index + 1;
    },
    mediaBusy() {
      return this.busy_save || this.busy_ai || this.pending_orders > 0 || this.gallery_activity.busy;
    },
    hasOpenDialog() {
      return this.dialog_alt || this.dialog_bg_remove || this.gallery_activity.dialog;
    },
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
    mediaBusy: { immediate: true, handler() { this.emitActivity(); } },
    hasOpenDialog: { immediate: true, handler() { this.emitActivity(); } },
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
    refreshLayout() {
      const grid = this.$refs.gallery?.$refs.grid_container?.grid;
      grid?.refreshItems().layout();
    },
    emitActivity() {
      if (this.modern) this.$emit('activity', { busy: this.mediaBusy, dialog: this.hasOpenDialog });
    },
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
      if (this.modern) this.pending_orders++;
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

            NotificationService.showSuccessAlert(
              null,
              this.$t("product_images_list.notifications.update_sort_success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => { if (this.modern) this.pending_orders--; });
    },

    showEditAlt(image) {
      this.selected_image_alt = image;
      this.alt_input = image.alt;
      this.dialog_alt = true;
    },
    saveAlt() {
      if (this.modern && (this.busy_save || !this.selected_image_alt || String(this.alt_input || '').length > 256)) return;
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

            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "product_images_gallery.dialog_alt.success_update_notification",
              ),
            );
            this.dialog_alt = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showBackgroundRemove(image) {
      if (this.modern && (this.IS_VENDOR_PANEL || /^https?:\/\//i.test(image?.path || ''))) return;
      this.selected_image_bg_remove = image;
      this.dialog_bg_remove = true;
    },
    removeBackground(image) {
      if (this.modern && (this.IS_VENDOR_PANEL || this.busy_ai || /^https?:\/\//i.test(image?.path || ''))) return;
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

            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "product_images_gallery.dialog_alt.success_remove_bg_notification",
              ),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-images-gallery__dialog.v-card {
  padding: 23px;
  border-radius: 16px;
  .v-card-title { display: flex; align-items: center; gap: 10px; padding: 0; font-size: 18px; line-height: 26px; font-weight: 500; white-space: normal; }
  .v-card-title > svg { flex-shrink: 0; color: var(--sd-modern-muted); }
  .v-card-text { padding: 20px 0 0; font-size: var(--sd-modern-font-body); line-height: 22px; }
  .v-card-text p { margin-block: 0 16px; color: var(--sd-modern-muted); }
  .v-card-actions { padding: 20px 0 0; gap: 8px; }
  .sd-modern-button { font-size: 13px; line-height: 20px; }
  .b-product-images-gallery__alt-preview { display: flex; align-items: center; gap: 12px; margin-block-end: 18px; font-size: 13px; }
  .b-product-images-gallery__alt-preview .v-img { flex: 0 0 64px; border-radius: 9px; }
  .b-product-images-gallery__bg-preview { margin: 0 auto 18px; border-radius: 9px; }
  .b-product-images-gallery__quota { font-size: var(--sd-modern-font-small); line-height: 21px; }
  .v-card-actions :deep(.v-btn__content) { gap: 7px; }
  @media (max-width: 520px) { .v-card-actions { flex-wrap: wrap; } }
  @media (max-width: 600px) { padding: 18px 16px; }
}
</style>
