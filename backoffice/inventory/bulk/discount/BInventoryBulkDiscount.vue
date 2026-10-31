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
  <div>
    <!-- ====================== Dialog > Bulk discount action ====================== -->
    <v-dialog
      :model-value="modelValue"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
      @update:model-value="(v) => $emit('update:modelValue', v)"
    >
      <v-card
        class="text-start"
        :class="{ 'sd-modern-canvas b-inventory-bulk-dialog b-inventory-bulk-discount': modern }"
      >
        <v-card-title :class="{ 'b-inventory-bulk-dialog__title': modern }">
          <div v-if="modern" class="b-inventory-bulk-dialog__header">
            <div class="b-inventory-bulk-dialog__heading">
              <v-icon aria-hidden="true">discount</v-icon>
              <div><h1>{{ $t('inventory_list.bulk_discount_dialog.title') }}</h1><p>{{ $t('inventory_list.bulk_discount_dialog.modern.subtitle') }}</p></div>
            </div>
            <v-btn class="sd-modern-icon-button" variant="text" icon :aria-label="$t('global.actions.close')" :disabled="busy_bulk" @click="$emit('update:modelValue', false)"><v-icon size="18" aria-hidden="true">close</v-icon><v-tooltip activator="parent" :text="$t('global.actions.close')" location="top" content-class="sd-modern-tooltip text-start" /></v-btn>
          </div>
          <template v-else>
          <template
            v-if="
              category /*Only for this category! In the admin select products view.*/
            "
          >
            <v-avatar class="me-2" size="36">
              <img
                v-if="category.icon"
                :src="getShopImagePath(category.icon, 64)"
              />
              <v-icon v-else>folder</v-icon>
            </v-avatar>

            {{ category.title }} >
          </template>
          <v-icon v-else class="me-2">shelves</v-icon>

          {{ $t("inventory_list.bulk_discount_dialog.title") }}
          </template>
        </v-card-title>
        <v-card-text
          class="text-start"
          :class="{ 'b-inventory-bulk-dialog__body': modern }"
        >
          <ol v-if="modern" class="b-inventory-bulk-dialog__steps" :aria-label="$t('inventory_list.bulk_discount_dialog.title')">
            <li aria-current="step"><span>1</span>{{ $t('bulk_price_dialog.modern.configure_step') }}</li>
            <li><span>2</span>{{ $t('inventory_list.bulk_discount_dialog.modern.review_step') }}</li>
            <li><span>3</span>{{ $t('bulk_price_dialog.modern.apply_step') }}</li>
          </ol>
          <div :class="{ 'b-inventory-bulk-dialog__grid': modern }">
          <div :class="{ 'b-inventory-bulk-dialog__settings': modern }">
          <div :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
            <div v-if="modern" class="b-inventory-bulk-dialog__section-heading">
              <h2>{{ $t('inventory_list.bulk_discount_dialog.modern.method_title') }}</h2>
              <v-tooltip location="top" open-on-click open-on-focus content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon :aria-label="$t('inventory_list.bulk_discount_dialog.modern.method_title')"><v-icon size="15" aria-hidden="true">info_outline</v-icon></v-btn></template>
                {{ $t('inventory_list.bulk_discount_dialog.modern.method_help') }}
              </v-tooltip>
            </div>
            <u-widget-header v-if="!modern"
              :class="{ 'sd-modern-form-header': modern }"
              :title="$t('global.commons.discount')"
              icon="discount"
            ></u-widget-header>

            <v-list-subheader>
              {{ $t(modern ? 'inventory_list.bulk_discount_dialog.modern.method_description' : 'inventory_list.bulk_discount_dialog.message') }}
            </v-list-subheader>

            <b-inventory-price-preview v-if="!modern" multiple price-color="#C2185B">
              <u-chip-discount :percent="bulk_percent" show-zero size="x-large">
              </u-chip-discount>
            </b-inventory-price-preview>

            <u-number-input
              v-model="bulk_percent"
              :label="modern ? $t('inventory_list.bulk_discount_dialog.modern.discount_percent') : undefined"
              :suffix="modern ? '%' : undefined"
              :decimal="1"
              :max="90"
              :min="0"
              :step="0.5"
              class="strong-field"
              :class="{ 'sd-modern-underlined-field b-inventory-bulk-dialog__value': modern }"
              :prepend-inner-icon="modern ? undefined : 'fa:fas fa-percent'"
              show-buttons
            ></u-number-input>
            <u-smart-suggestion v-if="modern" modern no-random :preview-count="4" :more-label="$t('global.commons.more')" :samples="[{ title: '0%', value: 0 }, { title: '10%', value: 10 }, { title: '20%', value: 20 }, { title: '30%', value: 30 }]" @select="bulk_percent = $event" />
            <p v-if="modern" class="b-inventory-bulk-dialog__field-help">{{ $t('inventory_list.bulk_discount_dialog.modern.percent_help') }}</p>
            <p v-if="modern" class="b-inventory-bulk-discount__zero-help">{{ Number(bulk_percent) === 0 ? $t('inventory_list.bulk_discount_dialog.modern.zero_help') : '\u00a0' }}</p>
            <section :class="{ 'b-inventory-bulk-discount__schedule': modern }">
              <div v-if="modern" class="b-inventory-bulk-dialog__section-heading">
                <h2>{{ $t('inventory_list.bulk_discount_dialog.modern.schedule_title') }}</h2>
                <v-tooltip location="top" open-on-click open-on-focus content-class="sd-modern-tooltip text-start">
                  <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon :aria-label="$t('inventory_list.bulk_discount_dialog.modern.schedule_title')"><v-icon size="15" aria-hidden="true">info_outline</v-icon></v-btn></template>
                  {{ $t('inventory_list.bulk_discount_dialog.modern.schedule_help') }}
                </v-tooltip>
              </div>
            <u-date-input
              v-model="dis_start"
              :label="$t('add_product.pricing.start_input')"
              :max="dis_end"
              :placeholder="$t('add_product.pricing.start_input_placeholder')"
              class="mt-2"
              :class="{ 'sd-modern-underlined-field': modern }"
              clearable
              :color="modern ? 'primary' : '#C2185B'"
              prepend-inner-icon="play_arrow"
              return-utc
            />
            <u-date-input
              v-model="dis_end"
              :disabled="!dis_start"
              :label="$t('add_product.pricing.end_input')"
              :min="dis_start"
              :placeholder="$t('add_product.pricing.end_input_placeholder')"
              class="mt-2"
              :class="{ 'sd-modern-underlined-field': modern }"
              clearable
              :color="modern ? 'primary' : '#C2185B'"
              prepend-inner-icon="stop"
              return-utc
            />

            <u-time-progress-bar
              :modern="modern"
              :small="modern"
              :created-time="new Date()"
              :end-time="dis_end"
              :start-time="dis_start"
              class="my-2"
            />
            <p v-if="modern" class="b-inventory-bulk-discount__period"><v-icon size="16" aria-hidden="true">schedule</v-icon><span>{{ periodText }}</span></p>
            <p v-if="modern" class="b-inventory-bulk-dialog__field-help">{{ $t('inventory_list.bulk_discount_dialog.modern.schedule_help') }}</p>
            </section>
          </div>

          <div :class="modern ? 'sd-modern-widget b-inventory-bulk-dialog__scope' : 'widget-box mb-5'" :aria-busy="modern ? busy_report : undefined">
            <div v-if="modern" class="b-inventory-bulk-dialog__section-heading">
              <h2>{{ $t('bulk_price_dialog.modern.scope_title') }}</h2>
              <v-tooltip location="top" open-on-click open-on-focus content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon :aria-label="$t('bulk_price_dialog.modern.scope_title')"><v-icon size="15" aria-hidden="true">info_outline</v-icon></v-btn></template>
                {{ $t(category ? 'inventory_list.bulk_discount_dialog.modern.scope_fixed_help' : 'bulk_price_dialog.modern.scope_help') }}
              </v-tooltip>
            </div>
            <u-widget-header v-if="!modern"
              :class="{ 'sd-modern-form-header': modern }"
              :title="$t('global.commons.category')"
              icon="snippet_folder"
            ></u-widget-header>
            <v-list-subheader
              >{{ $t(modern && category ? 'inventory_list.bulk_discount_dialog.modern.scope_fixed_help' : 'bulk_price_dialog.category.subtitle') }}
            </v-list-subheader>

            <b-category-input
              :class="{ 'sd-modern-underlined-field': modern }"
              v-if="!category"
              v-model="bulk_category"
              :label="$t('global.commons.category')"
              :messages="$t('inventory_list.category_filter_msg')"
              :placeholder="$t('global.commons.all') + ' *.*'"
              clearable
              no-home
              persistent-placeholder
              @update:model-value="fetchReport"
            >
            </b-category-input>

            <!-- The category has been selected before! -->
            <div v-else class="d-flex align-center text-start">
              <v-avatar :size="32" class="me-2">
                <img
                  v-if="category.icon"
                  :src="getShopImagePath(category.icon, 64)"
                />
                <v-icon v-else>folder</v-icon>
              </v-avatar>

              <div class="flex-grow-1 overflow-hidden">
                <b>{{ category.title }}</b>
                <b-category-parent :category="category" class="d-block" small>
                </b-category-parent>
              </div>
            </div>

            <!-- ━━━━━━━━━━━━━━━━━━ 📊 Report ━━━━━━━━━━━━━━━━━━ -->
            <u-loading-progress v-if="busy_report"></u-loading-progress>
            <div v-if="modern" class="b-inventory-bulk-dialog__counts">
              <u-text-value-dashed><template #label>{{ $t('bulk_price_dialog.modern.products_in_scope') }}</template>{{ report?.count_products ?? '—' }}</u-text-value-dashed>
              <u-text-value-dashed><template #label>{{ $t('bulk_price_dialog.modern.variants_in_scope') }}</template>{{ report?.count_variants ?? '—' }}</u-text-value-dashed>
            </div>
            <v-expand-transition v-else>
              <div v-if="report">
                <div class="py-3">
                  <u-text-value-dashed>
                    <template v-slot:label>{{ $t('bulk_price_dialog.total_products') }}</template>
                    {{ report.count_products }}
                  </u-text-value-dashed>

                  <u-text-value-dashed>
                    <template v-slot:label>{{ $t('bulk_price_dialog.total_variants') }}</template>
                    {{ report.count_variants }}
                  </u-text-value-dashed>
                </div>
              </div>
            </v-expand-transition>

            <!-- ━━━━━━━━━━━━━━━━━━ Confirmation ━━━━━━━━━━━━━━━━━━ -->

            <hr v-if="!modern" class="hr-dashed" />

            <u-smart-verify v-if="!modern"
              v-model="bulk_check"
              :true-title="$t('inventory_list.bulk_discount_dialog.check')"
              :true-description="$t('inventory_list.bulk_discount_dialog.check_description')"
            >
            </u-smart-verify>
            <div v-if="modern" class="sd-modern-notice b-inventory-bulk-dialog__notice"><v-icon size="16" aria-hidden="true">info_outline</v-icon><p class="sd-modern-notice__content">{{ $t('bulk_price_dialog.modern.scope_notice') }}</p></div>
          </div>
          </div>
          <aside v-if="modern" class="b-inventory-bulk-dialog__explanation">
            <b-inventory-bulk-discount-illustration :percent="bulk_percent" :start="dis_start" :end="dis_end" />
            <section class="b-inventory-bulk-dialog__help">
              <h2>{{ $t('inventory_list.bulk_discount_dialog.modern.help_title') }}</h2>
              <div class="b-inventory-bulk-dialog__help-row"><v-icon size="17" aria-hidden="true">find_replace</v-icon><div><h3>{{ $t('inventory_list.bulk_discount_dialog.modern.replaces_title') }}</h3><p>{{ $t('inventory_list.bulk_discount_dialog.modern.replaces_help') }}</p></div></div>
              <div class="b-inventory-bulk-dialog__help-row"><v-icon size="17" aria-hidden="true">receipt_long</v-icon><div><h3>{{ $t('inventory_list.bulk_discount_dialog.modern.base_unchanged_title') }}</h3><p>{{ $t('inventory_list.bulk_discount_dialog.modern.base_unchanged_help') }}</p></div></div>
              <div class="b-inventory-bulk-dialog__help-row"><v-icon size="17" aria-hidden="true">preview</v-icon><div><h3>{{ $t('inventory_list.bulk_discount_dialog.modern.preview_first') }}</h3><p>{{ $t('inventory_list.bulk_discount_dialog.modern.preview_help') }}</p></div></div>
              <details class="b-inventory-bulk-dialog__rounding"><summary>{{ $t('inventory_list.bulk_discount_dialog.modern.rounding_title') }}<v-icon size="15" aria-hidden="true">expand_more</v-icon></summary><p>{{ $t('inventory_list.bulk_discount_dialog.modern.rounding_help') }}</p></details>
            </section>
          </aside>
          </div>
          <div v-if="modern" class="sd-modern-widget b-inventory-bulk-dialog__verify">
            <u-smart-verify v-model="bulk_check" role="checkbox" :aria-label="$t('inventory_list.bulk_discount_dialog.modern.verify_title')" :aria-checked="bulk_check" :aria-disabled="busy_bulk" :disabled="busy_bulk" tabindex="0"
              :true-title="$t('inventory_list.bulk_discount_dialog.modern.verify_title')" :true-description="$t('inventory_list.bulk_discount_dialog.modern.verify_help')"
              @keydown.space.prevent="!busy_bulk && (bulk_check = !bulk_check)" @keydown.enter.prevent="!busy_bulk && (bulk_check = !bulk_check)" />
          </div>
        </v-card-text>

        <v-card-actions
          :class="{
            'sd-modern-form-actions b-inventory-bulk-dialog__actions': modern,
          }"
        >
          <div :class="modern ? 'b-inventory-bulk-dialog__action-content' : 'widget-buttons'">
            <p v-if="modern">{{ $t(bulk_check ? 'inventory_list.bulk_discount_dialog.modern.ready_hint' : 'inventory_list.bulk_discount_dialog.modern.confirm_hint') }}</p>
            <div :class="{ 'b-inventory-bulk-dialog__action-buttons': modern }" :style="modern ? undefined : { display: 'contents' }">
            <v-btn
              :class="{ 'sd-modern-button': modern }"
              size="x-large"
              variant="text"
              @click="$emit('update:modelValue', false)"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :class="{
                disabled: !bulk_check,
                'sd-modern-button sd-modern-button--primary': modern,
              }"
              color="primary"
              size="x-large"
              variant="elevated"
              :disabled="!bulk_check || busy_bulk"
              @click="showPreviewList()"
            >
              <v-icon v-if="modern" start size="17" aria-hidden="true">preview</v-icon>
              {{ $t("global.actions.show_preview") }}

              <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ████████████████████ Dialog > Preview ████████████████████ -->

    <v-dialog
      v-model="preview"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card
        v-if="dialog_pre"
        class="text-start"
        :class="{ 'sd-modern-canvas b-inventory-bulk-dialog b-inventory-bulk-discount': modern }"
      >
        <v-card-title :class="{ 'b-inventory-bulk-dialog__title': modern }">
          <div v-if="modern" class="b-inventory-bulk-dialog__header"><div class="b-inventory-bulk-dialog__heading"><v-icon aria-hidden="true">preview</v-icon><div><h1>{{ $t('inventory_list.bulk_discount_dialog.modern.preview_title') }}</h1><p>{{ $t('inventory_list.bulk_discount_dialog.modern.preview_subtitle') }}</p></div></div><span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot sd-modern-status__dot--warning"></span>{{ $t('bulk_price_dialog.modern.preview_not_applied') }}</span></div>
        </v-card-title>

        <v-card-text
          :class="{ 'b-inventory-bulk-dialog__body': modern }"
        >
          <ol v-if="modern" class="b-inventory-bulk-dialog__steps" :aria-label="$t('inventory_list.bulk_discount_dialog.title')"><li><span>1</span>{{ $t('bulk_price_dialog.modern.configure_step') }}</li><li aria-current="step"><span>2</span>{{ $t('inventory_list.bulk_discount_dialog.modern.review_step') }}</li><li><span>3</span>{{ $t('bulk_price_dialog.modern.apply_step') }}</li></ol>
          <div v-if="modern" class="b-inventory-bulk-dialog__preview-rule"><div><strong>{{ $t('inventory_list.bulk_discount_dialog.modern.discount_percent') }}</strong><bdi>{{ bulk_percent }}%</bdi></div><p>{{ $t('bulk_price_dialog.modern.all_currencies') }}</p><p class="b-inventory-bulk-discount__period"><v-icon size="16" aria-hidden="true">schedule</v-icon><span>{{ periodText }}</span></p></div>
          <b-inventory-bulk-preview
            :modern="modern"
            discount-update
            :class="{
              'sd-modern-widget b-inventory-bulk-dialog__preview-list':
                modern,
            }"
            :params="{
              category: bulk_category,
              percent: bulk_percent,
              dis_start: dis_start,
              dis_end: dis_end,
            }"
            :shop="shop"
            :url="list_url"
            has-currency
          ></b-inventory-bulk-preview>
        </v-card-text>

        <v-card-actions
          :class="{
            'sd-modern-form-actions b-inventory-bulk-dialog__actions': modern,
          }"
        >
          <div :class="modern ? 'b-inventory-bulk-dialog__action-content' : 'widget-buttons'">
            <p v-if="modern">{{ $t('bulk_price_dialog.modern.preview_apply_scope') }}</p>
            <div :class="{ 'b-inventory-bulk-dialog__action-buttons': modern }" :style="modern ? undefined : { display: 'contents' }">
            <v-btn
              size="x-large"
              variant="text"
              :class="{ 'sd-modern-button': modern }"
              @click="preview = false"
            >
              <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>
              {{ $t("global.actions.back") }}
            </v-btn>

            <v-btn
              :class="{
                disabled: !bulk_check,
                'sd-modern-button sd-modern-button--primary': modern,
              }"
              :loading="busy_bulk"
              :disabled="!bulk_check || busy_bulk"
              :color="modern ? 'primary' : '#C2185B'"
              size="x-large"
              variant="elevated"
              @click="setBulkDiscount"
            >
              <v-icon start>check</v-icon>
              {{ $t("global.actions.apply_change") }}

              <b v-if="!modern" class="ms-2">%{{ bulk_percent }}</b>
            </v-btn>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import BCategoryInput from "../../../category/input/BCategoryInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import BInventoryBulkPreview from "../../../inventory/bulk/preview/BInventoryBulkPreview.vue";

