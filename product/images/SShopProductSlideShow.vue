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
  <div class="s--product-images" :class="{ '-vertical': vertical }">
    <!--  ▃▃▃▃▃▃▃▃▃▃ Gallery > Thumbs Swiper ▃▃▃▃▃▃▃▃▃▃ -->

    <s-fade-scroll class="gallery-thumbs" :class="{ '-vertical': vertical }" style="max-height: 600px">
      <div class="gallery-thumbs-wrap">
        <div v-for="(item, i) in images_list_embedded" :key="item.key">
          <!--  ▃▃▃▃▃▃▃▃▃▃ Thumbnails > Image ▃▃▃▃▃▃▃▃▃▃ -->

          <v-img
            v-if="item.image"
            @click="index = i"
            class="-slide"
            aspect-ratio="1"
            :src="getShopImagePath(item.image.path, IMAGE_SIZE_SMALL)"
            :alt="item.image.alt"
          />

          <!--  ━━━━━━━━━━━━ Thumbnails > Video ━━━━━━━━━━━━ -->

          <div
            v-else-if="item.video"
            class="-slide -video"
            @click="index = i"
            :class="{ '-video-active': index === i }"
          >
            <div class="ma-auto">
              <v-icon color="#fff" class="mb-1">smart_display</v-icon>
              <div>{{$t('global.commons.video')}}</div>
            </div>
          </div>

          <!--  ━━━━━━━━━━━━ Thumbnails > AR / 3D ━━━━━━━━━━━━ -->

          <div
            v-else-if="item.ar"
            class="-slide -ar"
            @click="index = i"
            :class="{ '-ar-active': index === i }"
          >
            <div class="ma-auto">
              <v-icon color="#fff" class="mb-1">view_in_ar</v-icon>
              <div>3D / AR</div>
            </div>
          </div>
        </div>
      </div>
    </s-fade-scroll>


    <!--  ▃▃▃▃▃▃▃▃▃▃ Gallery > Main Swiper ▃▃▃▃▃▃▃▃▃▃ -->

    <v-carousel
      :key="product.id + '-' + currentVariant?.id"
      v-model="index"
      class="gallery-top"
      :class="{
        '-bg-white': isStyleContain,
        '-vertical': vertical,
      }"
      :show-arrows="true"
      hide-delimiter-background
      height="100%"
      show-arrows-on-hover
      hide-delimiters
      :style="{
        '--circle-left': `${circleX}px`,
        '--circle-top': `${circleY}px`,
      }"
    >
      <v-carousel-item
        v-for="item in images_list_embedded"
        :key="item.key"
        :eager="
          !!item.image /*Only for images! Prevent load YouTube and ar by default!*/
        "
      >
        <!--  ━━━━━━━━━━━━ Main > Image ━━━━━━━━━━━━ -->

        <template v-if="item.image">
          <!-- Caution: Only show current variant images or general product images! -->
          <variant-item-view-micro
            v-if="item.image.variant_id && currentVariant"
            :product-variant="currentVariant"
            style="
              position: absolute;
              bottom: 0;
              z-index: 1;
              left: 50%;
              transform: translate(-50%, 0);
            "
          />

          <v-img
            class="swiper-slide-image pointer-zoom-in ma-auto pointer-zoom-in"
            width="calc(100% - 8px)"
            height="auto"
            aspect-ratio="1"
            :src="getShopImagePath(item.image.path)"
            :alt="item.image.alt"
            @click="showFullscreen"
            :contain="!!isStyleContain"

            eager
            @mousemove.native="updateCirclePosition"
            @mouseleave.native="show_circle = false"
          >
            <div v-if="show_circle" class="circle-zoom ripple-focus"></div>
          </v-img>
        </template>

        <!--  ━━━━━━━━━━━━ Main > Video ━━━━━━━━━━━━ -->
        <template v-else-if="item.video">
          <v-responsive class="position-relative" aspect-ratio="1">
            <youtube
              style="border-radius: 8px"
              :player-vars="{
                color: 'white',
                controls: 1,
                modestbranding: 1,
                rel: 0,
              }"
              :video-id="item.video"
              width="100%"
              height="100%"
            ></youtube>
          </v-responsive>
        </template>

        <!--  ━━━━━━━━━━━━ AR / 3D ━━━━━━━━━━━━ -->

        <template v-else-if="item.ar">
          <v-responsive class="position-relative" aspect-ratio="1">
            <iframe
              allowfullscreen="1"
              title="3D View"
              :src="item.ar"
              width="100%"
              frameborder="0"
              scrolling="no"
              style="
                display: block;
                min-height: 320px;
                z-index: 1;
                background-color: #fff;
              "
              class="w-100 h-100 position-absolute"
            ></iframe>
          </v-responsive>
        </template>
      </v-carousel-item>

      <template v-slot:prev="{ on }">
        <v-avatar
          v-if="prev_item"
          size="84"
          v-on="on"
          class="pp hover-scale-small"
        >
          <img
            v-if="prev_item.image"
            :src="getShopImagePath(prev_item.image.path, IMAGE_SIZE_SMALL)"
            class="pa-2"
          />
          <v-icon v-else-if="prev_item.video">smart_display</v-icon>
          <v-icon v-else-if="prev_item.ar">view_in_ar</v-icon>
        </v-avatar>
      </template>
      <template v-slot:next="{ on }">
        <v-avatar
          v-if="next_item"
          size="84"
          v-on="on"
          class="pp hover-scale-small"
        >
          <img
            v-if="next_item.image"
            :src="getShopImagePath(next_item.image.path, IMAGE_SIZE_SMALL)"
            class="pa-2"
          />
          <v-icon v-else-if="next_item.video">smart_display</v-icon>
          <v-icon v-else-if="next_item.ar">view_in_ar</v-icon>
        </v-avatar>
      </template>
    </v-carousel>
  </div>
