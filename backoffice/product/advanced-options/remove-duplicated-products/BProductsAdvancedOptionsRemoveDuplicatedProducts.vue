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
  <div class="widget-box mb-5">
    <u-widget-header
      icon="cleaning_services"
      title="Auto Remove Duplicated Products"
    ></u-widget-header>

    <v-list-subheader>
      Automatically remove duplicate products from your shop. Choose the criteria below for removing duplicates:
    </v-list-subheader>

    <u-smart-select
        v-model="mode"
        :items="[
    {
      value: 'sku',
      text: 'Duplicate by SKU',
      description: 'Remove duplicate products that share the same SKU. Products without an SKU will be ignored.',
    },
    {
      value: 'title',
      text: 'Duplicate by Title',
      description: 'Remove duplicate products that share the same Title.',
    },
    {
      value: 'sku-title',
      text: 'Duplicate by SKU & Title (✨ Recommended)',
      description: 'Safely remove duplicates that share both the same SKU and Title.',
    }
  ]"
        item-value="value"
        item-text="text"
        item-description="description"
        item-icon="icon"
        force-show-all
        class="my-3"
    />

<div class="my-5 bg-white rounded-18px">
  <b-category-input
      v-model="category_id"
      placeholder="Leave empty to include all categories (*)"
      variant="solo"
      flat
      label="Filter by Category"
      persistent-placeholder
      clearable
      no-home>
  </b-category-input>

</div>

    <v-list-subheader>Preview Products to Be Removed</v-list-subheader>

    <v-data-table-server v-if="products" :loading="busy_fetch" :items="products"

    v-model:page="page"
                         v-model:items-per-page="limit"
                         :items-length="total"
                         :items-per-page-options="[5,10, 25, 50, 100]"

                         :headers="headers"

    >
      <template v-slot:item.title="{item}">
        <u-avatar-folder :src="getShopImagePath(item.icon, 128)" is-gray :size="48" :border-size="4" class="me-1 my-1" elevated hide-side-icon>

        </u-avatar-folder>

        {{item.title}}
      </template>


    </v-data-table-server>


    <u-smart-verify
      v-model="verify_action"
      class="my-3"
      true-description="I've confirm to remove duplicated products."
      true-title="I verify this action."
    ></u-smart-verify>
    <div class="widget-buttons">
      <v-btn
        :disabled="!verify_action"
        :loading="busy_remove"
        color="red"
        size="x-large"
        @click="autoRemoveDuplicatedProducts"
      >
        <v-icon class="me-1">auto_fix_high</v-icon>
        Remove All Duplicated Products
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import BCategoryInput from "@selldone/components-vue/backoffice/category/input/BCategoryInput.vue";

export default {
  name: "BProductsAdvancedOptionsRemoveDuplicatedProducts",
  mixins: [],
  components: {
    BCategoryInput,
    UAvatarFolder,
    USmartSelect,
    USmartSwitch,
    USmartVerify,
  },
  props: {
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: () => ({
    verify_action: false,
    busy_remove: false,
    mode: "sku-title",

    products:[],
    total:0,
    busy_fetch:false,

    page: 1,
    limit: 5,
    category_id: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    headers(){
      return [
        {
          title: "Title",
          align: "start",
          value: "title",
        },
        {
          title: "ID",
          align: "start",
          value: "id",
        },

        {
          title: "SKU",
          align: "start",
          value: "sku",
        },


      ]
    }
  },

  watch: {
    mode(){
      this.fetchPreviewProducts();
    },
    page(){
      this.fetchPreviewProducts();
    },
    limit(){
      this.fetchPreviewProducts();
    },
    category_id(){
      this.fetchPreviewProducts();
    }
  },

  created() {
    this.fetchPreviewProducts();
  },

  mounted() {},

  beforeUnmount() {},
  methods: {
    fetchPreviewProducts(){
      this.busy_fetch = true;
      axios
          .get(
              window.ARTICLE_API.GET_SHOP_AUTO_REMOVE_DUPLICATED_PRODUCTS_PREVIEW(
                  this.shop.id,
              ),
              {
                params:{
                  mode: this.mode,
                  category_id: this.category_id?this.category_id:"*",
                  offset: (this.page - 1) * this.limit,
                  limit:this.limit,
                }
              },
          )
          .then(({ data }) => {
            if (data.error) {
              // Error!
              NotificationService.showErrorAlert(null, data.error_msg);
              return;
            }

            this.products = data.products;
            this.total = data.total;


          })
          .catch((e) => {
            NotificationService.showLaravelError(e);
          })
          .finally(() => {
            this.busy_fetch = false;
          });
    },
    autoRemoveDuplicatedProducts() {
      this.busy_remove = true;
      axios
        .post(
          window.ARTICLE_API.POST_SHOP_AUTO_REMOVE_DUPLICATED_PRODUCTS(
            this.shop.id,
          ),
          {
            mode: this.mode,
            category_id: this.category_id?this.category_id:"*",
          },
        )
        .then(({ data }) => {
          if (data.error) {
            // Error!
            NotificationService.showErrorAlert(null, data.error_msg);

            return;
          }

          NotificationService.showSuccessAlert(
            `Successfully Removed Duplicated Products | ${data.count}x`,
            "All duplicated products have been removed from your shop.",
          );
          this.$emit("close");
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_remove = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
