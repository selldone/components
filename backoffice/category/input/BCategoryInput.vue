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

<template>
  <v-autocomplete
    v-bind="$attrs"
    v-model="category"
    v-model:menu="menu"
    v-model:search="search"
    :chips="multiple"
    :class="{ disabled: modelValue && busy && !category_obj }"
    :clearable="clearable"
    :closable-chips="multiple"
    :counter="counter"
    :customFilter="() => true"
    :disabled="disabled"
    :items="categories"
    :label="label"
    :multiple="multiple"
    :no-data-text="placeholder"
    :outlined="outlined"
    :persistent-placeholder="persistentPlaceholder"
    :placeholder="placeholder"
    :return-object="returnObject"
    :rounded="rounded"
    :single-line="singleLine"
    :variant="variant ? variant : filled ? 'filled' : 'underlined'"
    class="m-2"
    item-title="title"
    item-value="id"
    messages=" "
    @update:model-value="$emit('change')"
    @click:clear="$emit('click:clear')"
    @blur="$emit('blur')"
    v-model:focused="focused"
  >
    <!-- ―――――――――――――――――― message ―――――――――――――――――― -->

    <template v-slot:message>
      <v-btn
        @click="dialog = true"
        size="small"
        slim
        variant="text"
        color="primary"
        prepend-icon="drive_folder_upload"
      >
        {{ $t("global.actions.select_category") }}
      </v-btn>
      <b-category-parent
        v-if="
          !multiple /*Show the category detail on the single mode!*/ &&
          category_obj
        "
        :category="category_obj"
        class="ms-2 fadeIn"
      >
      </b-category-parent>
      <div v-if="messages">{{ messages }}</div>
    </template>

    <!-- ―――――――――――――――――― items ―――――――――――――――――― -->
    <template v-slot:item="{ props, item }">
      <v-list-item
        :subtitle="item.raw.description?.limitWords(8)"
        :title="item.raw.title"
        class="text-start"
        v-bind="props"
      >
        <template v-slot:prepend>
          <u-avatar-folder
            :borderSize="5"
            :placeholder-icon="item.raw.id ? 'folder' : 'home'"
            :size="42"
            :src="
              item.raw.icon
                ? getShopImagePath(item.raw.icon, IMAGE_SIZE_SMALL, null)
                : null
            "
            :text-avatar="item.raw.title"
            hide-side-icon
            is-amber
          >
          </u-avatar-folder>
        </template>
        <template
          v-if="multiple /*Show the category detail on the multiple mode!*/"
          v-slot:subtitle
        >
          <b-category-parent :category="item.raw" class="d-block" small>
          </b-category-parent>
        </template>
      </v-list-item>
    </template>

    <!-- ―――――――――――――――――― selection ―――――――――――――――――― -->
    <template v-slot:chip="{ props, item }">
      <v-chip
        v-if="multiple"
        :prepend-avatar="
          item.raw.icon
            ? getShopImagePath(item.raw.icon, IMAGE_SIZE_SMALL)
            : undefined
        "
        :prepend-icon="item.raw.icon ? null : !item.raw.id ? 'home' : 'folder'"
        :text="item.raw.title"
        v-bind="props"
      ></v-chip>
      <span v-else>{{ item.raw.title }}</span>
    </template>

    <!-- ―――――――――――――――――― prepend-inner ―――――――――――――――――― -->

    <template v-if="!multiple /*Only in the single mode*/" v-slot:prepend-inner>
      <circle-image
        v-if="category_obj"
        :size="32"
        :src="
          category_obj?.icon
            ? getShopImagePath(category_obj.icon, IMAGE_SIZE_SMALL)
            : ShopCategoryHelper.GetCategoryIconById(
                isObject(modelValue) ? modelValue.id : modelValue,
              )
        "
        class="mb-1 me-1 hover-scale force-top"
      />
      <v-avatar v-else :size="32">
        <v-icon>{{ defaultIcon }}</v-icon>
      </v-avatar>
    </template>

    <!-- ―――――――――――――――――― prepend-item ―――――――――――――――――― -->

    <template v-slot:prepend-item>
      <u-loading-progress v-if="busy"></u-loading-progress>
      <v-list-item
        v-if="
          !multiple /*Only in the single mode*/ &&
          search &&
          !categories.some((i) => i.title === search)
        "
        class="text-start"
        prepend-icon="create_new_folder"
      >
        <small class="d-block">{{ $t("global.actions.add") }}</small>
        <b> {{ search }}</b>

        <template v-slot:append>
          <v-list-item-action end>
            <v-btn
              :loading="busy_create"
              class="nbt-colored ms-1"
              color="primary"
              @click="createCategory(search)"
            >
              <v-icon start>add_box</v-icon>
              {{ $t("global.actions.create") }}
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
    </template>
    <template v-slot:append-inner>
      <slot name="append-inner"></slot>
    </template>
  </v-autocomplete>

  <v-bottom-sheet
    v-model="dialog"
    max-width="1720"
    width="98vw"
    content-class="rounded-t-xl"
    min-height="70vh"
    scrollable
    max-height="90vh"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-text>
        <b-products-window
          :can-select-category="true"
          :can-select-product="false"
          :selected-list="selected_list"
          :shop="$shop"
          :vendor="$vendor"
          class="mx-auto"
          dialog-mode
          select-mode
          compactMode
          @select="selectProduct"
          @select-category="selectCategory"
        />
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog = false"
            prepend-icon="close"
          >
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import CircleImage from "../../../ui/image/CircleImage.vue";
import BCategoryParent from "../../category/parent/BCategoryParent.vue";
import threads from "@selldone/core-js/utils/thread/threads";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { ShopCategoryHelper } from "@selldone/core-js/helper/category/ShopCategoryHelper.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { defineAsyncComponent } from "vue";