</template>

<script>
import VariantItemViewMicro from "@components/product/variant/VariantItemViewMicro.vue";
import SFadeScroll from "@components/ui/fade-scroll/SFadeScroll.vue";

export default {
  name: "SShopProductSlideShow",
  components: { SFadeScroll, VariantItemViewMicro },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
    currentVariant: {},

    vertical: {
      // Determine thumbnails are vertical or not!
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    offset_images: 1, // Number of images forces to show at first to prevent loading video or ar as default!
    index: 0,

    //-----------------------------

    // Video:
    show_video: false,

    // AR & 3D Model:
    show_ar: false,

    //-----------------------------
    show_circle: false,

    circleX: 0,
    circleY: 0,
  }),

  computed: {
    isStyleContain() {
      return this.product?.style?.contain;
    },

    images_list() {
      let out = [];
      let has_variant_image = false;

      if (this.product.images && this.product.images.length) {
        if (this.currentVariant) {
          let for_this_variant = this.product.images.filter((item) => {
            return item.variant_id === this.currentVariant.id;
          });
          has_variant_image = for_this_variant.length > 0;

          let for_other = this.product.images.filter((item) => {
            return item.variant_id === null;
          });
          out = for_this_variant.concat(for_other);
        } else {
          out = this.product.images;
        }
      }

      if (
        this.product.icon &&
        !out.some(
          (i) => i.path === this.product.icon
        ) /*Prevent duplicate images - Specially external images in connect*/
      ) {
        if (has_variant_image) out.push({ path: this.product.icon });
        else out.unshift({ path: this.product.icon });
      }

      return out;
    },
    images_list_embedded() {
      const out = [];

      this.images_list.forEach((image) => {
        out.push({ image: image, key: image.path,alt:image.alt });
      });

      if (this.ar_url) {
        out.splice(this.offset_images, 0, {
          ar: this.ar_url,
          key: this.ar_url,
        });
      }

      if (this.current_youtube) {
        out.splice(this.offset_images, 0, {
          video: this.current_youtube,
          key: this.current_youtube,
        });
      }

      return out;
    },

    current_ar() {
      if (this.currentVariant && this.currentVariant.ar)
        return this.currentVariant.ar;
      return this.product.ar;
    },

    ar_url() {
      if (this.currentVariant && this.currentVariant.ar)
        return this.window.URLS.ARViewURL(
          this.shop_name,
          this.product.id,
          this.currentVariant.id,
          this.currentVariant.ar.src
        );
      else if (this.product.ar)
        return this.window.URLS.ARViewURL(
          this.shop_name,
          this.product.id,
          "default",
          this.product.ar.src
        );

      return null;
    },
    current_youtube() {
      //ZGbxEgSIyWE
      return this.product.video;
    },

    prev_item() {
      if (this.index === 0)
        return this.images_list_embedded[this.images_list_embedded.length - 1];
      return this.images_list_embedded[this.index - 1];
    },
    next_item() {
      if (this.index >= this.images_list_embedded.length)
        return this.images_list_embedded[0];
      return this.images_list_embedded[this.index + 1];
    },
  },

  watch: {
    currentVariant() {
      this.goToSlide(0); // Go to variant image (if exist)
    },
  },

  methods: {
    goToSlide(index) {
      if (index > this.images_list_embedded.length) index = 0;
      if (index < 0) index = Math.max(0, this.images_list_embedded.length - 1);
      this.index = index;
    },

    updateCirclePosition(event) {
      const containerBounds = event.target.getBoundingClientRect();
      this.circleX = event.clientX - containerBounds.left - 25; // Subtract container left position
      this.circleY = event.clientY - containerBounds.top - 25; // Subtract container top position
      this.show_circle = true;
    },

    handleKeyPress(event) {
      if (event.code === "ArrowLeft") {
        // Do something when left arrow key is pressed
        this.goToSlide(this.index - 1);
      } else if (event.code === "ArrowRight") {
        // Do something when right arrow key is pressed
        this.goToSlide(this.index + 1);
      }
    },
  },

  mounted() {
    // Add the keydown event listener when the component is mounted
    window.addEventListener("keydown", this.handleKeyPress);
  },
  beforeDestroy() {
    // Remove the keydown event listener when the component is destroyed
    window.removeEventListener("keydown", this.handleKeyPress);
  },
};
</script>

