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
  <div class="s--sort-view">
    <!-- ███████████████████ Only available ███████████████████ -->

    <v-btn
      :size="smallSortButtons ? 'small' : undefined"
      class="tnt"
      height="46"
      stacked
      variant="text"
      @click="$emit('update:only-available', !onlyAvailable)"
    >
      <v-icon class="mb-1" size="24"
        >{{ onlyAvailable ? "check_box" : "all_inclusive" }}
      </v-icon>
      <span class="small">
        {{
          onlyAvailable ? $t("sort.only_available") : $t("global.commons.all")
        }}
      </span>
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
          border="0"
          height="46"
          variant="text"
        >
          {{ item.name }}
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
          exact
          rounded="xl"
          @click="(val) => $emit('update:modelValue', item.val)"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
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
        <template v-slot:append-inner>
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
              <b>Search Tips</b>
              <ul class="mt-3">
                <li><b>Normal : </b>Search Title, MPN, SKU, Brand, Tags</li>
                <li>
                  <b>P+Product ID : </b>Find exact product ID, ex.
                  <b class="text-green">P</b><i class="text-yellow">360</i>
                </li>
                <li>
                  <b>Quotes : </b> Use quotes to search for an exact phrase, ex.
                  <b class="text-green">"</b><i class="text-yellow">text here</i
                  ><b class="text-green">"</b>
                </li>
                <li>
                  <b>Tax : </b> To find products with a tax profile, ex.
                  <b class="text-green">tax:</b
                  ><i class="text-yellow">tax profile name</i>
                </li>
                <li>
                  <b>New Products : </b> To find added products between dates,
                  ex. <b class="text-green">new~</b
                  ><i class="text-yellow">2023-08-10</i
                  ><b class="text-green">~</b
                  ><i class="text-yellow">2023-08-20</i>
                </li>
              </ul>
            </div>
          </v-tooltip>
        </template>
      </v-text-field>
    </template>
  </div>
</template>

<script>
import { ModeView } from "@selldone/core-js/enums/shop/ModeView";
import _ from "lodash-es";

export default {
  name: "SProductsSortView",
  components: {},
  emits: ["update:modelValue", "update:search", "update:view-mode"],

  props: {
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
    search: _.throttle(function (newVal, oldVal) {
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
  min-height: 54px;
  overflow: auto;

  .search-box {
    max-width: 360px;
    flex-grow: 2;
    flex-basis: 120px;
  }
}
</style>
