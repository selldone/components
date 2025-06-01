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
  <v-toolbar
    :border="outlined"
    :color="
      color
        ? color
        : transparent
          ? 'transparent'
          : dark
            ? 'var(--theme-dark)'
            : '#fff'
    "
    :flat="flat"
    :rounded="rounded"
    :style="{
      '--justify': center ? 'center' : 'start',
      backdropFilter: backdrop_filter,
      '-dark': dark,
    }"
    :theme="dark ? 'dark' : 'light'"
    class="s--storefront-top-menu"
    :class="{ '-border': border }"
  >
    <template v-for="(tab, index) in tabs">
      <span v-if="tab.type === 'link'" :key="'l' + index">
        <v-btn
          :color="dark ? '#fff' : '#000'"
          :href="preview ? undefined : tab.link"
          :target="tab.link?.startsWith('http') ? '_blank' : undefined"
          class="me-2"
          variant="text"
          :aria-label="`${tab.title} Link`"
          role="link"
        >
          <span class="--caption">
            <v-icon
              v-if="tab.icon"
              :size="
                tab.icon_size === 'large'
                  ? 'large'
                  : tab.icon_size === 'small'
                    ? 'small'
                    : undefined
              "
              start
              >{{ tab.icon }}</v-icon
            >

            {{ tab.title }}
          </span>
        </v-btn>
      </span>

      <v-btn
        v-else
        :key="'m' + index"
        :ref="`tab_${index}`"
        :color="dark ? '#fff' : '#000'"
        class="me-2"
        variant="text"
        :aria-label="`${tab.title} Menu`"
        role="button"
      >
        <span class="--caption">
          <v-icon
            v-if="tab.icon"
            :size="
              tab.icon_size === 'large'
                ? 'large'
                : tab.icon_size === 'small'
                  ? 'small'
                  : undefined
            "
            start
            >{{ tab.icon }}
          </v-icon>

          {{ tab.title }}
        </span>
        <v-icon>expand_more</v-icon>

        <v-menu
          v-model="visibles[index]"
          :open-on-hover="tab.hover"
          :transition="tab.transition"
          :z-index="100"
          activator="parent"
          location="bottom center"
          origin="top center"
          :open-delay="0"
          theme="light"
          :offset="[10, 0]"
          :max-height="window.innerHeight * 0.8"
          eager
          :width="tab.cols?.length <=3?undefined:'100%'"

        >
          <!-- Menu > default -->
          <v-sheet
            :rounded="tab.rounded"
            class="s--storefront-top-menu-submenu"
            elevation="0"
            border
          >
            <v-container
              v-if="tab.type === 'default'"
              class="py-8 text-start"
              max-width="1720"
            >
              <v-row dense align="start" justify="start">
                <v-col
                  v-for="(col, i) in tab.cols"
                  :key="i"
                  class="flex-grow-0"
                >
                  <v-list-item
                    v-for="(item, index) in col"
                    :key="index"
                    :href="preview ? undefined : item.href"
                    :target="item.target"
                    :to="preview ? undefined : item.to"
                    exact
                    min-width="200"
                    slim
                    density="compact"
                  >
                    <v-list-item-title
                      class="text-wrap "
                      >
                      <span class="--caption">
                            {{ item.name }}
                      </span>

                    </v-list-item-title>
                    <template v-slot:append>
                      <v-avatar
                        v-if="item.image"
                        :image="getShopImagePath(item.image, 128)"
                        :size="24"
                      >
                      </v-avatar>
                      <v-icon v-if="item.target === '_blank'" size="x-small"
                        >launch
                      </v-icon>
                    </template>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-container>

            <!-- Menu > category -->
            <menu-categories
              v-if="tab.type === 'category' && tab.categories"
              :categories="tab.categories"
              :preview="preview"
              class="my-2 ms-2"
              style="width: 98vw; max-height: 90vh"
              :rounded-preview="tab.rounded"
              :dark="dark"
            ></menu-categories>

            <!-- Menu > Custom -->

            <LPageViewer
              v-if="
                tab.type === 'custom' &&
                tab.page &&
                tab.page.content &&
                visibles[index]
              "
              :initialPageData="tab.page.content"
              :initialPageCss="tab.page.css"
            />
          </v-sheet>
        </v-menu>
      </v-btn>
    </template>
    <!--
    <u-fade-scroll class="overflow-auto">
      <div class="text-no-wrap">

      </div>
    </u-fade-scroll>-->
  </v-toolbar>
</template>

<script lang="ts">
import MenuCategories from "./MenuCategories.vue";
import { defineAsyncComponent } from "vue";
import { LUtilsFilter } from "@selldone/page-builder/utils/filter/LUtilsFilter.ts";

