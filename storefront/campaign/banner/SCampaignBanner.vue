<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-expand-transition>
    <div v-if="show">
      <v-banner
        :class="{ '-bg-repeat': banner.repeat }"
        :style="{
          'background-color': banner.bg,
          'background-image': banner.bg_image
            ? `url(${banner.bg_image})`
            : undefined,
        }"
        :theme="banner.dark ? 'dark' : 'light'"
        class="s--storefront-top-banner"
      >
        <template v-slot:prepend>
          <v-avatar v-if="banner.icon" :color="banner.icon_bg" size="40">
            <v-icon>
              {{ banner.icon }}
            </v-icon>
          </v-avatar>
        </template>

        <router-link
          :class="{ pen: developerMode }"
          :to="
            banner.page_name
              ? {
                  name: window.$storefront.routes.PAGE_RENDER,
                  params: { page_name: banner.page_name },
                }
              : {}
          "
          class="flex-grow-1"
        >
          <div v-html="banner.message"></div>
        </router-link>

        <template v-slot:actions>
          <v-list-item-action end>
            <u-lottie
              :height="banner.anim_height"
              :options="{ path: banner.anim, loop: true }"
              :speed="1"
              :width="banner.anim_width"
              class="mx-1 flex-grow-0"
            />
            <v-btn
              class="mx-2 flex-grow-0"
              icon
              size="42"
              variant="text"
              @click.stop="dismiss"
              aria-label="Close Banner"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-banner>
    </div>
  </v-expand-transition>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";

export default {
  name: "SCampaignBanner",

  inject: ["$shop"],
  props: {
    bannerPreview: {
      type: Object,
    },

    developerMode: {
      type: Boolean,
      require: false,
      default: false,
    },
  },

  data() {
    return {
      close: false,
    };
  },

  computed: {
    campaign() {
      return this.$shop?.campaign;
    },
    banner() {
      if (this.developerMode) return this.bannerPreview;
      return this.campaign ? this.campaign.banner : null;
    },

    show() {
      return (
        !this.close &&
        this.banner?.message &&
        !(
          this.$route.name === window.$storefront.routes.PAGE_RENDER &&
          this.$route.params.page_name === this.banner.page_name
        )
      );
    },
  },

  components: {
    // Asynchronously load the u-lottie component
    ULottie: defineAsyncComponent(
      () =>
        import(
          /* webpackChunkName: "plug-lottie" */ "@selldone/components-vue/ui/lottie/ULottie.vue"
        ),
    ),
  },

  created() {
    /**
     * We set the banner status in the store state, to inform other components (like layout)
     */
    if (!this.developerMode)
      this.$store.commit("setShopMainBanner", this.banner);
  },

  watch: {
    banner() {
      if (!this.developerMode)
        this.$store.commit("setShopMainBanner", this.banner);
    },
  },

  methods: {
    dismiss() {
      this.close = true;
      if (!this.developerMode) this.$store.commit("setShopMainBanner", null);
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-top-banner {
  z-index: 100;
  min-height: 64px;
  text-align: start;

  a {
    color: currentColor !important;
  }

  &.-bg-repeat {
    background-repeat: repeat;
  }

  .v-banner-actions {
    margin-top: 0 !important;
  }
}
</style>
