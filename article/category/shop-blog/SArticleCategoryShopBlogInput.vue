<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-select
    :clearable="clearable"
    :disabled="disabled"
    :flat="flat"
    :items="categories"
    :label="$t('global.article.category_input')"
    :loading="busy"
    :messages="$t('global.article.category_input_message')"
    :model-value="modelValue"
    :prepend-inner-icon="modelValue ? undefined : 'tab'"
    :rounded="rounded"
    :variant="variant"
    class="text-start"
    item-title="category"
    item-value="id"
    @update:modelValue="(v) => $emit('update:modelValue', v)"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        :subtitle="item.raw.description"
        :title="item.raw.category"
        class="text-start"
        v-bind="props"
        lines="two"
      >
        <template v-slot:prepend>
          <v-avatar rounded size="28"
            ><img v-if="item.raw.icon" :src="getShopImagePath(item.raw.icon)" />
            <v-icon v-else>folder</v-icon>
          </v-avatar>
        </template>
      </v-list-item>
    </template>
    <template v-slot:selection="{ item }">
      <v-avatar v-if="item.raw.icon" class="me-2" rounded size="28"
        ><img :src="getShopImagePath(item.raw.icon)"
      /></v-avatar>
      <div class="flex-grow-1 text-start overflow-hidden">
        <div class="text-subtitle-2">{{ item.raw.category }}</div>
        <div class="single-line small text-muted">
          {{ item.raw.description }}
        </div>
      </div>
    </template>
  </v-select>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SArticleCategoryShopBlogInput",

  props: {
    shop: {},
    modelValue: {},
    disabled: {},
    variant: {
      default: "underlined",
    },
    flat: Boolean,
    clearable: Boolean,
    rounded: Boolean,
  },

  data() {
    return {
      categories: [],
      busy: false,
    };
  },

  created() {
    this.getCategories();
  },
  methods: {
    getCategories() {
      this.busy = true;

      axios
        .get(window.ARTICLE_API.GET_SHOP_BLOG_CATEGORIES(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.categories = data.categories;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped></style>
