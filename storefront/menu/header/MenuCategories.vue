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
  <div class="s--top-menu-categories">
    <v-container class="-container" @click.stop>
      <v-row>
        <v-col class="-categories-wrap" cols="12" lg="10">
          <v-row>
            <v-col
              v-for="(group, k) in categories_balanced.filter(
                (g) => !!g?.length,
              )"
              :key="k"
              :style="{
                width: 100 / columns_count + '%',
                flex: 100 / columns_count + '%',
                'max-width': 100 / columns_count + '%',
              }"
            >
              <div v-for="(cat, j) in group" :key="j" class="mb-5">
                <router-link
                  :class="{ pen: preview }"
                  :to="{
                    name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                    params: { category_name: cat.name },
                  }"
                  class="-category-header -route"
                  @mouseenter="selected_category = cat"
                >
                  <v-avatar
                    v-if="cat.icon"
                    class="hover-scale force-top me-2"
                    size="24"
                  >
                    <img :src="getShopImagePath(cat.icon, 64)" />
                  </v-avatar>
                  <span>{{ cat.title }}</span>
                </router-link>
                <v-expansion-panels flat>
                  <v-expansion-panel
                    v-for="child in cat.children
                      ?.filter((c) => c.children?.length)
                      .limit(6) /*Only has children*/"
                    :key="child.id"
                  >
                    <v-expansion-panel-title
                      class="parent-cat"
                      @mouseenter="selected_category = child"
                    >
                      {{ child.title }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-list-item
                        v-for="_child in child.children"
                        :key="'_' + _child.id"
                        class="-route"
                        v-bind="
                          preview
                            ? {}
                            : {
                                to: {
                                  name: window.$storefront.routes
                                    .SHOP_CATEGORY_PAGE,
                                  params: { category_name: _child.name },
                                },
                              }
                        "
                      >
                        <v-list-item-title>
                          {{ _child.title }}
                        </v-list-item-title>
                      </v-list-item>

                      <!-- View all categories in a this category -->
                      <v-list-item
                        class="-route"
                        v-bind="
                          preview
                            ? {}
                            : {
                                to: {
                                  name: window.$storefront.routes
                                    .SHOP_CATEGORY_PAGE,
                                  params: { category_name: child.name },
                                },
                              }
                        "
                        @mouseenter="selected_category = cat"
                        append-icon="more_horiz"
                      >
                        <v-list-item-title>
                          {{ $t("global.actions.view_all") }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <div
                  v-for="child in cat.children
                    ?.filter((c) => !c.children?.length)
                    .limit(6) /*Only has no child*/"
                  :key="child.id"
                >
                  <v-list-item
                    class="-route"
                    v-bind="
                      preview
                        ? {}
                        : {
                            to: {
                              name: window.$storefront.routes
                                .SHOP_CATEGORY_PAGE,
                              params: { category_name: child.name },
                            },
                          }
                    "
                    @mouseenter="selected_category = child"
                  >
                    <v-list-item-title class="parent-cat">
                      {{ child.title }}
                    </v-list-item-title>
                  </v-list-item>
                </div>

                <!-- View all categories in a main category -->
                <v-list-item
                  v-if="cat.children?.length > 6"
                  class="-route"
                  v-bind="
                    preview
                      ? {}
                      : {
                          to: {
                            name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                            params: { category_name: cat.name },
                          },
                        }
                  "
                  @mouseenter="selected_category = cat"
                  append-icon="more_horiz"
                >
                  <v-list-item-title class="parent-cat text-capitalize">
                    {{ $t("global.actions.view_all") }}
                  </v-list-item-title>
                </v-list-item>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col v-if="selected_category && $vuetify.display.lgAndUp" cols="2">
          <div class="pa-2">
            <v-img
              v-if="selected_category.icon"
              :lazy-src="getShopImagePath(selected_category.icon, 64)"
              :src="getShopImagePath(selected_category.icon)"
              aspect-ratio="1"
              rounded="xl"
              cover
            ></v-img>
            <h3 class="mt-2 mb-1">{{ selected_category.title }}</h3>
            <p class="typo-body">
              {{ selected_category.description }}
            </p>
          </div>
        </v-col>
      </v-row>
      <v-spacer></v-spacer>
      <u-fade-scroll>
        <div class="d-flex flex-grow-0 mt-12 text-center">
          <v-col
            v-for="cat in selected_categories"
            :key="cat.id"
            :style="{
              width: 100 / columns_count + '%',
              flex: 100 / columns_count + '%',
              'max-width': 100 / columns_count + '%',
              'min-width': '200px',
            }"
          >
            <router-link
              :class="{ pen: preview }"
              :to="{
                name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                params: { category_name: cat.name },
              }"
            >
              <v-img
                :alt="cat.description"
                :aspect-ratio="small_mode ? 1 : 3 / 2"
                :class="{ 'rounded-circle': small_mode, rounded: !small_mode }"
                :gradient="'to top, rgba(0,0,0,0.4), rgba(0,0,0,0)'"
                :src="getShopImagePath(cat.icon)"
                class="cat-hover"
                content-class="d-flex flex-column"
                cover
              >
                <v-spacer></v-spacer>
                <div
                  v-if="!small_mode"
                  class="pa-2 text-center text-capitalize"
                  style="color: #fff; font-size: 1.2rem"
                >
                  {{ cat.title }}
                </div>
              </v-img>
            </router-link>
            <div v-if="small_mode" class="my-3 text-muted text-capitalize">
              {{ cat.title }}
            </div>
          </v-col>
        </div>
      </u-fade-scroll>
    </v-container>
  </div>
