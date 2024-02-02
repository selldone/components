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
      :items="categories"
      :label="$t('global.article.category_input')"
      :messages="$t('global.article.category_input_message')"
      :variant="variant"
      :flat="flat"
      :clearable="clearable"
      :disabled="disabled"
      class="text-start"
      :rounded="rounded"
  >
  </v-select>
</template>

<script>
import { defineComponent } from "vue";
import { ArticleTypes } from "@core/enums/article/ArticleTypes";
import { HelpCategories } from "@core/enums/admin/help/HelpCategories";

export default defineComponent({
  name: "OArticleSelldoneHelpCategoryInput",

  props: {
    modelValue: {},
    loading: {},
    disabled: {},
    variant: {
      default: "underlined",
    },
    flat:Boolean,
    clearable:Boolean,
    rounded: Boolean,

  },

  data() {
    return {
      categories:[],

    };
  },

  created() {
    this.getCategories();
  },
  methods: {
    getCategories() {
      this.categories = Object.keys(HelpCategories);
    },
  },
});
</script>

<style scoped lang="scss"></style>
