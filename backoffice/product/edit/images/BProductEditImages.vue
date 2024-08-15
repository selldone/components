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

              <template v-if="product.icon && !forStudio">
                <u-button-ai-large
                  :loading="busy_ai"
                  sub-title="Create transparent background."
                  title="Remove Background"
                  @select="removeBackground()"
                >
                </u-button-ai-large>

                <u-button-ai-large
                  sub-title="Create more images with new backgrounds."
                  title="Reimagine"
                  @select="showReplaceBg()"
                >
                </u-button-ai-large>
              </template>
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
      <b-product-images-gallery ref="images" :product="product" class="m-2" />
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

    <!-- ███████████████████████ Dialog > AI > Change Background ███████████████████████ -->

    <v-dialog
      v-model="dialog_replace_bg"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1" color="#111">wallpaper</v-icon>
          Create Image With New Background
        </v-card-title>

        <v-card-text>
          <div class="text-center py-5">
            <v-avatar rounded="xl" size="256" class="bg-tiny-checkers">
              <v-img :src="getShopImagePath(product.icon)"></v-img>
            </v-avatar>
          </div>

          <v-slide-group
            v-model="prompt"
            class="pa-4"
            selected-class="bg-success"
            show-arrows
          >
            <v-slide-group-item
              v-for="it in items"
              :key="it.value"
              v-slot="{ isSelected, toggle, selectedClass }"
              :value="it.value"
            >
              <v-card
                :class="['ma-4', selectedClass]"
                color="grey-lighten-1"
                height="160"
                width="160"
                @click="toggle"
                :image="it.src"
              >
                <div class="d-flex fill-height align-center justify-center">
                  <v-scale-transition>
                    <v-icon v-if="isSelected" color="white" size="48">
                      check_circle
                    </v-icon>
                  </v-scale-transition>
                  <b>
                    {{it.title}}
                  </b>
                </div>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>

          <div class="max-widget-width mx-auto">
            <v-textarea
              v-model="prompt"
              label="Prompt"
              placeholder="Describe what the background should be..."
              persistent-placeholder
              variant="outlined"
            >
            </v-textarea>
          </div>

          <u-button-ai-large
            :loading="busy"
            :sub-title="!prompt?'Reimagine entire image.':'Replace background.'"
            title="Create New Image"
            @select="replaceBackground()"
          >
          </u-button-ai-large>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_replace_bg = false"
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

    dialog_replace_bg: false,
    prompt: null,
    busy: false,

    items: [
      {
        value: "",
        title: "Reimagine",
        src: require("./assets/reimage.webp"),

      },
      {
        value:
          "A softly lit, seamless white backdrop with gentle shadows and a subtle gradient effect, ideal for highlighting clean and modern product designs.",
        src: require("./assets/A softly lit, seamless white backdrop with gentle shadows and a subtle gradient effect. The background is smooth and clean, ideal for highlighting mod.webp"),

      },
      {
        value:
          "A soft pastel-colored studio background with a smooth, curved surface and diffused lighting, creating a calm and inviting atmosphere for delicate or luxury products.",
        src: require("./assets/A soft pastel-colored studio background with a smooth, curved surface and diffused lighting. The colors are gentle and calming, creating an inviting a.webp"),

      },
      {
        value:
          "A neutral-toned studio setup with a light beige backdrop and a subtle spotlight effect, perfect for bringing attention to the details of premium or handcrafted items.",
        src: require("./assets/A neutral-toned studio setup with a light beige backdrop and a subtle spotlight effect. The background is simple and elegant, with the light creating .webp"),

      },
      {
        value:"A scene , product studio, with colorful persian mosaic tile designs, viewed from the side. The mosaic patterns create a vibrant backdrop,  leaving the center clear for product placement.",
        src: require("./assets/A product studio scene featuring colorful Persian mosaic tile designs, viewed from the side. The intricate and vibrant mosaic patterns serve as a rich.webp"),

      },

      {
        value:
          "A minimalist white marble countertop with soft natural sunlight streaming through a large window, casting gentle shadows, perfect for displaying luxury skincare products.",
        src: require("./assets/A minimalist white marble countertop with subtle veining, set in a bright room with large windows. Soft natural sunlight streams through the windows.webp"),
      },
      {
        value:
          "A rustic wooden table set in a cozy kitchen, with warm, ambient lighting and a vase of fresh flowers in the background, ideal for showcasing handmade kitchenware.",
        src: require("./assets/A rustic wooden table set in a cozy, warmly lit kitchen. The table features a natural wood grain with a slightly weathered finish, giving it a charmin.webp"),
      },
      {
        value:
          "A sleek, modern living room with a clean-lined sofa and a coffee table, bathed in soft afternoon light, perfect for highlighting contemporary home decor items.",
        src: require("./assets/A sleek, modern living room featuring a clean-lined, minimalist sofa in neutral tones, positioned against a simple, elegant backdrop. A contemporary c.webp"),
      },
      {
        value:
          "A serene outdoor garden scene with a small wooden deck, surrounded by lush greenery and soft dappled sunlight, ideal for presenting eco-friendly products.",
        src: require("./assets/A serene outdoor garden scene featuring a small wooden deck surrounded by lush, vibrant greenery. The deck is nestled within a natural setting, with s.webp"),
      },
      {
        value:
          "A stylish bathroom with a marble sink and gold accents, with soft, diffused lighting, perfect for displaying premium grooming or beauty products.",
        src: require("./assets/A stylish bathroom featuring a sleek marble sink with a polished finish, complemented by elegant gold accents such as faucets and handles. The space i.webp"),
      },
      {
        value:
          "A modern kitchen island with polished concrete surfaces and subtle under-cabinet lighting, ideal for showcasing high-end kitchen gadgets or appliances.",
        src: require("./assets/A modern kitchen featuring a central island with polished concrete surfaces that have a smooth, refined finish. The island is complemented by subtle u.webp"),
      },
      {
        value:
          "A cozy bedroom scene with a neatly made bed, soft linens, and a bedside table with a small lamp, perfect for presenting sleep-related products.",
        src: require("./assets/A cozy bedroom scene featuring a neatly made bed with soft, inviting linens in neutral tones. The bed is positioned against a simple, calming backdrop.webp"),
      },
      {
        value:
          "A clean, white desk setup with a sleek laptop, a few minimalist office accessories, and soft lighting from a nearby window, ideal for showcasing tech gadgets.",
        src: require("./assets/A clean, white desk setup featuring a sleek, modern laptop at the center. The desk is minimalistic, with only a few carefully chosen office accessorie.webp"),
      },
      {
        value:
          "A luxurious dining table set with elegant tableware and a centerpiece of fresh flowers, with ambient evening lighting, perfect for showcasing dining products.",
        src: require("./assets/A luxurious dining table elegantly set with fine tableware, including polished plates, crystal glassware, and silver cutlery. At the center of the tab.webp"),
      },
      {
        value:
          "A calm beach scene with a wooden boardwalk leading to the ocean, with soft sunlight and gentle waves, ideal for presenting outdoor or summer products.",
        src: require("./assets/A calm beach scene featuring a wooden boardwalk that stretches towards the ocean. The boardwalk is weathered but sturdy, leading through soft sand tow.webp"),
      },
      {
        value:
          "A high-rise city balcony at dusk, with twinkling city lights in the background and a small table set with a cup of coffee, perfect for showcasing urban lifestyle products.",
        src: require("./assets/A high-rise city balcony at dusk, overlooking a sprawling urban landscape with twinkling city lights in the distance. The balcony features a small, st.webp"),
      },
      {
        value:
          "A vintage-style study with a wooden desk, an antique globe, and warm, ambient lighting from a desk lamp, ideal for displaying classic stationery or books.",
        src: require("./assets/A vintage-style study featuring a rich wooden desk with an antique finish. On the desk sits an antique globe with detailed maps, along with classic st.webp"),
      },
      {
        value:
          "A serene yoga studio with a clean wooden floor, soft natural light, and a few strategically placed plants, perfect for showcasing wellness or fitness products.",
        src: require("./assets/A serene yoga studio with a clean, polished wooden floor that exudes warmth and simplicity. Soft natural light floods the room, creating a calm and in.webp"),
      },
      {
        value:
          "A chic, minimalist coffee shop with modern seating and a barista counter in the background, with soft morning light, ideal for presenting gourmet coffee or accessories.",
        src: require("./assets/A chic, minimalist coffee shop featuring sleek, modern seating in neutral tones. In the background, a stylish barista counter is visible, with clean l.webp"),
      },
    ],
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

    showReplaceBg() {
      this.dialog_replace_bg = true;
      if(!this.prompt)this.prompt=this.items[Math.floor(Math.random()*this.items.length)].value;
    },
    replaceBackground() {
      if (!this.USER().premium) return this.showNeedSubscribePremium();

      this.busy = true;
      axios
        .post(
          window.API.POST_AI_CREATE_NEW_PRODUCT_IMAGE(
            this.product.shop_id,
            this.product.id,
          ),
          {
            prompt: this.prompt,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            if (data.variant) Object.assign(this.variant, data.variant);

            this.AddOrUpdateItemByID(this.product.images, data.image);
            this.$refs.images.forceInitializeImages();

            this.dialog_replace_bg = false;

            this.showSuccessAlert(null, "Image created successfully!");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
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
