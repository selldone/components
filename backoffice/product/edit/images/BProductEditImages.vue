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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="mt-5">
    <!-- ==================== Main Image ==================== -->

    <div class="widget-box -large mb-5">
      <v-row justify="center" no-gutters>
        <v-col class="d-flex flex-column" cols="12" sm="6">
          <h2>
            <v-icon class="me-1">photo_camera</v-icon>
            {{ $t("add_product.edit_images.title") }}
          </h2>
          <v-list-subheader
            >{{ $t("add_product.edit_images.main_image_input_message") }}
          </v-list-subheader>

          <div>
            <s-image-uploader
              :image="getShopImagePath(product.icon)"
              :server="
                IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                  ? window.VAPI.POST_MY_VENDOR_UPLOAD_PRODUCT_MAIN_IMAGE(
                      $route.params.vendor_id,
                      product.id,
                    )
                  : window.API.POST_UPLOAD_PRODUCT_MAIN_IMAGE(
                      product.shop_id,
                      product.id,
                    )
              "
              class="mt-2"
              max-file-size="3MB"
              @new-path="handleProcessFile"
              auto-compact
            >
            </s-image-uploader>
            <v-alert
              v-if="!product.icon"
              class="small"
              color="info"
              density="compact"
              icon="info"
            >
              {{ $t("add_product.edit_images.main_image_input_nodata") }}
            </v-alert>
          </div>

          <v-expand-transition>
            <div v-if="product.icon && !forStudio">
              <h2 class="mt-5">
                <v-icon class="me-1">tune</v-icon>
                {{ $t("add_product.edit_images.image_style") }}
              </h2>
              <u-smart-toggle
                v-model="product.style.contain"
                :true-description="
                  $t('add_product.edit_images.background_is_white_msg')
                "
                :true-title="$t('add_product.edit_images.background_is_white')"
                class="m-2 mt-5"
                false-gray
                false-icon="center_focus_strong"
                true-icon="filter_center_focus"
                @change="
                  $refs.prev
                    ? $refs.prev.extRefreshStyle() /*Force update preview!*/
                    : undefined;
                  $forceUpdate();
                "
              ></u-smart-toggle>

              <u-button-ai-large
                v-if="product.icon && !forStudio"
                :loading="busy_ai"
                sub-title="Create transparent background."
                title="Remove Background"
                @select="removeBackground()"
              >
              </u-button-ai-large>
            </div>
          </v-expand-transition>
        </v-col>

        <v-col v-if="preview_available" cols="12" sm="6">
          <div v-if="!$vuetify.display.smAndUp" class="widget-buttons">
            <v-btn
              block
              color="#222"
              size="x-large"
              variant="flat"
              @click="show_preview_card = !show_preview_card"
            >
              <v-icon class="me-1" size="small"
                >{{ show_preview_card ? "visibility" : "visibility_off" }}
              </v-icon>

              {{
                show_preview_card
                  ? $t("global.actions.hide_preview")
                  : $t("global.actions.show_preview")
              }}
            </v-btn>
          </div>

          <!-- ==================== Product card image preview ==================== -->

          <v-expand-transition>
            <div v-if="show_preview_card || $vuetify.display.smAndUp">
              <div class="sample-view">
                <small class="d-block mb-2">
                  <v-icon class="me-1" color="green" size="12">circle</v-icon>
                  {{ $t("add_product.edit_images.preview") }}
                </small>
                <s-shop-product-card
                  :key="product.icon"
                  ref="prev"
                  :product="product"
                  rounded
                >
                </s-shop-product-card>
              </div>
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </div>

    <!-- ==================== Product Images ==================== -->

    <div class="mb-5 widget-box -large">
      <h2>
        <v-icon class="me-1">collections</v-icon>
        {{ $t("add_product.edit_images.images.title") }}
      </h2>
      <v-list-subheader>
        {{ $t("add_product.edit_images.images.sub_title") }}
      </v-list-subheader>
      <b-product-images-gallery :product="product" class="m-2" />
    </div>

    <!-- ==================== Product Video ==================== -->

    <div v-if="!forStudio" class="widget-box -large mb-5">
      <h2>
        <v-icon class="me-1">videocam</v-icon>
        {{ $t("add_product.edit_images.video.title") }}
      </h2>
      <v-list-subheader>
        {{ $t("add_product.edit_images.video.sub_title") }}
      </v-list-subheader>

      <v-text-field
        v-model="video_id"
        append-inner-icon="fa:fab fa-youtube"
        bg-color="#D32F2F"
        class="max-width-field-large mx-auto"
        clearable
        flat
        hide-details
        label="Youtube video"
        messages="Enter youtube video url or video ID"
        rounded
        variant="solo-filled"
        @blur="correctVideoId"
      >
      </v-text-field>

      <u-youtube-preview
        :video-id="video_id"
        class="max-width-field-large mx-auto"
      ></u-youtube-preview>
    </div>

    <s-widget-buttons v-if="!forStudio" auto-fixed-position class="my-5">
      <v-btn
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script>
import SShopProductCard from "../../../../storefront/product/card/SShopProductCard.vue";
import BProductImagesGallery from "../../images/gallery/BProductImagesGallery.vue";
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import UYoutubePreview from "../../../../ui/youtube/preview/UYoutubePreview.vue";
import UButtonAiLarge from "../../../../ui/button/ai/large/UButtonAiLarge.vue";
import { getYoutubeId } from "../../../../ui/youtube/helper/YoutubeHelper";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BProductEditImages",
  components: {
    SWidgetButtons,
    UButtonAiLarge,
    UYoutubePreview,
    USmartToggle,
    SImageUploader,
    BProductImagesGallery,
    SShopProductCard,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
    forStudio: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    selected_gallery: null,
    cover_pic: null,

    icon_pic: null,

    video_id: "",
    show_preview_card: false,
    force_preview: false,

    // -------------------
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

    preview_available() {
      return this.product.icon || this.force_preview;
    },
  },
  created() {
    if (!this.product.style || Array.isArray(this.product.style))
      this.product.style = { contain: false };

    this.video_id = this.product.video;
  },

  methods: {
    removeBackground() {
      if (!this.USER().premium) return this.showNeedSubscribePremium();

      this.busy_ai = true;
      axios
        .post(
          window.API.POST_AI_REMOVE_BACKGROUND_PRODUCT_MAIN_IMAGE(
            this.product.shop_id,
            this.product.id,
          ),
          {},
        )
        .then(({ data }) => {
          if (!data.error) {
            this.product.icon = data.product.icon;
            this.$forceUpdate();
            this.$emit("update:icon", data.product.icon);

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

    correctVideoId() {
      if (this.video_id) {
        if (this.video_id.includes(".")) {
          this.video_id = getYoutubeId(this.video_id);
        } else {
        }
      }

      this.product.video = this.video_id;
      this.$emit("update:video", this.video_id);
    },

    handleProcessFile(path) {
      //  console.log("handleProcessFile",path);
      this.force_preview = true;
      this.product.icon = path;
      this.$forceUpdate();
      this.$emit("update:icon", path);
    },
  },
};
</script>

<style lang="scss" scoped>
.sample-view {
  position: relative;
  padding: 10% 10% 6% 10%;

  margin-left: auto;
  margin-right: auto;

  border-radius: 18px;

  //border: #fff solid 8px !important;
  // box-shadow: 0 2px 43px -4px rgba(0, 0, 0, 0.19);

  @media only screen and (max-width: 520px) {
    padding: 8px;
  }
}
</style>
