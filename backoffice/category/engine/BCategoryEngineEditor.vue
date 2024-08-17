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
    <div class="widget-box mb-5 pb-5">
      <s-widget-header
        icon="shelves"
        :title="$t('category_engine_editor.title')"
      ></s-widget-header>
      <v-list-subheader>
        {{$t('category_engine_editor.subtitle')}}

      </v-list-subheader>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Preview ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <b-category-engine-preview
        :category="category"
        :engine-categories="engine_categories"
        :engine-tags="engine_tags"
      >
      </b-category-engine-preview>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Categories ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <b-category-input
        v-model="engine_categories"
        :counter="32"
        class="my-3"
        clearable
        :label="$t('category_engine_editor.inputs.categories.label')"
        :messages="$t('category_engine_editor.inputs.categories.messages')"
        multiple
        persistent-placeholder
        :placeholder="$t('category_engine_editor.inputs.categories.placeholder')"
        @change="engine_changed = true"
      >
      </b-category-input>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Tags ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <v-combobox
        v-model="engine_tags"
        :counter="32"
        :items="cache_tags"
        chips
        class="my-3"
        clearable
        closable-chips
        :label="$t('category_engine_editor.inputs.tags.label')"
        :messages="$t('category_engine_editor.inputs.tags.messages')"
        multiple
        persistent-placeholder
        :placeholder="$t('category_engine_editor.inputs.tags.placeholder')"
        variant="underlined"
        @update:model-value="engine_changed = true"
      >
        <template v-slot:chip="{ props, item }">
          <u-chip-tag :tag="item.raw" v-bind="props"></u-chip-tag>
        </template>
      </v-combobox>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Auto Add All Sub Categories ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <v-list-subheader>
        {{$t('category_engine_editor.aut_add_sub_categories_tips')}}

      </v-list-subheader>
      <div>
        <v-btn
          :loading="busy_auto"
          class="tnt"
          prepend-icon="flash_auto"
          variant="elevated"
          @click="autoAddSubCategories"
        >
          {{$t('category_engine_editor.actions.auto_add_subcategories')}}

        </v-btn>
      </div>
    </div>

    <v-fade-transition>
      <s-widget-buttons v-if="engine_changed" auto-fixed-position>
        <v-btn
          :disabled="IS_VENDOR_PANEL"
          :loading="busy_engine"
          color="primary"
          prepend-icon="save"
          size="x-large"
          variant="elevated"
          @click="saveEngine()"
        >
          {{$t('category_engine_editor.actions.save_engine')}}

          {{ IS_VENDOR_PANEL ? " [Marketplace Owner]" : "" }}
        </v-btn>
      </s-widget-buttons>
    </v-fade-transition>
  </v-card-text>
</template>

<script>
import UChipTag from "../../../ui/chip/tag/UChipTag.vue";
import BCategoryInput from "../input/BCategoryInput.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import SWidgetHeader from "../../../ui/widget/header/SWidgetHeader.vue";
import { BackofficeLocalStorages } from "@selldone/core-js/helper/local-storage/BackofficeLocalStorages";
import BCategoryEnginePreview from "@selldone/components-vue/backoffice/category/engine/preview/BCategoryEnginePreview.vue";

export default {
  name: "BCategoryEngineEditor",
  components: {
    BCategoryEnginePreview,
    SWidgetHeader,
    SWidgetButtons,
    BCategoryInput,
    UChipTag,
  },
  emits: ["edit-engine", "edit-filters"],
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

    busy_auto: false,
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
            this.$emit("edit-filters", data.filters);

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

    autoAddSubCategories() {
      this.busy_auto = true;

      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? null
            : window.API.GET_CATEGORY_ALL_SUB_CATEGORIES(
                this.shop.id,
                this.category.id,
              ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              "All sub-categories have been successfully added.",
            );

            this.engine_categories.push(...data.ids);
            this.engine_categories = this.engine_categories.unique().limit(32);
            this.engine_changed = true;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_auto = false;
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