<style scoped lang="scss">
.s--product-images {
  --size-thumbnail: 64px;
  --gap-vertical-thumbnail: 10px;
  --gap-horizontal-thumbnail: 10px;
  --thumbnail-top-margin: 32px;

  --width-carosel-thumbnails: calc(
    var(--size-thumbnail) + 2 * var(--gap-horizontal-thumbnail)
  );
  --left-carosel-main: var(--width-carosel-thumbnails);

  --thumbnails-flex-direction: column-reverse;

  --main-gallery-heigh: calc(100% - var(--left-carosel-main));
  --main-gallery-width: 100%;

  &.-vertical {
    --thumbnail-top-margin: 0;

    --gap-vertical-thumbnail: 10px;
    --gap-horizontal-thumbnail: 32px;

    --thumbnails-flex-direction: row;

    --main-gallery-heigh: 100%;
    --main-gallery-width: calc(100% - var(--left-carosel-main));
  }
}

.swiper-slide-image {
  position: relative;
  border-radius: 8px;
  margin: 0 0.25rem;
  @media only screen and (max-width: 1750px) {
    margin: 0 0.5rem;
  }
}

.s--product-images {
  display: flex;
  flex-direction: var(--thumbnails-flex-direction);
}

.gallery-top {
  flex-grow: 1;

  moz-transition: all 0.4s ease-in-out;
  -o-transition: all 0.4s ease-in-out;
  -webkit-transition: all 0.4s ease-in-out;
  transition: all 0.4s ease-in-out;

  background-color: #fff;

  height: var(--main-gallery-heigh);
  width: var(--main-gallery-width);
}

.gallery-thumbs {
  margin-top: var(--thumbnail-top-margin);

  .gallery-thumbs-wrap {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
  }

  &.-vertical {
    .gallery-thumbs-wrap {
      flex-direction: column;
      width: var(--width-carosel-thumbnails);
      height: 100%;
    }

    .-slide {
      // Only in vertical mode!
      &:hover {
        z-index: 1;
        margin-top: 16px;
        margin-bottom: 16px;
        transform: scale(1.2, 1.2);
        transition-duration: 250ms;
      }
    }
  }

  .-slide {
    width: var(--size-thumbnail);
    height: var(--size-thumbnail);
    margin: 0 var(--gap-horizontal-thumbnail) var(--gap-vertical-thumbnail)
      var(--gap-horizontal-thumbnail);
    border-radius: 8px;
    flex-grow: 0;
    cursor: pointer;
    border: 1px solid #dee2e6;

    position: relative;
    transition-duration: 450ms;

    &.-video,
    &.-ar {
      color: #fff;
      display: flex;
      text-align: center;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      background-color: #333;
    }
    &.-video-active {
      background: #d93f21;
      border-color: #b4351c;
    }
    &.-ar-active {
      background: #4895ff;
      border-color: #3069b7;
    }
  }
}

.circle-zoom {
  position: absolute;
  left: var(--circle-left);
  top: var(--circle-top);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
  pointer-events: none; // Prevents the circle from interfering with other mouse events
  transition: none; // Optional: Adds smooth transition effect
}
</style>
