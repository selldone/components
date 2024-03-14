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
  <div v-bind="$attrs">
    <div class="widget-box -large">
      <h3 class="my-2 widget-title">
        <v-icon class="me-1">post_add</v-icon>
        Structured data
      </h3>

      <v-row>
        <v-fade-transition group leave-absolute>
          <v-col
            v-for="(structure, index) in modelValue"
            :key="index"
            cols="12"
            md="4"
          >
            <v-card
              class="text-start shadow-box -hover min-h-100 rounded-18px"
              @click="showDialog(structure)"
            >
              <v-card-text v-if="findType(structure)">
                <div class="text-center mb-2">
                  <img
                    :src="findType(structure).image"
                    height="auto"
                    width="60%"
                  />
                </div>
                <b class="text-uppercase">{{
                  $t(findType(structure).title)
                }}</b>
                <p v-if="structure.name" class="font-weight-bold mb-1">
                  {{ structure.name }}
                </p>
                <p v-if="structure.description" class="mb-1">
                  {{ structure.description }}
                </p>
              </v-card-text>

              <span v-else class="p-3">Invalid data!</span>

              <v-btn
                class="absolute-top-end"
                color="red"
                icon
                variant="text"
                @click.stop="remove(modelValue, structure)"
              >
                <v-icon>close</v-icon>
                <v-tooltip content-class="bg-red text-white" activator="parent">
                  {{ $t("global.actions.delete") }}
                </v-tooltip>
              </v-btn>
            </v-card>
          </v-col>
          <v-col key="new" cols="12" md="4" style="font-size: 12px">
            <s-add-button-green
              :caption="$t('global.json.add')"
              :message="$t('global.json.add_message')"
              class="rounded-18px"
              icon="add"
              min-height="160px"
              @click="showDialog()"
            >
            </s-add-button-green>
          </v-col>
        </v-fade-transition>
      </v-row>
    </div>
  </div>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title>
        <span
          :class="{ 'pointer-pointer': selected_type }"
          @click="selected_type = null"
          >{{ $t("global.json.structures") }}</span
        >
        <span v-if="selected_type"
          ><v-icon class="mx-2">{{ $t("icons.angle_next") }}</v-icon>
          {{ $t(selected_type.title) }}</span
        ></v-card-title
      >

      <v-fade-transition leave-absolute>
        <!-- ================= STEP 2 =================== -->
        <v-card-text v-if="selected_type" class="text-start">
          <v-container>
            <v-row align="stretch">
              <v-col cols="12" md="6" order="2">
                <div class="text-center">
                  <img :src="selected_type.image" height="auto" width="240px" />
                </div>

                <b>{{ $t(selected_type.title) }}</b>
                <p>{{ $t(selected_type.desc) }}</p>

                <pre
                  v-copy
                  class="p-3 rounded dashed overflow-hidden"
                  dir="ltr"
                  v-text="structure_data_pretty"
                ></pre>
              </v-col>

              <v-col cols="12" md="6" order="1">
                <div v-for="(type, name) in selected_type.inputs" :key="name">
                  <div v-if="false" class="bg-primary text-white">
                    {{ name }}:{{ type }}
                  </div>

                  <s-structure-data-input
                    v-model="structure_data[name]"
                    :name="name"
                    :type="type"
                  ></s-structure-data-input>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <!-- ================= STEP 1 =================== -->

        <v-card-text v-else>
          <v-container>
            <v-row align="stretch">
              <v-col
                v-for="(type, index) in types"
                :key="index"
                cols="12"
                md="4"
              >
                <v-card
                  class="shadow-paper -hover pp min-h-100"
                  @click="selectType(type)"
                >
                  <v-card-text>
                    <div class="mb-2">
                      <img :src="type.image" height="auto" width="80%" />
                    </div>

                    <b>{{ $t(type.title) }}</b>
                    <p>{{ $t(type.desc) }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-fade-transition>

      <v-card-actions>
        <s-widget-buttons>
          <v-btn
            size="x-large"
            variant="text"
            @click="
              () => {
                dialog = false;
                selected_type = null;
              }
            "
            prepend-icon="close"
            >{{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            size="x-large"
            color="primary"
            variant="elevated"
            @click="saveChange()"
            prepend-icon="check"
            >{{ $t("global.actions.confirm") }}
          </v-btn>
        </s-widget-buttons>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SAddButtonGreen from "../ui/button/add/SAddButtonGreen.vue";
import SStructureDataInput from "./SStructureDataInput.vue";
import SWidgetButtons from "@components/ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "SArticleStructuredData",
  components: { SWidgetButtons, SStructureDataInput, SAddButtonGreen },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},

    editMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: null, // Selected item for editing.
      structure_data: null,

      types: [
        {
          "@type": "Book",
          title: "global.json.book.title",
          desc: "global.json.book.desc",
          image: require("@components/assets/jsonld/jsonld-book.svg"),
          inputs: { name: "text", author: "@Person", workExample: ["@Book"] },
        },
        {
          "@type": "Occupation",
          title: "global.json.occupation.title",
          desc: "global.json.occupation.desc",
          image: require("@components/assets/jsonld/jsonld-ocupation.svg"),
          inputs: {
            name: "text",
            mainEntityOfPage: "@WebPage",
            description: "text",
            estimatedSalary: ["@MonetaryAmountDistribution"],
            occupationLocation: ["@City"],
          },
        },
        {
          "@type": "Course",
          title: "global.json.course.title",
          desc: "global.json.course.desc",
          image: require("@components/assets/jsonld/jsonld-course.svg"),
          inputs: {
            name: "text",
            description: "text",
            provider: "@Organization",
          },
        },
        {
          "@type": "HowTo",
          title: "global.json.howto.title",
          desc: "global.json.howto.desc",
          image: require("@components/assets/jsonld/jsonled-howto.svg"),
          inputs: {
            name: "text",
            description: "text",
            image: "@ImageObject",
            estimatedCost: "@MonetaryAmount",
            supply: ["@HowToSupply"],
            tool: ["@HowToTool"],
            step: ["@HowToStep"],
            totalTime: "duration",
          },
        },

        {
          "@type": "Recipe",
          title: "global.json.recipe.title",
          desc: "global.json.recipe.desc",
          image: require("@components/assets/jsonld/jsonld-recipe.svg"),
          inputs: {
            name: "text",
            description: "text",
            image: ["url"],
            author: "@Person",
            datePublished: "date",
            prepTime: "duration",
            cookTime: "duration",
            totalTime: "duration",
            keywords: "text",
            recipeYield: "text",
            recipeCategory: "text",
            recipeCuisine: "text",
            nutrition: "@NutritionInformation",
            recipeIngredient: ["text"],
            recipeInstructions: ["@HowToStep"],
            aggregateRating: "@AggregateRating",
            video: "@VideoObject",
            expires: "date",
          },
        },
      ],

      //-----------------------
      selected_type: null,
      dialog: false,
    };
  },

  computed: {
    structure_data_pretty() {
      return JSON.stringify(this.structure_data, null, 2);
    },
  },

  created() {
    if (!this.modelValue || !Array.isArray(this.modelValue))
      this.$emit("update:modelValue", []);
  },

  methods: {
    showDialog(jsonld = null) {
      this.selected_type = null;
      this.dialog = true;
      this.selected = null;

      if (jsonld) {
        this.selected_type = this.findType(jsonld);
        this.structure_data = jsonld;
        this.selected = jsonld;
      }
    },
    selectType(type) {
      this.selected_type = type;

      // New jsonld:
      if (!this.selected)
        this.structure_data = {
          "@context": "https://schema.org",
          "@type": this.selected_type["@type"],
        };
    },

    saveChange() {
      if (!this.modelValue || !Array.isArray(this.modelValue)) {
        // Not set yet!
        this.$emit("update:modelValue", [this.structure_data]);
      } else {
        if (!this.selected) {
          this.modelValue.push(this.structure_data);
        }
      }

      this.dialog = false;
      this.selected_type = null;
    },

    findType(jsonld) {
      return this.types.find((it) => it["@type"] === jsonld["@type"]);
    },
  },
};
</script>

<style scoped></style>
