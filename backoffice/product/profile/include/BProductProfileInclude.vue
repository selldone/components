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
  <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Package Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

  <v-list-item class="row-hover" prepend-icon="bento" @click="showIncludes()" slim>
    <v-list-item-title>
      <b
        >{{ $t("global.commons.included_in_the_product") }}
        <span v-if="product.includes?.length">
          <v-icon class="mx-1" color="#111">{{
            $t("icons.chevron_next")
          }}</v-icon>
          {{ product.includes.length }} items</span
        >
      </b>
    </v-list-item-title>

    <v-menu v-for="include in product.includes" :key="include.id" open-on-hover>
      <template v-slot:activator="{ props }">
        <v-avatar class="me-2" color="#fff" rounded size="24" v-bind="props">
          <img :src="getShopImagePath(include.image)" />
        </v-avatar>
      </template>
      <v-sheet class="pa-3 small" color="#fff" rounded="xl">
        <v-img
          :src="getShopImagePath(include.image)"
          class="mx-auto mb-3 rounded-lg"
          height="128"
          width="128"
        />
        <div>
          {{ include.title }}
        </div>
      </v-sheet>
    </v-menu>
    <v-list-item-subtitle v-if="!product.includes?.length">
      {{ $t("product_include_profile.subtitle") }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          :color="product.includes?.length ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon
            >{{ product.includes?.length ? "check_box" : "add_box" }}
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </template>

    <!-- ██████████████████████ Dialog > Select Included in the product ██████████████████████ -->

    <v-dialog
      v-model="includes_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">bento</v-icon>
          {{ $t("product_include_profile.dialog.header") }}
        </v-card-title>
        <v-card-text>
          <div class="widget-box -large mb-5">
            <u-widget-header
              :add-caption="$t('product_include_profile.dialog.action_manage')"
              :disabled="IS_VENDOR_PANEL"
              :disabled-reason="
                $t('product_include_profile.dialog.action_disable_msg')
              "
              :title="$t('product_include_profile.dialog.title')"
              :to="{ name: 'BPageShopLogisticIncludes' }"
              add-icon="ballot"
              add-text
              icon="library_add_check"
            >
            </u-widget-header>

            <v-expand-transition>
              <div v-if="includes?.length">
                <v-list-subheader>
                  {{ $t("product_include_profile.dialog.subtitle") }}
                </v-list-subheader>
                <v-container>
                  <v-row>
                    <v-col
                      v-for="it in includes"
                      :key="it.id"
                      class="text-center small position-relative"
                      cols="12"
                      lg="3"
                      md="4"
                      sm="6"
                    >
                      <v-img
                        :src="getShopImagePath(it.image)"
                        aspect-ratio="1"
                        class="mx-auto my-3 rounded-lg"
                        max-width="90%"
                        width="128"
                      />
                      <div>
                        {{ it.title }}
                      </div>
                      <div class="small text-muted" title="Item Code">
                        code: <span v-copy>{{ it.code }}</span>
                      </div>
                      <v-btn
                        class="absolute-top-end"
                        icon
                        size="small"
                        variant="flat"
                        @click="DeleteItemByID(includes, it.id)"
                      >
                        <v-icon color="red">close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </v-expand-transition>

            <v-list-subheader>
              {{ $t("product_include_profile.dialog.select_items_tips") }}
            </v-list-subheader>

            <div class="max-widget-width">
              <v-locale-provider :rtl="false">
                <b-include-item-input
                  v-model="selected_include"
                  :shop="shop"
                  @update:model-value="
                    (val) => {
                      if (val) AddOrUpdateItemByID(includes, val);
                    }
                  "
                ></b-include-item-input>
              </v-locale-provider>
            </div>

            <template v-if="!IS_VENDOR_PANEL">
              <v-list-subheader>
                {{ $t("product_include_profile.dialog.create_item_tips") }}
              </v-list-subheader>

              <div class="widget-buttons">
                <v-btn
                  size="x-large"
                  variant="outlined"
                  @click="dialog_add = true"
                >
                  <v-icon class="me-1">add_box</v-icon>
                  {{
                    $t("product_include_profile.dialog.create_new_item_action")
                  }}
                </v-btn>
              </div>
            </template>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="includes_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="busy_save"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="saveIncludes()"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ██████████████████████ Dialog > Select Included in the product ██████████████████████ -->

    <v-dialog
      v-model="dialog_add"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <b-include-item-add
        :shop="shop"
        :vendor="vendor"
        class="max-widget-width"
        dialog-mode
        @add="
          (include) => {
            AddOrUpdateItemByID(includes, include);
            dialog_add = false;
          }
        "
        @close="dialog_add = false"
      >
      </b-include-item-add>
    </v-dialog>
  </v-list-item>
</template>

<script lang="ts">
import BIncludeItemInput from "../../../include-item/input/BIncludeItemInput.vue";
import BIncludeItemAdd from "../../../include-item/add/BIncludeItemAdd.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductProfileInclude",
  mixins: [],
  components: {
    BIncludeItemAdd,
    BIncludeItemInput,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },

  data: function () {
    return {
      includes: [],
      includes_dialog: false,

      selected_include: null,
      busy_save: false,

      dialog_add: false,
    };
  },
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {},

  created() {},

  methods: {
    // ████████████████████ Included in the box ████████████████████

    showIncludes() {
      this.includes = Object.assign([], this.product.includes); // Return object!
      if (!this.includes || !Array.isArray(this.includes)) this.includes = [];
      this.includes_dialog = true;
      this.selected_include = null;
    },

    saveIncludes() {
      this.busy_save = true;

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_INCLUDE_SET(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_PRODUCT_INCLUDE_SET(
                this.shop.id,
                this.product.id,
              ),
          {
            ids: this.includes?.map((i) => i.id),
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.product.includes = data.includes;
          this.includes_dialog = false;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.label-s-number-input {
  color: #2f3133;
  font-weight: 400;
  vertical-align: baseline;
  text-align: start;
  margin: 0 16px;
}
</style>
