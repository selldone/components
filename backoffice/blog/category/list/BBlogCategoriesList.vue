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
  <!-- ████████████████████████ List ████████████████████████ -->

  <u-loading-progress v-if="busy_fetch"></u-loading-progress>

  <v-row no-gutters>
    <v-spacer></v-spacer>
    <v-text-field
      v-model="search"
      :label="$t('global.commons.search')"
      class="max-width-field"
      clearable
      hide-details
      prepend-inner-icon="search"
      single-line
      variant="plain"
    ></v-text-field>
  </v-row>

  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:options="options"
    v-model:page="page"
    :class="{ disabled: busy_fetch }"
    :headers="headers"
    :items="categories"
    :items-length="totalItems"
    :mobile="$vuetify.display.xs"
    :row-props="
      (_data) => {
        return { class: 'row-hover' };
      }
    "
    class="bg-transparent mt-4 min-height-60vh"
    density="compact"
    @click:row="(_, r) => showAddBlogCategoryDialog(r.item)"
  >
    <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
    <template v-slot:no-data>
      <div v-if="!busy_fetch" class="py-5 usn fadeIn">
        <img
          :src="require('../../../../assets/guides/blog-categories-empty.png')"
          class="m-3 op-0-3"
          width="85%"
        />
        <h2 class="text-h4 font-weight-thin">Create blog categories here...</h2>
      </div>
      <div v-else class="text-center px-3 py-5">
        <v-icon class="me-1">sentiment_dissatisfied</v-icon>
        {{ $t("global.commons.no_data") }}
      </div>
    </template>
    <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

    <template v-slot:item.icon="{ item }">
      <u-avatar-folder
        :src="item.icon?getShopImagePath(item.icon):undefined"
        class="my-1"
        is-amber
        side-icon="devices_fold"
        elevated
      >
      </u-avatar-folder>
    </template>

    <template v-slot:item.star="{ item }">
      <template v-if="item.star">
        <v-chip color="#111" pill size="x-small" variant="flat">
          <v-icon start>star</v-icon>

          {{ $t("global.commons.important") }}
        </v-chip>
      </template>
    </template>

    <template v-slot:item.category="{ item }">
      <div class="py-1 max-w-300 min-width-200">
        <div class="body-title">{{ item.category }}</div>
        <div>{{ item.description }}</div>
      </div>
    </template>

    <template v-slot:item.delete="{ item }">
      <v-btn
        :loading="busy_del === item.id"
        class="m-1"
        color="red"
        icon
        title="Remove category"
        variant="text"
        @click.stop="deleteCategory(item)"
      >
        <v-icon>close</v-icon>
      </v-btn>
    </template>

    <template v-slot:bottom>
      <v-pagination v-model="page" :length="pageCount" rounded />
    </template>
  </v-data-table-server>

  <!-- ████████████████████████ Add / edit Dialog ████████████████████████ -->

  <v-dialog
    v-model="dialog_add"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card v-if="dialog_pre">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">snippet_folder</v-icon>
        {{ $t("blog_category.add_dialog.title") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.general_config')"
            icon="tune"
          ></u-widget-header>
          <v-list-subheader>
            Improve your blog classification by adding categories and assigning
            articles accordingly. Utilize specific and comprehensive topics
            relevant to your business, rather than relying on generic titles.
          </v-list-subheader>

          <v-text-field
            v-model="category"
            :append-inner-icon="
              selected ? (force_edit ? 'lock_open' : 'lock') : undefined
            "
            :disabled="!!selected && !force_edit"
            :rules="[GlobalRules.required()]"
            label="Category"
            messages=" "
            placeholder="Enter category title here..."
            variant="underlined"
            @click:append-inner="force_edit = !force_edit"
          >
            <template v-slot:message>
              <u-smart-suggestion
                v-if="!selected"
                :samples="$tm('suggestions.blog_category.category')"
                class="mb-4"
                @select="
                  (v) => {
                    category = v;
                  }
                "
              ></u-smart-suggestion>
            </template>
          </v-text-field>

          <v-expand-transition>
            <div v-if="selected && force_edit">
              <v-list-item
                :subtitle="$t('blog_category.add_dialog.force_edit_msg')"
                :title="$t('blog_category.add_dialog.force_edit')"
                class="mb-7"
                prepend-icon="warning_amber"
              ></v-list-item>
            </div>
          </v-expand-transition>

          <v-text-field
            v-model="description"
            :rules="[GlobalRules.required()]"
            label="Description"
            messages=" "
            placeholder="Enter blog category description here..."
            variant="underlined"
          >
            <template v-slot:message>
              <u-smart-suggestion
                v-if="!selected"
                :samples="$tm('suggestions.blog_category.description')"
                class="mb-4"
                @select="
                  (v) => {
                    description = v;
                  }
                "
              ></u-smart-suggestion>
            </template>
          </v-text-field>

          <u-smart-toggle
            v-model="star"
            :true-description="$t('blog_category.add_dialog.star_msg')"
            :true-title="$t('blog_category.add_dialog.star')"
            class="my-3"
            color="primary"
            false-icon="star"
            true-icon="auto_awesome"
          ></u-smart-toggle>
        </div>

        <div v-if="selected" class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.image')"
            icon="photo_camera"
          ></u-widget-header>
          <v-list-subheader>
            Customize blog category image here.
          </v-list-subheader>
          <s-image-uploader
            :image="selected.icon ? getShopImagePath(selected.icon) : null"
            :server="
              window.API.POST_UPLOAD_SHOP_BLOG_CATEGORY_ICON(
                shop.id,
                selected.id,
              )
            "
            auto-compact
            label="Blog category cover"
            max-file-size="2MB"
            @new-path="(path) => (selected.icon = path)"
          >
          </s-image-uploader>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_add = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :disabled="!category"
            :loading="busy_set"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addCategory()"
          >
            <v-icon class="me-1" size="small"
              >{{ selected ? "edit" : "add" }}
            </v-icon>

            {{
              selected
                ? $t("blog_category.add_dialog.edit_action")
                : $t("blog_category.add_dialog.add_action")
            }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import threads from "@selldone/core-js/utils/thread/threads";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import UAvatarFolder from "../../../../ui/avatar/folder/UAvatarFolder.vue";

export default {
  name: "BBlogCategoriesList",
  components: {
    UAvatarFolder,
    SImageUploader,
    USmartSuggestion,
    USmartToggle,
  },
  props: {
    shop: {
      required: true,
    },
  },

  data: function () {
    return {
      dialog_add: false,
      dialog_pre: false,

      busy_set: false,

      categories: [],
      busy_fetch: false,

      headers: [
        { title: "", value: "icon", width: 100, align: "center" },

        {
          title: this.$t("global.commons.category"),
          align: "start",
          value: "category",
          sortable: true,
        },
        {
          title: this.$t("global.commons.star"),
          value: "star",
          align: "center",
          sortable: true,
        },

        {
          title: this.$t("global.commons.visits"),
          value: "visits",
          align: "center",
          sortable: true,
        },
        {
          title: this.$t("global.commons.articles"),
          value: "articles",
          align: "center",
          sortable: true,
        },
        { title: "", value: "delete" },
      ],

      //---------------
      force_edit: false,

      selected: null,
      category: "",
      description: "",
      star: false,
      icon: null,

      //---------------
      busy_del: false,

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      search: "",
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        const sort = sortBy[0];
        this.fetchCategories(page, sort?.key, sort?.order);
      },
      deep: true,
    },

    search: threads.debounceSearch(function () {
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;
      const sort = sortBy[0];
      this.fetchCategories(this.page, sort?.key, sort?.order);
    }),
  },

  created() {},

  methods: {
    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * 🛑 DO NOT CHANGE IT!
     * This function is called externally.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * @param selected
     */

    showAddBlogCategoryDialog(selected = null) {
      this.selected = selected;
      this.force_edit = false;

      if (selected) {
        this.category = selected.category;
        this.description = selected.description;
        this.star = selected.star;
        this.icon = selected.icon;
      } else {
        this.category = null;
        this.description = null;
        this.star = true;
        this.icon = null;
      }

      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.dialog_add = true;
        });
      });
    },
    fetchCategories(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      window.$backoffice.blog.categories
        .optimize(60)
        .cancellation(true)
        .list(this.shop.id, (page - 1) * this.itemsPerPage, this.itemsPerPage, {
          search: this.search,

          sortBy: sortBy,
          sortDesc: sortDesc,
        })

        .then(({ total, categories }) => {
          this.categories = categories;
          this.totalItems = total;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    addCategory() {
      this.busy_set = true;

      const pack = {
        category: this.category,
        description: this.description,
        star: this.star,
      };
      let promise;
      if (this.selected && this.force_edit) {
        promise = window.$backoffice.blog.categories.edit(
          this.shop.id,
          this.selected.id,
          pack,
        );
      } else {
        promise = window.$backoffice.blog.categories.add(this.shop.id, pack);
      }

      promise
        .then(({ category }) => {
          this.AddOrUpdateItemByID(this.categories, category, "id", false);
          this.dialog_add = false;

          if (this.selected) {
            NotificationService.showSuccessAlert(null, "Category updated successfully.");
          } else {
            this.totalItems++;
            NotificationService.showSuccessAlert(null, "Category added successfully.");
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    deleteCategory(category) {
      NotificationService.openDangerAlert(
        "Delete category",
        "Are you sure to delete selldone blog category?",
        "Yes, delete now",
        () => {
          this.busy_del = category.id;

          window.$backoffice.blog.categories
            .remove(this.shop.id, category.id)

            .then(({ id }) => {
              NotificationService.showSuccessAlert(null, "Category deleted successfully.");
              this.DeleteItemByID(this.categories, id);
              this.totalItems--;
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_del = null;
            });
        },
      );
    },
  },
};
</script>

<style scoped></style>