export default {
  name: "SStorefrontTopMenu",
  components: {
    MenuCategories,

    LPageViewer: defineAsyncComponent(
      () => import("@selldone/page-builder/page/viewer/LPageViewer.vue"),
    ),
  },
  inject: ["$shop"],
  props: {
    rounded: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    border: Boolean,
    outlined: {
      type: Boolean,
      default: false,
    },
    tabs: {},
    preview: {
      default: false,
      type: Boolean,
    },
    transparent: {
      default: null,
    },
    forceDark: {
      default: null,
    },
    color: {},
    center: {
      type: Boolean,
    },
  },
  data: () => ({
    visibles: [],
  }),

  computed: {
    some_menu_opened() {
      return this.visibles.some((v) => v);
    },
    columns_count() {
      let width = this.preview
        ? 1040 /*In shop dashboard editor!*/
        : window.innerWidth;
      width = 0.9 /*90vw max width of container!*/ * width; //Right column!

      return Math.floor(width / 250);
    },

    full_width() {
      return (
        this.$route.name === window.$storefront.routes.PAGE_RENDER ||
        this.$route.name === "CustomHomePage"
      );
    },
    is_light_header() {
      return (
        this.$route.matched.some((record) => record.meta.light_header) ||
        this.$shop?.theme?.light_header
      );
    },
    dark() {
      if (this.forceDark !== null || this.forceDark !== undefined) {
        // Override by forceDark prop:
        return this.forceDark;
      }
      // Default behavior:
      return (
        this.full_width && // Be in full screen mode like landing pages!
        !this.is_light_header // Set light in the route or shop custom template.
      );
    },

    show_filter_menu() {
      return this.$store.getters.getShowFilterMenu;
    },
    globalStyle() {
      return this.$store.getters.getGlobalStyle;
    },
    backdrop_filter() {
      return this.globalStyle?.header_filter
        ? LUtilsFilter.CalcFilter(this.globalStyle.header_filter)
        : undefined;
    },
  },

  watch: {
    $route(val) {
      this.visibles = new Array(this.visibles.length).fill(false);
    },
  },

  created() {
    this.visibles = Array(this.tabs.length).fill(false);
  },

  methods: {
    calcMenuWidth(tab) {
      const filter_w = 260;
      const padding_l =
        window.innerWidth > 1720 ? (window.innerWidth - 1700) / 2 : 0;

      const max_w =
        window.innerWidth -
        //  - (this.show_filter_menu ? filter_w : 0)
        padding_l -
        40; /*Extra spaces*/

      let size = 1700;

      if (tab.type === "default") {
        const count = tab.cols.length;
        size = count * 230;
      } else if (tab.type === "category") {
        size = 1700;
      }
      if (tab.type === "link") {
        return 0;
      }
      if (tab.type === "custom") {
        return 420;
      }

      if (size > max_w) size = max_w;
      return size;
    },
    calcPositionX(tab, ref_key) {
      if (this.fullscreen) return null;
      const w_container = this.calcMenuWidth(tab);
      if (w_container < 1500) return null;

      const ref = this.$refs[ref_key] ? this.$refs[ref_key][0] : null;
      const element = ref?.$el;
      if (!element) return null;

      const x = element.getBoundingClientRect().left + window.pageXOffset;
      // const w = element.getBoundingClientRect().width;

      const out = w_container / 2 - (window.innerWidth / 2 - x);
      //console.log('w',w_container,'out',out,'element',element.getBoundingClientRect(),x)
      return out;
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-top-menu {
  --justify: start;
  --font-size: 1.1rem;
  --text-transform: none;
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-top-menu {
  &.-border {
    border-bottom: 1px solid rgba(10, 10, 10, 0.3) !important;

    &.-dark {
      border-bottom: 1px solid rgba(222, 226, 230, 0.3) !important;
    }
  }


  .v-toolbar__content {
    justify-content: var(--justify);
  }

  .v-btn {
    .v-btn__overlay {
      display: none;
    }
  }
}

.s--storefront-top-menu-submenu {
  .v-list-item {
    .v-list-item__overlay {
      display: none;
    }
  }
}

.s--storefront-top-menu,
.s--storefront-top-menu-submenu {

  .v-list-item {
    --caption-underline-bottom:0;
    --caption-underline-height:1px;
  }
  .v-btn{
    --caption-underline-bottom:-4px;
    --caption-underline-height:2px;
  }



  .v-btn,
  .v-list-item {
    font-size: var(--font-size);
    text-transform: var(--text-transform);
    background-color: transparent !important;

    .--caption {
      font-weight: 600;
      position: relative;
      font-size: 0.9rem;

      &::after {
        content: "";
        position: absolute;
        bottom: var(--caption-underline-bottom);
        left: 0;
        width: 0%;
        height: var(--caption-underline-height);
        background-color: currentColor;
        transition: width 0.3s ease-in-out;
      }
    }




    &:hover {
      .--caption {
        &::after {
          width: 100%;
        }
      }
    }
  }
}
</style>
