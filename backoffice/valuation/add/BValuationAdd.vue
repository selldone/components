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
  <v-card
    :color="transparent ? 'transparent' : undefined"
    class="text-start"
    flat
  >
    <v-card-title>
      <v-icon class="me-2">calculate</v-icon>
      {{
        valuation
          ? $t("valuation_add.title_edit")
          : $t("valuation_add.title_add")
      }}
    </v-card-title>
    <v-card-text>
      <v-form ref="form" lazy-validation>
        <!-- ████████████████████████ Config ████████████████████████ -->

        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.config')"
            icon="tune"
          ></s-widget-header>
          <v-list-subheader>
            {{ $t("valuation_add.config.subtitle") }}
          </v-list-subheader>

          <v-text-field
            v-model="title"
            :label="$t('global.commons.title') + '*'"
            :rules="[GlobalRules.counter(120), GlobalRules.required()]"
            :messages="$t('valuation_add.inputs.title.message')"
            :placeholder="$t('valuation_add.inputs.title.placeholder')"
            variant="underlined"
          ></v-text-field>

          <u-smart-suggestion
            v-if="!title || !valuation?.id"
            :samples="$tm('suggestions.valuation.title')"
            @select="(v) => (title = v)"
          >
          </u-smart-suggestion>
        </div>
        <!-- ████████████████████████ Structure ████████████████████████ -->

        <div class="widget-box mb-5">
          <s-widget-header
            :add-caption="
              collapse
                ? $t('valuation_add.structure.expand_action')
                : $t('valuation_add.structure.collapse_action')
            "
            :add-icon="collapse ? 'unfold_more' : 'unfold_less'"
            add-text
            icon="table_view"
            :title="$t('valuation_add.structure.title')"
            @click:add="collapse = !collapse"
          ></s-widget-header>
          <v-list-subheader>
            {{ $t("valuation_add.structure.subtitle") }}
          </v-list-subheader>

          <b-valuation-form-structure
            v-model="structure"
            :collapse="collapse"
            :sample-product="product"
          >
          </b-valuation-form-structure>

          <!-- Preview -->
          <div
            v-if="$vuetify.display.lgAndUp && structure?.length > 0"
            style="
              max-width: 30vw;
              left: 50%;
              position: fixed;
              transform: translate(320px, 0);
              top: 0;
              bottom: 0;
              width: 30%;
            "
          >
            <div class="pa-3 text-muted text-center mt-5">
              <v-icon class="me-1">science</v-icon>
              {{ $t("valuation_add.valuation_preview") }}
            </div>

            <s-product-section-valuation
              v-model:preferences="preview_valuation"
              :product="{ ...preview_product,valuation:{structure,conditions} }"
              class="my-5"
              preview-mode
            ></s-product-section-valuation>
          </div>

          <div class="text-end m-3">
            <v-btn class="me-1" variant="text" @click="samples_dialog = true">
              <v-icon start>science</v-icon>

              {{ $t("valuation_add.load_sample") }}
            </v-btn>

            <v-menu :min-width="160">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" variant="elevated">
                  <v-icon start>add</v-icon>
                  {{ $t("global.form_builder.add_item_action") }}
                </v-btn>
              </template>
              <v-list class="text-start" rounded="lg">
                <v-list-item
                  v-for="(item_type, index) in types"
                  :key="index"
                  :prepend-icon="item_type.icon"
                  @click="addField(item_type.value)"
                >
                  <v-list-item-title
                    ><b>{{ item_type.title }}</b>

                    <v-icon
                      v-if="item_type.valuation"
                      class="ms-2"
                      color="primary"
                      size="small"
                      title="Has pricing formula"
                      >price_change
                    </v-icon>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <!-- ████████████████████████ Conditions ████████████████████████ -->
        <div class="widget-box mb-5">
          <s-widget-header
            icon="rule_folder"
            :title="$t('valuation_add.conditions.title')"
          ></s-widget-header>
          <v-list-subheader
            >{{ $t("valuation_add.conditions.subtitle") }}
          </v-list-subheader>

          <b-valuation-form-condition
            v-model="conditions"
            :shop="shop"
            :structure="structure"
          ></b-valuation-form-condition>
        </div>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="close">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="valuation && cloneMode"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addValuation()"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create_clone") }}
        </v-btn>

        <v-btn
          v-else-if="valuation"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="saveValuation"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
        <v-btn
          v-else
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addValuation"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </v-card-actions>

    <!-- ███████████████████████ Sample dialog ███████████████████████ -->
    <v-bottom-sheet
      v-model="samples_dialog"
      content-class="rounded-t-xl"
      max-width="98vw"
      width="640px"
      scrollable
    >
      <v-card class="rounded-t-xl text-start" rounded="0">
        <v-card-title>
          <v-icon class="me-2" color="#111">science</v-icon>
          {{ $t("valuation_add.samples.title") }}
        </v-card-title>

        <v-card-text>
          <v-list class="border-between-vertical" lines="two">
            <v-list-item
              v-for="(item, i) in samples"
              :key="i"
              :prepend-icon="item.icon"
              @click="
                title = title ? title : item.title;
                structure = item.structure;
                conditions = item.conditions;
                collapse = true;
                samples_dialog = false;
              "
            >
              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ item.description }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="samples_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </v-card>
