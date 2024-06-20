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
  <div :class="{ block: block }" class="s--storefront-search-box">
    <v-btn
      v-if="isMobile && !force_show"
      :color="color ? color : SaminColorLight"
      class="collapse-button"
      size="small"
      variant="flat"
      @click="force_show = true"
      @click.stop
    >
      <v-icon> search</v-icon>
    </v-btn>

    <v-text-field
      v-if="!block || !isMobile || force_show"
      v-model="search"
      :append-icon="isMobile && noClose ? $t('icons.navigate_next') : undefined"
      :bg-color="backgroundColor"
      :class="{ 'is-mobile': isMobile, force_show: force_show, shadow: shadow }"
      :color="color"
      :density="dense ? 'compact' : 'default'"
      :flat="flat"
      :hint="hint"
      :label="current_label"
      :loading="isLoading"
      :messages="messages ? messages : undefined"
      :persistentPlaceholder="persistentPlaceholder"
      :placeholder="placeholder ? placeholder : $t('global.commons.search')"
      :readonly="readonly"
      :rounded="rounded"
      :single-line="singleLine"
      :theme="dark ? 'dark' : 'light'"
      :variant="
        variant
          ? variant
          : solo && filled
            ? 'solo-filled'
            : solo
              ? 'solo'
              : filled
                ? 'filled'
                : outlined
                  ? 'outlined'
                  : 'underlined'
      "
      class="search-box"
      clearable
      hide-details
      hide-selected
      no-filter
      prepend-inner-icon="search"
      v-on:keyup.enter="
        () => {
          search ? goToResult({ title: search }) : undefined;
        }
      "
      @click:append="force_show = false"
      v-model:focused="focused"
      @keydown.enter="goToResult(model)"
      @click:clear="goToResult()"
      :autofocus="isMobile"
    >
      <template v-slot:prepend-inner>
        <v-btn
          v-if="!noQr"
          :class="negativeQrMargin ? 'mt-n3' : ''"
          class="hoverable-icon zoomIn delay_500 flex-grow-0"
          icon
          size="small"
          variant="text"
          @click="showQRScanner"
        >
          <v-icon size="20">qr_code_scanner</v-icon>
        </v-btn>
      </template>

      <template v-slot:append-inner>
        <u-avatar-folder
          v-if="model?.icon"
          :src="getShopImagePath(model.icon, IMAGE_SIZE_SMALL)"
          placeholder-icon="grain"
          :is-amber="!!model.cat"
          :is-gray="model.query && !model.cat"
          :side-icon="model.query ? 'search' : model.cat ? 'folder' : 'shelves'"
          :size="42"
          :border-size="5"
        >
        </u-avatar-folder>
      </template>
    </v-text-field>

    <teleport to="body">
      <v-card
        v-if="focused_dealyed"
        max-width="98vw"
        width="840"
        rounded="t-xl"
        max-height="80vh"
        min-height="40vh"
        style="
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translate(-50%, 0);
          z-index: 99;
        "
        class="d-flex flex-column align-stretch text-start pt-3 border"
      >
        <template v-if="!items?.length">
          <v-list-subheader class="px-3 d-flex align-center">
            <v-icon class="me-1">manage_search</v-icon>
            {{ title }}
          </v-list-subheader>

          <v-btn
            @click="focused_dealyed = false"
            icon
            variant="text"
            class="absolute-top-end ms-2"
            size="32"
          >
            <v-icon size="24">expand_more</v-icon>
          </v-btn>

          <v-list density="compact" class="flex-grow-1">
            <v-list-item
              v-for="old_item in old_items"
              :key="old_item"
              :disabled="$route.query.search === old_item.replace('%c-', '')"
              density="compact"
              @click="
                goToResult({
                  title: old_item.replace('%c-', ''),
                  cat: old_item.startsWith('%c-'),
                })
              "
            >
              <template v-slot:prepend>
                <v-icon v-if="old_item.startsWith('%c-')" color="amber"
                  >folder
                </v-icon>
                <v-icon v-else>search</v-icon>
              </template>

              <v-list-item-title
                >{{ old_item.replace("%c-", "") }}
              </v-list-item-title>
            </v-list-item>
          </v-list>

          <hr class="my-5" />
          <small class="d-block mb-5 text-center px-3">{{
            $t("global.search_box.tips")
          }}</small>
        </template>

        <template v-else>
          <v-list-subheader class="px-3 d-flex align-center">
            <v-icon class="me-1">arrow_drop_down</v-icon>
            {{ $t("global.search_box.result") }}
          </v-list-subheader>
          <v-btn
            @click="focused_dealyed = false"
            icon
            variant="text"
            class="absolute-top-end ms-2"
            size="32"
          >
            <v-icon size="24">expand_more</v-icon>
          </v-btn>

          <v-list>
            <v-list-item
              v-for="item in items"
              :title="item.title"
              @click="
                search = item.title;
                goToResult(item);
              "
            >
              <template v-slot:prepend>
                <u-avatar-folder
                  v-if="item.icon"
                  :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
                  placeholder-icon="grain"
                  :is-amber="!!item.cat"
                  :is-gray="item.query && !item.cat"
                  :side-icon="
                    item.query ? 'search' : item.cat ? 'folder' : 'shelves'
                  "
                  :size="42"
                  :border-size="5"
                >
                </u-avatar-folder>
                <v-icon v-else>search</v-icon>
              </template>
              <v-list-item-subtitle>
                {{ item.title_en }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-list-item-action v-if="item.cat" class="small">
                  {{ $t("global.search_box.category") }}
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-list>
        </template>
      </v-card>
    </teleport>

    <!-- ---------------------------------------------------------- -->
    <v-dialog
      v-model="show_scanner"
      content-class="no-shadow-dialog"
      max-width="680"
    >
      <v-card class="rounded-28px text-start">
        <v-card-title>
          <v-icon class="me-1">qr_code_scanner</v-icon>
          {{ $t("global.commons.barcode_scanner") }}
        </v-card-title>
        <v-card-text v-if="show_scanner">
          <u-scanner other-codes qr-code @on-scan="onScan"></u-scanner>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              prepend-icon="close"
              size="x-large"
              variant="text"
              @click="show_scanner = false"
              >{{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { StorefrontLocalStorages } from "@selldone/core-js/helper/local-storage/StorefrontLocalStorages";
import UScanner from "../../ui/scanner/UScanner.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";

export default {
  name: "SStorefrontSearchBox",
  components: { UAvatarFolder, UScanner },
  emits: ["onSearch", "onClear", "update:expandInput"],
  props: {
    title: {
      type: String,
      required: false,
    },

    label: {
      type: String,
      required: false,
      default: null,
    },

    shopId: {
      required: false,
    },
    shopName: {
      type: String,
      required: false,
    },

    filled: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    shadow: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    negativeQrMargin: {
      // In selldone dashboard it needed!
      type: Boolean,
      default: true,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    noQr: {
      type: Boolean,
      default: false,
    },
    noClose: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    expandInput: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    color: {},
    backgroundColor: {},

    placeholder: {},
    messages: {},
    hint: {},
    persistentPlaceholder: {},
    singleLine: { default: true },

    outlined: {
      type: Boolean,
      default: false,
    },
    variant: {},
  },
  data: () => ({
    isLoading: false,
    items: [],

    model: null,
    search: null,

    last_event: null,

    force_show: false,

    old_items: [],

    show_scanner: false,

    focused: false,
    focused_dealyed: false,
  }),
  computed: {
    max_title() {
      return Math.max(20, this.window.innerWidth / 20);
    },

    current_label() {
      return this.label ? this.label : this.$t("global.search_box.label");
    },
  },

  watch: {
    focused(val) {
      if (val) {
        this.focused_dealyed = true;
      } else {
        setTimeout(() => {
          this.focused_dealyed = false;
        }, 300);
      }
    },
    search(val) {
      // Items have already been loaded
      //  if (this.items.length > 0) return;
      if (!val || val.length < 3) return;

      val = val.replace(/\//g, "").replace(/\\/g, "");
      if (!val || val.length < 3) return;

      this.isLoading = true;

      axios
        .get(
          this.shopName
            ? window.XAPI.GET_SEARCH_QUERY(this.shopName, val)
            : window.API.GET_SEARCH_QUERY_ADMIN(this.shopId, val),
        )
        .then(({ data }) => {
          // Remove just query items:
          this.items = this.items.filter((item) => !item.query);

          this.items.unshift(...data.items);

          // Show current search on top:
          this.items.unshift({ title: val, query: true });

          this.items = this.items.uniqueByKey("title").limit(12);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isLoading = false));
    },
    force_show(force_show) {
      setTimeout(
        () => {
          this.$emit("update:expandInput", force_show);
        },
        force_show ? 0 : 300,
      ); // Delayed in hide for smooth animation in shop page!
    },
  },

  created() {
    // Reconstruct from current route query:
    if (this.$route.query.search) {
      this.model = {
        title: this.$route.query.search,
        cat: this.$route.query.search === "category",
        id:
          this.$route.query.search === "exact"
            ? this.$route.query.search
            : null,
      };
      this.items = [this.model];
      this.search = this.$route.query.search;
    }

    this.force_show = this.expandInput;

    let history = localStorage.getItem(
      StorefrontLocalStorages.GetUserShopSearchHistory(
        this.$localstorage_base_path(),
      ),
    );
    if (history) this.old_items = JSON.parse(history);
    if (!this.old_items || !Array.isArray(this.old_items)) this.old_items = [];
  },
  methods: {
    goToResult(item) {
      // console.log("goToResult --> ", item);

      if (item && this.$route.query.search === item.title) return; // Prevent duplicated search!

      this.last_event = item;

      if (item) {
        let search_type = item.cat ? "category" : item.id ? "exact" : null;

        const pack = {
          search_type: search_type,
          search: search_type === "exact" ? item.id : item.title,
        };
        this.$emit("onSearch", pack);

        // Set current item:
        if (!this.items.includes(item)) this.items.push(item);
        this.model = item;

        // Save on history:
        this.old_items.unshift((item.cat ? "%c-" : "") + item.title);

        let count = 0;
        this.old_items = this.old_items.filter(
          (item, index) =>
            this.old_items.indexOf(item) === index && count++ < 4,
        );

        localStorage.setItem(
          StorefrontLocalStorages.GetUserShopSearchHistory(
            this.$localstorage_base_path(),
          ),
          JSON.stringify(this.old_items),
        );
      } else {
        this.$emit("onClear");
      }
    },
    showQRScanner() {
      this.show_scanner = true;
    },
    onScan(result) {
      console.log("onScan", result);

      const item = { title: result };
      this.items = [item];

      this.show_scanner = false;
      this.model = item;
      this.goToResult(item);
    },
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
.s--storefront-search-box {
  .search-box {
    transition: all 0.3s ease-out;

    &.is-mobile {
      //visibility: hidden;
      transform: scale(0.1);
      top: -80px;
      max-width: 48px;
      //display: none !important;
    }

    &.force_show {
      top: 0px;
      //display: block !important;
      max-width: 100vw;
      //visibility: visible;
      transform: scale(1);
    }

    &.shadow {
      box-shadow: 0px 5px 15px 2px rgba(220, 220, 220, 0.24) !important;
    }
  }

  .collapse-button {
    visibility: hidden !important;
    display: none !important;

    position: absolute;
    // top: 8px;
    left: 50%;
    transform: translateX(-50%);

    @media only screen and (max-width: 780px) {
      visibility: visible !important;
      display: block !important;
    }

    @media only screen and (max-width: 500px) {
      right: 0;
      //transform: translateX(-50%);
    }
  }

  .block {
    .collapse-button {
      position: relative;
      left: unset;
      transform: unset;
    }
  }

  .hoverable-icon {
    &:hover {
      background-color: var(--theme-light) !important;
      color: #fff !important;
    }
  }
}
</style>
