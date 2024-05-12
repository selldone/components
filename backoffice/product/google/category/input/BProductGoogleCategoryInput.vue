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
    v-level.min="AppLevel.NOVICE"
    v-model:search="search"
    :customFilter="() => true"
    :items="items"
    :loading="busy_google_category"
    :model-value="modelValue"

    clearable
    hide-no-data
    hint="Represents the category of your product according to the Google's product taxonomy."
    item-title="category"
    item-value="id"
    label="Google product category code"
    placeholder="Enter product or service category.. (Optional)"
    variant="underlined"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:prepend-inner>
      <img :src="require('../../../../../assets/trademark/google.svg')" width="24" height="24">
    </template>

    <template v-slot:item="{ item,props }">
      <v-list-item v-bind="props" :title="item.raw.category" class="text-start">
        <template v-slot:prepend>
          <b class="me-2 single-line" style="flex-basis: 48px"
          >{{ item.raw.id }} ┇
          </b>
        </template>

      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import _ from "lodash-es";
import { AppLevel } from "@selldone/core-js/enums/application/AppLevel";

export default {
  name: "BProductGoogleCategoryInput",
  emits: ["update:modelValue"],
  computed: {
    AppLevel() {
      return AppLevel;
    },
  },

  props: {
    shop: {
      required: true,
    },

    product: {
      required: true,
      type: Object,
    },

    modelValue: {},
  },

  data: function () {
    return {
      search: null,
      items: [],
      busy_google_category: false,

      select: null,
    };
  },
  watch: {
    search: _.throttle(function (val, oldVal) {
      val &&
        val !== this.select &&
        this.getGoogleCategory(val, this.product.gpc);
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.getGoogleCategory(null, this.product.gpc);
  },
  methods: {
    // ████████████████████ Get Google products categories ████████████████████

    getGoogleCategory(val, contain_id) {
      if (!val && !contain_id) return;

      this.busy_google_category = true;
      axios
        .get(window.API.GET_GOOGLE_CATEGORY(val), {
          params: { contain: contain_id },
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.items = data.items;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_google_category = false;
        });
    },
  },
};
</script>

<style scoped></style>
