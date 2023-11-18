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
  <div>
    <div class="widget-box -large" >
      <h3 class="my-2 widget-title"
      >
        <v-icon class="me-1">post_add</v-icon>
        Structured data</h3
      >

      <v-scroll-y-transition group tag="v-row">
        <v-col
          v-for="(structure, index) in value"
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
                  width="60%"
                  height="auto"
                />
              </div>
              <b class="text-uppercase">{{ $t(findType(structure).title) }}</b>
              <p v-if="structure.name" class="font-weight-bold mb-1">
                {{ structure.name }}
              </p>
              <p v-if="structure.description" class="mb-1">
                {{ structure.description }}
              </p>
            </v-card-text>

            <span v-else class="p-3">Invalid data!</span>

            <v-btn
              icon
              color="red"
              @click.stop="remove(value, structure)"
              class="absolute-top-end sub-caption -hover"
              :caption="$t('global.actions.delete')"
              ><v-icon>close</v-icon></v-btn
            >
          </v-card>
        </v-col>
        <v-col key="new" cols="12" md="4" style="font-size: 12px">
          <add-button-green
            icon="add"
            class="rounded-18px"
            :caption="$t('global.json.add')"
            :message="$t('global.json.add_message')"
            @click="showDialog()"
            min-height="160px"
          >
          </add-button-green>
        </v-col>
      </v-scroll-y-transition>
    </div>

    <v-dialog v-model="dialog" max-width="1200px" scrollable>
      <v-card>
        <v-card-title>
          <span
            @click="selected_type = null"
            :class="{ 'pointer-pointer': selected_type }"
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
            <v-row>
              <v-col cols="12" md="6" order="2">
                <div class="text-center">
                  <img :src="selected_type.image" width="240px" height="auto" />
                </div>

                <b>{{ $t(selected_type.title) }}</b>
                <p>{{ $t(selected_type.desc) }}</p>

                <pre
                  v-copy
                  dir="ltr"
                  class="p-3 rounded dashed overflow-hidden"
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
                    :type="type"
                    :name="name"
                  ></s-structure-data-input>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- ================= STEP 1 =================== -->

          <v-card-text v-else>
            <v-container>
              <v-row>
                <v-col
                  v-for="(type, index) in types"
                  :key="index"
                  cols="12"
                  md="4"
                >
                  <v-card
                    class="shadow-paper text-start -hover pointer-pointer"
                    @click="selectType(type)"
                  >
                    <v-card-text>
                      <div class="text-center mb-2">
                        <img :src="type.image" width="80%" height="auto" />
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
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="
              () => {
                dialog = false;
                selected_type = null;
              }
            "
            class="m-1"
            >{{ $t("global.actions.close") }}</v-btn
          >
          <v-btn depressed @click="saveChange()" color="success" class="m-1">{{
            $t("global.actions.save")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AddButtonGreen from "../ui/button/AddButtonGreen.vue";
import SStructureDataInput from "./SStructureDataInput.vue";

export default {
  name: "SArticleStructuredData",
  components: { SStructureDataInput, AddButtonGreen },

  props: {
    value: {},

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
    if (!this.value || !Array.isArray(this.value)) this.$emit("input", []);
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
      if (!this.value || !Array.isArray(this.value)) {
        // Not set yet!
        this.$emit("input", [this.structure_data]);
      } else {
        if (!this.selected) {
          this.value.push(this.structure_data);
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
