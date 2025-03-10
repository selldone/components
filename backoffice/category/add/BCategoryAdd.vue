<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-card flat>
    <v-card-title v-if="!hideTopBar">
      <b-category-add-header
        key="header"
        v-model:tab="tab"
        :category="category"
        :shop="shop"
        :vendor="vendor"
        @back="back"
      >
      </b-category-add-header>
    </v-card-title>
    <!-- ███████████████████████████ Engine ███████████████████████████ -->
    <template v-if="tab === 'engine'">
      <b-category-engine-editor
        :category="category"
        :shop="shop"
        @edit-engine="(_engine) => (category.engine = _engine)"
      ></b-category-engine-editor>
    </template>

    <!-- ███████████████████████████ Setting ███████████████████████████ -->
    <template v-if="tab === 'setting'">
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
            :title="
              category
                ? $t('add_category.title_edit')
                : $t('add_category.title_update')
            "
            icon="tune"
          ></u-widget-header>

          <v-list-subheader>
            {{ $t("add_category.config.subtitle") }}
          </v-list-subheader>

          <v-text-field
            v-model="title"
            :counter="24"
            :error-messages="
              !title ? $t('add_category.title_input_error') : null
            "
            :label="$t('add_category.title_input')"
            placeholder="Enter category title, e.g. 'Shoes', 'Clothing', etc."
            variant="underlined"
            @blur="
              () => {
                if (!name) name = Slugify.apply(title);
              }
            "
          >
            <template v-slot:append-inner>
              <b-translation-button-category
                v-if="category?.id"
                :category="category"
                :label="$t('add_category.title_input')"
                :shop="shop"
                translation-key="title"
              ></b-translation-button-category>

              <v-btn
                class="margin-n7px"
                color="#fafafa"
                rounded
                variant="flat"
                @click="star = !star"
              >
                <v-icon :color="star ? '#FFA000' : 'gray'">
                  {{ star ? "star" : "star_border" }}
                </v-icon>
                {{ $t("add_category.star") }}
              </v-btn>
            </template>
          </v-text-field>

          <v-btn
            class="tnt my-2"
            color="primary"
            height="auto"
            min-height="36"
            variant="text"
            @click="edit_name = !edit_name"
          >
            <v-icon class="me-1">link</v-icon>
            <div class="text-wrap text-start py-1">
              <b>{{ $t("global.actions.edit") }}</b> :
              {{ ShopURLs.MainShopUrl(shop) }}/{{ name }}-category
            </div>
          </v-btn>
          <v-expand-transition>
            <div v-if="edit_name">
              <v-text-field
                v-model="name"
                :counter="24"
                :error-messages="
                  !valid_name ? $t('add_category.name_input_error') : null
                "
                :label="$t('add_category.name_input')"
                class="ma-2"
                suffix="-category"
                variant="underlined"
              />
            </div>
          </v-expand-transition>

          <v-textarea
            v-model="description"
            :label="$t('add_category.description_input')"
            :messages="$t('add_category.description_input_message')"
            auto-grow
            rows="2"
            variant="underlined"
          >
            <template v-slot:append-inner>
              <b-translation-button-category
                v-if="category?.id"
                :category="category"
                :label="$t('add_category.description_input')"
                :shop="shop"
                translation-key="description"
              ></b-translation-button-category>
            </template>
          </v-textarea>

          <!-- Image -->

          <s-image-uploader
            v-if="category && category.id"
            :image="getShopImagePath(icon)"
            :label="$t('add_category.image_input')"
            :server="
              IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.POST_MY_VENDOR_UPLOAD_CATEGORY_IMAGE(
                    vendor.id,
                    category.id,
                  )
                : window.API.POST_UPLOAD_CATEGORY_IMAGE(shop.id, category.id)
            "
            auto-compact
            max-file-size="2MB"
            @new-path="handleProcessFile"
          >
          </s-image-uploader>

          <v-file-input
            v-else
            v-model="selected_file"
            :label="$t('add_category.image_input')"
            :placeholder="$t('add_category.image_input_placeholder')"
            accept="image/*"
            append-inner-icon="attach_file"
            class="mt-5"
            clearable
            color="primary"
            prepend-icon=""
            variant="underlined"
          />

          <hr class="my-5" />
          <!-- Parent folder -->
          <template v-if="parentFolder">
            <u-widget-header
              :title="$t('add_category.parent_input')"
              icon="account_tree"
            ></u-widget-header>
            <v-list-subheader>
              {{ $t("add_category.parent.subtitle") }}
            </v-list-subheader>
            <div class="my-2 d-flex align-center">
              <circle-image
                :size="36"
                :src="ShopCategoryHelper.GetCategoryIconById(parentFolder.id)"
                class="me-2 avatar-gradient -thin -category"
                scale-on-hover
              />
              <div>
                <b class="text-subtitle-2">{{ parentFolder.title }}</b>
                <p class="small">{{ parentFolder.description }}</p>
              </div>
            </div>
          </template>
          <b-category-input
            v-model="parent_id"
            :label="$t('add_category.parent_input')"
            :messages="parent_id ? '' : $t('add_category.parent_input_message')"
            class="mb-5"
            clearable
          >
          </b-category-input>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn color="default" size="x-large" variant="flat" @click="back()">
            <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
            {{ $t("add_category.back_action") }}
          </v-btn>

          <v-btn
            v-if="category"
            :disabled="!canConfirm"
            :loading="busy"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="editCategory()"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save_changes") }}
          </v-btn>

          <v-btn
            v-else
            :disabled="!canConfirm"
            :loading="busy"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addCategory()"
          >
            <v-icon start>add</v-icon>

            {{ $t("add_category.add_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </template>

    <!-- ███████████████████████████ Filter ███████████████████████████ -->

    <b-category-filter-editor
      v-if="tab === 'filter' && category"
      :category="category"
      :shop="shop"
    >
    </b-category-filter-editor>

    <!-- ███████████████████████████ Template ███████████████████████████ -->

    <template v-if="tab === 'template' && category">
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
            :add-caption="
              page
                ? $t('add_category.template.edit_page')
                : $t('add_category.template.Pages_list')
            "
            :add-icon="page ? 'edit' : 'add_box'"
            :to="
              page
                ? { name: 'BPageLandingEditor', params: { page_id: page.id } }
                : { name: 'BPageShopPagesLandings' }
            "
            add-text
            icon="layers"
            :title="$t('add_category.template.title')"
          ></u-widget-header>

          <v-list-subheader>
            {{ $t("add_category.template.subtitle") }}
          </v-list-subheader>

          <b-page-input
            v-model="page"
            :shop="shop"
            background-color="transparent"
            clearable
            :label="$t('global.commons.page')"
          ></b-page-input>
        </div>
        <v-expand-transition>
          <div v-if="page">
            <div class="widget-box mb-5">
              <l-augment-form
                v-model="augment"
                :loading="busy_load"
                @change="changed = true"
              ></l-augment-form>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions>
        <v-expand-transition>
          <div
            v-if="page?.id !== category.page_id || changed"
            class="widget-buttons"
          >
            <v-btn
              :loading="busy"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="editCategory"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-expand-transition>
      </v-card-actions>
    </template>

    <!-- ███████████████████████████ Critical ███████████████████████████ -->

    <template v-if="tab === 'critical' && category">
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('add_category.critical_zone.title')"
            icon="warning_amber"
          >
          </u-widget-header>
          <v-list-subheader>
            <div
              v-html="
                $t('add_category.critical_zone.subtitle', {
                  parent: parentFolder
                    ? parentFolder.title
                    : $t('global.commons.home'),
                })
              "
            ></div>
          </v-list-subheader>

          <u-smart-verify
            v-model="accept_delete"
            color="red"
            false-gray
            :true-description="
              $t('add_category.critical_zone.accept_delete.true_description')
            "
            :true-title="
              $t('add_category.critical_zone.accept_delete.true_title')
            "
          ></u-smart-verify>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :disabled="!accept_delete"
            :loading="busy_delete"
            color="red"
            size="x-large"
            variant="elevated"
            @click="deleteCategoryDialog()"
          >
            <v-icon class="me-1">delete</v-icon>
            {{ $t("add_category.menu.delete") }}
          </v-btn>
        </div>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script lang="ts">
import BCategoryFilterEditor from "../../category/filter/BCategoryFilterEditor.vue";
import CircleImage from "../../../ui/image/CircleImage.vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import BCategoryInput from "../../category/input/BCategoryInput.vue";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import LAugmentForm from "@selldone/page-builder/components/augment/form/LAugmentForm.vue";
import BPageInput from "../../page/input/BPageInput.vue";
import BTranslationButtonCategory from "../../translation/button/category/BTranslationButtonCategory.vue";
import UWidgetHeader from "../../../ui/widget/header/UWidgetHeader.vue";
import BCategoryAddHeader from "../../category/add/header/BCategoryAddHeader.vue";
import BCategoryEngineEditor from "@selldone/components-vue/backoffice/category/engine/BCategoryEngineEditor.vue";
import { ShopURLs } from "@selldone/core-js/helper";
import { ShopCategoryHelper } from "@selldone/core-js/helper/category/ShopCategoryHelper.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";

export default {
  name: "BCategoryAdd",
  mixins: [],
  components: {
    BCategoryEngineEditor,

    BCategoryAddHeader,
    UWidgetHeader,
    BTranslationButtonCategory,
    BPageInput,
    LAugmentForm,
    USmartVerify,
    BCategoryInput,
    SImageUploader,
    CircleImage,
    BCategoryFilterEditor,
  },
  emits: ["add", "edit", "delete", "back"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    category: {
      required: false,
      type: Object,
    },

    categories: {
      required: false,
      type: Array,
    },
    parentFolder: {
      // Custom set parent!
      required: false,
    },
    hideTopBar: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    ShopURLs: ShopURLs,
    Slugify: Slugify,

    tab: "setting",

    profile_pic: [],

    title: "",

    name: "",

    icon: null,

    description: "",

    star: true,

    parent_id: null,

    busy: false,
    busy_delete: false,

    selected_file: null,
    edit_name: false,

    accept_delete: false,

    //---------------------
    page: null,
    busy_save: null,
    augment: null,
    changed: false,

    busy_load: false,
  }),
  computed: {
    ShopCategoryHelper() {
      return ShopCategoryHelper;
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    valid_name() {
      return !!this.name;
    },

    canConfirm() {
      return this.valid_name && this.title;
    },
  },
  watch: {
    category() {
      this.assignData();
    },
    page(page) {
      this.loadArgumentStructure(page);
    },
  },
  created() {
    this.assignData();
  },
  mounted() {},

  methods: {
    findCategoryById(id) {
      return (
        this.categories &&
        this.categories.find((item) => {
          return item.id === id;
        })
      );
    },

    addCategory() {
      this.busy = true;

      let formData = new FormData();
      if (this.selected_file) formData.append("photo", this.selected_file);
      if (this.title) formData.append("title", this.title);
      if (this.description) formData.append("description", this.description);
      formData.append("star", this.star);
      if (this.parent_id) formData.append("parent_id", this.parent_id);
      if (this.name) formData.append("name", this.name);

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_CATEGORY(this.vendor.id)
            : window.API.POST_ADD_CATEGORY(this.shop.id),

          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            // Update prent childes:
            if (data.category.parent_id && !this.parentFolder) {
              const parent_item_in_list = this.findCategoryById(
                data.category.parent_id,
              );
              if (parent_item_in_list)
                this.AddOrUpdateItemByID(
                  parent_item_in_list.childes,
                  data.category,
                );
            } else {
            }

            NotificationService.showSuccessAlert(
              null,
              this.$t("add_category.notifications.add_success"),
            );
            //    data.category.parent = t.findCategoryById(t.parent_id);
            this.$emit("add", data.category);
            this.back();
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editCategory() {
      this.busy = true;

      const old_parent_id = this.category.parent_id;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_EDIT_CATEGORY(
                this.vendor.id,
                this.category.id,
              )
            : window.API.PUT_EDIT_CATEGORY(this.shop.id, this.category.id),
          {
            title: this.title,
            icon: this.icon,
            description: this.description,
            star: this.star,
            parent_id: this.parent_id,
            name: this.name,

            page_id: this.page?.id,
            augment: this.augment,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            // data.category.parent = t.findCategoryById(t.parent_id);
            // Update prent childes:
            if (old_parent_id !== data.category.parent_id) {
              // 1. (Add) Update new parent:
              const new_parent_item_in_list = this.findCategoryById(
                data.category.parent_id,
              );
              if (new_parent_item_in_list)
                this.AddOrUpdateItemByID(
                  new_parent_item_in_list.childes,
                  data.category,
                );
              // 2. (Remove) Update old parent:
              const old_parent_item_in_list =
                this.findCategoryById(old_parent_id);
              if (old_parent_item_in_list)
                this.DeleteItemByID(
                  old_parent_item_in_list.childes,
                  data.category.id,
                );
            }

            NotificationService.showSuccessAlert(
              null,
              this.$t("add_category.notifications.edit_success"),
            );
            this.$emit("edit", data.category);
            this.back();
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    deleteCategoryDialog() {
      NotificationService.openDangerAlert(
        this.$t("add_category.delete_alert.title"),
        this.$t("add_category.delete_alert.message", {
          title: this.category.title,
        }),
        this.$t("add_category.delete_alert.action"),
        () => {
          this.deleteCategory(this.category);
        },
      );
    },

    deleteCategory(category) {
      this.busy_delete = true;
      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_CATEGORY(this.vendor.id, category.id)
            : window.API.DELETE_CATEGORY(this.shop.id, category.id),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_category.notifications.delete_success", {
                title: category.title,
              }),
            );
            // Update prent childes:
            if (category.parent_id) {
              const parent = this.findCategoryById(category.parent_id);
              if (parent && parent.childes)
                this.DeleteItemByID(parent.childes, data.id);
            }
            if (this.categories) this.DeleteItemByID(this.categories, data.id);

            this.$emit("delete", category.id);
            this.back();
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },

    handleFilePondInit: function () {
      console.log("FilePond has initialized");
    },
    back() {
      this.$emit("back");
    },

    handleProcessFile(path) {
      this.icon = path;
      this.category.icon = path;
    },

    assignData() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.category) {
        this.title = this.category.title;
        this.description = this.category.description;
        this.icon = this.category.icon;
        this.star = this.category.star;
        this.parent_id = this.category.parent_id;
        this.name = this.category.name;

        this.edit_name = this.name && this.name !== Slugify.apply(this.name);

        this.page = this.category.page;
        this.augment = Object.assign([], this.category.augment);

        if (this.category.page_id && !this.page) {
          this.page = { id: this.category.page_id };
        }
      } else {
        if (this.parentFolder) this.parent_id = this.parentFolder.id;
      }
    },

    loadArgumentStructure(page) {
      if (!page?.id) return;

      this.busy_load = true;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.page.getPageAugment(
            this.$route.params.vendor_id,
            page.id,
            this.augment,
          )
        : window.$backoffice.page.getPageAugment(
            this.shop.id,
            page.id,
            this.augment,
          )
      )

        .then(({ augment }) => {
          this.augment = augment;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_load = false;
        });
    },
  },
};
</script>

<style scoped></style>
