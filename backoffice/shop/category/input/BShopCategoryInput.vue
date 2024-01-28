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
    v-model="category"
    class="m-2"
    :items="categories"
    item-title="title"
    item-value="id"
    :label="label"
    :rounded="rounded"
    :outlined="outlined"
    messages=" "
    :return-object="returnObject"
    :clearable="clearable"
    :placeholder="placeholder"
    :no-data-text="placeholder"
    :persistent-placeholder="persistentPlaceholder"
    v-model:search="search"
    v-model:menu="menu"
    :customFilter="() => true"
    :class="{ disabled: modelValue && busy && !category_obj }"
    @update:model-value="$emit('change')"
    :multiple="multiple"
    :chips="chips"
    :disabled="disabled"
    :variant="filled ? 'filled' : 'underlined'"
  >
    <!-- ―――――――――――――――――― message ―――――――――――――――――― -->

    <template v-slot:message>
      <category-parents-view
        v-if="
          !multiple /*Show the category detail on the single mode!*/ &&
          category_obj
        "
        class="ms-2 fadeIn"
        :category="category_obj"
      >
      </category-parents-view>
      <div v-if="messages">{{ messages }}</div>
    </template>

    <!-- ―――――――――――――――――― items ―――――――――――――――――― -->
    <template v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :prepend-avatar="
          item.raw.icon
            ? getShopImagePath(item.raw.icon, IMAGE_SIZE_SMALL)
            : null
        "
        :prepend-icon="item.raw.icon ? null : 'folder'"
        :title="item.raw.title"
        :subtitle="item.raw.description?.limitWords(8)"
        class="text-start"
      >
        <template
          v-if="multiple /*Show the category detail on the multiple mode!*/"
          v-slot:subtitle
        >
          <category-parents-view :category="item.raw" small class="d-block">
          </category-parents-view>
        </template>
      </v-list-item>
    </template>

    <!-- ―――――――――――――――――― selection ―――――――――――――――――― -->
    <template v-slot:chip="{ props, item }">
      <v-chip
        v-if="multiple"
        v-bind="props"
        :prepend-avatar="getShopImagePath(item.raw.icon, IMAGE_SIZE_SMALL)"
        :text="item.raw.title"
      ></v-chip>
      <span v-else>{{ item.raw.title }}</span>
    </template>

    <!-- ―――――――――――――――――― prepend-inner ―――――――――――――――――― -->

    <template v-if="!multiple /*Only in the single mode*/" v-slot:prepend-inner>
      <circle-image
        v-if="category"
        :src="getCategoryIcon(returnObject ? category.id : category)"
        :size="32"
        class="mb-1 me-1 hover-scale force-top"
      />
      <v-avatar v-else :size="32">
        <v-icon>{{ defaultIcon }}</v-icon>
      </v-avatar>
    </template>

    <!-- ―――――――――――――――――― prepend-item ―――――――――――――――――― -->

    <template v-slot:prepend-item>
      <s-progress-loading v-if="busy"></s-progress-loading>
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
              class="nbt-colored ms-1"
              color="primary"
              @click="createCategory(search)"
              :loading="busy_create"
            >
              <v-icon start>add_box</v-icon>
              {{ $t("global.actions.create") }}
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
    </template>
    <template v-slot:append-inner>
      <slot name="append"></slot>
    </template>
  </v-autocomplete>
</template>

<script>
import CircleImage from "@components/ui/image/CircleImage.vue";
import CategoryParentsView from "../../../category/CategoryParentsView.vue";
import threads from "@core/utils/thread/threads";

export default {
  name: "BShopCategoryInput",
  components: { CategoryParentsView, CircleImage },
  emits: ["change", "update:modelValue"],
  props: {
    modelValue: {},
    label: {},
    messages: {},
    color: {},

    dark: {
      default: false,
      type: Boolean,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
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
    chips: {
      default: false,
      type: Boolean,
    },
    defaultIcon: {
      default: "home",
    },
  },
  data: () => ({
    category: null,
    categories: [],
    total: 0,
    busy: false,

    search: "",
    menu: false,

    busy_create: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    category_obj() {
      if (!this.category) return null;
      return this.isObject(this.category)
        ? this.category
        : this.categories.find((i) => i.id === this.category);
    },
  },
  watch: {
    search: threads.debounceSearch(function (val) {
      if (!this.menu || val === this.$t("global.commons.home")) return; // Search only if menu is open!
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
    this.category = this.modelValue;

    this.fetchCategories();
  },

  methods: {
    fetchCategories() {
      this.busy = true;

      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_CATEGORIES(this.$route.params.vendor_id)
            : window.API.GET_MY_SHOP_CATEGORIES(this.$route.params.shop_id),
          {
            params: {
              contain: this.isObject(this.modelValue)
                ? this.modelValue.id
                : this.modelValue,
              search: this.search,

              children: false,
              parent: true,

              offset: 0,
              limit: 10,
            },
          },
        )
        .then(({ data }) => {
          this.categories = data.categories;
          this.total = data.total;

          if (!this.noHome)
            this.categories.unshift({
              id: null,
              title: this.$t("global.commons.home"),
            });
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.AddOrUpdateItemByID(this.categories, data.category);
            this.category = this.returnObject
              ? data.category
              : data.category.id;
            this.showSuccessAlert(
              null,
              this.$t("add_category.notifications.add_success"),
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_create = false;
        });
    },
  },
};
</script>

<style scoped></style>
