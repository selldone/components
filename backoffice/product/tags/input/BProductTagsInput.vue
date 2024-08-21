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
    <div class="widget-box mb-5">
      <s-widget-header
        icon="label"
        :title="$t('product_tags.title')"
      ></s-widget-header>

      <ul class="small text-muted ps-5 pa-2">
        <li v-for="tip in $tm('product_tags.tips')" v-html="tip"></li>
      </ul>

      <u-loading-progress v-if="busy"></u-loading-progress>
      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Tags ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <v-combobox
        v-model="tags"
        :items="cache_items"
        chips
        clearable
        closable-chips
        multiple
        :placeholder="$t('product_tags.inputs.tags.placeholder')"
        variant="underlined"
        @update:model-value="change = true"
      >
        <template v-slot:chip="{ props, item }">
          <u-chip-tag :tag="item.raw" v-bind="props"></u-chip-tag>
        </template>
      </v-combobox>
    </div>
  </div>
</template>

<script>
import _ from "lodash-es";
import { BackofficeLocalStorages } from "@selldone/core-js/helper/local-storage/BackofficeLocalStorages";
import UChipTag from "@selldone/components-vue/ui/chip/tag/UChipTag.vue";

export default {
  name: "BProductTagsInput",
  components: { UChipTag },
  props: {
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
    onChange: _.debounce(function () {
      this.setTags();
    }, 1500),

    setTags() {
      if (!this.change) return;
      this.change = false;

      this.busy = true;
      this.tags = this.tags
        ?.filter((i) => !!i)
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

          this.showSuccessAlert(
            null,
            this.$t("product_tags.notifications.tags_updated"),
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },

  created() {
    this.tags = this.product.tags;
    this.cache_items = BackofficeLocalStorages.GetProductCachedTags(
      this.$localstorage_base_path(),
    );
    if (!this.cache_items || !Array.isArray(this.cache_items))
      this.cache_items = [];
  },

  beforeUnmount() {
    this.setTags();
  },
};
</script>

<style lang="scss" scoped></style>