import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BCategoryParent from "../../../category/parent/BCategoryParent.vue";
import { throttle } from "lodash-es";
import UChipDiscount from "../../../../ui/chip/discount/UChipDiscount.vue";
import BInventoryPricePreview from "../../../inventory/price-preview/BInventoryPricePreview.vue";
import BInventoryBulkDiscountIllustration from "./BInventoryBulkDiscountIllustration.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import { formatDiscountPeriod } from '../formatDiscountPeriod';

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BInventoryBulkDiscount",
  mixins: [],
  components: {
    BInventoryBulkDiscountIllustration,
    USmartSuggestion,
    BInventoryPricePreview,
    UChipDiscount,
    BCategoryParent,
    USmartVerify,

    BInventoryBulkPreview,
    UTextValueDashed,
    UTimeProgressBar,
    UDateInput,
    BCategoryInput,

    UNumberInput,
  },
  emits: ["update", "update:modelValue"],
  props: {
    modern: { type: Boolean, default: false },
    modelValue: {},
    shop: {
      required: true,
      type: Object,
    },
    category: {
      // Optional ! Only for this category!
    },
  },
  data: () => ({
    bulk_category: null,
    bulk_percent: 0,
    bulk_check: false,
    busy_bulk: false,

    dis_start: null,
    dis_end: null,

    report: null,
    busy_report: false,

    preview: false,
    dialog_pre: false,
  }),
  computed: {
    periodText() {
      return formatDiscountPeriod(this.dis_start, this.dis_end, this.$i18n?.locale || 'en', this.$t);
    },
    list_url() {
      return window.API.GET_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT_LIST(
        this.shop.id,
      );
    },
  },

  watch: {
    modelValue(value) {
      if (value) {
        this.resetToDefault(); // 🞇 Reset to default
        this.bulk_category = this.category?.id ?? null; // A pinned category must survive reopening the dialog.

        this.$nextTick(() => {
          this.fetchReport();
        });
      }
    },

    category(val) {
      this.bulk_category = val?.id;
    },
  },
  created() {
    this.bulk_category = this.category?.id;
    if (this.category) {
      this.fetchReport();
    }
  },
  methods: {
    showPreviewList() {
      if (!this.bulk_check || this.busy_bulk) return;
      this.dialog_pre = false;
      this.$nextTick(() => {
        if (!this.bulk_check || this.busy_bulk) return;
        this.dialog_pre = true;
        this.preview = true;
      });
    },

    setBulkDiscount() {
      if (!this.bulk_check || this.busy_bulk) return;
      this.busy_bulk = true;
      axios
        .post(
          window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT(this.shop.id),
          {
            category: this.bulk_category,

            percent: this.bulk_percent,
            dis_start: this.dis_start,
            dis_end: this.dis_end,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert();
            this.preview = false;
            this.$emit("update", data);
            this.$emit("update:modelValue", false);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => (this.busy_bulk = false));
    },

    fetchReport: throttle(function () {
      this.report = null;
      this.$nextTick(() => {
        // Make sure all params updated!

        this.busy_report = true;
        axios
          .get(
            window.API.GET_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT_REPORT(
              this.shop.id,
            ),
            {
              params: {
                category: this.bulk_category,

                percent: this.bulk_percent,
                dis_start: this.dis_start,
                dis_end: this.dis_end,
              },
            },
          )
          .then(({ data }) => {
            if (!data.error) {
              this.report = data;
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            NotificationService.showLaravelError(error);
          })
          .finally(() => {
            this.busy_report = false;
          });
      });
    }, 1000),
  },
};
</script>

<style lang="scss" scoped src="../bulk-dialog.scss"></style>
<style lang="scss" scoped>
.b-inventory-bulk-discount__schedule { margin-block-start: 22px; }
.b-inventory-bulk-discount__zero-help { min-height: 21px; margin: 6px 0 0; font-size: 13px; line-height: 21px; }
.b-inventory-bulk-discount__period { display: flex; align-items: flex-start; gap: 7px; font-size: 13px; line-height: 21px; margin-block-start: 17px; }
.b-inventory-bulk-discount__period .v-icon { flex-shrink: 0; margin-block-start: 2px; }
</style>