</template>

<script>
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BValuationFormStructure from "../../valuation/form/structure/BValuationFormStructure.vue";
import { ValuationStructureItemType } from "../ValuationStructureItemType.ts";
import BValuationFormCondition from "../../valuation/form/condition/BValuationFormCondition.vue";
import SProductSectionValuation from "../../../storefront/product/section/valuation/SProductSectionValuation.vue";

export default {
  name: "BValuationAdd",
  components: {
    SProductSectionValuation,
    BValuationFormCondition,
    BValuationFormStructure,
    USmartSuggestion,
  },
  emits: ["close", "edit", "add", "update:valuation"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      // Sample product
      required: true,
      type: Object,
    },

    valuation: {
      required: false,
      type: Object,
    },
    cloneMode: {
      // Is clone mode? Create a clone from discountCode
      default: false,
      type: Boolean,
    },

    hasFile: {
      default: false,
      type: Boolean,
    },
    icon: {},
    hint: {},

    transparent: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    title: null,
    structure: [],
    conditions: null,

    busy_save: false,

    drag: false,

    collapse: false,

    samples_dialog: false,

    samples: [
      {
        title: "Notebook Pricing",
        description:
          "Users can choose a unique mix of variants, and the price will automatically adjust based on their preferences.",
        icon: "auto_stories",
        structure: [
          {
            name: "size",
            title: "Size",
            type: "select",
            pricing: true,
            sum: false,
            lookup: {
              'Pocket (3.5" x 5.5")': 1,
              'Medium (5.5" x 8.25")': 1.2,
              'Large (7.5" x 10")': 1.7,
            },
            selects: [
              'Pocket (3.5" x 5.5")',
              'Medium (5.5" x 8.25")',
              'Large (7.5" x 10")',
            ],
          },
          {
            name: "binding-type",
            title: "Binding Type",
            type: "select",
            pricing: true,
            sum: true,
            lookup: {
              "Perfect Bound": 2,
              Hardcover: 5,
            },
            selects: ["Spiral Bound", "Perfect Bound", "Hardcover"],
          },
        ],
        conditions: {
          unavailable: [],
        },
      },

      {
        title: "Handmade Jewelry",
        description:
          "A basic jewelry variant with adjustable pricing suitable for multiple products.",
        icon: "diamond",
        structure: [
          {
            name: "type",
            title: "Metal Type",
            type: "select",
            pricing: true,
            sum: true,
            lookup: {
              Gold: 200,
              Silver: 50,
            },
            selects: ["Gold", "Silver", "Bronze"],
          },
          {
            name: "stone",
            title: "Stone",
            type: "select",
            pricing: true,
            sum: true,
            lookup: {
              Diamond: 100,
              Ruby: 50,
            },
            selects: ["Diamond", "Ruby", "Sapphire"],
          },
        ],
        conditions: {
          unavailable: [],
        },
      },
    ],

    types: ValuationStructureItemType,

    preview_valuation: { valuation: {} },
  }),

  computed: {
    preview_product() {
      return Object.assign(
        {
          valuation: { structure: this.structure, conditions: this.conditions },
        },
        this.product,
      );
    },
  },

  watch: {},
  created() {
    if (this.valuation) {
      this.title = this.valuation.title;
      this.structure = Object.assign([], this.valuation.structure);
      this.conditions = Object.assign({}, this.valuation.conditions);
    } else {
      this.structure = [];
      this.conditions = {};
    }

    if (this.cloneMode) {
      this.title += " - 🍒clone";
    }

    // Default collapse if valuation is not null (in edit mode)
    this.collapse = !!this.valuation;
  },
  methods: {
    addField(type) {
      this.structure.push({
        name: "",
        title: "",
        type: type,
        pricing: false,
        sum: true,
        lookup: {} /*Pricing lookup table*/,
      });
      //this.$forceUpdate(); // Force refresh component!
    },

    saveValuation() {
      this.$refs.form.validate();

      this.busy_save = true;

      axios
        .put(
          window.API.PUT_EDIT_SHOP_VALUATION(this.shop.id, this.valuation.id),
          {
            title: this.title,
            structure: this.structure,
            conditions: this.conditions,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update:valuation", data.valuation);
            this.$emit("edit", data.valuation);
            this.showSuccessAlert(
              null,
              "Valuation form has been successfully updated.",
            );
            this.close();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
    addValuation() {
      this.$refs.form.validate();

      this.busy_save = true;

      axios
        .post(window.API.POST_ADD_SHOP_VALUATION(this.shop.id), {
          title: this.title,
          structure: this.structure,
          conditions: this.conditions,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update:valuation", data.valuation);
            this.$emit("add", data.valuation);
            this.showSuccessAlert(
              null,
              "Valuation form has been successfully created.",
            );
            this.close();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped></style>