</template>

<script>
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";

export default {
  name: "MenuCategories",
  components: { UFadeScroll },
  props: {
    categories: {
      require: true,
      type: Array,
    },
    preview: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    selected_category: null,
  }),

  computed: {
    small_mode() {
      return this.$vuetify.display.smAndDown;
    },
    selected_categories() {
      return this.flattenCategories(this.categories)
        .filter((c) => c.icon)
        .random()
        .limit(Math.max(this.columns_count, 4));
    },

    columns_count() {
      let width = this.preview
        ? 1040 /*In shop dashboard editor!*/
        : window.innerWidth;
      if (width > 992)
        width = (0.9 /*90vw max width of container!*/ * width * 10) / 12; //Right column!

      return Math.floor(width / 250);
    },
    categories_balanced() {
      // Define the number of columns based on the window size
      function getNumberOfColumns() {
        const width = window.innerWidth;
        return Math.floor(width / 250);
      }

      const columns_count = getNumberOfColumns();

      function groupCategories(categories, n) {
        // Sort categories in descending order of their number of children
        categories.sort((a, b) => b.children?.length - a.children?.length);

        // Initialize n groups with empty arrays
        const groups = Array.from({ length: n }, () => []);

        // Add each category to the group with the smallest total number of children
        categories.forEach((category) => {
          let minIndex = 0;
          let minTotal = Infinity;
          for (let i = 0; i < n; i++) {
            const total = groups[i].reduce(
              (sum, c) =>
                sum + (c.children?.length ? c.children.length : 0) + 1,
              0,
            );
            if (total <= minTotal) {
              minIndex = i;
              minTotal = total;
            }
          }
          groups[minIndex].push(category);
        });

        return groups;
      }

      return groupCategories(this.categories, columns_count);
    },
  },
  methods: {
    flattenCategories(categories) {
      return categories.reduce((acc, category) => {
        acc.push(category);
        if (category.children?.length > 0) {
          acc = acc.concat(this.flattenCategories(category.children));
        }
        return acc;
      }, []);
    },

    totalItems(categories) {
      let count = 0;
      categories.forEach((category) => {
        count++;
        if (category.children) {
          count += this.totalItems(category.children);
        }
      });
      return count;
    },
    calcColSpan(cat) {
      let expandable_children = cat.children
        ? cat.children.filter((c) => c.children.length).limit(6).length
        : 0;

      let normal_children = cat.children
        ? cat.children.filter((c) => !c.children.length).limit(6).length
        : 0;

      return expandable_children + normal_children + 2;
    },
    calcRowStart(j) {
      const indexes_before = [];
      let pointer = j % this.columns_count;

      let out = 0;

      while (pointer < j) {
        indexes_before.push(pointer);
        out += this.calcColSpan(this.categories[pointer]);
        pointer += this.columns_count;
      }

      console.log("calcRowStart", j, out);
      return out;
    },
  },
};
</script>

<style lang="scss">
.s--top-menu-categories {
  --item-heigh: 28px;
  --font-size: 14px;
  --background: #fff;

  text-align: start;
  min-height: calc(100vh - 200px);
  font-size: var(--font-size);
  display: flex;
  flex-direction: column;

  .-container {
    flex-grow: 1;
    max-width: 90vw !important;
    margin: auto;
    min-height: 100%;
    padding-bottom: 10vh;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .parent-cat {
    font-weight: 500;
  }

  .-categories-wrap {
    .-category-header {
      font-size: var(--font-size);
      text-align: start;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      text-transform: uppercase;
      color: #000 !important;
      height: var(--item-heigh);
      max-height: var(--item-heigh);
      margin-bottom: 4px;
      overflow: visible;

      span {
        flex-grow: 1;
        max-width: calc(100% - 42px);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    .v-expansion-panel {
      padding: 0 !important;

      .v-expansion-panel-header {
        padding: 2px 8px !important;
        font-size: var(--font-size);
        height: var(--item-heigh);
        max-height: var(--item-heigh);
        min-height: var(--item-heigh);
      }
    }
  }

  .-route {
    border-radius: 8px;
    overflow: hidden;
    padding: 2px 8px !important;
    font-size: var(--font-size);
    min-height: var(--item-heigh);
    height: var(--item-heigh);
  }

  .cat-hover {
    .v-img__image {
      transition: all 0.3s ease-in-out;
    }

    &:hover {
      .v-img__image {
        transform: scale(1.2);
      }
    }
  }

  .v-expansion-panels {
    .v-expansion-panel {
      background: transparent; // Override default expansion headers
    }
  }
}
</style>
