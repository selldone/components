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
  <v-card-text>
    <div class="widget-box mb-5">
      <s-widget-header
        title="Extra Products Listing"
        icon="shelves"
      ></s-widget-header>
      <v-list-subheader>
        Display products from various categories. You have the option to choose
        multiple categories to showcase products or filter products by tags.
      </v-list-subheader>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Preview ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <b-category-engine-preview :category="category" :engine-categories="engine_categories" :engine-tags="engine_tags">

      </b-category-engine-preview>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Categories ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <b-category-input
        v-model="engine_categories"
        multiple
        label="Categories"
        placeholder="Select categories..."
        persistent-placeholder
        messages="Products in these categories will be shown."
        clearable
        class="my-3"
        :counter="20"
        @change="engine_changed = true"
      >
      </b-category-input>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Tags ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <v-combobox
        v-model="engine_tags"
        :items="cache_tags"
        chips
        clearable
        closable-chips
        multiple
        placeholder="Wire tags here and press enter. ex. new collection"
        variant="underlined"
        label="Product tags"
        persistent-placeholder
        messages="Products with these tags will be show."
        class="my-3"
        :counter="20"
        @update:model-value="engine_changed = true"
      >
        <template v-slot:chip="{ props, item }">
          <u-chip-tag v-bind="props" :tag="item.raw"></u-chip-tag>
        </template>
      </v-combobox>


    </div>

    <v-fade-transition>
      <s-widget-buttons v-if="engine_changed" auto-fixed-position>
        <v-btn
          :disabled="IS_VENDOR_PANEL"
          size="x-large"
          color="primary"
          prepend-icon="save"
          variant="elevated"
          @click="saveEngine()"
          :loading="busy_engine"
        >
          Save Engine
          {{ IS_VENDOR_PANEL ? " [Marketplace Owner]" : "" }}
        </v-btn>
      </s-widget-buttons>
    </v-fade-transition>
  </v-card-text>
</template>

<script>
import UChipTag from "../../../ui/chip/tag/UChipTag.vue";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import BCategoryInput from "../input/BCategoryInput.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import SWidgetHeader from "../../../ui/widget/header/SWidgetHeader.vue";
import { BackofficeLocalStorages } from "@selldone/core-js/helper/local-storage/BackofficeLocalStorages";
import BCategoryEnginePreview
  from "@selldone/components-vue/backoffice/category/engine/preview/BCategoryEnginePreview.vue";

export default {
  name: "BCategoryEngineEditor",
  components: {
    BCategoryEnginePreview,
    SWidgetHeader,
    SWidgetButtons,
    UNumberInput,
    BCategoryInput,
    ProductsDenseImagesCircles,
    UChipTag,
  },
  emits: ["edit-engine"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    category: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    engine_categories: [],
    engine_tags: [],
    cache_tags: [],
    busy_engine: false,
    engine_changed: false,
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
    category() {
      this.assignData();
    },
  },

  created() {
    this.assignData();

    this.cache_tags = BackofficeLocalStorages.GetProductCachedTags(
      this.$localstorage_base_path(),
    );
    if (!this.cache_tags || !Array.isArray(this.cache_tags))
      this.cache_tags = [];
  },
  methods: {
    assignData() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.category.engine) {
        this.engine_categories = this.category.engine.categories;
        this.engine_tags = this.category.engine.tags;
      }
    },

    saveEngine() {
      this.busy_engine = true;

      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? null
            : window.API.PUT_CATEGORY_SET_ENGINE(
                this.shop.id,
                this.category.id,
              ),
          {
            categories: this.engine_categories,
            tags: this.engine_tags,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              "Category engine has been successfully updated.",
            );
            this.$emit("edit-engine", data.engine);

            this.engine_changed = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_engine = false;
        });
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
</style>