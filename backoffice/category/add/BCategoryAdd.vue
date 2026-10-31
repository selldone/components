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
  <v-card flat class="b-category-add text-start">
    <b-category-add-header
      key="header"
      v-model:tab="tab"
      :category="category"
      :shop="shop"
      :vendor="vendor"
      v-if="!hideTopBar"
      @back="back"
    >
    </b-category-add-header>
    <!-- ███████████████████████████ Engine ███████████████████████████ -->
    <template v-if="tab === 'engine'">
      <div class="b-category-add__engine sd-modern-canvas text-start">
        <b-category-engine-editor
          v-if="category.engine !== undefined"
          :category="category"
          :shop="shop"
          modern
          embedded
          @edit-engine="(_engine) => (category.engine = _engine)"
          @edit-filters="category.filters = $event"
        ></b-category-engine-editor>
        <div
          v-else
          class="b-category-add__content b-category-add__engine-loading sd-modern-notice"
          :role="engine_load_error ? 'alert' : 'status'"
        >
          <v-icon size="20" aria-hidden="true">info_outline</v-icon>
          <div class="sd-modern-notice__content">
            {{
              $t(
                engine_load_error
                  ? "add_category.modern.engine_load_error"
                  : "global.commons.loading",
              )
            }}
          </div>
          <v-btn
            v-if="engine_load_error"
            class="sd-modern-button"
            variant="text"
            @click="loadEngine"
            >{{ $t("global.actions.refresh") }}</v-btn
          >
        </div>
      </div>
    </template>

    <!-- ███████████████████████████ Setting ███████████████████████████ -->
    <v-card-text
      v-show="tab === 'setting'"
      class="b-category-add__body sd-modern-canvas"
    >
      <header
        v-if="hideTopBar"
        class="b-category-add__embedded-heading b-category-add__content"
      >
        <v-icon size="22" aria-hidden="true">tune</v-icon>
        <div>
          <h1>
            {{
              $t(
                category
                  ? "add_category.title_edit"
                  : "add_category.title_update",
              )
            }}
          </h1>
          <p class="sd-modern-subtitle">
            {{ $t("add_category.modern.page_header_subtitle") }}
          </p>
        </div>
      </header>
      <div class="b-category-add__content b-category-add__grid">
        <section class="sd-modern-widget b-category-add__details">
          <header class="b-category-add__section-heading">
            <v-icon aria-hidden="true">notes</v-icon>
            <div>
              <h2>{{ $t("add_category.modern.details_title") }}</h2>
              <p class="sd-modern-subtitle">
                {{ $t("add_category.modern.details_subtitle") }}
              </p>
            </div>
          </header>

          <v-text-field
            v-model="title"
            :counter="24"
            :error-messages="
              !title ? $t('add_category.title_input_error') : null
            "
            :label="$t('add_category.title_input')"
            :placeholder="$t('add_category.modern.title_placeholder')"
            class="sd-modern-underlined-field"
            required
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
                class="b-category-add__star"
                :aria-pressed="star"
                :aria-label="$t('add_category.star')"
                variant="text"
                type="button"
                @click="star = !star"
              >
                <v-icon
                  :color="star ? 'warning' : undefined"
                  size="18"
                  aria-hidden="true"
                >
                  {{ star ? "star" : "star_border" }}
                </v-icon>
                <span>{{ $t("add_category.star") }}</span>
              </v-btn>
            </template>
          </v-text-field>

          <v-btn
            class="sd-modern-button sd-modern-button--inline b-category-add__url"
            color="primary"
            variant="text"
            :aria-expanded="edit_name"
            :aria-label="`${$t('global.actions.edit')}: ${ShopURLs.MainShopUrl(shop)}/${name}-category`"
            @click="edit_name = !edit_name"
          >
            <v-icon size="16" aria-hidden="true">link</v-icon>
            <span class="b-category-add__url-value" dir="ltr"
              >{{ ShopURLs.MainShopUrl(shop) }}/{{ name }}-category</span
            >
            <v-icon size="16" aria-hidden="true">edit</v-icon>
            <v-tooltip
              activator="parent"
              :text="`${ShopURLs.MainShopUrl(shop)}/${name}-category`"
              location="top"
              :open-on-focus="true"
              content-class="sd-modern-tooltip text-start"
            />
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
                class="sd-modern-underlined-field mt-2"
                suffix="-category"
                variant="underlined"
              />
            </div>
          </v-expand-transition>

          <v-textarea
            v-model="description"
            class="sd-modern-underlined-field b-category-add__description"
            :label="$t('add_category.description_input')"
            :messages="$t('add_category.description_input_message')"
            auto-grow
            persistent-placeholder
            rows="3"
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
        </section>

        <!-- Image -->
        <section class="sd-modern-widget b-category-add__image">
          <header class="b-category-add__section-heading">
            <v-icon aria-hidden="true">image</v-icon>
            <div>
              <h2>{{ $t("add_category.image_input") }}</h2>
              <p class="sd-modern-subtitle">
                {{ $t("add_category.modern.image_subtitle") }}
              </p>
            </div>
          </header>

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
            dense
            modern
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
            class="sd-modern-underlined-field"
            clearable
            color="primary"
            prepend-icon=""
            variant="underlined"
          />
          <p
            v-if="category?.id"
            class="sd-modern-subtitle b-category-add__image-limit"
          >
            {{ $t("add_category.modern.image_size") }}
          </p>
        </section>

        <!-- Parent folder -->
        <section class="sd-modern-widget b-category-add__parent">
          <header class="b-category-add__section-heading">
            <v-icon aria-hidden="true">account_tree</v-icon>
            <div>
              <h2>{{ $t("add_category.parent_input") }}</h2>
              <p class="sd-modern-subtitle">
                {{ $t("add_category.modern.parent_subtitle") }}
              </p>
            </div>
          </header>
          <template v-if="parentFolder">
            <p class="sd-modern-subtitle">
              {{ $t("add_category.parent.subtitle") }}
            </p>
            <div class="b-category-add__parent-context">
              <circle-image
                :size="36"
                :src="ShopCategoryHelper.GetCategoryIconById(parentFolder.id)"
                class="me-2 avatar-gradient -thin -category"
                scale-on-hover
              />
              <div>
                <b>{{ parentFolder.title }}</b>
                <p class="sd-modern-subtitle">{{ parentFolder.description }}</p>
              </div>
            </div>
          </template>
          <div class="sd-modern-underlined-field b-category-add__parent-input">
            <b-category-input
              v-model="parent_id"
              :label="$t('add_category.parent_input')"
              :messages="
                parent_id ? '' : $t('add_category.parent_input_message')
              "
              clearable
            >
            </b-category-input>
          </div>
        </section>
      </div>
    </v-card-text>

    <v-card-actions
      v-show="tab === 'setting'"
      class="sd-modern-form-actions b-category-add__actions"
    >
      <div class="widget-buttons">
        <v-btn class="sd-modern-button" variant="text" @click="back()">
          <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
          {{ $t("add_category.back_action") }}
        </v-btn>

        <v-btn
          v-if="category"
          class="sd-modern-button sd-modern-button--primary"
          :disabled="!canConfirm || busy_save"
          :loading="busy"
          color="primary"
          variant="elevated"
          @click="editCategory()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>

        <v-btn
          v-else
          class="sd-modern-button sd-modern-button--primary"
          :disabled="!canConfirm"
          :loading="busy"
          color="primary"
          variant="elevated"
          @click="addCategory()"
        >
          <v-icon start>add</v-icon>

          {{ $t("add_category.add_action") }}
        </v-btn>
      </div>
    </v-card-actions>
    <!-- ███████████████████████████ Filter ███████████████████████████ -->

    <div
      v-if="tab === 'filter' && category"
      class="b-category-add__filter sd-modern-canvas text-start"
    >
      <b-category-filter-editor
        :category="category"
        :shop="shop"
        embedded
        @edit-filters="category.filters = $event"
      />
    </div>

    <!-- ███████████████████████████ Template ███████████████████████████ -->

    <template v-if="tab === 'template' && category">
      <v-card-text class="b-category-add__body sd-modern-canvas">
        <div class="b-category-add__content sd-modern-widget">
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
            class="sd-modern-form-header"
            :title="$t('add_category.template.title')"
          ></u-widget-header>

          <p class="sd-modern-subtitle mb-4">
            {{ $t("add_category.template.subtitle") }}
          </p>

          <b-page-input
            v-model="page"
            modern
            :shop="shop"
            background-color="transparent"
            clearable
            :label="$t('global.commons.page')"
            :disabled="busy_save"
          ></b-page-input>
        </div>
        <v-expand-transition>
          <div v-if="page">
            <div class="b-category-add__content sd-modern-widget mt-4">
              <l-augment-form
                v-model="augment"
                :loading="busy_load || busy_save"
                @change="changed = true"
              ></l-augment-form>
            </div>
          </div>
        </v-expand-transition>
        <div
          v-if="augment_load_error"
          class="b-category-add__content sd-modern-notice mt-4"
          role="alert"
        >
          <v-icon size="20" aria-hidden="true">info_outline</v-icon>
          <div class="sd-modern-notice__content">
            {{ $t("add_category.modern.template_load_error") }}
          </div>
          <v-btn
            class="sd-modern-button"
            variant="text"
            @click="loadArgumentStructure(page)"
            >{{ $t("global.actions.refresh") }}</v-btn
          >
        </div>
        <div
          class="b-category-add__content b-category-add__inline-actions sd-modern-actions"
        >
          <p class="sd-modern-subtitle">
            {{ $t("add_category.modern.template_save_scope") }}
          </p>
          <v-btn
            :loading="busy_save"
            :disabled="
              !templateChanged ||
              busy ||
              busy_save ||
              busy_load ||
              augment_load_error
            "
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="elevated"
            @click="saveTemplate"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-text>
    </template>

    <!-- ███████████████████████████ Critical ███████████████████████████ -->

    <template v-if="tab === 'critical' && category">
      <v-card-text class="b-category-add__body sd-modern-canvas">
        <details
          class="b-category-add__content sd-modern-widget sd-modern-disclosure sd-modern-critical"
          :open="critical_open"
          @toggle="critical_open = $event.target.open"
        >
          <summary class="sd-modern-disclosure__summary">
            <v-icon
              class="sd-modern-disclosure__icon"
              color="error"
              aria-hidden="true"
              >warning_amber</v-icon
            >
            <span class="sd-modern-disclosure__copy">
              <span class="sd-modern-disclosure__title">{{
                $t("add_category.critical_zone.title")
              }}</span>
              <span
                class="sd-modern-subtitle d-block"
                v-html="
                  $t('add_category.critical_zone.subtitle', {
                    parent: parentFolder
                      ? parentFolder.title
                      : $t('global.commons.home'),
                  })
                "
              ></span>
            </span>
            <v-icon class="sd-modern-disclosure__chevron" aria-hidden="true"
              >expand_more</v-icon
            >
          </summary>
          <div class="b-category-add__critical-body">
            <u-smart-verify
              v-model="accept_delete"
              role="checkbox"
              tabindex="0"
              :aria-checked="accept_delete"
              :aria-disabled="busy_delete"
              :aria-label="
                $t('add_category.critical_zone.accept_delete.true_title')
              "
              :disabled="busy_delete"
              @keydown.space.prevent="
                !busy_delete && (accept_delete = !accept_delete)
              "
              @keydown.enter.prevent="
                !busy_delete && (accept_delete = !accept_delete)
              "
              color="error"
              false-gray
              :true-description="
                $t('add_category.critical_zone.accept_delete.true_description')
              "
              :true-title="
                $t('add_category.critical_zone.accept_delete.true_title')
              "
            ></u-smart-verify>
            <div class="b-category-add__critical-actions">
              <v-btn
                :disabled="!accept_delete"
                :loading="busy_delete"
                class="sd-modern-button sd-modern-button--danger"
                color="error"
                variant="elevated"
                @click="deleteCategoryDialog()"
              >
                <v-icon class="me-1">delete</v-icon>
                {{ $t("add_category.menu.delete") }}
              </v-btn>
            </div>
          </div>
        </details>
      </v-card-text>
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
    critical_open: false,

    //---------------------
    page: null,
    busy_save: false,
    augment: null,
    changed: false,

    busy_load: false,
    augment_load_error: false,
    busy_load_engine: false,
    engine_load_error: false,
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
    templateChanged() {
      return (
        (this.page?.id ?? null) !== (this.category?.page_id ?? null) ||
        this.changed
      );
    },
  },
  watch: {
    "shop.id"() {
      this.assignData();
    },
    tab(tab) {
      this.critical_open = false;
      this.accept_delete = false;
      if (tab === "engine") this.loadEngine();
    },
    critical_open(open) {
      if (!open) this.accept_delete = false;
    },
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

    saveTemplate() {
      if (
        !this.category ||
        !this.templateChanged ||
        this.busy_save ||
        this.busy ||
        this.busy_load ||
        this.augment_load_error
      )
        return;
      const category = this.category;
      const shopId = this.shop.id;
      const page = this.page;
      const updates = {
        page_id: page?.id ?? null,
        augment: page ? JSON.parse(JSON.stringify(this.augment)) : null,
      };
      this.busy_save = true;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_EDIT_CATEGORY(
                this.vendor.id,
                category.id,
              )
            : window.API.PUT_EDIT_CATEGORY(shopId, category.id),
          updates,
        )
        .then(({ data }) => {
          if (this.category !== category || this.shop.id !== shopId) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          // Apply only the saved template; routine form fields remain an independent draft.
          category.page_id = data.category.page_id ?? null;
          category.page =
            data.category.page || (category.page_id === page?.id ? page : null);
          category.augment = data.category.augment;
          this.augment = JSON.parse(JSON.stringify(category.augment));
          this.changed = false;
          NotificationService.showSuccessAlert(
            null,
            this.$t("add_category.notifications.edit_success"),
          );
          this.$emit("edit", {
            ...category,
            ...data.category,
            page: category.page,
          });
        })
        .catch((error) => {
          if (this.category === category && this.shop.id === shopId)
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.category === category && this.shop.id === shopId)
            this.busy_save = false;
        });
    },

    loadEngine() {
      if (
        !this.category ||
        this.category.engine !== undefined ||
        this.busy_load_engine
      )
        return;
      const category = this.category;
      const shopId = this.shop.id;
      this.busy_load_engine = true;
      this.engine_load_error = false;
      axios
        .get(window.API.GET_ALL_MY_CATEGORIES_LIST_BY_PARAMS(shopId), {
          params: { params: ["engine", "deleted_at"], list: [category.id] },
        })
        .then(({ data }) => {
          if (this.category !== category || this.shop.id !== shopId) return;
          const saved = data.categories?.find(
            (item) => item.id === category.id && !item.deleted_at,
          );
          if (data.error || !saved || saved.engine === undefined) {
            this.engine_load_error = true;
            return;
          }
          category.engine = saved.engine;
        })
        .catch((error) => {
          if (this.category !== category || this.shop.id !== shopId) return;
          this.engine_load_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.category === category && this.shop.id === shopId)
            this.busy_load_engine = false;
        });
    },

    deleteCategoryDialog() {
      if (
        this.tab !== "critical" ||
        !this.critical_open ||
        !this.accept_delete ||
        !this.category ||
        this.busy_delete
      )
        return;
      const category = this.category;
      NotificationService.openDangerAlert(
        this.$t("add_category.delete_alert.title"),
        this.$t("add_category.delete_alert.message", {
          title: category.title,
        }),
        this.$t("add_category.delete_alert.action"),
        () => {
          this.deleteCategory(category);
        },
      );
    },

    deleteCategory(category) {
      // Recheck intent and resource after the final confirmation returns.
      if (
        this.tab !== "critical" ||
        !this.critical_open ||
        !this.accept_delete ||
        !category ||
        category.id !== this.category?.id ||
        this.busy_delete
      )
        return;
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
      this.augment_load_error = false;
      if (!page?.id) {
        this.busy_load = false;
        return;
      }
      const category = this.category;
      const shopId = this.shop.id;

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
          if (
            this.category !== category ||
            this.shop.id !== shopId ||
            this.page !== page
          )
            return;
          this.augment = augment;
        })
        .catch((error) => {
          if (
            this.category !== category ||
            this.shop.id !== shopId ||
            this.page !== page
          )
            return;
          this.augment_load_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (
            this.category !== category ||
            this.shop.id !== shopId ||
            this.page !== page
          )
            return;
          this.busy_load = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-category-add {
  display: flex;
  flex-direction: column;
  min-height: 0;

  &.v-card > .b-category-add__body.v-card-text {
    padding: 0 30px 30px;
  }
  &__content {
    width: 100%;
    max-width: 800px;
    margin-inline: auto;
  }
  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
  }
  &__details {
    grid-row: span 2;
  }
  .sd-modern-widget {
    padding: 22px;
    border: 0;
    border-radius: 16px;
    box-shadow: none;
  }
  &__section-heading {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-bottom: 23px;
    > .v-icon {
      margin-top: 2px;
      font-size: 18px;
      color: var(--sd-modern-muted);
    }
    > div {
      min-width: 0;
    }
    h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 22px;
    }
    .sd-modern-subtitle {
      margin-top: 3px;
      font-size: 12px;
      line-height: 19px;
    }
  }
  &__description {
    margin-top: 27px;
  }
  &__star.v-btn {
    align-self: center;
    min-width: 0;
    height: 32px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
  }
  &__url.v-btn {
    display: flex;
    max-width: calc(100% + 10px);
    margin-top: 8px;
    margin-inline-start: -10px;
    font-size: 12px;
  }
  &__url :deep(.v-btn__content) {
    min-width: 0;
    gap: 7px;
  }
  &__url-value {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__image-limit {
    margin-top: 8px;
    font-size: 12px;
    line-height: 19px;
  }
  &__image :deep(.v-list-item-title) {
    font-size: 13px;
    line-height: 20px;
    b {
      font-weight: 500;
    }
  }
  &__image :deep(.v-list-item-subtitle) {
    font-size: 11px;
    line-height: 16px;
  }
  &__parent &__section-heading {
    margin-bottom: 17px;
  }
  &__parent-input {
    margin: 0;
  }
  &__parent-input > :deep(.v-input) {
    margin: 0;
  }
  &__parent-input :deep(.v-messages__message) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  &__parent-input :deep(.v-messages__message > span) {
    margin-inline-start: 0 !important;
  }
  &__parent-context {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-block: 12px;
    overflow-wrap: anywhere;
    b {
      font-size: 13px;
      font-weight: 500;
    }
  }
  &__embedded-heading {
    display: flex;
    gap: 12px;
    margin-block: 26px 22px;
    h1 {
      margin: 0;
      font-size: 21px;
      font-weight: 600;
      line-height: 28px;
    }
  }
  &__actions {
    flex: 0 0 auto;
    padding: 16px 30px;
    background: rgb(var(--v-theme-surface));
  }
  &__actions .widget-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    max-width: 800px;
    justify-content: space-between;
    gap: 16px;
    margin: 0 auto;
    padding: 0;
  }
  &__actions .widget-buttons > .sd-modern-button {
    flex: 0 1 auto;
    min-width: 0;
    width: auto;
    max-width: 100%;
    font-size: 13px;
    line-height: 20px;
    padding-inline: 20px;
  }
  &__critical-body {
    margin-top: 22px;
  }
  &__engine-loading {
    margin-block: 24px;
  }
  &__inline-actions {
    justify-content: space-between;
    gap: 12px 20px;
    margin-top: 24px;
    .sd-modern-subtitle {
      flex: 1 1 240px;
      margin: 0;
      font-size: 13px;
      line-height: 20px;
    }
  }
  &__critical-body :deep(.s--smart-verify:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 8px;
  }
  &__critical-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  @media (max-width: 660px) {
    &.v-card > .b-category-add__body.v-card-text {
      padding-inline: 16px;
      padding-bottom: 22px;
    }
    &__grid {
      grid-template-columns: minmax(0, 1fr);
    }
    &__details {
      grid-row: auto;
    }
    .sd-modern-widget {
      padding: 20px;
    }
    &__actions {
      padding: 14px 16px;
    }
    &__star.v-btn {
      min-height: 44px;
      padding-inline: 4px;
    }
  }
}
.b-category-add__filter,
.b-category-add__engine {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}
</style>
