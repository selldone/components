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
  <div class="s--sort-view" :class="{ 's-products-sort-view--modern': modern }">
    <!-- ███████████████████ Only available ███████████████████ -->

    <v-btn-toggle
      v-if="modern"
      :model-value="onlyAvailable"
      class="s-products-sort-view__availability-group"
      selected-class="s-products-sort-view__availability--selected"
      :aria-label="`${$t('global.commons.all')} / ${$t('sort.only_available')}`"
      mandatory
      border="0"
      @update:model-value="(value) => $emit('update:only-available', value)"
    >
      <v-btn
        v-for="available in [false, true]"
        :key="String(available)"
        :value="available"
        :aria-label="$t(available ? 'sort.only_available' : 'global.commons.all')"
        :aria-pressed="onlyAvailable === available"
        class="s-products-sort-view__availability"
        icon
        variant="text"
      >
        <v-icon size="18" aria-hidden="true">{{ available ? "check_circle_outline" : "all_inclusive" }}</v-icon>
        <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">
          {{ $t(available ? "products_sort_view.modern.show_available" : "products_sort_view.modern.show_all") }}
        </v-tooltip>
      </v-btn>
    </v-btn-toggle>

    <v-btn
      v-else
      :size="smallSortButtons ? 'small' : undefined"
      class="tnt"
      height="46"
      stacked
      variant="text"
      @click="$emit('update:only-available', !onlyAvailable)"
    >
      <v-icon class="mb-1" size="24">{{ onlyAvailable ? "check_box" : "all_inclusive" }}</v-icon>
      <span class="small">{{ onlyAvailable ? $t("sort.only_available") : $t("global.commons.all") }}</span>
    </v-btn>

    <!-- ███████████████████ View mode ███████████████████ -->

    <v-btn
      v-if="hasViewMode"
      :size="smallSortButtons ? 'small' : undefined"
      :title="$t(viewMode.title)"
      class="tnt"
      height="46"
      stacked
      variant="text"
      @click="toggleModeView"
    >
      <v-icon class="mb-1" size="24">{{ viewMode.icon }}</v-icon>
      <span class="small">
        {{ $t(viewMode.title) }}
      </span>
    </v-btn>

    <!-- ███████████████████ Sort ███████████████████ -->

    <div v-if="!forceCollapse">
      <v-btn-toggle
        :mandatory="mandatory"
        :model-value="modelValue"
        :selected-class="activeClass"
        border="0"
        class="hide-on-small-900 mx-2"
        style="min-width: max-content"
        @update:model-value="(val) => $emit('update:modelValue', val)"
      >
        <v-btn
          v-for="item in items"
          :key="item.val"
          :loading="loading && modelValue === item.val && !search"
          :size="
            $vuetify.display.mdAndDown || smallSortButtons ? 'small' : undefined
          "
          :value="item.val"
          :aria-label="modern ? $t('products_sort_view.modern.sort_by', { sort: item.name }) : undefined"
          border="0"
          height="46"
          variant="text"
        >
          {{ item.name }}
          <v-tooltip
            v-if="modern"
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
          >{{ $t("products_sort_view.modern.sort_by", { sort: item.name }) }}</v-tooltip>
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Small screen -->
    <v-menu location="bottom" transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn
          :class="{ 'show-on-small-900': !forceCollapse }"
          height="46"
          v-bind="props"
          variant="text"
        >
          {{ sort_title }}
          <v-icon class="ms-1" size="x-small">expand_more</v-icon>
        </v-btn>
      </template>

      <v-list class="text-start text-uppercase">
        <v-list-item
          v-for="item in items"
          :key="item.val"
          :color="modelValue === item.val ? 'blue' : undefined"
          :aria-label="modern ? $t('products_sort_view.modern.sort_by', { sort: item.name }) : undefined"
          exact
          rounded="xl"
          @click="(val) => $emit('update:modelValue', item.val)"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-tooltip
            v-if="modern"
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
          >{{ $t("products_sort_view.modern.sort_by", { sort: item.name }) }}</v-tooltip>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- ███████████████████ Slot ███████████████████ -->

    <slot></slot>

    <!-- ███████████████████ Search ███████████████████ -->

    <template v-if="hasSearch">
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        :autofocus="
          $vuetify.display
            .lgAndUp /*Prevent opening keyboard on phone and tablets!*/
        "
        :class="{ 'my-2 my-md-0': !twoLine, 'my-2': twoLine }"
        :loading="loading && !!search"
        :placeholder="$t('global.commons.search')"
        class="search-box me-1 min-width-200"
        clearable
        density="compact"
        flat
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="solo"
      >
        <template v-if="!modern" v-slot:append-inner>
          <v-tooltip
            color="#000"
            content-class="bg-black rounded-xl"
            location="bottom"
          >
            <template v-slot:activator="{ props }">
              <v-btn icon size="24" v-bind="props" variant="plain">
                <v-icon size="20">info</v-icon>
              </v-btn>
            </template>
            <div class="text-start pa-3">
              <b>{{ $t("products_sort_view.search_tips.title") }}</b>
              <ul class="mt-3">
                <li v-html="$t('products_sort_view.search_tips.normal')"></li>
                <li v-html="$t('products_sort_view.search_tips.product')"></li>
                <li v-html="$t('products_sort_view.search_tips.quotes')"></li>
                <li v-html="$t('products_sort_view.search_tips.tax')"></li>
                <li
                  v-html="$t('products_sort_view.search_tips.new_products')"
                ></li>
              </ul>
            </div>
          </v-tooltip>
        </template>
      </v-text-field>
      <span v-if="modern" class="s-products-sort-view__search-help">
        <v-btn
          class="sd-modern-icon-button sd-modern-info-button"
          icon
          variant="text"
          :aria-label="$t('products_sort_view.search_tips.title')"
        >
          <v-icon icon="info_outline" size="16" aria-hidden="true" />
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-click="true"
            :open-on-focus="true"
            interactive
            content-class="sd-modern-tooltip text-start"
          >
            <div class="s-products-sort-view__search-tips">
              <strong>{{ $t("products_sort_view.search_tips.title") }}</strong>
              <ul>
                <li v-html="$t('products_sort_view.search_tips.normal')"></li>
                <li v-html="$t('products_sort_view.search_tips.product')"></li>
                <li v-html="$t('products_sort_view.search_tips.quotes')"></li>
                <li v-html="$t('products_sort_view.search_tips.tax')"></li>
                <li v-html="$t('products_sort_view.search_tips.new_products')"></li>
              </ul>
            </div>
          </v-tooltip>
        </v-btn>
      </span>
    </template>
  </div>
