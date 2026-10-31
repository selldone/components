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
  <v-card-text
    :class="
      modern
        ? 'b-category-engine-editor b-category-engine-editor--modern sd-modern-content text-start'
        : undefined
    "
  >
    <div :class="modern ? 'b-category-engine-editor__layout' : undefined">
      <div
        :class="
          modern
            ? 'b-category-engine-editor__fields sd-modern-widget'
            : 'widget-box mb-5 pb-5'
        "
      >
        <u-widget-header
          icon="shelves"
          :title="$t('category_engine_editor.title')"
          :class="{ 'sd-modern-form-header': modern }"
        ></u-widget-header>
        <v-list-subheader :class="{ 'b-category-engine-editor__help': modern }">
          {{ $t("category_engine_editor.subtitle") }}
        </v-list-subheader>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Preview ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <b-category-engine-preview
          v-if="!modern"
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
          :class="{ 'b-category-engine-editor__multiple': modern }"
          clearable
          :label="$t('category_engine_editor.inputs.categories.label')"
          :messages="$t('category_engine_editor.inputs.categories.messages')"
          multiple
          persistent-placeholder
          :placeholder="
            $t('category_engine_editor.inputs.categories.placeholder')
          "
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
          :class="{ 'b-category-engine-editor__multiple': modern }"
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

        <aside v-if="modern" class="b-category-engine-editor__matching">
          <h3>{{ $t("category_engine_editor.matching.title") }}</h3>
          <p>{{ $t("category_engine_editor.matching." + matchingRule) }}</p>
        </aside>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Auto Add All Sub Categories ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <v-list-subheader :class="{ 'b-category-engine-editor__help': modern }">
          {{ $t("category_engine_editor.aut_add_sub_categories_tips") }}
        </v-list-subheader>
        <div>
          <v-btn
            :loading="busy_auto"
            class="tnt"
            :class="{
              'sd-modern-button b-category-engine-editor__auto': modern,
            }"
            prepend-icon="flash_auto"
            :variant="modern ? 'outlined' : 'elevated'"
            @click="autoAddSubCategories"
          >
            {{ $t("category_engine_editor.actions.auto_add_subcategories") }}
          </v-btn>
        </div>
        <footer
          v-if="embedded"
          class="b-category-engine-editor__inline-actions sd-modern-actions"
        >
          <p class="sd-modern-subtitle">
            {{ $t("category_engine_editor.save_scope") }}
          </p>
          <v-btn
            :disabled="
              IS_VENDOR_PANEL || !engine_changed || busy_engine || busy_auto
            "
            :loading="busy_engine"
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            prepend-icon="save"
            variant="elevated"
            @click="saveEngine()"
            >{{ $t("category_engine_editor.actions.save_engine") }}</v-btn
          >
        </footer>
      </div>
      <div
        v-if="modern"
        class="b-category-engine-editor__preview sd-modern-widget"
      >
        <h2>{{ $t("category_engine_editor.preview.title") }}</h2>
        <b-category-engine-explanation
          :shop="shop"
          :category="category"
          :has-sources="
            Boolean(engine_categories?.length || engine_tags?.length)
          "
        />
      </div>
    </div>

    <v-fade-transition>
      <s-widget-buttons
        v-if="!embedded && (modern || engine_changed)"
        :class="{ 'sd-modern-form-actions': modern }"
        auto-fixed-position
      >
        <v-btn
          v-if="modern"
          :disabled="busy_engine || busy_auto"
          class="sd-modern-button"
          variant="outlined"
          @click="cancelEngine"
        >
          {{ $t("global.actions.cancel") }}
        </v-btn>
        <v-btn
          :disabled="IS_VENDOR_PANEL || (modern && !engine_changed)"
          :loading="busy_engine"
          :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
          color="primary"
          prepend-icon="save"
          :size="modern ? undefined : 'x-large'"
          variant="elevated"
          @click="saveEngine()"
        >
          {{ $t("category_engine_editor.actions.save_engine") }}

          {{ IS_VENDOR_PANEL ? " [Marketplace Owner]" : "" }}
        </v-btn>
      </s-widget-buttons>
    </v-fade-transition>
  </v-card-text>
</template>

