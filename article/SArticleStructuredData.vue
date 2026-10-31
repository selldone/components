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
  <section v-if="workspace" v-bind="$attrs" class="s-article-structures-refined sd-modern-widget text-start">
    <header class="s-article-structures-refined__heading">
      <div>
        <div class="s-article-structures-refined__title-row">
          <h2>{{ t('structure_title') }}</h2>
          <v-btn class="sd-modern-info-button" icon variant="text" :aria-label="t('structure_help')">
            <v-icon size="14">info_outline</v-icon>
            <v-tooltip activator="parent" content-class="sd-modern-tooltip text-start" location="top">{{ t('structure_help') }}</v-tooltip>
          </v-btn>
        </div>
        <p>{{ t('structure_subtitle') }}</p>
      </div>
      <v-btn v-if="editMode" class="sd-modern-button sd-modern-button--compact" variant="text" prepend-icon="add" @click="showDialog()">{{ t('structure_add') }}</v-btn>
    </header>
    <div v-if="Array.isArray(modelValue) && modelValue.length">
      <div class="s-article-structures-refined__list-heading sd-modern-list-header">
        <span>{{ t('structure_content') }}</span><span>{{ t('structure_status') }}</span><span>{{ t('structure_actions') }}</span>
      </div>
      <div v-for="(structure, index) in modelValue" :key="index" class="s-article-structures-refined__row">
        <div class="s-article-structures-refined__record">
          <span class="s-article-structures-refined__icon"><v-icon size="17" aria-hidden="true">{{ typeIcon(structure?.['@type']) }}</v-icon></span>
          <div class="s-article-structures-refined__copy">
            <h3>{{ typeTitle(structure) }}</h3>
            <p>{{ structure?.name || structure?.description || t('structure_no_name') }}</p>
          </div>
        </div>
        <span class="s-article-structures-refined__status"><span class="sd-modern-status__dot sd-modern-status__dot--success"></span>{{ t('structure_added') }}</span>
        <div class="s-article-structures-refined__actions">
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('structure_json')" @click="showJson(structure)">
            <v-icon>data_object</v-icon><v-tooltip activator="parent" content-class="sd-modern-tooltip" location="top">{{ t('structure_json') }}</v-tooltip>
          </v-btn>
          <v-btn v-if="editMode && findType(structure)" class="sd-modern-icon-button" icon variant="text" :aria-label="t('structure_edit')" @click="showDialog(structure)">
            <v-icon>edit</v-icon><v-tooltip activator="parent" content-class="sd-modern-tooltip" location="top">{{ t('structure_edit') }}</v-tooltip>
          </v-btn>
          <v-btn v-if="editMode" class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.delete')" @click="removeStructure(structure)">
            <v-icon>delete_outline</v-icon><v-tooltip activator="parent" content-class="sd-modern-tooltip" location="top">{{ $t('global.actions.delete') }}</v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
    <div v-else class="s-article-structures-refined__empty">
      <v-icon size="24" aria-hidden="true">data_object</v-icon><h3>{{ t('structure_empty') }}</h3><p>{{ t('structure_empty_hint') }}</p>
    </div>
    <p class="s-article-structures-refined__foot"><v-icon size="14" aria-hidden="true">info_outline</v-icon>{{ t('structure_faq_note') }}</p>

    <v-dialog :model-value="dialog && active" max-width="720" :content-props="dialogContentProps" scrollable @update:model-value="!$event && requestClose()">
      <v-card class="s-article-structures-refined__dialog text-start">
        <header class="s-article-structures-refined__dialog-head">
          <div><h2>{{ jsonView ? t('structure_json') : t(selected ? 'structure_edit' : 'structure_add') }}</h2><p v-if="selected_type">{{ $t(selected_type.title) }}</p></div>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="requestClose()"><v-icon>close</v-icon><v-tooltip activator="parent" content-class="sd-modern-tooltip" location="top">{{ $t('global.actions.close') }}</v-tooltip></v-btn>
        </header>
        <v-card-text class="s-article-structures-refined__dialog-body">
          <div v-if="pendingAction" class="s-article-structures-refined__discard" role="alert">
            <p>{{ t('structure_discard_message') }}</p>
            <div class="s-article-structures-refined__actions">
              <v-btn class="sd-modern-button sd-modern-button--compact" variant="text" @click="pendingAction = null">{{ t('structure_keep_editing') }}</v-btn>
              <v-btn class="sd-modern-button sd-modern-button--compact" variant="outlined" @click="discardPending()">{{ t('structure_discard') }}</v-btn>
            </div>
          </div>
          <pre v-if="jsonView" class="s-article-structures-refined__json" dir="ltr">{{ structure_data_pretty }}</pre>
          <template v-else-if="selected_type">
            <v-btn v-if="!selected" class="sd-modern-button sd-modern-button--compact s-article-structures-refined__change-type" variant="text" @click="changeType()">{{ t('structure_change_type') }}</v-btn>
            <s-structure-data-input v-for="(type, name) in primaryInputs" :key="name" v-model="structure_data[name]" :name="name" :type="type" workspace />
            <details v-if="Object.keys(extraInputs).length" class="s-article-structures-refined__more" @toggle="extraExpanded = $event.target.open">
              <summary>{{ t('structure_more_properties') }}</summary>
              <template v-if="extraExpanded"><s-structure-data-input v-for="(type, name) in extraInputs" :key="name" v-model="structure_data[name]" :name="name" :type="type" workspace /></template>
            </details>
            <details class="s-article-structures-refined__more"><summary>{{ t('structure_json_preview') }}</summary><pre class="s-article-structures-refined__json" dir="ltr">{{ structure_data_pretty }}</pre></details>
          </template>
          <div v-else class="s-article-structures-refined__types">
            <button v-for="type in types" :key="type['@type']" type="button" class="s-article-structures-refined__type sd-modern-clickable-item" @click="selectType(type)">
              <span class="s-article-structures-refined__icon"><v-icon size="18" aria-hidden="true">{{ typeIcon(type['@type']) }}</v-icon></span>
              <span><strong>{{ $t(type.title) }}</strong><small>{{ $t(type.desc) }}</small></span>
              <v-icon size="17" aria-hidden="true">{{ $t('icons.angle_next') }}</v-icon>
            </button>
          </div>
        </v-card-text>
        <footer class="s-article-structures-refined__dialog-foot">
          <p v-if="!jsonView">{{ t('structure_draft_hint') }}</p>
          <div class="s-article-structures-refined__actions">
            <v-btn v-if="jsonView" v-copy="structure_data_pretty" class="sd-modern-button sd-modern-button--compact" variant="outlined" prepend-icon="content_copy">{{ $t('global.actions.copy') }}</v-btn>
            <v-btn class="sd-modern-button sd-modern-button--compact" variant="text" @click="requestClose()">{{ $t(jsonView ? 'global.actions.close' : 'global.actions.cancel') }}</v-btn>
            <v-btn v-if="!jsonView && selected_type" class="sd-modern-button sd-modern-button--compact" color="primary" variant="flat" prepend-icon="check" :disabled="!editMode || !!pendingAction" @click="saveChange()">{{ t('structure_apply') }}</v-btn>
          </div>
        </footer>
      </v-card>
    </v-dialog>
  </section>
  <div v-else v-bind="$attrs" class="s-article-structures" :class="{ 's-article-structures--workspace text-start': workspace }">
    <div :class="workspace ? 's-article-structures__panel' : 'widget-box -large'">
      <div :class="{ 's-article-structures__heading': workspace }">
        <h3 :class="workspace ? 's-article-structures__title' : 'my-2 widget-title'">
          <v-icon class="me-1">post_add</v-icon>
          {{ workspace ? $t('global.json.structures') : 'Structured data' }}
        </h3>
        <v-btn v-if="workspace && editMode" class="sd-modern-button sd-modern-button--compact" variant="text" prepend-icon="add" @click="showDialog()">{{ $t('global.json.add') }}</v-btn>
      </div>

      <v-row>
        <v-fade-transition group leave-absolute>
          <v-col
            v-for="(structure, index) in modelValue"
            :key="index"
            cols="12"
            md="4"
          >
            <v-card
              :class="workspace ? ['s-article-structures__item text-start', { 'sd-modern-clickable-item': editMode }] : 'text-start shadow-box -hover min-h-100 rounded-18px'"
              :link="workspace ? editMode : undefined"
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
                v-if="!workspace || editMode"
                :class="workspace ? 'sd-modern-icon-button s-article-structures__remove' : 'absolute-top-end'"
                :color="workspace ? undefined : 'red'"
                :aria-label="$t('global.actions.delete')"
                icon
                variant="text"
                @click.stop="removeStructure(structure)"
              >
                <v-icon>close</v-icon>
                <v-tooltip :content-class="workspace ? 'sd-modern-tooltip' : 'bg-red text-white'" activator="parent" location="top">
                  {{ $t("global.actions.delete") }}
                </v-tooltip>
              </v-btn>
            </v-card>
          </v-col>
          <v-col v-if="!workspace" key="new" cols="12" md="4" style="font-size: 12px">
            <u-button-add
              :caption="$t('global.json.add')"
              :message="$t('global.json.add_message')"
              class="rounded-18px"
              icon="add"
              min-height="160px"
              @click="showDialog()"
            >
            </u-button-add>
          </v-col>
        </v-fade-transition>
      </v-row>
    </div>
  </div>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-dialog
    v-if="!workspace"
    v-model="dialog"
    :fullscreen="!workspace || $vuetify.display.smAndDown"
    :max-width="workspace ? 1080 : undefined"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start" :class="{ 's-article-structures__dialog': workspace }">
      <v-card-title>
        <span
          :class="{ 'pointer-pointer': selected_type }"
          @click="!workspace || editMode ? selected_type = null : undefined"
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
            :size="workspace ? undefined : 'x-large'"
            :class="{ 'sd-modern-button': workspace }"
            variant="text"
            @click="closeDialog()"
            prepend-icon="close"
            >{{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            v-if="!workspace || editMode"
            :size="workspace ? undefined : 'x-large'"
            :class="{ 'sd-modern-button': workspace }"
            :disabled="workspace && (!selected_type || !structure_data)"
            color="primary"
            variant="elevated"
            @click="saveChange()"
            :prepend-icon="workspace ? 'save' : 'check'"
            >{{ $t("global.actions.confirm") }}
          </v-btn>
        </s-widget-buttons>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UButtonAdd from "../ui/button/add/UButtonAdd.vue";
import SStructureDataInput from "./SStructureDataInput.vue";
import SWidgetButtons from "../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "SArticleStructuredData",
  components: { SWidgetButtons, SStructureDataInput, UButtonAdd },
  emits: ["update:modelValue", "change", "pending-change"],
  props: {
    workspace: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
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
      workspace_source: null,
      workspace_baseline: "",
      jsonView: false,
      pendingAction: null,
      extraExpanded: false,

      types: [
        {
          "@type": "Book",
          title: "global.json.book.title",
          desc: "global.json.book.desc",
          image: require("../assets/jsonld/jsonld-book.svg"),
          inputs: { name: "text", author: "@Person", workExample: ["@Book"] },
        },
        {
          "@type": "Occupation",
          title: "global.json.occupation.title",
          desc: "global.json.occupation.desc",
          image: require("../assets/jsonld/jsonld-ocupation.svg"),
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
          image: require("../assets/jsonld/jsonld-course.svg"),
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
          image: require("../assets/jsonld/jsonled-howto.svg"),
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
          image: require("../assets/jsonld/jsonld-recipe.svg"),
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
    dialogContentProps() { return this.$vuetify.display.width <= 580 ? { style: { width: 'calc(100% - 16px)', maxWidth: 'calc(100% - 16px)', margin: '8px' } } : undefined; },
    dialogDirty() {
      return this.workspace && this.dialog && !this.jsonView && !!this.selected_type && JSON.stringify(this.structure_data) !== this.workspace_baseline;
    },
    primaryInputs() {
      const names = {
        Book: ['name', 'author', 'workExample'],
        Occupation: ['name', 'description', 'estimatedSalary'],
        Course: ['name', 'description', 'provider'],
        HowTo: ['name', 'description', 'step'],
        Recipe: ['name', 'description', 'recipeIngredient', 'recipeInstructions'],
      }[this.selected_type?.['@type']] || [];
      return Object.fromEntries(names.filter(name => this.selected_type?.inputs[name]).map(name => [name, this.selected_type.inputs[name]]));
    },
    extraInputs() {
      return Object.fromEntries(Object.entries(this.selected_type?.inputs || {}).filter(([name]) => !(name in this.primaryInputs)));
    },
    structure_data_pretty() {
      return JSON.stringify(this.structure_data, null, 2);
    },
  },

  watch: {
    dialogDirty(value) { if (this.workspace) this.$emit('pending-change', value); },
    editMode(value) { if (this.workspace && !value) this.closeDialog(); },
    modelValue(value, previous) { if (this.workspace && value !== previous) this.closeDialog(); },
  },

  created() {
    if ((!this.workspace || this.editMode) && (!this.modelValue || !Array.isArray(this.modelValue)))
      this.$emit("update:modelValue", []);
  },

  methods: {
    t(key) { return this.$t(`global.article.workspace.${key}`); },
    typeTitle(structure) {
      const type = this.findType(structure);
      return type ? this.$t(type.title) : String(structure?.['@type'] || this.t('structure_unknown'));
    },
    typeIcon(type) {
      return { Book: 'menu_book', Occupation: 'work_outline', Course: 'school', HowTo: 'checklist', Recipe: 'restaurant_menu' }[type] || 'data_object';
    },
    showJson(structure) {
      this.jsonView = true;
      this.selected_type = this.findType(structure);
      this.structure_data = JSON.parse(JSON.stringify(structure));
      this.workspace_baseline = JSON.stringify(this.structure_data);
      this.pendingAction = null;
      this.dialog = true;
    },
    requestClose() {
      if (this.dialogDirty) this.pendingAction = 'close';
      else this.closeDialog();
    },
    changeType() {
      if (this.selected || !this.editMode) return;
      if (this.dialogDirty) this.pendingAction = 'type';
      else this.resetType();
    },
    resetType() {
      this.selected_type = null;
      this.structure_data = null;
      this.workspace_baseline = '';
      this.pendingAction = null;
      this.extraExpanded = false;
    },
    discardPending() {
      if (this.pendingAction === 'type') this.resetType();
      else this.closeDialog();
    },
    showDialog(jsonld = null) {
      if (this.workspace && !this.editMode) return;
      this.selected_type = null;
      this.dialog = true;
      this.selected = null;
      if (this.workspace) {
        this.jsonView = false;
        this.pendingAction = null;
        this.extraExpanded = false;
        this.workspace_source = this.modelValue;
        this.structure_data = null;
      }

      if (jsonld) {
        this.selected_type = this.findType(jsonld);
        // Workspace cancellation must not modify the article's nested JSON.
        this.structure_data = this.workspace ? JSON.parse(JSON.stringify(jsonld)) : jsonld;
        this.selected = jsonld;
        if (this.workspace && !this.selected_type) this.jsonView = true;
      }
      if (this.workspace) this.workspace_baseline = JSON.stringify(this.structure_data);
    },
    selectType(type) {
      if (this.workspace && (!this.editMode || !this.dialog || this.selected || this.jsonView)) return;
      this.selected_type = type;

      // New jsonld:
      if (!this.selected)
        this.structure_data = {
          "@context": "https://schema.org",
          "@type": this.selected_type["@type"],
        };
      if (this.workspace) this.workspace_baseline = JSON.stringify(this.structure_data);
    },

    saveChange() {
      if (this.workspace && (!this.editMode || !this.dialog || this.jsonView || this.pendingAction || !this.selected_type || !this.structure_data || this.workspace_source !== this.modelValue)) return;
      if (this.workspace) {
        const values = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
        if (this.selected) {
          const index = values.indexOf(this.selected);
          if (index < 0) return;
          values.splice(index, 1, this.structure_data);
        } else values.push(this.structure_data);
        this.$emit('update:modelValue', values);
        this.$emit('change');
        this.closeDialog();
        return;
      }
      if (!this.modelValue || !Array.isArray(this.modelValue)) {
        // Not set yet!
        this.$emit("update:modelValue", [this.structure_data]);
      } else {
        if (this.workspace && this.selected) {
          const index = this.modelValue.indexOf(this.selected);
          if (index < 0) return;
          this.modelValue.splice(index, 1, this.structure_data);
        } else if (!this.selected) {
          this.modelValue.push(this.structure_data);
        }
      }

      if (this.workspace) this.$emit("change");
      this.closeDialog();
    },

    closeDialog() {
      this.dialog = false;
      this.selected_type = null;
      if (this.workspace) {
        this.selected = null;
        this.structure_data = null;
        this.workspace_source = null;
        this.workspace_baseline = '';
        this.jsonView = false;
        this.pendingAction = null;
      }
    },

    removeStructure(structure) {
      if (!this.workspace) return this.remove(this.modelValue, structure);
      if (!this.editMode || !Array.isArray(this.modelValue)) return;
      const index = this.modelValue.indexOf(structure);
      if (index < 0) return;
      this.$emit('update:modelValue', this.modelValue.filter((_, i) => i !== index));
      this.$emit("change");
    },

    findType(jsonld) {
      return this.types.find((it) => it["@type"] === jsonld?.["@type"]);
    },
  },
};
</script>

<style lang="scss" scoped>
.s-article-structures-refined {
  --sd-modern-icon-button-size: 32px;
  padding: 24px;
  border: 1px solid var(--sd-modern-border);
  border-radius: 18px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  &__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 10px; }
  &__title-row { display: flex; align-items: center; gap: 7px; }
  &__title-row h2 { margin: 0; font-family: inherit; font-size: 14px !important; font-weight: 500; line-height: 22px; }
  &__heading p { margin: 4px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  &__list-heading, &__row { display: grid; grid-template-columns: minmax(0, 1fr) 102px 112px; gap: 16px; }
  &__list-heading { padding: 14px 0 10px; border-bottom: 1px solid var(--sd-modern-border); }
  &__list-heading > :last-child { text-align: end; }
  &__row { align-items: center; padding: 16px 0; border-bottom: 1px solid var(--sd-modern-border); min-width: 0; }
  &__row:last-child { border-bottom: 0; padding-bottom: 0; }
  &__record { display: flex; align-items: center; gap: 12px; min-width: 0; }
  &__icon { display: inline-grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; border-radius: 8px; background: var(--article-structures-soft); color: var(--sd-modern-muted); }
  &__copy { min-width: 0; }
  &__copy h3 { margin: 0; font-family: inherit; font-size: 13px !important; font-weight: 500; line-height: 20px; }
  &__copy p { margin: 0; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  &__status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; line-height: 18px; white-space: nowrap; }
  &__status .sd-modern-status__dot { width: 5px; height: 5px; flex: 0 0 5px; }
  &__actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
  &__foot { display: flex; align-items: flex-start; gap: 7px; margin: 20px 0 0; padding-top: 16px; border-top: 1px solid var(--sd-modern-border); font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  &__foot .v-icon { margin-top: 2px; flex-shrink: 0; }
  &__empty { padding: 30px 12px; text-align: center; }
  &__empty > .v-icon { color: var(--sd-modern-muted); margin-bottom: 10px; }
  &__empty h3 { margin: 0; font-family: inherit; font-size: 13px !important; font-weight: 500; line-height: 20px; }
  &__empty p { margin: 5px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
}
.s-article-structures-refined__dialog {
  --sd-modern-icon-button-size: 32px;
  font-family: inherit;
  border: 1px solid var(--sd-modern-border);
  border-radius: 18px !important;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  .s-article-structures-refined__dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px; border-bottom: 1px solid var(--sd-modern-border); }
  .s-article-structures-refined__dialog-head h2 { margin: 0; font-family: inherit; font-size: 17px !important; font-weight: 500; line-height: 25px; }
  .s-article-structures-refined__dialog-head p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .s-article-structures-refined__dialog-body { padding: 24px !important; min-width: 0; font-size: 13px; line-height: 20px; }
  .s-article-structures-refined__dialog-foot { padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--sd-modern-border); }
  .s-article-structures-refined__dialog-foot > p { margin: 0; max-width: 280px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .s-article-structures-refined__actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
  .s-article-structures-refined__dialog-foot .s-article-structures-refined__actions { margin-inline-start: auto; }
  .s-article-structures-refined__type { display: flex; align-items: center; gap: 12px; width: 100%; padding: 13px 12px; border: 0; border-bottom: 1px solid var(--sd-modern-border); background: transparent; text-align: start; color: inherit; }
  .s-article-structures-refined__type:last-child { border-bottom: 0; }
  .s-article-structures-refined__type > span:nth-child(2) { flex: 1; }
  .s-article-structures-refined__type strong { display: block; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  .s-article-structures-refined__type small { display: block; font-size: 11px; line-height: 18px; margin-top: 2px; color: var(--sd-modern-muted); }
  .s-article-structures-refined__icon { display: inline-grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; border-radius: 8px; background: var(--article-structures-soft); color: var(--sd-modern-muted); }
  .s-article-structures-refined__more { margin-top: 16px; }
  .s-article-structures-refined__more > summary { font-size: 12px; font-weight: 500; line-height: 20px; cursor: pointer; }
  .s-article-structures-refined__more > .s-structure-input:first-of-type { margin-top: 18px; }
  .s-article-structures-refined__change-type { margin-bottom: 18px; }
  .s-article-structures-refined__json { margin: 10px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; padding: 16px; border: 1px solid var(--sd-modern-border); border-radius: 10px; background: var(--article-structures-soft); font: 11px/19px ui-monospace, Consolas, monospace; text-align: start; }
  .s-article-structures-refined__discard { padding: 12px 14px; margin-bottom: 18px; border-radius: 8px; background: var(--article-structures-soft); font-size: 12px; line-height: 20px; }
  .s-article-structures-refined__discard p { margin: 0 0 10px; }
}
.s-article-structures-refined, .s-article-structures-refined__dialog {
  --sd-modern-border: rgba(var(--v-theme-on-surface), 0.09);
  --sd-modern-muted: rgba(var(--v-theme-on-surface), 0.66);
  --article-structures-soft: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 3%, rgb(var(--v-theme-surface)));
  .sd-modern-icon-button :deep(.v-icon) { font-size: 16px !important; }
  .sd-modern-button.sd-modern-button--compact { min-height: 36px; height: auto; padding: 7px 12px; border-radius: 8px; font-family: inherit; font-size: 12px !important; font-weight: 500; line-height: 20px !important; letter-spacing: 0; text-transform: none; }
  .sd-modern-button :deep(.v-btn__content) { font-family: inherit; font-size: 12px !important; font-weight: 500; line-height: 20px !important; }
}
@media (max-width: 580px) {
  .s-article-structures-refined {
    padding: 18px;
    &__heading { flex-wrap: wrap; }
    &__list-heading { grid-template-columns: minmax(0, 1fr) 100px; }
    &__list-heading > span:nth-child(2) { display: none; }
    &__row { grid-template-columns: minmax(0, 1fr) 100px; gap: 12px; }
    &__status { grid-column: 1; grid-row: 2; padding-inline-start: 46px; }
    &__actions { grid-column: 2; grid-row: 1/3; flex-wrap: wrap; }
  }
  .s-article-structures-refined__dialog {
    .s-article-structures-refined__dialog-head, .s-article-structures-refined__dialog-body { padding: 20px !important; }
    .s-article-structures-refined__dialog-foot { padding: 16px 20px; flex-wrap: wrap; }
    .s-article-structures-refined__dialog-foot > p { max-width: none; }
  }
}
@media (max-width: 580px), (pointer: coarse) {
  .s-article-structures-refined, .s-article-structures-refined__dialog { --sd-modern-icon-button-size: 44px; .sd-modern-button { min-height: 44px !important; } }
}
.s-article-structures--workspace {
  .s-article-structures__heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
  .s-article-structures__title { display: flex; align-items: center; margin: 0; font: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
  .s-article-structures__title :deep(.v-icon) { font-size: 18px; color: rgba(var(--v-theme-on-surface), 0.64); }
  .s-article-structures__item { min-height: 100px; border: 1px solid rgba(var(--v-theme-on-surface), 0.1); border-radius: 12px; background: rgb(var(--v-theme-surface)); box-shadow: none; }
  .s-article-structures__item :deep(.v-card-text) { padding: 20px; padding-inline-end: 56px; font-family: inherit; font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  .s-article-structures__item img { max-width: 150px; }
  .s-article-structures__item p { font-weight: 400 !important; }
  .s-article-structures__remove { position: absolute; inset-inline-end: 10px; inset-block-start: 10px; }
}
.s-article-structures__dialog {
  font-family: inherit;
  :deep(.v-card-title) { font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; }
  :deep(.v-card-text) { font-family: inherit; font-size: 13px; line-height: 20px; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; }
}
</style>
