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
    class="b-valuation-add text-start"
    :class="{ 'b-valuation-add--modern sd-modern-canvas': modern }"
    flat
  >
    <v-card-title :class="{ 'b-valuation-add__header': modern }">
      <template v-if="modern">
        <div class="b-valuation-add__heading">
          <div class="b-valuation-add__heading-copy">
            <div class="b-valuation-add__title-row">
              <h1 class="sd-modern-page-title">
                {{
                  $t(
                    cloneMode && !saved_valuation
                      ? "valuation_add.modern.editor_clone"
                      : valuation || saved_valuation
                        ? "valuation_add.modern.editor_edit"
                        : "valuation_add.modern.editor_new",
                  )
                }}
              </h1>
              <products-dense-images-circles
                v-if="!cloneMode && valuation?.product_ids?.length"
                :ids="valuation.product_ids"
                :max-count="3"
                :size="24"
                class="b-valuation-add__header-products"
                aria-hidden="true"
                inline
                border
              />
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("valuation_add.modern.editor_subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="$t('global.actions.close')"
          @click="close"
          ><v-icon size="20">close</v-icon
          ><v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            :persistent="false"
            >{{ $t("global.actions.close") }}</v-tooltip
          ></v-btn
        >
      </template>
      <template v-else>
        <v-icon class="me-2">calculate</v-icon>
        {{
          valuation
            ? $t("valuation_add.title_edit")
            : $t("valuation_add.title_add")
        }}
      </template>
    </v-card-title>
    <v-card-text :class="{ 'b-valuation-add__body': modern }">
      <v-form
        ref="form"
        lazy-validation
        :class="{ 'b-valuation-add__grid': modern }"
      >
        <div :class="{ 'b-valuation-add__main': modern }">
          <!-- ████████████████████████ Config ████████████████████████ -->

          <div :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :title="
                $t(
                  modern
                    ? 'valuation_add.modern.details_title'
                    : 'global.commons.config',
                )
              "
              icon="tune"
            ></u-widget-header>
            <v-list-subheader :class="{ 'b-valuation-add__subtitle': modern }">
              {{ $t("valuation_add.config.subtitle") }}
            </v-list-subheader>

            <div class="b-valuation-add__identity-editor">
              <div class="b-valuation-add__image-actions">
                <input
                  ref="icon_input"
                  class="d-none"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  :disabled="busy_save"
                  @change="
                    selectIcon($event.target.files?.[0]);
                    $event.target.value = '';
                  "
                />
                <button
                  type="button"
                  class="b-valuation-add__image-tile"
                  :class="{ 'b-valuation-add__image-tile--filled': form_image }"
                  :disabled="busy_save"
                  :aria-label="
                    $t(
                      form_image
                        ? 'valuation_add.modern.icon_change'
                        : 'valuation_add.modern.icon_choose',
                    )
                  "
                  :aria-describedby="`valuation-image-help-${$.uid}`"
                  :aria-invalid="!!icon_error"
                  @click="$refs.icon_input.click()"
                >
                  <v-img v-if="form_image" :src="form_image" alt="" cover />
                  <template v-else>
                    <v-icon size="26" aria-hidden="true"
                      >add_photo_alternate</v-icon
                    >
                    <span>{{ $t("valuation_add.modern.icon_choose") }}</span>
                  </template>
                  <v-icon
                    v-if="form_image"
                    class="b-valuation-add__image-edit"
                    size="16"
                    aria-hidden="true"
                    >edit</v-icon
                  >
                  <v-tooltip
                    activator="parent"
                    location="top"
                    :open-on-focus="true"
                    content-class="sd-modern-tooltip text-start"
                    :persistent="false"
                    >{{
                      $t(
                        form_image
                          ? "valuation_add.modern.icon_change"
                          : "valuation_add.modern.icon_choose",
                      )
                    }}</v-tooltip
                  >
                </button>
                <button
                  v-if="icon_file"
                  type="button"
                  class="b-valuation-add__image-discard"
                  :disabled="busy_save"
                  @click="selectIcon(null)"
                >
                  {{ $t("valuation_add.modern.icon_discard") }}
                  <v-tooltip
                    activator="parent"
                    location="top"
                    :open-on-focus="true"
                    content-class="sd-modern-tooltip text-start"
                    :persistent="false"
                    >{{ $t("valuation_add.modern.icon_discard") }}</v-tooltip
                  >
                </button>
              </div>
              <v-text-field
                v-model="title"
                :label="$t('global.commons.title') + '*'"
                :rules="[GlobalRules.counter(120), GlobalRules.required()]"
                :messages="$t('valuation_add.inputs.title.message')"
                :placeholder="$t('valuation_add.inputs.title.placeholder')"
                variant="underlined"
              />
            </div>
            <p
              :id="`valuation-image-help-${$.uid}`"
              class="b-valuation-add__image-help"
            >
              {{ $t("valuation_add.modern.icon_hint") }}
              <span v-if="icon_error" role="alert" class="d-block">{{
                icon_error
              }}</span>
            </p>
            <p
              v-if="icon_upload_error"
              role="alert"
              class="b-valuation-add__icon-error"
            >
              <v-icon size="18" class="me-1" aria-hidden="true"
                >info_outline</v-icon
              >
              {{ icon_upload_error }}
            </p>

            <u-smart-suggestion
              v-if="!title || !valuation?.id"
              :samples="$tm('suggestions.valuation.title')"
              @select="(v) => (title = v)"
            >
            </u-smart-suggestion>
          </div>
          <!-- ████████████████████████ Structure ████████████████████████ -->

          <div :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :add-caption="
                modern
                  ? null
                  : collapse
                    ? $t('valuation_add.structure.expand_action')
                    : $t('valuation_add.structure.collapse_action')
              "
              :add-icon="collapse ? 'unfold_more' : 'unfold_less'"
              add-text
              icon="table_view"
              :title="
                $t(
                  modern
                    ? 'valuation_add.modern.structure_title'
                    : 'valuation_add.structure.title',
                )
              "
              @click:add="collapse = !collapse"
            >
              <template v-if="modern" #append-title>
                <span class="sd-modern-status sd-modern-status--plain ms-3">{{
                  $t("valuation_add.modern.fields_count", {
                    count: structure.length,
                  })
                }}</span>
              </template>
              <template v-if="modern" #icon-actions>
                <v-btn
                  class="sd-modern-icon-button ms-2"
                  icon
                  variant="text"
                  :aria-label="
                    $t(
                      collapse
                        ? 'valuation_add.structure.expand_action'
                        : 'valuation_add.structure.collapse_action',
                    )
                  "
                  @click="collapse = !collapse"
                >
                  <v-icon size="20">{{
                    collapse ? "unfold_more" : "unfold_less"
                  }}</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    :open-on-focus="true"
                    content-class="sd-modern-tooltip text-start"
                    :persistent="false"
                    >{{
                      $t(
                        collapse
                          ? "valuation_add.structure.expand_action"
                          : "valuation_add.structure.collapse_action",
                      )
                    }}</v-tooltip
                  >
                </v-btn>
              </template>
            </u-widget-header>
            <v-list-subheader :class="{ 'b-valuation-add__subtitle': modern }">
              {{
                $t(
                  modern
                    ? "valuation_add.modern.structure_hint"
                    : "valuation_add.structure.subtitle",
                )
              }}
            </v-list-subheader>

            <b-valuation-form-structure
              :key="sample_revision"
              v-model="structure"
              :collapse="collapse"
              :sample-product="product"
              :modern="modern"
            >
            </b-valuation-form-structure>

            <!-- Preview -->
            <div
              v-if="
                !modern && $vuetify.display.lgAndUp && structure?.length > 0
              "
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
                class="my-5"
                preview-mode
              ></s-product-section-valuation>
            </div>

            <div
              :class="
                modern ? 'b-valuation-add__structure-actions' : 'text-end m-3'
              "
            >
              <v-btn
                :class="
                  modern ? 'sd-modern-button sd-modern-button--inline' : 'me-1'
                "
                variant="text"
                @click="samples_dialog = true"
              >
                <v-icon start>science</v-icon>

                {{ $t("valuation_add.load_sample") }}
                <v-tooltip
                  v-if="modern"
                  activator="parent"
                  location="top"
                  :open-on-focus="true"
                  content-class="sd-modern-tooltip text-start"
                  :persistent="false"
                  >{{ $t("valuation_add.load_sample") }}</v-tooltip
                >
              </v-btn>

              <v-menu :min-width="160">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :class="{ 'sd-modern-button': modern }"
                    :variant="modern ? 'outlined' : 'elevated'"
                  >
                    <v-icon start>add</v-icon>
                    {{ $t("global.form_builder.add_item_action") }}
                    <v-tooltip
                      v-if="modern"
                      activator="parent"
                      location="top"
                      :open-on-focus="true"
                      content-class="sd-modern-tooltip text-start"
                      :persistent="false"
                      >{{
                        $t("global.form_builder.add_item_action")
                      }}</v-tooltip
                    >
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
          <div :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              icon="rule_folder"
              :title="
                $t(
                  modern
                    ? 'valuation_add.modern.conditions_title'
                    : 'valuation_add.conditions.title',
                )
              "
            >
              <template v-if="modern" #append-title>
                <v-btn
                  class="sd-modern-icon-button sd-modern-info-button ms-2"
                  icon
                  variant="text"
                  :aria-label="$t('valuation_add.modern.conditions_help_title')"
                >
                  <v-icon size="16">info_outline</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    :open-on-click="true"
                    :open-on-focus="true"
                    interactive
                    :max-width="360"
                    content-class="sd-modern-tooltip text-start"
                    :persistent="false"
                    >{{ $t("valuation_add.modern.conditions_hint") }}</v-tooltip
                  >
                </v-btn>
              </template>
            </u-widget-header>
            <v-list-subheader :class="{ 'b-valuation-add__subtitle': modern }"
              >{{
                $t(
                  modern
                    ? "valuation_add.modern.conditions_hint"
                    : "valuation_add.conditions.subtitle",
                )
              }}
            </v-list-subheader>

            <b-valuation-form-condition
              :key="sample_revision"
              v-model="conditions"
              :shop="shop"
              :structure="structure"
              :modern="modern"
            ></b-valuation-form-condition>
          </div>
        </div>
        <aside
          v-if="modern"
          class="sd-modern-widget b-valuation-add__preview"
          :aria-label="$t('valuation_add.modern.preview_title')"
        >
          <header class="sd-modern-header">
            <div class="sd-modern-title">
              <v-icon class="sd-modern-icon--plain" size="19"
                >visibility</v-icon
              >
              <h2 class="sd-modern-title-text">
                {{ $t("valuation_add.modern.preview_title") }}
              </h2>
            </div>
            <span class="sd-modern-status sd-modern-status--plain">{{
              $t("valuation_add.modern.preview_example")
            }}</span>
          </header>
          <p class="sd-modern-subtitle b-valuation-add__preview-base">
            {{ $t("valuation_add.modern.preview_base") }}
            <u-price :amount="product.price" :currency="product.currency" />
          </p>
          <s-product-section-valuation
            v-if="structure.length"
            v-model:preferences="preview_valuation"
            class="b-valuation-add__customer-form"
            preview-mode
          />
          <p v-else class="sd-modern-empty-state">
            {{ $t("valuation_add.modern.preview_empty") }}
          </p>
          <div class="b-valuation-add__preview-total" aria-live="polite">
            <span>{{ $t("valuation_add.modern.preview_total") }}</span>
            <u-price :amount="preview_total" :currency="product.currency" />
          </div>
          <p class="sd-modern-subtitle">
            {{ $t("valuation_add.modern.preview_hint") }}
          </p>
        </aside>
      </v-form>
    </v-card-text>
    <v-card-actions :class="{ 'b-valuation-add__footer': modern }">
      <div :class="modern ? 'b-valuation-add__actions' : 'widget-buttons'">
        <v-btn
          :class="{ 'sd-modern-button': modern }"
          size="x-large"
          variant="text"
          @click="close"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
          <v-tooltip
            v-if="modern"
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            :persistent="false"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>

        <v-btn
          v-if="valuation && cloneMode && !saved_valuation"
          :class="{ 'sd-modern-button': modern }"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="saveValuation(true)"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.create_clone") }}
          <v-tooltip
            v-if="modern"
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            :persistent="false"
            >{{ $t("global.actions.create_clone") }}</v-tooltip
          >
        </v-btn>

        <v-btn
          v-else-if="valuation || saved_valuation"
          :class="{ 'sd-modern-button': modern }"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="saveValuation()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
          <v-tooltip
            v-if="modern"
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            :persistent="false"
            >{{ $t("global.actions.save") }}</v-tooltip
          >
        </v-btn>
        <v-btn
          v-else
          :class="{ 'sd-modern-button': modern }"
          :loading="busy_save"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="saveValuation(true)"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
          <v-tooltip
            v-if="modern"
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            :persistent="false"
            >{{ $t("global.actions.add") }}</v-tooltip
          >
        </v-btn>
      </div>
    </v-card-actions>

    <!-- ███████████████████████ Sample dialog ███████████████████████ -->
    <v-bottom-sheet
      v-model="samples_dialog"
      content-class="rounded-t-xl"
      max-width="98vw"
      width="960px"
      scrollable
    >
      <v-card
        class="rounded-t-xl text-start b-valuation-add__sample-picker"
        :class="{ 'b-valuation-add__samples': modern }"
        rounded="0"
      >
        <v-card-title class="b-valuation-add__sample-header">
          <h2>{{ $t("valuation_add.samples.title") }}</h2>
          <p>{{ $t("valuation_add.samples.subtitle") }}</p>
        </v-card-title>

        <v-card-text class="b-valuation-add__sample-body">
          <section class="b-valuation-add__sample-guide">
            <h3>{{ $t("valuation_add.samples.reuse_title") }}</h3>
            <p>{{ $t("valuation_add.samples.reuse_description") }}</p>
          </section>
          <div class="b-valuation-add__sample-grid">
            <button
              v-for="item in samples"
              :key="item.id"
              type="button"
              class="b-valuation-add__sample"
              :disabled="busy_save"
              @click="loadSample(item)"
            >
              <img
                :src="item.image"
                alt=""
                width="64"
                height="64"
                loading="lazy"
              />
              <span class="b-valuation-add__sample-copy">
                <strong>{{ item.title }}</strong>
                <span>{{ item.description }}</span>
                <small>
                  {{
                    $t("valuation_add.samples.fields_count", {
                      count: $n(item.structure.length),
                    })
                  }}
                  <span
                    v-if="item.conditions.unavailable.length"
                    class="b-valuation-add__sample-conditions"
                  >
                    {{
                      $t("valuation_add.samples.unavailable_count", {
                        count: $n(item.conditions.unavailable.length),
                      })
                    }}
                  </span>
                </small>
              </span>
              <v-tooltip
                activator="parent"
                location="top"
                max-width="320"
                content-class="sd-modern-tooltip"
                >{{ $t("valuation_add.samples.load_help") }}</v-tooltip
              >
            </button>
          </div>
          <section
            class="b-valuation-add__sample-guide b-valuation-add__sample-inventory"
          >
            <h3>
              <v-icon size="18" class="me-2">info_outline</v-icon
              >{{ $t("valuation_add.samples.inventory_title") }}
            </h3>
            <p>{{ $t("valuation_add.samples.inventory_description") }}</p>
            <p>{{ $t("valuation_add.samples.pricing_note") }}</p>
          </section>
        </v-card-text>

        <v-card-actions class="b-valuation-add__sample-footer">
          <v-btn size="large" variant="text" @click="samples_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip"
              >{{ $t("global.actions.close") }}</v-tooltip
            >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </v-card>
</template>

<script lang="ts">
import USmartSuggestion from "../../../ui/smart/suggestion/USmartSuggestion.vue";
import BValuationFormStructure from "../../valuation/form/structure/BValuationFormStructure.vue";
import { ValuationStructureItemType } from "../ValuationStructureItemType.ts";
import BValuationFormCondition from "../../valuation/form/condition/BValuationFormCondition.vue";
import SProductSectionValuation from "../../../storefront/product/section/valuation/SProductSectionValuation.vue";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import { computed } from "vue";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper.ts";
import { createValuationSamples } from "./ValuationSamples";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BValuationAdd",
  mixins: [],
  components: {
    SProductSectionValuation,
    ProductsDenseImagesCircles,
    BValuationFormCondition,
    BValuationFormStructure,
    USmartSuggestion,
  },

  provide() {
    return {
      /**
       * Simulate product
       */
      $product: computed(() => {
        return {
          ...this.preview_product,
          valuation: { structure: this.structure, conditions: this.conditions },
        };
      }),
    };
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
    modern: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    title: null,
    structure: [],
    conditions: null,

    busy_save: false,
    saved_valuation: null,
    save_reported: false,
    icon_file: null,
    icon_preview: "",
    icon_error: "",
    icon_upload_error: "",

    drag: false,

    collapse: false,

    samples_dialog: false,
    sample_revision: 0,

    types: ValuationStructureItemType,

    preview_valuation: { valuation: {} },
  }),

  computed: {
    samples() {
      return createValuationSamples(this.$t.bind(this));
    },
    form_image() {
      return (
        this.icon_preview ||
        this.saved_valuation?.icon_url ||
        (!this.cloneMode && this.valuation?.icon_url) ||
        null
      );
    },
    preview_total() {
      return PriceHelper.ApplyValuation(
        {
          ...this.valuation,
          structure: this.structure,
          conditions: this.conditions,
        },
        this.preview_valuation,
        this.product.price,
      );
    },
    preview_product() {
      return Object.assign(
        {
          valuation: { structure: this.structure, conditions: this.conditions },
        },
        this.product,
      );
    },
  },

  watch: {
    valuation() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  beforeUnmount() {
    this.releaseIcon();
  },
  methods: {
    loadSample(item) {
      if (this.busy_save) return;
      if (!this.title) this.title = item.title;
      // Keep the catalog independent from subsequent edits to this draft.
      this.structure = JSON.parse(JSON.stringify(item.structure));
      this.conditions = JSON.parse(JSON.stringify(item.conditions));
      this.preview_valuation = { valuation: {} };
      // Recreate editors that keep local references to the previous fields.
      this.sample_revision++;
      this.collapse = true;
      this.samples_dialog = false;
    },
    init() {
      this.releaseIcon();
      this.saved_valuation = null;
      this.save_reported = false;
      this.icon_error = "";
      this.icon_upload_error = "";
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

    releaseIcon() {
      if (this.icon_preview) URL.revokeObjectURL(this.icon_preview);
      this.icon_preview = "";
      this.icon_file = null;
    },
    selectIcon(value) {
      if (this.busy_save) return;
      const file = Array.isArray(value) ? value[0] : value;
      this.icon_error = "";
      this.icon_upload_error = "";
      if (
        file &&
        (!["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
          file.size < 1 ||
          file.size > 2 * 1024 * 1024)
      ) {
        this.icon_error = this.$t("valuation_add.modern.icon_invalid");
        return;
      }
      this.releaseIcon();
      if (!file) return;
      this.icon_file = file;
      this.icon_preview = URL.createObjectURL(file);
    },
    async saveValuation(create = false) {
      if (this.busy_save || this.icon_error) return;
      this.busy_save = true;
      try {
        const { valid } = await this.$refs.form.validate();
        if (!valid) return;
        this.icon_upload_error = "";
        const target = this.saved_valuation || (!create && this.valuation);
        const created = !this.valuation || this.cloneMode;
        const payload = {
          title: this.title,
          structure: this.structure,
          conditions: this.conditions,
        };
        const { data } = target
          ? await axios.put(
              window.API.PUT_EDIT_SHOP_VALUATION(this.shop.id, target.id),
              payload,
            )
          : await axios.post(
              window.API.POST_ADD_SHOP_VALUATION(this.shop.id),
              payload,
            );
        if (data.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        // Retain the created ID so an image-upload retry never creates another form.
        this.saved_valuation = data.valuation;
        this.save_reported = false;
        if (this.icon_file) {
          try {
            const body = new FormData();
            body.append("photo", this.icon_file);
            const response = await axios.post(
              window.API.POST_SHOP_VALUATION_ICON(
                this.shop.id,
                this.saved_valuation.id,
              ),
              body,
            );
            if (response.data.error) {
              NotificationService.showErrorAlert(null, response.data.error_msg);
              this.icon_upload_error = this.$t(
                "valuation_add.modern.icon_upload_retry",
              );
              return;
            }
            this.saved_valuation = response.data.valuation;
            this.releaseIcon();
          } catch (error) {
            this.icon_upload_error = this.$t(
              "valuation_add.modern.icon_upload_retry",
            );
            NotificationService.showLaravelError(error);
            return;
          }
        }
        const saved = this.saved_valuation;
        // Product-editor callers close or reset the editor when these events arrive.
        this.$emit("update:valuation", saved);
        this.$emit(created ? "add" : "edit", saved);
        this.save_reported = true;
        NotificationService.showSuccessAlert(
          null,
          this.$t(
            created
              ? "valuation_add.modern.created"
              : "valuation_add.modern.saved",
          ),
        );
        this.close();
      } catch (error) {
        NotificationService.showLaravelError(error);
      } finally {
        this.busy_save = false;
      }
    },

    close() {
      this.$emit("close", this.save_reported ? null : this.saved_valuation);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-valuation-add__sample-picker {
  max-height: 92dvh;
}
.b-valuation-add__sample-header {
  padding: 24px 28px 16px;
  white-space: normal;
  h2 {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 600;
    line-height: 1.4;
  }
  p {
    margin: 0;
    color: rgba(var(--v-theme-on-surface), 0.65);
    font-size: 13px;
    line-height: 1.6;
  }
}
.b-valuation-add__sample-body {
  padding: 0 28px 24px !important;
  overflow-y: auto;
}
.b-valuation-add__sample-guide {
  h3 {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.6;
  }
  p {
    margin: 0 0 8px;
    color: rgba(var(--v-theme-on-surface), 0.65);
    font-size: 13px;
    line-height: 1.7;
  }
}
.b-valuation-add__sample-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-block: 20px;
}
.b-valuation-add__sample {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  text-align: start;
  cursor: pointer;
  img {
    flex-shrink: 0;
    border-radius: 12px;
    object-fit: contain;
  }
  &:hover {
    border-color: rgb(var(--v-theme-primary));
  }
  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}
.b-valuation-add__sample-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
  strong {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
  > span {
    font-size: 12px;
    line-height: 1.6;
    color: rgba(var(--v-theme-on-surface), 0.65);
  }
  small {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    font-size: 11px;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), 0.65);
  }
}
.b-valuation-add__sample-conditions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: "";
    width: 5px;
    height: 5px;
    flex-shrink: 0;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
  }
}
.b-valuation-add__sample-inventory {
  padding-block-start: 18px;
  border-block-start: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
.b-valuation-add__sample-footer {
  justify-content: flex-end;
  padding: 12px 24px;
  border-block-start: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  :deep(.v-btn) {
    text-transform: none;
    letter-spacing: normal;
  }
}
@media (max-width: 699px) {
  .b-valuation-add__sample-header {
    padding: 20px 20px 16px;
  }
  .b-valuation-add__sample-body {
    padding-inline: 20px !important;
  }
  .b-valuation-add__sample-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
.b-valuation-add__identity-editor {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: flex-start;
  gap: 20px;
}
.b-valuation-add__image-actions {
  display: grid;
  gap: 4px;
}
.b-valuation-add__image-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 88px;
  height: 88px;
  border: 1.5px dashed rgba(var(--v-theme-on-surface), 0.28);
  border-radius: 14px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 11px;
  line-height: 1.3;
  cursor: pointer;
  > span {
    padding-inline: 4px;
  }
  :deep(.v-img) {
    width: 100%;
    height: 100%;
  }
  &:hover {
    border-color: rgb(var(--v-theme-primary));
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
  &--filled {
    border-style: solid;
  }
}
.b-valuation-add__image-edit {
  position: absolute;
  inset-inline-end: 5px;
  bottom: 5px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}
.b-valuation-add__image-discard {
  min-height: 28px;
  font-size: 11px;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-surface), 0.7);
  border-radius: 6px;
}
.b-valuation-add__image-tile:focus-visible,
.b-valuation-add__image-discard:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 3px;
}
.b-valuation-add__image-help {
  margin-block: 12px 16px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.b-valuation-add__icon-error {
  margin-block: -8px 16px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
}
.b-valuation-add--modern {
  .b-valuation-add__header,
  .b-valuation-add__body,
  .b-valuation-add__footer {
    width: min(1280px, 100%);
    margin-inline: auto;
    padding-inline: 28px;
  }

  .b-valuation-add__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding-block: 28px 24px;
    white-space: normal;
  }

  .b-valuation-add__heading {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .b-valuation-add__heading-copy {
    min-width: 0;
  }
  .b-valuation-add__title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-block-end: 8px;
  }
  .b-valuation-add__header-products {
    pointer-events: none;
  }

  .b-valuation-add__header h1 {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .b-valuation-add__body {
    padding-block: 0 24px;
  }

  .b-valuation-add__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    align-items: start;
    gap: 24px;
  }

  .b-valuation-add__main {
    display: grid;
    gap: 24px;
    min-width: 0;
  }

  .b-valuation-add__subtitle {
    min-height: 0;
    padding: 0;
    margin-block: 0 20px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 1.6;
    white-space: normal;
  }

  .b-valuation-add__subtitle :deep(.v-list-subheader__text) {
    white-space: normal;
    overflow: visible;
  }

  .b-valuation-add__structure-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-block-start: 20px;
  }

  .b-valuation-add__preview {
    min-width: 0;
  }

  .b-valuation-add__preview .sd-modern-header {
    gap: 10px;
    flex-wrap: wrap;
    margin-block-end: 14px;
  }

  .b-valuation-add__preview-base {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .b-valuation-add__preview-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-block: 20px 14px;
    padding-block-start: 18px;
    border-block-start: 1px dashed var(--sd-modern-border);
  }

  .b-valuation-add__customer-form {
    max-width: none;
    margin: 18px 0;
  }

  .b-valuation-add__footer {
    padding-block: 16px 24px;
  }

  .b-valuation-add__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    margin: 0;
  }

  @media (max-width: 959px) {
    .b-valuation-add__grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 600px) {
    .b-valuation-add__identity-editor {
      grid-template-columns: 76px minmax(0, 1fr);
      gap: 14px;
    }
    .b-valuation-add__image-tile {
      width: 76px;
      height: 76px;
    }
    .b-valuation-add__image-discard {
      min-height: 44px;
    }
    .b-valuation-add__header,
    .b-valuation-add__body,
    .b-valuation-add__footer {
      padding-inline: 16px;
    }

    .b-valuation-add__header h1 {
      font-size: 25px;
    }

    .b-valuation-add__main {
      gap: 18px;
    }
  }
}
</style>