const BProductsWindow = defineAsyncComponent(
  () =>
    import(
      "@selldone/components-vue/backoffice/product/window/BProductsWindow.vue"
    ),
);

export default {
  name: "BCategoryInput",
  mixins: [],
  components: { BProductsWindow, UAvatarFolder, BCategoryParent, CircleImage },
  emits: ["change", "update:modelValue", "click:clear", "blur"],
  inject: ["$shop", "$vendor"],
  props: {
    modelValue: {},
    label: {},
    messages: {},
    color: {},

    dark: {
      default: false,
      type: Boolean,
    },
    rounded: {},
    outlined: {
      default: false,
      type: Boolean,
    },

    disabled: {
      default: false,
      type: Boolean,
    },

    returnObject: {
      default: false,
      type: Boolean,
    },
    clearable: {
      default: false,
      type: Boolean,
    },
    filled: {
      default: false,
      type: Boolean,
    },
    placeholder: {},
    noHome: {
      default: false,
      type: Boolean,
    },
    persistentPlaceholder: {
      default: false,
      type: Boolean,
    },

    multiple: {
      default: false,
      type: Boolean,
    },

    defaultIcon: {
      default: "home",
    },
    variant: {},
    singleLine: Boolean,
    counter: {},
  },
  data: () => ({
    category: null,
    categories: [],
    total: 0,
    busy: false,

    search: "",
    menu: false,

    busy_create: false,

    dialog: false,
    focused: false,
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

    category_obj() {
      if (!this.category) return null;
      return this.categories.find(
        (i) =>
          i.id ===
          parseInt(
            this.isObject(this.category) ? this.category.id : this.category,
          ),
      );
    },

    selected_list() {
      if (!this.category) return [];

      if (this.multiple) {
        if (this.returnObject) {
          return this.category.map((i) => "c-" + i.id);
        } else {
          return this.category.map((i) => "c-" + i);
        }
      } else {
        return this.returnObject
          ? ["c-" + this.category.id]
          : ["c-" + this.category];
      }
    },
  },
  watch: {
    search: threads.debounceSearch(function (val) {
      if (
        !this.menu ||
        val === this.$t("global.commons.home") ||
        (val &&
          val ===
            this.category_obj
              ?.title) /*Prevent search when user first focus on input!*/
      )
        return; // Search only if menu is open!
      this.fetchCategories();
    }),

    category(category) {
      this.$emit("update:modelValue", category);
    },
    modelValue(category) {
      this.category = category;
    },
  },
  created() {
    // Fix some possible issues in setting v-model initial value:
    if (this.modelValue) {
      if (this.multiple) {
        if (Array.isArray(this.modelValue)) {
          this.category = this.modelValue;
        } else {
          this.category = [];
        }
      } else {
        if (this.returnObject) {
          this.category = this.isObject(this.modelValue)
            ? this.modelValue
            : null;
        } else {
          this.category = this.isObject(this.modelValue)
            ? null
            : parseInt(this.modelValue);
        }
      }
    } else {
      this.category = null;
    }

    this.fetchCategories();
  },

  methods: {
    fetchCategories() {
      this.busy = true;

      let contain = null;

      if (this.modelValue) {
        if (this.multiple) {
          if (this.returnObject) {
            contain = this.modelValue.map((i) => i.id);
          } else {
            contain = this.modelValue;
          }
        } else {
          if (this.returnObject) {
            contain = this.modelValue.id;
          } else {
            contain = this.modelValue;
          }
        }
      }

      const offset = 0;
      const limit =
        (Array.isArray(this.modelValue)
          ? this.modelValue?.length
          : this.modelValue) && !this.focused
          ? 0
          : this.search
            ? 20
            : 100;

      const params = {
        contain: contain,
        search: this.search,

        children: false,
        parent: true,
      };

      const handleSuccessResponse = ({ categories, total }) => {
        this.categories = categories;
        this.total = total;

        // Add home category to the list:
        if (!this.noHome && !this.categories.some((c) => c.id === null))
          this.categories.unshift({
            id: null,
            title: this.$t("global.commons.home"),
          });
      };

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.category
            .optimize(120)
            .list(this.$vendor.id, offset, limit, params)
        : window.$backoffice.category
            .optimize(120)
            .list(this.$shop.id, offset, limit, params)
      )

        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .finally(() => {
          this.busy = false;
        });
    },
    createCategory(title) {
      this.busy_create = true;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_CATEGORY(
                this.$route.params.vendor_id,
              )
            : window.API.POST_ADD_CATEGORY(this.$route.params.shop_id),

          {
            title: title,
            name: title,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.AddOrUpdateItemByID(this.categories, data.category);
            this.category = this.returnObject
              ? data.category
              : data.category.id;
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_category.notifications.add_success"),
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_create = false;
        });
    },
    selectCategory(category) {
      // Add to cached categories!
      if (category) {
        this.AddOrUpdateItemByID(this.categories, category);
      }

      if (this.returnObject) {
        if (this.multiple) {
          this.category = [...this.category, category];
        } else {
          this.category = category;
        }
      } else {
        if (this.multiple) {
          this.category = [...this.category, category.id];
        } else {
          this.category = category.id;
        }
      }

      if (!this.multiple) {
        this.dialog = false;
      }
      //console.log("category", category, this.category);
    },
  },
};
</script>

<style scoped></style>
