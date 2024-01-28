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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-if="isFile && files" class="s--shop-product-files">
    <v-container class="my-16">
      <v-row align="center" justify="space-between">
        <v-col cols="12" :md="free_files.length?6:12" class="text-start">
          <v-list-subheader>● Files included in {{ product.title }}</v-list-subheader>
          <h2 class="text-h3 line-height-normal font-weight-black">
            {{ $t("global.commons.files_list") }}
          </h2>
          <v-row no-gutters class="mt-2">
            <div
              v-for="(val, extension) in files_grouped"
              :key="extension"
              class="m-1"
            >
              <img
                :src="getFileExtensionImage(extension)"
                width="20"
                style="vertical-align: top"
              />
              {{   numeralFormat(val,"0.[0] a") }}🞬
            </div>
          </v-row>
        </v-col>

        <v-col v-if="free_files.length" cols="12" sm="6" md="3">
          <div class="-highlight">
            <span class="text-h3 font-weight-black">{{
              free_files.length
            }}</span>
          </div>
          <div>Free sample files.</div>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="my-16 position-relative">
      <s-expand-view
        class="master-article-container"
        max-height="50vh"
        min-height="30vh"
      >
        <s-shop-product-files-list
          :files="files"
          :purchased="product.buy_file"
        ></s-shop-product-files-list>
      </s-expand-view>
    </v-container>
  </div>
</template>

<script>
import SExpandView from "@components/ui/expand-view/SExpandView.vue";
import SShopProductFilesList from "@components/storefront/product/file/SShopProductFilesList.vue";
import { ProductType } from "@core/enums/product/ProductType";

export default {
  name: "SShopProductFiles",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    SShopProductFilesList,
    SExpandView,
  },

  data: function () {
    return {};
  },

  computed: {
    files() {
      return this.product.files;
    },
    free_files() {
      return this.product.files.filter((f) => f.sample);
    },

    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },

    files_grouped() {
      let out = {};
      this.files.forEach((file) => {
        const extension = file.name.split(".").pop();

        if (out[extension]) out[extension]++;
        else out[extension] = 1;
      });
      return out;
    },
    files_size() {
      let sum = 0;
      this.files.forEach((item) => (sum += item.size));
      return sum * 1024;
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-product-files {
  .-highlight {
    min-height: 96px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
  }
}
</style>
