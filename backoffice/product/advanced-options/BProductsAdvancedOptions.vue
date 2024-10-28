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
  <!-- █████████████████████ Edit Dialog █████████████████████ -->
  <v-dialog
    :model-value="modelValue"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card>
      <v-toolbar extended extension-height="10" v-bind="SUB_TOOLBAR_CONFIG">
        <template v-slot:extension>
          <div style="height: 10px"></div>
        </template>
        <v-row align="center" class="body-title px-3" no-gutters>
          <span
            :to="{ name: 'BPageShopProductsList' }"
            class="pp text-primary"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon class="me-1" size="small">view_module </v-icon>
            <span>{{ $t("admin_shop.products.title") }}</span>
          </span>

          <v-icon class="mx-1" size="small"
            >{{ $t("icons.angle_next") }}
          </v-icon>

          <span :class="{ 'pp text-primary': action }" @click="action = null">
            <v-icon class="me-1" size="small">settings_suggest </v-icon>
            {{ $t("admin_shop.products.menu_advanced_options") }}
          </span>

          <v-fade-transition>
            <span v-if="action">
              <v-icon class="mx-1" size="small">{{
                $t("icons.angle_next")
              }}</v-icon>

              <v-icon class="mx-1" size="small">{{ action.icon }}</v-icon>
              {{ action.title }}
            </span>
          </v-fade-transition>
          <v-spacer />
        </v-row>
      </v-toolbar>

      <v-card-text>
        <div v-if="!action" class="widget-box mb-5">
          <u-widget-header
            icon="batch_prediction"
            title="Advanced Options"
          ></u-widget-header>
          <v-list-subheader> Please choose an option listed.</v-list-subheader>

          <v-list class="bg-transparent border-between-vertical">
            <v-list-item
              v-for="op in options"
              :key="op.code"
              :prepend-icon="op.icon"
              class="row-hover rounded-lg"
              @click="action = op"
            >
              <v-list-item-title>
                {{ op.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ op.description }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
        <!-- ━━━━━━━━━━━━━━━ BProductsAdvancedOptions > Fix articles ━━━━━━━━━━━━━━━ -->

        <b-products-advanced-options-fix-articles
          v-else-if="action?.code === 'article'"
          :shop="shop"
          :vendor="vendor"
          @close="$emit('update:modelValue', false)"
        ></b-products-advanced-options-fix-articles>

        <!-- ━━━━━━━━━━━━━━━ BProductsAdvancedOptions > Google Sheet ━━━━━━━━━━━━━━━ -->

        <b-products-advanced-options-google-sheet
          v-else-if="action?.code === 'sheet'"
          :shop="shop"
          :vendor="vendor"
          @close="$emit('update:modelValue', false)"
        ></b-products-advanced-options-google-sheet>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import BProductsAdvancedOptionsFixArticles from "../../product/advanced-options/fix-articles/BProductsAdvancedOptionsFixArticles.vue";
import BProductsAdvancedOptionsGoogleSheet from "../../product/advanced-options/google-sheet/BProductsAdvancedOptionsGoogleSheet.vue";

export default {
  name: "BProductsAdvancedOptions",
  components: {
    BProductsAdvancedOptionsGoogleSheet,
    BProductsAdvancedOptionsFixArticles,
  },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},

    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: () => ({
    action: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    options() {
      return [
        {
          code: "article",
          icon: "description",
          title: "Fix Products Descriptions",
          description:
            "Are your product descriptions imported from third-party platforms like WooCommerce or via Excel files poorly structured?",
        },

        {
          code: "sheet",
          icon: "add_to_drive",
          title: "Connect Google Drive™",
          description:
            "You have the option to link your shop with your Google Drive™. ",
        },
      ];
    },
  },

  watch: {
    modelValue(value) {
      if (!value) this.action = null;
    },
  },

  created() {},

  mounted() {},

  beforeUnmount() {},
  methods: {},
};
</script>

<style lang="scss" scoped></style>
