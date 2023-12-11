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
      text
      @click="$emit('update:only-available', !onlyAvailable)"
      height="46"
      class="tnt"
    >
      <div class="d-flex flex-column small">
        <v-icon class="mb-1"
          >{{ onlyAvailable ? "check_box" : "all_inclusive" }}
        </v-icon>
        {{
          onlyAvailable ? $t("sort.only_available") : $t("global.commons.all")
        }}
      </div>
    </v-btn>

    <!-- ███████████████████ View mode ███████████████████ -->

    <v-btn
      v-if="hasViewMode"
      @click="toggleModeView"
      text
      :title="$t(viewMode.title)"
      height="46"
      class="tnt"
    >
      <div class="d-flex flex-column small">
        <v-icon class="mb-1">{{ viewMode.icon }}</v-icon>
        {{ $t(viewMode.title) }}
      </div>
    </v-btn>

    <!-- ███████████████████ Sort ███████████████████ -->

    <v-btn-toggle
      v-if="!forceCollapse"
      :value="value"
      @change="(val) => $emit('input', val)"
      class="rounded-group hide-on-small-900 mx-2"
      :active-class="activeClass"
      borderless
      :mandatory="mandatory"
    >
      <v-btn
        :value="item.val"
        v-for="item in items"
        :loading="loading && value === item.val && !search"
        text
        :key="item.val"
        height="46"
      >
        {{ item.name }}
      </v-btn>
    </v-btn-toggle>

    <!-- Small screen -->
    <v-menu transition="slide-y-transition" bottom offset-y rounded="xl">
      <template v-slot:activator="{ on }">
        <v-btn
          :class="{ 'show-on-small-900': !forceCollapse }"
          text
          v-on="on"
          height="46"
        >
          {{ sort_title }}
          <v-icon class="ms-1" x-small>expand_more</v-icon>
        </v-btn>
      </template>

      <v-list class="text-start text-uppercase">
        <v-list-item
          selectable
          v-for="item in items"
          :key="item.val"
          :color="value === item.val ? 'blue' : undefined"
          @click="(val) => $emit('input', item.val)"
          exact
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
        solo
        :autofocus="$vuetify.breakpoint.lgAndUp/*Prevent opening keyboard on phone and tablets!*/"
        flat
        v-model="search"
        single-line
        :loading="loading && !!search"
        dense
        prepend-inner-icon="search"
        hide-details
        :placeholder="$t('global.commons.search')"
        class="search-box me-1 min-width-200"
        :class="{ 'my-2 my-md-0': !twoLine, 'my-2': twoLine }"
        clearable
      >
        <template v-slot:append>
          <v-tooltip bottom color="#000">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="#aaa" dark v-bind="attrs" v-on="on" icon small>
                <v-icon small>info</v-icon>
              </v-btn>
            </template>
            <div class="text-start pa-3">
              <b>Search Tips</b>
              <ul class="mt-3">
                <li><b>Normal : </b>Search Title, MPN, SKU, Brand, Tags</li>
                <li>
                  <b>P+Product ID : </b>Find exact product ID, ex.
                  <b class="green--text">P</b><i class="yellow--text">360</i>
                </li>
                <li>
                  <b>Quotes : </b> Use quotes to search for an exact phrase, ex.
                  <b class="green--text">"</b
                  ><i class="yellow--text">text here</i
                  ><b class="green--text">"</b>
                </li>
                <li>
                  <b>Tax : </b> To find products with a tax profile, ex.
                  <b class="green--text">tax:</b
                  ><i class="yellow--text">tax profile name</i>
                </li>
                <li>
                  <b>New Products : </b> To find added products between dates,
                  ex. <b class="green--text">new~</b
                  ><i class="yellow--text">2023-08-10</i
                  ><b class="green--text">~</b
                  ><i class="yellow--text">2023-08-20</i>
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
import { ModeView } from "@core/enums/shop/ModeView";
import _ from "lodash-es";

export default {
  name: "SProductsSortView",
  components: {},

  props: {
    value: {
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
      const find = this.items.find((item) => item.val === this.value);
      return find ? this.$t(find.name) : this.$t("sort.title_small");
    },
  },
  watch: {
    search: _.throttle(function (newVal, oldVal) {
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

<style scoped lang="scss">
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
