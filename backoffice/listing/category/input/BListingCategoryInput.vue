<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <v-combobox
    v-bind="$attrs"
    v-model:search="search"
    :customFilter="() => true"
    :items="categories"
    :label="label"
    :loading="busy"
    :messages="selectedCategory && selectedCategory.description ? selectedCategory.description : ''"
    :model-value="modelValue"
    :variant="variant"
    :rules="rules"
    clearable
    item-title="title"
    item-value="id"
    :return-object="returnObject"
    @update:model-value="onUpdateModelValue"
    @click:clear="onClear"
    :prepend-inner-icon="prependInnerIcon"
  >
    <!-- Selected item view -->
    <template v-slot:selection="{ item }">
      <v-avatar class="m-2" size="32" color="grey-lighten-4">
        <template v-if="item.raw.icon">
          <img :src="getShopImagePath(item.raw.icon)" style="object-fit: cover" />
        </template>
        <template v-else>
          <v-icon size="18" color="#333">folder</v-icon>
        </template>
      </v-avatar>

      <div class="d-inline-flex align-center flex-wrap">
        <span class="font-weight-bold">{{ item.raw.title }}</span>

        <v-chip
          v-if="item.raw.parent && item.raw.parent.title"
          size="x-small"
          class="mx-1"
          variant="flat" color="amber"
          :prepend-avatar="getShopImagePath(item.raw.parent.icon)"
        >
          {{ item.raw.parent.title }}
        </v-chip>

        <v-chip
          v-if="item.raw.is_active === false"
          size="x-small"
          class="mx-1"
          label
          variant="tonal"
        >
          Inactive
        </v-chip>
      </div>
    </template>

    <!-- Dropdown items -->
    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" class="text-start">
        <template v-slot:prepend>
          <v-avatar class="m-2" size="32" color="grey-lighten-4">
            <template v-if="item.raw.icon">
              <img :src="getShopImagePath(item.raw.icon)" style="object-fit: cover" />
            </template>
            <template v-else>
              <v-icon size="18" color="#333">folder</v-icon>
            </template>
          </v-avatar>
        </template>

        <template v-slot:title>
          <b>
            {{ item.raw.title }}
          </b>
        </template>


        <v-list-item-subtitle class="d-flex align-center flex-wrap">

          <v-chip
            v-if="item.raw.parent && item.raw.parent.title"
            size="x-small"
            class="me-1 my-1"
            variant="flat" color="amber"
            :prepend-avatar="getShopImagePath(item.raw.parent.icon)"
          >
            {{$t('global.commons.folder')}}:
            {{ item.raw.parent.title }}
          </v-chip>

          <v-chip
            v-if="item.raw.is_active === false"
            size="x-small"
            class="me-1 my-1"
            label
            variant="tonal"
          >
            Inactive
          </v-chip>

          <span v-if="item.raw.description" class="text-muted my-1">
            — {{ item.raw.description }}
          </span>
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { throttle } from "lodash-es";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BListingCategoryInput",
  inheritAttrs: false,

  inject: ["$shop"],

  emits: ["update:modelValue", "click:clear"],

  props: {
    modelValue: {},

    rules:{},
    prependInnerIcon:{},
    /**
     * If true, v-model contains the full category object.
     * If false, v-model contains the category id.
     */
    returnObject: {
      type: Boolean,
      default: false,
    },

    /**
     * Optional: filter by parent_id (useful for selecting only children of a parent).
     */
    parentId: {
      default: null,
    },

    /**
     * Optional: include soft-deleted categories.
     */
    withTrashed: {
      type: Boolean,
      default: false,
    },

    /**
     * Optional: show only active categories (client-side filter).
     */
    activeOnly: {
      type: Boolean,
      default: false,
    },

    /**
     * Input label.
     */
    label: {
      default: "Category"
    },

    /**
     * Vuetify variant.
     */
    variant: {
      default: "underlined",
    },

    /**
     * Max fetched items per request (UI autocomplete).
     */
    limit: {
      type: Number,
      default: 30,
    },
  },

  data() {
    return {
      categories: [] as any[],
      total: 0,

      busy: false,
      search: null as string | null,
    };
  },

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    selectedId(): number | null {
      const v: any = this.modelValue;

      if (this.isObject(v) && v.id) return parseInt(String(v.id), 10) || null;

      const id = parseInt(String(v || ""), 10);
      return isNaN(id) ? null : id;
    },

    selectedCategory(): any | null {
      if (!this.selectedId) return null;
      return this.categories.find((c: any) => c && c.id === this.selectedId) || null;
    },
  },

  watch: {
    search: throttle(function () {
      this.getCategories();
    }, (window as any).SERACH_THROTTLE || 600),


    modelValue: {
      handler() {
        // Ensure "contain" item exists in items list for stable UI rendering.
        if (this.selectedId && !this.selectedCategory) {
          this.getCategories();
        }
      },
    },
  },

  created() {
    this.getCategories();
  },

  methods: {
    isObject(val: any): boolean {
      return val !== null && typeof val === "object" && !Array.isArray(val);
    },

    onUpdateModelValue(val: any) {
      // Vuetify already returns id or object based on return-object.
      this.$emit("update:modelValue", val);
    },

    onClear() {
      this.search = null;
      this.$emit("click:clear");
      this.getCategories();
    },

    looksLikeStoragePath(value: string): boolean {
      if (!value) return false;
      const v = String(value);

      if (v.startsWith("http://") || v.startsWith("https://")) return true;

      // Common Selldone stored keys (underscore format) usually start with shops_
      if (v.startsWith("shops_") || v.startsWith("shops/")) return true;

      // If it contains slashes, treat it as a path.
      if (v.includes("/")) return true;

      return false;
    },





    getCategories() {
      const shopId = this.shop?.id;
      if (!shopId) return;

      this.busy = true;

      axios
        .get(window.API.GET_SHOP_LISTING_CATEGORIES(shopId), {
          params: {
            contain: this.selectedId || null,
            search: this.search,

            offset: 0,
            limit: this.limit,

            parent_id: this.parentId,
            with_trashed: this.withTrashed,

            sortBy: "title",
            sortDesc: false,
          },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          let list = Array.isArray(data.categories) ? data.categories : [];

          // Optional client-side filter for active categories.
          if (this.activeOnly) {
            list = list.filter((c: any) => c && c.is_active);
          }

          this.categories = list;
          this.total = data.total ?? list.length;

          // Normalize v-model type (id vs object) based on returnObject.
          if (this.selectedId) {
            const found = this.categories.find((c: any) => c && c.id === this.selectedId) || null;

            if (!found) {
              // Selected value is invalid (deleted/missing/unavailable).
              this.$emit("update:modelValue", null);
              this.$emit("click:clear");
              return;
            }

            const normalized = this.returnObject ? found : found.id;

            // Only emit if different to avoid loops.
            if (this.returnObject) {
              if (!this.isObject(this.modelValue) || (this.modelValue as any)?.id !== found.id) {
                this.$emit("update:modelValue", normalized);
              }
            } else {
              const currentId = this.isObject(this.modelValue) ? (this.modelValue as any)?.id : this.modelValue;
              if (parseInt(String(currentId), 10) !== found.id) {
                this.$emit("update:modelValue", normalized);
              }
            }
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