<script lang="ts">
import UChipTag from "../../../ui/chip/tag/UChipTag.vue";
import BCategoryInput from "../input/BCategoryInput.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import UWidgetHeader from "../../../ui/widget/header/UWidgetHeader.vue";
import { BackofficeLocalStorages } from "@selldone/core-js/helper/local-storage/BackofficeLocalStorages";
import BCategoryEnginePreview from "@selldone/components-vue/backoffice/category/engine/preview/BCategoryEnginePreview.vue";
import BCategoryEngineExplanation from "./preview/BCategoryEngineExplanation.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BCategoryEngineEditor",
  mixins: [],
  components: {
    BCategoryEnginePreview,
    BCategoryEngineExplanation,
    UWidgetHeader,
    SWidgetButtons,
    BCategoryInput,
    UChipTag,
  },
  emits: ["edit-engine", "edit-filters", "cancel"],
  props: {
    modern: Boolean,
    embedded: Boolean,
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
    matchingRule() {
      const categories = Boolean(this.engine_categories?.length);
      const tags = Boolean(this.engine_tags?.length);
      return categories && tags
        ? "combined"
        : categories
          ? "categories"
          : tags
            ? "tags"
            : "none";
    },
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
        // The modern editor keeps a local draft until the explicit Save action.
        this.engine_categories = this.modern
          ? Array.isArray(this.category.engine.categories)
            ? [...this.category.engine.categories]
            : []
          : this.category.engine.categories;
        this.engine_tags = this.modern
          ? Array.isArray(this.category.engine.tags)
            ? [...this.category.engine.tags]
            : []
          : this.category.engine.tags;
      }
    },

    cancelEngine() {
      this.engine_categories = Array.isArray(this.category.engine?.categories)
        ? [...this.category.engine.categories]
        : [];
      this.engine_tags = Array.isArray(this.category.engine?.tags)
        ? [...this.category.engine.tags]
        : [];
      this.engine_changed = false;
      this.$emit("cancel");
    },

    saveEngine() {
      if (this.busy_engine || this.busy_auto) return;
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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              "Category engine has been successfully updated.",
            );
            this.$emit("edit-engine", data.engine);
            this.$emit("edit-filters", data.filters);

            this.engine_changed = false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              "All sub-categories have been successfully added.",
            );

            this.engine_categories.push(...data.ids);
            this.engine_categories = this.engine_categories.unique().limit(32);
            this.engine_changed = true;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_auto = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-category-engine-editor--modern {
  padding: 0;
  max-width: 808px;

  .b-category-engine-editor__inline-actions {
    margin-top: 24px;
    justify-content: space-between;
    gap: 12px 20px;
    .sd-modern-subtitle {
      flex: 1 1 240px;
      margin: 0;
      font-size: 13px;
      line-height: 20px;
    }
  }

  .b-category-engine-editor__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 19px;
  }

  .b-category-engine-editor__fields,
  .b-category-engine-editor__preview {
    min-width: 0;
    padding: 23px;
    border-radius: 15px;
  }

  :deep(.sd-modern-form-header h2) {
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
  }

  .b-category-engine-editor__help {
    height: auto;
    min-height: 0;
    padding-inline: 0;
    margin-block: 0 18px;
    color: var(--sd-modern-muted);
    font-size: 14px;
    line-height: 23px;
    white-space: normal;

    :deep(.v-list-subheader__text) {
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
    }
  }

  .b-category-engine-editor__multiple {
    min-width: 0;
    font-family: inherit;

    :deep(.v-field__input) {
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 24px;
      letter-spacing: 0;
    }

    :deep(.v-field-label) {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0;
    }

    :deep(.v-field-label--floating) {
      font-size: 12px;
      line-height: 18px;
    }
  }

  .b-category-engine-editor__auto {
    min-height: 36px;
    font-size: 12px;
  }

  .b-category-engine-editor__matching {
    margin-block: 16px 20px;
    padding: 12px 16px;
    border-radius: 10px;
    background: var(--sd-modern-inset);
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 23px;
    }
    p {
      margin: 4px 0 0;
      font-size: 14px;
      line-height: 23px;
    }
  }

  .b-category-engine-editor__preview > h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
  }

  @media (max-width: 760px) {
    .b-category-engine-editor__fields,
    .b-category-engine-editor__preview {
      padding: 19px;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
