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
    :model-value="modelValue"
    @update:modelValue="(v) => $emit('update:modelValue', v)"
    item-value="id"
    item-title="category"
    :items="categories"
    :label="$t('global.article.category_input')"
    :messages="$t('global.article.category_input_message')"
    :variant="variant"
    :clearable="clearable"
    :loading="busy"
    :disabled="disabled"
    :prepend-inner-icon="modelValue ? undefined : 'tab'"
    :flat="flat"
    class="text-start"
    :rounded="rounded"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        v-bind="props"
        :title="item.raw.category"
        :subtitle="item.raw.description"
        class="text-start"
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
      <v-avatar rounded class="me-2" v-if="item.raw.icon" size="28"
        ><img :src="getShopImagePath(item.raw.icon)"
      /></v-avatar>
      <div class="flex-grow-1 text-start">
        <div class="text-subtitle-2">{{ item.raw.category }}</div>
        <small>{{ item.raw.description }}</small>
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

<style scoped lang="scss"></style>
