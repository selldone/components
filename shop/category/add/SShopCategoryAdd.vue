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
      <s-shop-category-add-header
        key="header"
        :shop="shop"
        :vendor="vendor"
        :category="category"
        v-model:tab="tab"
        @back="back"
      >
      </s-shop-category-add-header>
    </v-card-title>

    <!-- ███████████████████████████ Setting ███████████████████████████ -->
    <template v-if="tab === 'setting'">
      <v-card-text>
        <div class="widget-box mb-5">
          <s-widget-header
            :title="
              category
                ? $t('add_category.title_edit')
                : $t('add_category.title_update')
            "
            icon="tune"
          ></s-widget-header>

          <v-list-subheader>
            Categories simplify product management for you and expedite product
            searches for your customers in your store.
          </v-list-subheader>

          <v-text-field
            v-model="title"
            :counter="24"
            :label="$t('add_category.title_input')"
            placeholder="Enter category title, e.g. 'Shoes', 'Clothing', etc."
            :error-messages="
              !title ? $t('add_category.title_input_error') : null
            "
            @blur="
              () => {
                if (!edit_name || !name) name = slugify(title);
              }
            "
            variant="underlined"
          >
            <template v-slot:append-inner>
              <s-translations-button-category
                v-if="category?.id"
                :shop="shop"
                :category="category"
                translation-key="title"
                :label="$t('add_category.title_input')"
              ></s-translations-button-category>

              <v-btn
                class="margin-n7px"
                rounded
                variant="flat"
                color="#fafafa"
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
            @click="edit_name = !edit_name"
            class="tnt my-2"
            color="primary"
            variant="text"
          >
            <v-icon class="me-1">link</v-icon>
            {{ $t("global.actions.edit") }} : {{ getShopMainUrl(shop) }}/{{
              name
            }}-category
          </v-btn>
          <v-expand-transition>
            <div v-if="edit_name">
              <v-text-field
                v-model="name"
                :counter="24"
                class="ma-2"
                :label="$t('add_category.name_input')"
                :error-messages="
                  !valid_name ? $t('add_category.name_input_error') : null
                "
                suffix="-category"
                variant="underlined"
              />
            </div>
          </v-expand-transition>

          <v-textarea
            v-model="description"
            :label="$t('add_category.description_input')"
            :messages="$t('add_category.description_input_message')"
            rows="2"
            auto-grow
            variant="underlined"
          >
            <template v-slot:append-inner>
              <s-translations-button-category
                v-if="category?.id"
                :shop="shop"
                :category="category"
                translation-key="description"
                :label="$t('add_category.description_input')"
              ></s-translations-button-category>
            </template>
          </v-textarea>

          <!-- Image -->

          <s-image-uploader
            v-if="category && category.id"
            :label="$t('add_category.image_input')"
            :server="
              IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.POST_MY_VENDOR_UPLOAD_CATEGORY_IMAGE(
                    vendor.id,
                    category.id,
                  )
                : window.API.POST_UPLOAD_CATEGORY_IMAGE(shop.id, category.id)
            "
            max-file-size="2MB"
            :image="getShopImagePath(icon)"
            @new-path="handleProcessFile"
            auto-compact
          >
          </s-image-uploader>

          <v-file-input
            v-else
            v-model="selected_file"
            color="primary"
            class="mt-5"
            :label="$t('add_category.image_input')"
            :placeholder="$t('add_category.image_input_placeholder')"
            append-icon="attach_file"
            prepend-icon=""
            accept="image/*"
            variant="underlined"
            clearable
          />

          <!-- Parent folder -->
          <div v-if="parentFolder" class="text-start">
            <s-widget-header
              :title="$t('add_category.parent_input')"
              icon="account_tree"
            ></s-widget-header>
            <v-list-subheader>
              This category will be visible under its parent category. Products
              that do not have a parent category will be displayed in the root
              category.
            </v-list-subheader>
            <div class="m-2">
              <circle-image
                :src="getCategoryIcon(parentFolder.id)"
                :size="32"
                class="m-2 avatar-gradient -thin -category"
                scale-on-hover
              />
              <b>{{ parentFolder.title }}</b>
              <p>{{ parentFolder.description }}</p>
            </div>
          </div>
          <b-shop-category-input
            v-model="parent_id"
            class="mb-5"
            :label="$t('add_category.parent_input')"
            clearable
            :messages="parent_id ? '' : $t('add_category.parent_input_message')"
          >
          </b-shop-category-input>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" color="default" variant="flat" @click="back()">
            <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
            {{ $t("add_category.back_action") }}
          </v-btn>

          <v-btn
            v-if="category"
            size="x-large"
            color="primary"
            :disabled="!canConfirm"
            @click="editCategory()"
            :loading="busy"
            variant="elevated"
          >
            <v-icon class="me-1">save</v-icon>
            {{ $t("global.actions.save_changes") }}
          </v-btn>

          <v-btn
            v-else
            size="x-large"
            color="primary"
            :disabled="!canConfirm"
            @click="addCategory()"
            :loading="busy"
            variant="elevated"
          >
            <v-icon class="me-1">add</v-icon>

            {{ $t("add_category.add_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </template>

    <!-- ███████████████████████████ Filter ███████████████████████████ -->

    <s-shop-category-filter
      v-if="tab === 'filter' && category"
      :shop="shop"
      :category="category"
    >
    </s-shop-category-filter>

    <!-- ███████████████████████████ Template ███████████████████████████ -->

    <template v-if="tab === 'template' && category">
      <v-card-text>
        <div class="widget-box mb-5">
          <s-widget-header
            title="Template"
            icon="layers"
            :add-caption="page ? 'Edit Page' : 'List of Pages'"
            add-text
            :add-icon="page ? 'edit' : 'add_box'"
            :to="
              page
                ? { name: 'ShopPageBuilderPage', params: { page_id: page.id } }
                : { name: 'PagesManagement_CustomPages' }
            "
          ></s-widget-header>

          <v-list-subheader>
            You have the capability to overlay a page on your category page for
            improved display. The best strategy involves crafting pages with a
            transparent background and designing 1 to 2 sections specific to
            each category. Subsequently, you can link a single page to several
            categories, utilizing dynamic content to individualize each
            category.
          </v-list-subheader>

          <s-shop-page-input
            label="Page"
            v-model="page"
            :shop="shop"
            clearable
            background-color="transparent"
          ></s-shop-page-input>

          <v-expand-transition>
            <div v-if="page">
              <s-backoffice-page-augment-form
                v-model="augment"
                class="my-10"
                @change="changed = true"
                :loading="busy_load"
              ></s-backoffice-page-augment-form>
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-expand-transition>
          <div
            v-if="page?.id !== category.page_id || changed"
            class="widget-buttons"
          >
            <v-btn
              size="x-large"
              color="primary"
              variant="elevated"
              :loading="busy"
              @click="editCategory"
            >
              <v-icon class="me-1">save</v-icon>
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
          <s-widget-header
            icon="warning_amber"
            :title="$t('global.commons.critical_zone')"
          >
          </s-widget-header>
          <v-list-subheader>
            <div>
              Removing a category will move its subcategories and products to
              the parent directory
              <b>📁 {{ parentFolder ? parentFolder.title : "Home" }}</b
              >. To manage categories not present in the product list, navigate
              to Shop > Categories tab.
            </div>
          </v-list-subheader>

          <s-smart-check-verify-action
            v-model="accept_delete"
            color="red"
            true-title="Confirm Remove Category"
            true-description="I want to remove this category."
            false-gray
          ></s-smart-check-verify-action>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            @click="deleteCategoryDialog()"
            size="x-large"
            variant="elevated"
            color="red"
            :loading="busy_delete"
            :disabled="!accept_delete"
          >
            <v-icon class="me-1">delete</v-icon>
            {{ $t("add_category.menu.delete") }}
          </v-btn>
        </div>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script>
import SShopCategoryFilter from "@components/shop/category/filter/SShopCategoryFilter.vue";
import CircleImage from "@components/ui/image/CircleImage.vue";
import SImageUploader from "@components/uploader/SImageUploader.vue";
import BShopCategoryInput from "../../../backoffice/shop/category/input/BShopCategoryInput.vue";
import SSmartCheckVerifyAction from "@components/smart/SSmartCheckVerifyAction.vue";
import SBackofficePageAugmentForm from "../../../backoffice/augment/SBackofficePageAugmentForm.vue";
import SShopPageInput from "@components/shop/page/input/SShopPageInput.vue";
import STranslationsButtonCategory from "@components/translation/STranslationsButtonCategory.vue";
import SWidgetHeader from "@components/ui/widget/header/SWidgetHeader.vue";
import SShopCategoryAddHeader from "@components/shop/category/add/header/SShopCategoryAddHeader.vue";

export default {
  name: "SShopCategoryAdd",
  components: {
    SShopCategoryAddHeader,
    SWidgetHeader,
    STranslationsButtonCategory,
    SShopPageInput,
    SBackofficePageAugmentForm,
    SSmartCheckVerifyAction,
    BShopCategoryInput,
    SImageUploader,
    CircleImage,
    SShopCategoryFilter,
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

    selected_file: [],
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
      if (this.selected_file?.length)
        formData.append("photo", this.selected_file[0]);
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
            this.showErrorAlert(null, data.error_msg);
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

            this.showSuccessAlert(
              null,
              this.$t("add_category.notifications.add_success"),
            );
            //    data.category.parent = t.findCategoryById(t.parent_id);
            this.$emit("add", data.category);
            this.back();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showErrorAlert(null, data.error_msg);
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

            this.showSuccessAlert(
              null,
              this.$t("add_category.notifications.edit_success"),
            );
            this.$emit("edit", data.category);
            this.back();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    deleteCategoryDialog() {
      this.openDangerAlert(
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
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
          this.showLaravelError(error);
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

        this.edit_name = this.name && this.name !== this.slugify(this.name);

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
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_load = false;
        });
    },
  },
};
</script>

<style scoped></style>
