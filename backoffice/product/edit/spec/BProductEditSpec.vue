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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-bind="$attrs">
    <!-- ████████████████████ Spec Fields ████████████████████ -->

    <div :class="{ '-large': expanded }" class="widget-box mb-5 mt-5">
      <s-widget-header
        :title="$t('add_product.edit_spec.title')"
        icon="summarize"
      >
      </s-widget-header>
      <v-list-subheader>
        {{ $t("add_product.edit_spec.subtitle") }}
      </v-list-subheader>
      <b-product-spec-table
        :class="{ disabled: add_by_dropShipping }"
        :spec="spec"
        class="max-width-container-1280px my-8"
        editable
        @save="
          (list) => {
            spec = list;
            saveSpec(false);
          }
        "
        @update="
          (list) => {
            spec = list;
          }
        "
        @click-delete="deleteItemSpec"
      />

      <v-btn
        class="absolute-top-end"
        icon
        variant="text"
        @click="expanded = !expanded"
      >
        <v-icon :class="{ 'rotate-180': expanded }" size="small">
          {{ expanded ? "close_fullscreen" : "open_in_full" }}
        </v-icon>
      </v-btn>

      <template v-if="!add_by_dropShipping">
        <s-widget-header
          :title="$t('add_product.edit_spec.manual.title')"
          icon="format_list_bulleted_add"
        ></s-widget-header>
        <v-list-subheader>
          {{ $t("add_product.edit_spec.manual.subtitle") }}
        </v-list-subheader>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Add Group ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-bottom-sheet
          content-class="rounded-t-xl"
          inset
          max-width="640"
          width="98%"
        >
          <template v-slot:activator="{ props }">
            <div class="widget-buttons">
              <v-btn color="#000" size="x-large" v-bind="props" variant="flat">
                <v-icon start>create_new_folder</v-icon>

                <div>
                  <b>
                    {{ $t("add_product.edit_spec.manual.add_group_action") }}</b
                  >
                  <div
                    class="d-flex align-center justify-content-around mt-1 min-width-150"
                  >
                    <div
                      class="bg-amber rounded-lg"
                      style="height: 8px; width: 90%"
                    ></div>
                  </div>
                </div>
              </v-btn>
            </div>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card
              :title="$t('add_product.edit_spec.group_input_header')"
              class="text-start"
              prepend-icon="create_new_folder"
              rounded="t-xl"
            >
              <v-card-text>
                <v-text-field
                  v-model="group_title"
                  :label="$t('add_product.edit_spec.group_input')"
                  :placeholder="$t('add_product.edit_spec.group_input_message')"
                  color="#ffa000"
                  variant="underlined"
                  @keypress.enter.stop="addGroup"
                />
                <u-smart-suggestion
                  :samples="$tm('suggestions.spec.group')"
                  @select="(v) => (group_title = v)"
                ></u-smart-suggestion>
              </v-card-text>

              <v-card-actions>
                <div class="widget-buttons">
                  <v-btn size="x-large" @click="isActive.value = false">
                    <v-icon start>close</v-icon>
                    {{ $t("global.actions.close") }}
                  </v-btn>
                  <v-btn
                    :class="{ disabled: !group_title }"
                    color="primary"
                    size="x-large"
                    variant="elevated"
                    @click="addGroup"
                  >
                    <v-icon start>add</v-icon>
                    {{ $t("add_product.edit_spec.group_add_action") }}
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </template>
        </v-bottom-sheet>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Add Item ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-bottom-sheet
          content-class="rounded-t-xl"
          inset
          max-width="640"
          width="98%"
        >
          <template v-slot:activator="{ props }">
            <div class="widget-buttons">
              <v-btn color="#000" size="x-large" v-bind="props" variant="flat">
                <v-icon start>post_add</v-icon>
                <div>
                  <b>{{
                    $t("add_product.edit_spec.manual.add_item_action")
                  }}</b>
                  <div
                    class="d-flex align-center justify-content-around mt-1 min-width-150"
                  >
                    <div
                      class="bg-blue rounded-lg"
                      style="height: 8px; width: 30%"
                    ></div>
                    <div
                      class="bg-blue rounded-lg"
                      style="height: 8px; width: 60%"
                    ></div>
                  </div>
                </div>
              </v-btn>
            </div>
          </template>
          <template v-slot:default="{ isActive }">
            <v-card
              :title="$t('add_product.edit_spec.item_title_header')"
              class="text-start"
              prepend-icon="post_add"
              rounded="t-xl"
            >
              <v-card-text>
                <v-text-field
                  v-model="item_title"
                  :label="$t('add_product.edit_spec.item_title_input')"
                  :placeholder="
                    $t('add_product.edit_spec.item_title_input_message')
                  "
                  color="#673ab7"
                  variant="underlined"
                />

                <v-text-field
                  v-model="item_value"
                  :label="$t('add_product.edit_spec.item_value_input')"
                  :placeholder="
                    $t('add_product.edit_spec.item_value_input_message')
                  "
                  color="#673ab7"
                  variant="underlined"
                  @keypress.enter.stop="addSpec"
                />
              </v-card-text>
              <v-card-actions>
                <div class="widget-buttons">
                  <v-btn size="x-large" @click="isActive.value = false">
                    <v-icon start>close</v-icon>
                    {{ $t("global.actions.close") }}
                  </v-btn>

                  <v-btn
                    :class="{ disabled: !item_title || !item_value }"
                    color="primary"
                    size="x-large"
                    variant="elevated"
                    @click="addSpec"
                  >
                    <v-icon start>add</v-icon>
                    {{ $t("add_product.edit_spec.add_item_action") }}
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </template>
        </v-bottom-sheet>

        <!-- ████████████████████ Import ████████████████████ -->

        <div class="dashed-hr my-2 mx-n5"></div>
        <s-widget-header
          :title="$t('global.commons.import')"
          icon="save_alt"
        ></s-widget-header>
        <v-list-subheader>
          {{ $t("add_product.edit_spec.import.subtitle") }}
        </v-list-subheader>

        <div class="widget-buttons">
          <v-btn
            color="#000"
            size="x-large"
            variant="flat"
            @click="dialog_import = true"
          >
            <v-icon start> download</v-icon>

            <div>
              {{ $t("add_product.edit_spec.import.action_title") }}

              <div class="small mt-1">
                {{ $t("add_product.edit_spec.import.action_subtitle") }}
              </div>
            </div>
          </v-btn>
        </div>

        <!-- ████████████████████ AI ████████████████████ -->

        <div class="dashed-hr my-2 mx-n5"></div>

        <s-widget-header
          :title="$t('add_product.edit_spec.ai.title')"
          icon="auto_fix_high"
        ></s-widget-header>

        <v-list-subheader>
          {{ $t("add_product.edit_spec.ai.subtitle") }}
        </v-list-subheader>

        <u-button-ai-large
          :sub-title="$t('add_product.edit_spec.ai.action_subtitle')"
          :title="$t('add_product.edit_spec.ai.action_title')"
          @select="
            dialog_ai = true;
            prompt = null;
          "
        >
        </u-button-ai-large>
      </template>
    </div>

    <!-- ████████████████████ Actions ████████████████████ -->

    <s-widget-buttons auto-fixed-position>
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="saveSpec(true)"
      >
        {{
          add_by_dropShipping
            ? $t("global.actions.next")
            : $t("global.actions.save_continue")
        }}

        <v-icon end>
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>

  <!-- ████████████████████ Dialog > Import Spec ████████████████████ -->

  <v-dialog
    v-model="dialog_import"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1" color="#333">save_alt</v-icon>
        {{ $t("add_product.edit_spec.dialog.title") }}

        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="dialog_import = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <u-loading-progress v-if="busy || busy_find"></u-loading-progress>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog Wizard > Select product ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-container class="mx-auto min-height-50vh" style="max-width: 1720px">
          <b-products-window
            v-if="dialog_import"
            :hash="$route.hash"
            :shop="shop"
            :vendor="product.vendor"
            compact-mode
            dialog-mode
            set="spec"
            @select="selectProduct"
          />
        </v-container>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog Wizard > Selected product info  (spec) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-expand-transition>
          <div v-if="spec_selected">
            <div class="widget-box -large mb-5">
              <s-widget-header
                :title="$t('add_product.edit_spec.dialog.spec_view_title')"
                icon="info_outline"
              >
              </s-widget-header>
              <v-list-subheader
                >The specifications have been imported from the chosen product.
              </v-list-subheader>

              <b-product-spec-table
                :spec="spec_selected"
                class="min-height-10vh"
              ></b-product-spec-table>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_import = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !spec_selected }"
            color="primary"
            size="x-large"
            @click="
              () => {
                safeSetSpec(spec_selected);
                dialog_import = false;
              }
            "
          >
            <v-icon class="me-1">copy_all</v-icon>
            {{ $t("add_product.edit_spec.dialog.set_spec_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ████████████████████ Dialog > AI ████████████████████ -->

  <v-dialog
    v-model="dialog_ai"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1" color="#333">auto_fix_high</v-icon>
        Auto generate product spec
      </v-card-title>

      <v-card-text>
        <u-loading-progress v-if="busy || busy_find"></u-loading-progress>

        <div class="widget-box -large mb-5">
          <s-widget-header icon="mode_comment" title="Prompt">
            <template v-slot:actions>
              <b-ai-model-input
                v-model="ai_model"
                background-color="transparent"
                class="max-w-300"
                flat
                hide-details
                label="label"
                single-line
                variant="plain"
              >
              </b-ai-model-input>
            </template>
          </s-widget-header>

          <v-list-subheader>
            Please input a concise overview of the product, including essential
            and notable details. We will utilize this information to
            automatically generate the product's specifications.
          </v-list-subheader>

          <v-textarea
            v-model="prompt"
            :counter="1024"
            class="my-5"
            label="Product Raw Info"
            persistent-placeholder
            placeholder="Write about the product..."
            variant="underlined"
          ></v-textarea>

          <u-button-ai-large
            :class="{ disabled: !prompt }"
            :loading="busy_ai"
            sub-title="Start create product specifications by abstract prompt."
            title="Auto Generate Now"
            @select="autoGenerateAI"
          >
          </u-button-ai-large>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog Wizard > Selected product info  (spec) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-expand-transition>
          <div v-if="spec_generated">
            <div class="widget-box -large mb-5">
              <s-widget-header icon="info_outline" title="Auto generated spec">
              </s-widget-header>
              <v-list-subheader
                >This content has been generated by artificial intelligence.
              </v-list-subheader>

              <b-product-spec-table
                :spec="spec_generated"
                class="min-height-10vh"
              ></b-product-spec-table>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="outlined" @click="dialog_ai = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !spec_generated }"
            color="primary"
            size="x-large"
            variant="outlined"
            @click="
              () => {
                safeSetSpec(spec_generated);
                dialog_ai = false;
              }
            "
          >
            <v-icon class="me-1">copy_all</v-icon>
            Add generated spec
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import BProductSpecTable from "../../../../storefront/product/spec/table/BProductSpecTable.vue";
import BProductsWindow from "../../../product/window/BProductsWindow.vue";
import { SpecHelper } from "@selldone/core-js/helper/product/SpecHelper";
import BAiModelInput from "../../../../backoffice/ai/model/input/BAiModelInput.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import UButtonAiLarge from "../../../../ui/button/ai/large/UButtonAiLarge.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BProductEditSpec",
  components: {
    SWidgetButtons,
    UButtonAiLarge,
    USmartSuggestion,
    BAiModelInput,
    BProductsWindow,
    BProductSpecTable,
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
  },

  data: () => ({
    dialog_select_rating: false,

    busy: false,

    spec: [],
    // spec_order:[],

    item_title: "",
    item_value: "",

    group_title: "",
    //------------
    dialog_import: false,

    product_selected: null,
    spec_selected: null,

    search_product_code: null,

    busy_find: false,

    expanded: false,
    //---------------
    dialog_ai: false,
    ai_model: "chatgpt",
    prompt: null,
    busy_ai: false,
    spec_generated: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
  },

  watch: {
    spec(spec) {
      if (!this.spec) this.spec = [];
    },
  },

  created() {
    if (!this.product.spec) this.product.spec = {};

    this.spec = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
      this.product.spec,
      this.product.spec_order,
    );
  },
  methods: {
    addGroup() {
      if (!this.group_title) {
        this.showWarningAlert(
          null,
          this.$t(
            "add_product.edit_spec.notifications.enter_group_title_error",
          ),
        );
        return;
      }

      if (!this.spec) this.spec = [];

      this.spec.push({ group: this.group_title });
      this.saveSpec(false);

      this.group_title = "";
    },
    addSpec() {
      if (!this.item_title || !this.item_value) {
        this.showWarningAlert(
          null,
          this.$t(
            "add_product.edit_spec.notifications.enter_item_title_and_value_error",
          ),
        );
        return;
      }

      if (!this.spec) this.spec = [];

      this.spec.push([this.item_title, this.item_value]);
      this.saveSpec(false);

      this.item_title = "";
      this.item_value = "";
    },

    deleteItemSpec(index) {
      this.spec.splice(index, 1);
      this.saveSpec(false);
    },

    saveSpec(go_next = false) {
      if (this.add_by_dropShipping) {
        if (!go_next) return;
        this.$emit("next");
        return;
      }

      this.busy = true;

      //console.log("spec", this.spec);

      const { spec_json, spec_order } = SpecHelper.CONVERT_SPEC_ARRAY_TO_JSON(
        this.spec,
      );

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_SAVE_SPEC(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_SAVE_SPEC(this.product.shop_id, this.product.id),
          {
            spec: spec_json,
            spec_order: spec_order,
          },
        )
        .then((response) => {
          if (!response.data.error) {
            this.showSuccessAlert(
              null,
              this.$t("add_product.edit_spec.notifications.spec_saved_success"),
            );
            this.product.spec = response.data.spec;
            this.product.spec_order = response.data.spec_order;

            this.$emit("update-spec", {
              spec: response.data.spec,
              spec_order: response.data.spec_order,
            }); // Update main product!

            if (go_next) this.$emit("next");
          } else {
            this.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    safeSetSpec(new_spec) {
      this.spec = new_spec.filter((item) => {
        return item && (Array.isArray(item) ? item.length >= 2 : item.group);
      });
    },

    selectProduct(product_selected) {
      // console.log("selectProduct", product_selected);
      this.product_selected = product_selected;
      this.getSpecProduct(`P${product_selected.id}`);
    },

    getSpecProduct(product_code) {
      if (!product_code) return;

      this.busy_find = true;
      axios
        .get(
          this.IS_VENDOR_PANEL
            ? window.VAPI.GET_MY_VENDOR_SPEC_OF_PRODUCT(
                this.$route.params.vendor_id,
                product_code,
              )
            : window.API.GET_SPEC_OF_PRODUCT(this.shop.id, product_code),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            if (data.spec)
              this.spec_selected = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
                data.spec,
                data.spec_order,
              ).filter(Boolean);
            else this.spec_selected = [];
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_find = false;
        });
    },

    autoGenerateAI() {
      this.busy_ai = true;
      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_AI_PRODUCT_AUTO_CREATE_SPEC(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_AI_PRODUCT_AUTO_CREATE_SPEC(
                this.shop.id,
                this.product.id,
              ),
          {
            prompt: this.prompt,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            if (data.spec)
              this.spec_generated = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
                data.spec,
                data.spec_order,
              ).filter(Boolean);
            else this.spec_generated = [];
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.6rem;
}
</style>