</template>

<script lang="ts">
import { ModeView } from "@selldone/core-js/enums/shop/ModeView";
import { throttle } from "lodash-es";

export default {
  name: "SProductsSortView",
  components: {},
  emits: ["update:modelValue", "update:search", "update:view-mode", "update:only-available"],

  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      required: false,
      type: String,
    },

    onlyAvailable: {
      required: false,
      type: Boolean,
    },
    hasViewMode: {
      required: false,
      type: Boolean,
      default: false,
    },

    viewMode: {
      required: false,
      default: function () {
        return ModeView.NORMAL;
      },
    },
    mandatory: {
      default: false,
      type: Boolean,
    },
    hasSearch: {
      default: false,
      type: Boolean,
    },
    twoLine: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },
    forceCollapse: {
      default: false,
      type: Boolean,
    },
    activeClass: { default: "dark-flat" },
    smallSortButtons: Boolean,
  },

  data() {
    return {
      ModeView: ModeView,

      search: null,
    };
  },

  computed: {
    small_mode() {
      return window.innerWidth < 900;
    },
    items() {
      return [
        { name: this.$t("sort.most_views"), val: "most_visited" },
        { name: this.$t("sort.most_likes"), val: "most_popular" },
        { name: this.$t("sort.most_recent"), val: "newest" },
        { name: this.$t("sort.most_sell"), val: "bestselling" },
        { name: this.$t("sort.cheapest"), val: "cheapest" },
        { name: this.$t("sort.most_expensive"), val: "most_expensive" },
      ];
    },
    sort_title() {
      const find = this.items.find((item) => item.val === this.modelValue);
      return find ? this.$t(find.name) : this.$t("sort.title_small");
    },
  },
  watch: {
    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.$emit("update:search", newVal);
    }, window.SERACH_THROTTLE),

    "$route.query.search"(search) {
      this.search = search;
    },
  },

  mounted() {},
  methods: {
    toggleModeView() {
      let mode_view =
        this.viewMode.code === ModeView.NORMAL.code
          ? ModeView.GRID
          : this.viewMode.code === ModeView.GRID.code
            ? ModeView.LIST
            : this.viewMode.code === ModeView.LIST.code
              ? ModeView.INSTA
              : ModeView.NORMAL;
      this.$emit("update:view-mode", mode_view);
    },
  },

  created() {
    // Load initial search query:
    this.search = this.$route.query.search;
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--sort-view {
  display: flex;
  align-items: center;
  overflow: auto;
  min-height: 84px;


  .search-box {
    max-width: 360px;
    flex-grow: 2;
    flex-basis: 120px;
  }

  &.s-products-sort-view--modern .s-products-sort-view__search-help {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    order: 10;
  }
}

.s-products-sort-view__search-tips {
  strong { font-weight: 500; }
  ul { margin: 8px 0 0; padding-inline-start: 18px; }
  li + li { margin-block-start: 6px; }
  :deep(.text-green), :deep(.text-yellow) { color: inherit !important; }
}

.s-products-sort-view--modern .s-products-sort-view__availability-group.v-btn-toggle {
  --availability-button-size: 32px;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  height: auto;
  padding: 2px;
  border: 0;
  border-radius: 8px;
  background: var(--sd-modern-canvas-color, rgba(var(--v-theme-on-surface), .055));
  overflow: visible;

  :deep(> .v-btn) {
    width: var(--availability-button-size);
    min-width: var(--availability-button-size);
    max-width: var(--availability-button-size);
    height: var(--availability-button-size);
    min-height: var(--availability-button-size);
    padding: 0;
    border: 0;
    border-radius: 6px !important;
    background: transparent;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66));
    box-shadow: none;
  }

  :deep(> .s-products-sort-view__availability--selected) {
    --v-activated-opacity: 0;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    box-shadow: var(--sd-modern-selected-shadow, 0 1px 4px rgba(var(--v-theme-on-surface), .15));
  }

  :deep(.v-icon) { color: inherit; }
  :deep(> .v-btn:focus-visible) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }

  @media (max-width: 600px), (pointer: coarse) {
    --availability-button-size: 44px;
  }
}
</style>
