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

    <v-autocomplete
      v-if="!block || !isMobile || force_show"
      v-model="model"
      v-model:search="search"
      :append-icon="isMobile && noClose ? $t('icons.navigate_next') : undefined"
      :bg-color="backgroundColor"
      :class="{ 'is-mobile': isMobile, force_show: force_show, shadow: shadow }"
      :color="color"
      :customFilter="() => true"
      :density="dense ? 'compact' : 'default'"
      :flat="flat"
      :hint="hint"
      :items="items"
      :label="current_label"
      :loading="isLoading"
      :messages="messages ? messages : undefined"
      :persistentPlaceholder="persistentPlaceholder"
      :placeholder="placeholder ? placeholder : $t('global.commons.search')"
      :readonly="readonly"
      :rounded="rounded"
      :single-line="singleLine"
      :theme="dark ? 'dark' : 'light'"
      autocomplete
      class="search-box"
      clearable
      hide-details
      hide-selected
      no-filter
      prepend-inner-icon="search"
      return-object
      @update:model-value="goToResult"
      v-on:keyup.enter="
        () => {
          search ? goToResult({ title: search }) : undefined;
        }
      "
      @click:append="force_show = false"
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
    >
      <template v-slot:prepend-inner>
        <v-btn
          v-if="!noQr"
          :class="negativeQrMargin ? 'mt-n3' : ''"
          class="hoverable-icon zoomIn delay_500 flex-grow-0"
          icon
          variant="text"
          size="small"
          @click="showQRScanner"
        >
          <v-icon size="20">qr_code_scanner</v-icon>
        </v-btn>
      </template>
      <template v-slot:prepend-item>
        <p v-if="items.length" class="text-muted text-start small mx-2 mb-0">
          {{ $t("global.search_box.result") }}
          :
        </p>
      </template>

      <template v-slot:no-data>
        <v-list-item>
          <v-list-item-title class="text-start small">
            <strong>{{ title }}</strong>
          </v-list-item-title>
        </v-list-item>

        <v-list density="compact">
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

        <hr />
        <small>{{ $t("global.search_box.tips") }}</small>
      </template>

      <template v-slot:selection="{ item, selected }">
        <v-chip
          :model-value="selected"
          class="text-subtitle-2"
          variant="outlined"
        >
          <v-avatar v-if="item.raw.icon" start>
            <v-img :src="getShopImagePath(item.raw.icon, IMAGE_SIZE_SMALL)" />
          </v-avatar>

          <span
            class="limited-text-150px"
            v-text="item.raw.title.substring(0, max_title)"
          />
        </v-chip>
      </template>

      <template v-slot:item="{ item, props }">
        <v-list-item :title="item.raw.title" class="text-start" v-bind="props">
          <template v-slot:prepend>
            <v-avatar v-if="item.raw.icon" class="position-relative">
              <v-img :src="getShopImagePath(item.raw.icon, IMAGE_SIZE_SMALL)">
                <template v-slot:placeholder>
                  <v-progress-circular
                    color="grey-lighten-5"
                    class="center-absolute"
                    indeterminate
                  />
                </template>
              </v-img>
            </v-avatar>
            <v-icon v-if="item.raw.query">search</v-icon>
          </template>

          <template v-slot:append>
            <v-list-item-action>
              <div v-if="item.raw.cat" class="small">
                {{ $t("global.search_box.category") }}
              </div>
              <v-icon v-if="item.raw.cat" class="mx-auto" color="amber"
                >folder
              </v-icon>
            </v-list-item-action>
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>

    <!-- ---------------------------------------------------------- -->
    <v-dialog
      v-model="show_scanner"
      content-class="no-shadow-dialog"
      max-width="680"
    >
      <v-card class="rounded-28px text-start">
        <v-card-title>    <v-icon class="me-1">qr_code_scanner</v-icon>{{ $t("global.commons.barcode_scanner") }}</v-card-title>
        <v-card-text v-if="show_scanner">
          <u-scanner
            other-codes
            qr-code
            @on-scan="onScan"
          ></u-scanner>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              variant="text"
              @click="show_scanner = false"
              size="x-large"
              prepend-icon="close"
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

export default {
  name: "SStorefrontSearchBox",
  components: { UScanner },
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
          this.items = data.items;

          if (
            !this.items.some((element) => {
              return element.title === val;
            })
          ) {
            this.items.unshift({ title: val, query: true });
          }
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
      if (item && this.$route.query.search === item.title) return; // Prevent duplicated search!

      this.last_event = item;
      // console.log("goToResult --> ", item);

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
