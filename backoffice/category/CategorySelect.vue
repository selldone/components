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

<template>
  <v-autocomplete
    v-model="category"
    class="m-2"
    :items="categories"
    item-text="title"
    item-value="id"
    :label="label"
    :rounded="rounded"
    :outlined="outlined"
    messages=" "
    :return-object="returnObject"
    :clearable="clearable"
    :filled="filled"
    :placeholder="placeholder"
    :no-data-text="placeholder"
    :persistent-placeholder="persistentPlaceholder"
    :search-input.sync="search"
    :filter="() => true"
    :class="{ disabled: (value && busy && !category_obj ) }"
    @change="$emit('change')"
    :multiple="multiple"
    :chips="chips"
    :disabled="disabled"
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
    <template v-slot:item="{ item }">
      <div class="d-flex align-center text-start">
        <v-avatar :size="32" class="me-2">
          <img v-if="item.icon" :src="getShopImagePath(item.icon, 64)" />
          <v-icon v-else>folder</v-icon>
        </v-avatar>

        <div class="flex-grow-1 overflow-hidden">
          <b>{{ item.title }}</b>
          <category-parents-view
            v-if="multiple /*Show the category detail on the multiple mode!*/"
            :category="item"
            small
            class="d-block"
          >
          </category-parents-view>
          <small v-else class="d-block single-line">{{
            item.description?.limitWords(8)
          }}</small>
        </div>
      </div>
    </template>

    <!-- ―――――――――――――――――― selection ―――――――――――――――――― -->

    <template v-slot:selection="{ item, selected, parent }">
      <v-chip
        v-if="multiple"
        :input-value="selected"
        close
        @click:close="parent.selectItem(item)"
      >
        <v-avatar left>
          <v-img
            :src="
              (getShopImagePath(item.icon, IMAGE_SIZE_SMALL))
            "
          />
        </v-avatar>

        {{ item.title }}
      </v-chip>
      <span v-else>{{ item.title }}</span>
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
        <v-icon>home</v-icon>
      </v-avatar>
    </template>

    <!-- ―――――――――――――――――― prepend-item ―――――――――――――――――― -->

    <template v-slot:prepend-item>
      <progress-loading v-if="busy"></progress-loading>
      <div
        v-if="
          !multiple /*Only in the single mode*/ &&
          search &&
          !categories.some((i) => i.title === search)
        "
        class="d-flex align-center px-2 py-1"
      >
        <v-icon color="success" class="me-1">add_box</v-icon>
        <span class="text-muted">{{ $t("global.actions.add") }}</span>
        <b class="mx-1"> {{ search }}</b>
        <v-spacer></v-spacer>
        <v-btn
          class="nbt-colored ms-1"
          color="primary"
          @click="createCategory(search)"
          :loading="busy_create"
          >{{ $t("global.actions.create") }}</v-btn
        >
      </div>
    </template>
  </v-autocomplete>
</template>

<script>
import CircleImage from "@components/ui/image/CircleImage.vue";
import CategoryParentsView from "./CategoryParentsView.vue";
import _ from "lodash-es";

export default {
  name: "CategorySelect",
  components: { CategoryParentsView, CircleImage },
  props: {
    value: {},
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
  },
  data: () => ({
    category: null,
    categories: [],
    total: 0,
    busy: false,

    search: null,

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
    search: _.throttle(function (newVal, oldVal) {
      this.fetchCategories();
    }, window.SERACH_THROTTLE),

    category(category) {
      this.$emit("input", category);
    },
    value(category) {
      this.category = category;
    },
  },
  created() {
    this.category = this.value;

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
              contain: this.isObject(this.value) ? this.value.id : this.value,
              search: this.search,

              children: false,
              parent: true,

              offset: 0,
              limit: 10,
            },
          }
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
                this.$route.params.vendor_id
              )
            : window.API.POST_ADD_CATEGORY(this.$route.params.shop_id),

          {
            title: title,
            name: title,
          }
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
              this.$t("add_category.notifications.add_success")
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
