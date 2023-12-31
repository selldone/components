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
    :rounded="rounded"
    :flat="flat"
    :light="!dark"
    :dark="dark"
    :color="transparent ? 'transparent' : dark ? 'var(--theme-dark)' : null"
    :outlined="outlined"
    class="s--storefront-top-menu"
    :style="{ '--justify': center ? 'center' : 'start' }"
  >
    <s-fade-scroll class="overflow-auto">
      <div class="text-no-wrap">
        <template v-for="(tab, index) in tabs">
          <span v-if="tab.type === 'link'" :key="'l' + index">
            <v-btn
              :href="preview ? undefined : tab.link"
              text
              class="me-2"
              :target="tab.link?.startsWith('http') ? '_blank' : undefined"
            >
              <v-icon
                v-if="tab.icon"
                left
                :small="tab.icon_size === 'small'"
                :large="tab.icon_size === 'large'"
                >{{ tab.icon }}</v-icon
              >

              {{ tab.title }}
            </v-btn>
          </span>

          <v-menu
            v-else
            offset-y
            :key="'m' + index"
            :min-width="window.innerWidth - 24"
            :max-width="window.innerWidth - 24"
            close-delay="0"
            :open-on-hover="tab.hover"
            open-delay="0"
            :rounded="tab.rounded"
            :transition="tab.transition"
            content-class="bg-white shadow-box"
            :left="$vuetify.rtl"
            max-height="90vh"
            v-model="visibles[index]"
            :z-index="100"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                text
                class="me-2"
                :ref="`tab_${index}`"
              >
                <v-icon
                  v-if="tab.icon"
                  left
                  :small="tab.icon_size === 'small'"
                  :large="tab.icon_size === 'large'"
                >{{tab.icon}}</v-icon>

                {{ tab.title }}
              </v-btn>
            </template>

            <!-- Menu > default -->

            <v-container
              v-if="tab.type === 'default'"
              class="py-12 text-start"
              fluid
            >
              <v-row>
                <v-col
                  v-for="(col, i) in tab.cols"
                  :key="i"
                  :style="{
                    width: 100 / columns_count + '%',
                    flex: 100 / columns_count + '%',
                    'max-width': 100 / columns_count + '%',
                  }"
                >
                  <v-list-item
                    v-for="(item, index) in col"
                    :key="index"
                    :to="preview ? undefined : item.to"
                    :href="preview ? undefined : item.href"
                    :target="item.target"
                    exact
                  >
                    <v-list-item-title class="list-menu-item">{{
                      item.name
                    }}</v-list-item-title>
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
            ></menu-categories>

            <!-- Menu > Custom -->

            <SPageRenderMenu
              v-if="
                tab.type === 'custom' &&
                tab.page &&
                tab.page.content &&
                visibles[index]
              "
              :data="tab.page.content"
            />
          </v-menu>
        </template>
      </div>
    </s-fade-scroll>
  </v-toolbar>
</template>

<script>
import MenuCategories from "./MenuCategories.vue";
import SFadeScroll from "@components/ui/fade-scroll/SFadeScroll.vue";
export default {
  name: "SStorefrontTopMenu",
  components: { SFadeScroll, MenuCategories },
  props: {
    shop: {
      required: true,
    },
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
    center: {
      type: Boolean,
    },
  },
  data: () => ({
    visibles: [],
  }),

  computed: {
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
        (this.shop.theme && this.shop.theme.light_header)
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
  },

  watch: {
    $route(val) {
      this.visibles = new Array(this.visibles.length).fill(false);
    },
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
  .list-menu-item {
    font-weight: 500;
    font-size: 1rem;
  }

  .v-toolbar__content {
    justify-content: var(--justify);

    button,
    .v-btn {
      font-size: var(--font-size);
      text-transform: var(--text-transform);
    }
  }
}
</style>
