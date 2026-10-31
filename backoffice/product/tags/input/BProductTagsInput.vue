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
  <div>
    <component
      :is="modern ? 'details' : 'div'"
      :class="modern ? 'b-product-tags-input--modern b-product-edit-features__panel sd-modern-widget sd-modern-disclosure' : 'widget-box mb-5'"
    >
      <summary v-if="modern" class="sd-modern-disclosure__summary b-product-edit-features__summary">
        <b-product-edit-info-icon name="Tags" />
        <span class="b-product-edit-features__summary-copy">
          <span class="b-product-edit-features__summary-title">{{ $t('add_product.features_modern.tags_title') }}</span>
          <span class="b-product-edit-features__digest">{{ tags?.length ? tags.join(', ') : $t('add_product.features_modern.tags_empty') }}</span>
        </span>
        <span class="b-product-edit-features__count">{{ tags?.length || 0 }}</span>
        <b-product-edit-info-icon name="ChevronDown" class="b-product-edit-features__chevron" :size="16" />
      </summary>
      <div :class="{ 'b-product-edit-features__panel-content': modern }">
      <u-widget-header
        v-if="!modern"
        icon="label"
        :title="$t('product_tags.title')"
      ></u-widget-header>

      <p v-if="modern" class="b-product-edit-features__intro">{{ $t('add_product.features_modern.tags_intro') }}</p>

      <ul v-if="!modern" class="small text-muted ps-5 pa-2">
        <li v-for="(tip, index) in $tm('product_tags.tips')" :key="index" v-html="tip"></li>
      </ul>

      <u-loading-progress v-if="busy"></u-loading-progress>
      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Tags ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <v-combobox
        v-model="tags"
        :class="{ 'sd-modern-underlined-field': modern }"
        :items="cache_items"
        :label="modern ? $t('add_product.features_modern.tags_title') : undefined"
        :hide-details="modern ? 'auto' : false"
        chips
        clearable
        closable-chips
        multiple
        :placeholder="$t('product_tags.inputs.tags.placeholder')"
        variant="underlined"
        @update:model-value="change = true"
      >
        <template v-slot:chip="{ props, item }">
          <v-chip
            v-if="modern"
            v-bind="props"
            class="b-product-tags-input__chip"
            variant="outlined"
            size="default"
            :close-label="$t('global.actions.delete') + ' · ' + item.raw"
          >
            <span class="b-product-tags-input__chip-text">{{ item.raw }}</span>
            <template #close><b-product-edit-info-icon name="X" :size="14" /></template>
          </v-chip>
          <u-chip-tag v-else :tag="item.raw" v-bind="props"></u-chip-tag>
        </template>
      </v-combobox>
      <details v-if="modern" class="b-product-tags-input__help">
        <summary>{{ $t('add_product.features_modern.tags_help') }}</summary>
        <ul>
          <li v-for="(tip, index) in $tm('product_tags.tips')" :key="index" v-html="tip"></li>
        </ul>
      </details>
      </div>
    </component>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { debounce } from "lodash-es";
import { BackofficeLocalStorages } from "@selldone/core-js/helper/local-storage/BackofficeLocalStorages";
import UChipTag from "@selldone/components-vue/ui/chip/tag/UChipTag.vue";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default {
  name: "BProductTagsInput",
  components: { BProductEditInfoIcon, UChipTag },
  props: {
    modern: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    tags: [],
    busy: false,
    change: false,
    cache_items: [],
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    tags: {
      handler: function (val, oldVal) {
        this.onChange();
      },
      deep: true,
    },
  },

  methods: {
    onChange() {
      this.setTags();
    },

    setTags() {
      if (!this.change) return;
      this.change = false;

      this.busy = true;
      this.tags = (this.tags || [])
        .filter((i) => !!i)
        .map((i) => i.toLowerCase())
        .unique();

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.tags.set(
            this.$route.params.vendor_id,
            this.product.id,
            this.tags,
          )
        : window.$backoffice.product.tags.set(
            this.product.shop_id,
            this.product.id,
            this.tags,
          )
      )

        .then(({ tags }) => {
          this.product.tags = tags;
          BackofficeLocalStorages.SetProductCachedTags(
            this.$localstorage_base_path(),
            tags,
          );

          NotificationService.showSuccessAlert(
            null,
            this.$t("product_tags.notifications.tags_updated"),
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },

  created() {
    this.onChange = debounce(this.onChange, 1500);
    this.tags = Array.isArray(this.product.tags) ? [...this.product.tags] : [];
    this.cache_items = BackofficeLocalStorages.GetProductCachedTags(
      this.$localstorage_base_path(),
    );
    if (!this.cache_items || !Array.isArray(this.cache_items))
      this.cache_items = [];
  },

  beforeUnmount() {
    this.onChange.cancel();
    this.setTags();
  },
};
</script>

<style lang="scss" scoped>
.b-product-tags-input--modern {
  :deep(.v-combobox__selection) { height: auto; min-height: 32px; align-self: flex-start; }
  @media (max-width: 600px), (pointer: coarse) {
    :deep(.v-combobox__selection) { min-height: 44px; }
  }
  .b-product-tags-input__chip {
    box-sizing: border-box;
    max-width: 100%;
    min-height: 32px;
    height: auto;
    padding-block: 0;
    padding-inline: 10px 0;
    border: 0;
    box-shadow: inset 0 0 0 1px var(--sd-modern-border);
    border-radius: 8px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 13px;
    line-height: 20px;
    white-space: normal;
    .b-product-tags-input__chip-text { min-width: 0; overflow-wrap: anywhere; white-space: normal; }
    :deep(.v-chip__content) { flex: 1; min-width: 0; padding-block: 6px; }
    :deep(.v-chip__close) { box-sizing: border-box; flex: 0 0 32px; width: 32px; min-width: 32px; height: 32px; min-height: 32px; padding: 0; margin: 0; margin-inline: 6px 0; color: var(--sd-modern-muted); }
    :deep(.v-chip__close:focus-visible) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -3px; border-radius: 6px; }
    @media (max-width: 600px), (pointer: coarse) {
      min-height: 44px;
      :deep(.v-chip__close) { flex: 0 0 44px; width: 44px; min-width: 44px; height: 44px; min-height: 44px; }
    }
  }
  .b-product-tags-input__help {
    margin-top: 18px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
    > summary { width: fit-content; padding-block: 8px; cursor: pointer; }
    > summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
    ul { padding-inline-start: 20px; margin-top: 8px; }
    li + li { margin-top: 7px; }
  }
}
</style>
