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
    <v-dialog
      :model-value="modelValue"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
      @update:model-value="(v) => $emit('update:modelValue', v)"
    >
      <v-card
        class="text-start"
        :class="{ 'sd-modern-canvas b-inventory-bulk-dialog b-inventory-bulk-price': modern }"
      >
        <v-card-title :class="{ 'b-inventory-bulk-dialog__title': modern }">
          <div :class="modern ? 'b-inventory-bulk-dialog__header' : 'd-flex align-center'">
            <div :class="modern ? 'b-inventory-bulk-dialog__heading' : 'd-flex align-center'">
              <v-icon :class="modern ? undefined : 'me-2'" aria-hidden="true">{{ modern ? 'tune' : 'shelves' }}</v-icon>
              <div>
                <h1 v-if="modern">{{ $t("bulk_price_dialog.title") }}</h1>
                <template v-else>{{ $t("bulk_price_dialog.title") }}</template>
                <p v-if="modern">{{ $t('bulk_price_dialog.modern.subtitle') }}</p>
              </div>
            </div>
            <v-btn v-if="modern" class="sd-modern-icon-button" variant="text" icon :aria-label="$t('global.actions.close')" :disabled="busy_bulk" @click="$emit('update:modelValue', false)">
              <v-icon size="18" aria-hidden="true">close</v-icon>
              <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text
          class="text-start"
          :class="{ 'b-inventory-bulk-dialog__body': modern }"
        >
          <ol v-if="modern" class="b-inventory-bulk-dialog__steps" :aria-label="$t('bulk_price_dialog.title')">
            <li aria-current="step"><span>1</span>{{ $t('bulk_price_dialog.modern.configure_step') }}</li>
            <li><span>2</span>{{ $t('bulk_price_dialog.modern.preview_step') }}</li>
            <li><span>3</span>{{ $t('bulk_price_dialog.modern.apply_step') }}</li>
          </ol>
          <div :class="{ 'b-inventory-bulk-dialog__grid': modern }">
          <div :class="{ 'b-inventory-bulk-dialog__settings': modern }">
          <section :class="{ 'sd-modern-widget b-inventory-bulk-dialog__method': modern }">
            <div v-if="modern" class="b-inventory-bulk-dialog__section-heading">
              <h2>{{ $t('bulk_price_dialog.modern.method_title') }}</h2>
              <v-tooltip location="top" open-on-click open-on-focus content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon :aria-label="$t('bulk_price_dialog.modern.method_title')"><v-icon size="15" aria-hidden="true">info_outline</v-icon></v-btn></template>
                {{ $t(mode === 'marketplace' ? 'bulk_price_dialog.modern.marketplace_help' : 'bulk_price_dialog.modern.method_help') }}
              </v-tooltip>
            </div>
          <v-tabs
            v-model="mode"
            :align-tabs="modern ? 'start' : 'title'"
            mandatory
            :class="{ 'b-inventory-bulk-dialog__tabs': modern }"
          >
            <v-tab value="percent">
              <v-icon class="me-1">percent</v-icon>
              {{ $t(modern ? 'bulk_price_dialog.modern.percent_tab' : 'bulk_price_dialog.add_percent_tab') }}
            </v-tab>
            <v-tab value="constant">
              <v-icon class="me-1">functions</v-icon>
              {{ $t(modern ? 'bulk_price_dialog.modern.constant_tab' : 'bulk_price_dialog.add_constant_tab') }}
            </v-tab>
            <v-tab value="ending">
              <v-icon class="me-1">money</v-icon>
              {{ $t(modern ? 'bulk_price_dialog.modern.ending_tab' : 'bulk_price_dialog.ending_tab') }}
            </v-tab>

            <v-tab v-if="IS_MARKETPLACE" value="marketplace">
              <v-icon class="me-1">build</v-icon>
              {{ $t("bulk_price_dialog.marketplace_listing_price") }}
              <v-chip v-if="!modern"
                size="x-small"
                color="#673AB7"
                class="ms-1"
                variant="elevated"
              >
                {{ $t("global.commons.marketplace") }}
              </v-chip>
            </v-tab>
          </v-tabs>

          <v-window v-model="mode" class="mt-3">
            <v-window-item value="percent">
              <div
                :class="modern ? 'b-inventory-bulk-dialog__rule' : 'widget-box mb-5'"
              >
                <u-widget-header v-if="!modern"
                  :class="{ 'sd-modern-form-header': modern }"
                  :title="$t('global.commons.price')"
                  icon="price_change"
                ></u-widget-header>

                <v-list-subheader>
                  {{ $t(modern ? 'bulk_price_dialog.modern.percent_description' : 'bulk_price_dialog.message') }}
                </v-list-subheader>

                <b-inventory-price-preview v-if="!modern" multiple>
                  <small class="d-block">{{
                    $t("global.commons.price")
                  }}</small>
                  #######
                  <v-icon>close</v-icon>
                  (1
                  <v-icon>add</v-icon>
                  <b>%{{ bulk_percent }}</b
                  >)
                </b-inventory-price-preview>

                <u-number-input
                  v-model="bulk_percent"
                  :label="modern ? $t('bulk_price_dialog.modern.price_change') : undefined"
                  :suffix="modern ? '%' : undefined"
                  :decimal="1"
                  :max="90"
                  :min="-90"
                  :step="0.5"
                  class="strong-field"
                  :class="{ 'sd-modern-underlined-field b-inventory-bulk-dialog__value': modern }"
                  :prepend-inner-icon="modern ? undefined : 'fa:fas fa-percent'"
                  show-buttons
                ></u-number-input>
                <u-smart-suggestion v-if="modern" modern no-random :more-label="$t('global.commons.more')" :samples="[{ title: '−10%', value: -10 }, { title: '+5%', value: 5 }, { title: '+10%', value: 10 }]" @select="bulk_percent = $event" />
                <p v-if="modern" class="b-inventory-bulk-dialog__field-help">{{ $t('bulk_price_dialog.modern.percent_help') }}</p>
                <p v-if="modern" class="b-inventory-bulk-dialog__currency-scope"><v-icon size="16" aria-hidden="true">public</v-icon>{{ $t('bulk_price_dialog.modern.all_currencies') }}</p>
              </div>
            </v-window-item>
            <v-window-item value="constant">
              <div
                :class="modern ? 'b-inventory-bulk-dialog__rule' : 'widget-box mb-5'"
              >
                <u-widget-header v-if="!modern"
                  :class="{ 'sd-modern-form-header': modern }"
                  :title="$t('global.commons.price')"
                  icon="price_change"
                ></u-widget-header>

                <v-list-subheader>
                  {{ $t(modern ? 'bulk_price_dialog.modern.constant_description' : 'bulk_price_dialog.constant.subtitle') }}
                </v-list-subheader>

                <b-inventory-price-preview v-if="!modern" multiple>
                  <small class="d-block">{{
                    $t("global.commons.price")
                  }}</small>
                  #######
                  <v-icon
                    :color="bulk_constant >= 0 ? 'green' : 'red'"
                    @click="bulk_constant = -bulk_constant"
                    >{{ bulk_constant >= 0 ? "add" : "remove" }}
                  </v-icon>
                  <b>{{ Math.abs(bulk_constant) }}</b>
                </b-inventory-price-preview>

                <u-currency-input
                  :class="{ 'sd-modern-underlined-field': modern }"
                  v-model="bulk_currency"
                  :label="modern ? $t('bulk_price_dialog.modern.currency') : undefined"
                  :active-currencies="shop.currencies"
                  :return-object="false"
                  @change="fetchReport"
                ></u-currency-input>

                <u-price-input
                  v-model="bulk_constant"
                  :label="modern ? $t('bulk_price_dialog.modern.price_change') : undefined"
                  :currency="bulk_currency"
                  allow-negative
                  class="strong-field"
                  :class="{ 'sd-modern-underlined-field b-inventory-bulk-dialog__value': modern }"
                ></u-price-input>
                <u-smart-suggestion v-if="modern" modern no-random :more-label="$t('global.commons.more')" :samples="[{ title: '−5', value: -5 }, { title: '+5', value: 5 }, { title: '+10', value: 10 }]" @select="bulk_constant = $event" />
                <p v-if="modern" class="b-inventory-bulk-dialog__field-help">{{ $t('bulk_price_dialog.modern.constant_help') }}</p>
                <p v-if="modern" class="b-inventory-bulk-dialog__currency-scope"><v-icon size="16" aria-hidden="true">payments</v-icon>{{ $t('bulk_price_dialog.modern.selected_currency', { currency: bulk_currency || '—' }) }}</p>
              </div>
            </v-window-item>

            <v-window-item value="ending">
              <div
                :class="modern ? 'b-inventory-bulk-dialog__rule' : 'widget-box mb-5'"
              >
                <u-widget-header v-if="!modern"
                  :class="{ 'sd-modern-form-header': modern }"
                  :title="$t('global.commons.price')"
                  icon="price_change"
                ></u-widget-header>

                <v-list-subheader>
                  {{ $t(modern ? 'bulk_price_dialog.modern.ending_description' : 'bulk_price_dialog.ending.subtitle') }}
                </v-list-subheader>

                <b-inventory-price-preview v-if="!modern" multiple>
                  <small class="d-block">{{
                    $t("global.commons.price")
                  }}</small>
                  {{ "#".repeat(12 - ("" + bulk_ending).length) }}
                  <b>{{ bulk_ending }}</b>
                </b-inventory-price-preview>

                <u-currency-input
                  :class="{ 'sd-modern-underlined-field': modern }"
                  v-model="bulk_currency"
                  :label="modern ? $t('bulk_price_dialog.modern.currency') : undefined"
                  :active-currencies="shop.currencies"
                  :return-object="false"
                  @change="fetchReport"
                  :placeholder="$t('add_product.pricing.currency_input')"
                ></u-currency-input>

                <u-price-input
                  v-model="bulk_ending"
                  :currency="bulk_currency"
                  class="strong-field"
                  :class="{ 'sd-modern-underlined-field b-inventory-bulk-dialog__value': modern }"
                  :label="$t(modern ? 'bulk_price_dialog.modern.ending_value' : 'bulk_price_dialog.ending_tab')"
                ></u-price-input>
                <p v-if="modern" class="b-inventory-bulk-dialog__field-help">{{ $t('bulk_price_dialog.modern.ending_help') }}</p>
                <p v-if="modern" class="b-inventory-bulk-dialog__currency-scope"><v-icon size="16" aria-hidden="true">payments</v-icon>{{ $t('bulk_price_dialog.modern.selected_currency', { currency: bulk_currency || '—' }) }}</p>
              </div>
            </v-window-item>

            <v-window-item value="marketplace">
              <div
                :class="modern ? 'b-inventory-bulk-dialog__rule' : 'widget-box mb-5'"
              >
                <u-widget-header v-if="!modern"
                  :class="{ 'sd-modern-form-header': modern }"
                  :title="$t('bulk_price_dialog.marketplace.title')"
                  icon="price_change"
                ></u-widget-header>

                <v-list-subheader>
                  {{ $t(modern ? 'bulk_price_dialog.modern.marketplace_help' : 'bulk_price_dialog.marketplace.subtitle') }}
                </v-list-subheader>

                <u-smart-select
                  :class="{ 'sd-modern-smart-select': modern }"
                  :border="modern || undefined"
                  v-model="marketplace_listing_price_fix_strategy"
                  @change="fetchReport"
                  item-value="value"
                  item-text="title"
                  item-description="description"
                  :items="[
                    {
                      value: 'min',
                      title: $t(
                        'bulk_price_dialog.marketplace.strategy.min.title',
                      ),
                      description: $t(
                        'bulk_price_dialog.marketplace.strategy.min.description',
                      ),
                    },
                    {
                      value: 'max',
                      title: $t(
                        'bulk_price_dialog.marketplace.strategy.max.title',
                      ),
                      description: $t(
                        'bulk_price_dialog.marketplace.strategy.max.description',
                      ),
                    },
                  ]"
                  force-show-all
                  gray-unselected
                >
                </u-smart-select>
              </div>
            </v-window-item>
          </v-window>
          </section>

          <div :class="modern ? 'sd-modern-widget b-inventory-bulk-dialog__scope' : 'widget-box mb-5'" :aria-busy="modern ? busy_report : undefined">
            <div v-if="modern" class="b-inventory-bulk-dialog__section-heading">
              <h2>{{ $t('bulk_price_dialog.modern.scope_title') }}</h2>
              <v-tooltip location="top" open-on-click open-on-focus content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon :aria-label="$t('bulk_price_dialog.modern.scope_title')"><v-icon size="15" aria-hidden="true">info_outline</v-icon></v-btn></template>
                {{ $t('bulk_price_dialog.modern.scope_help') }}
              </v-tooltip>
            </div>
            <u-widget-header
              v-if="!modern"
              :class="{ 'sd-modern-form-header': modern }"
              :title="$t('global.commons.category')"
              icon="snippet_folder"
            ></u-widget-header>
            <v-list-subheader>
              {{ $t("bulk_price_dialog.category.subtitle") }}
            </v-list-subheader>

            <b-category-input
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="bulk_category"
              :label="$t('global.commons.category')"
              :messages="$t('inventory_list.category_filter_msg')"
              :placeholder="$t('global.commons.all') + ' *.*'"
              clearable
              no-home
              persistent-placeholder
              @change="fetchReport"
            >
            </b-category-input>
            <hr v-if="!modern" class="my-5" />

            <template v-if="IS_MARKETPLACE">
              <u-widget-header
                :class="{ 'sd-modern-form-header': modern }"
                :title="$t('global.commons.vendor')"
                icon="storefront"
              ></u-widget-header>
              <v-list-subheader>
                {{ $t(modern ? 'bulk_price_dialog.modern.vendor_scope_help' : 'bulk_price_dialog.vendor.subtitle') }}
              </v-list-subheader>

              <b-vendor-input
                :class="{ 'sd-modern-underlined-field': modern }"
                v-model="bulk_vendor"
                :label="$t('global.commons.vendor')"
                :placeholder="$t('global.commons.all') + ' *.*'"
                :shop="shop"
                clearable
                persistent-placeholder
                @change="fetchReport"
              >
              </b-vendor-input>

              <v-expand-transition>
                <div v-if="bulk_vendor">
                  <v-list-subheader>
                    <v-icon>warning_amber</v-icon>
                    {{
                      $t(
                        "bulk_price_dialog.vendor.listing_price_need_update_msg",
                      )
                    }}
                  </v-list-subheader>
                </div>
              </v-expand-transition>

              <hr v-if="!modern" class="my-5" />
            </template>

            <!-- ━━━━━━━━━━━━━━━━━━ 📊 Report ━━━━━━━━━━━━━━━━━━ -->
            <u-loading-progress v-if="busy_report"></u-loading-progress>
            <div v-if="modern" class="b-inventory-bulk-dialog__counts">
              <u-text-value-dashed><template #label>{{ $t(mode === 'marketplace' ? 'bulk_price_dialog.modern.listing_products_in_scope' : bulk_vendor ? 'bulk_price_dialog.modern.vendor_products_in_scope' : 'bulk_price_dialog.modern.products_in_scope') }}</template>{{ report?.count_products ?? '—' }}</u-text-value-dashed>
              <u-text-value-dashed v-if="mode !== 'marketplace' && !bulk_vendor"><template #label>{{ $t('bulk_price_dialog.modern.variants_in_scope') }}</template>{{ report?.count_variants ?? '—' }}</u-text-value-dashed>
            </div>
            <v-expand-transition v-else
              v-if="!need_currency_in_params || bulk_currency"
            >
              <div v-if="report">
                <div v-if="mode === 'marketplace'">
                  <u-text-value-dashed>
                    <template v-slot:label
                      >{{ $t("bulk_price_dialog.listing_products_changes") }}
                    </template>
                    <b>{{ report.count_products }}</b>
                  </u-text-value-dashed>
                </div>
                <div v-else-if="bulk_vendor">
                  <u-text-value-dashed>
                    <template v-slot:label>
                      {{ $t("bulk_price_dialog.total_vendor_products") }}
                    </template>
                    <b>{{ report.count_products }}</b>
                  </u-text-value-dashed>
                </div>
                <div v-else>
                  <u-text-value-dashed>
                    <template v-slot:label>
                      {{ $t("bulk_price_dialog.total_products") }}
                    </template>
                    <b>{{ report.count_products }}</b>
                  </u-text-value-dashed>

                  <u-text-value-dashed>
                    <template v-slot:label
                      >{{ $t("bulk_price_dialog.total_variants") }}
                    </template>
                    <b>{{ report.count_variants }}</b>
                  </u-text-value-dashed>
                </div>

                <hr class="my-5" />
              </div>
            </v-expand-transition>

            <!-- ━━━━━━━━━━━━━━━━━━ Confirmation ━━━━━━━━━━━━━━━━━━ -->

            <u-smart-verify v-if="!modern"
              v-model="bulk_check"
              :true-title="$t('bulk_price_dialog.check')"
              :true-description="$t('bulk_price_dialog.check_description')"
            >
            </u-smart-verify>
            <div v-if="modern" class="sd-modern-notice b-inventory-bulk-dialog__notice"><v-icon size="16" aria-hidden="true">info_outline</v-icon><p class="sd-modern-notice__content">{{ $t('bulk_price_dialog.modern.scope_notice') }}</p></div>
          </div>
          </div>
          <aside v-if="modern" class="b-inventory-bulk-dialog__explanation">
            <b-inventory-bulk-price-illustration :mode="mode" :percent="bulk_percent" :constant="bulk_constant" :ending="bulk_ending" :currency="bulk_currency" :strategy="marketplace_listing_price_fix_strategy" />
            <section class="b-inventory-bulk-dialog__help">
              <h2>{{ $t('bulk_price_dialog.modern.help_title') }}</h2>
              <div class="b-inventory-bulk-dialog__help-row"><v-icon size="17" aria-hidden="true">receipt_long</v-icon><div><h3>{{ $t(mode === 'marketplace' ? 'bulk_price_dialog.marketplace_listing_price' : 'bulk_price_dialog.modern.base_only') }}</h3><p>{{ $t(mode === 'marketplace' ? 'bulk_price_dialog.modern.marketplace_help' : 'bulk_price_dialog.modern.base_help') }}</p></div></div>
              <div class="b-inventory-bulk-dialog__help-row"><v-icon size="17" aria-hidden="true">preview</v-icon><div><h3>{{ $t('bulk_price_dialog.modern.preview_first') }}</h3><p>{{ $t('bulk_price_dialog.modern.preview_help') }}</p></div></div>
              <details v-if="mode !== 'marketplace'" class="b-inventory-bulk-dialog__rounding"><summary>{{ $t('bulk_price_dialog.modern.rounding_title') }}<v-icon size="15" aria-hidden="true">expand_more</v-icon></summary><p>{{ $t(`bulk_price_dialog.modern.${mode}_rounding`) }}</p></details>
            </section>
          </aside>
          </div>
          <div v-if="modern" class="sd-modern-widget b-inventory-bulk-dialog__verify">
            <u-smart-verify
              v-model="bulk_check"
              role="checkbox"
              :aria-label="$t('bulk_price_dialog.modern.verify_title')"
              :aria-checked="bulk_check"
              :aria-disabled="busy_bulk"
              :disabled="busy_bulk"
              tabindex="0"
              :true-title="$t('bulk_price_dialog.modern.verify_title')"
              :true-description="$t('bulk_price_dialog.modern.verify_help')"
              @keydown.space.prevent="!busy_bulk && (bulk_check = !bulk_check)"
              @keydown.enter.prevent="!busy_bulk && (bulk_check = !bulk_check)"
            />
          </div>
        </v-card-text>

        <v-card-actions
          :class="{
            'sd-modern-form-actions b-inventory-bulk-dialog__actions': modern,
          }"
        >
          <div :class="modern ? 'b-inventory-bulk-dialog__action-content' : 'widget-buttons'">
            <p v-if="modern">{{ $t(bulk_check ? 'bulk_price_dialog.modern.ready_hint' : 'bulk_price_dialog.modern.confirm_hint') }}</p>
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
              @click="showPreview"
            >
              <v-icon v-if="modern" start size="17" aria-hidden="true">preview</v-icon>
              {{ $t("global.actions.show_preview") }}

              <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ====================== Dialog > Preview ====================== -->

    <v-dialog
      v-model="preview"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card
        class="text-start"
        min-height="60vh"
        :class="{ 'sd-modern-canvas b-inventory-bulk-dialog b-inventory-bulk-price': modern }"
      >
        <v-card-title :class="{ 'b-inventory-bulk-dialog__title': modern }">
          <div v-if="modern" class="b-inventory-bulk-dialog__header"><div class="b-inventory-bulk-dialog__heading"><v-icon aria-hidden="true">preview</v-icon><div><h1>{{ $t('bulk_price_dialog.modern.preview_title') }}</h1><p>{{ $t('bulk_price_dialog.modern.preview_subtitle') }}</p></div></div><span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot sd-modern-status__dot--warning"></span>{{ $t('bulk_price_dialog.modern.preview_not_applied') }}</span></div>
        </v-card-title>

        <v-card-text
          :class="{ 'b-inventory-bulk-dialog__body': modern }"
        >
          <ol v-if="modern" class="b-inventory-bulk-dialog__steps" :aria-label="$t('bulk_price_dialog.title')"><li><span>1</span>{{ $t('bulk_price_dialog.modern.configure_step') }}</li><li aria-current="step"><span>2</span>{{ $t('bulk_price_dialog.modern.preview_step') }}</li><li><span>3</span>{{ $t('bulk_price_dialog.modern.apply_step') }}</li></ol>
          <div v-if="modern" class="b-inventory-bulk-dialog__preview-rule">
            <div>
              <strong>{{ $t(mode === 'marketplace' ? 'bulk_price_dialog.marketplace_listing_price' : `bulk_price_dialog.modern.${mode}_tab`) }}</strong>
              <bdi v-if="mode === 'percent'">{{ bulk_percent > 0 ? '+' : '' }}{{ bulk_percent }}%</bdi>
              <bdi v-else-if="mode === 'constant'">{{ bulk_constant > 0 ? '+' : '' }}{{ bulk_constant }} {{ bulk_currency }}</bdi>
              <bdi v-else-if="mode === 'ending'">{{ bulk_ending }} {{ bulk_currency }}</bdi>
              <span v-else-if="marketplace_listing_price_fix_strategy">{{ $t(`bulk_price_dialog.marketplace.strategy.${marketplace_listing_price_fix_strategy}.title`) }}</span>
            </div>
            <p>{{ $t(mode === 'percent' ? 'bulk_price_dialog.modern.all_currencies' : mode === 'marketplace' ? 'bulk_price_dialog.modern.marketplace_help' : 'bulk_price_dialog.modern.selected_currency', { currency: bulk_currency }) }}</p>
          </div>
          <b-inventory-bulk-preview
            :class="{
              'sd-modern-widget b-inventory-bulk-dialog__preview-list': modern,
            }"
            v-if="preview"
            :modern="modern"
            :has-currency="!need_currency_in_params"
            :params="params"
            :shop="shop"
            :url="list_url"
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
              :disabled="!bulk_check || busy_bulk"
              :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
              :loading="busy_bulk"
              :color="modern ? 'primary' : 'success'"
              size="x-large"
              variant="elevated"
              @click="setBulkPrice"
              prepend-icon="check"
            >
              {{ $t("global.actions.apply_change") }}

              <b v-if="!modern && mode === 'percent'" class="ms-2">%{{ bulk_percent }}</b>
              <b v-else-if="!modern && mode === 'constant'" class="ms-2"
                >+ {{ bulk_constant }} {{ bulk_currency }}</b
              >
              <b v-else-if="!modern && mode === 'ending'" class="ms-2"
                >{{ bulk_ending }} ####{{ bulk_currency }}</b
              >
            </v-btn>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import BCategoryInput from "../../../category/input/BCategoryInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import BInventoryBulkPreview from "../../../inventory/bulk/preview/BInventoryBulkPreview.vue";

import { throttle } from "lodash-es";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BInventoryPricePreview from "../../../inventory/price-preview/BInventoryPricePreview.vue";
import BVendorInput from "@selldone/components-vue/backoffice/vendor/input/BVendorInput.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BInventoryBulkPriceIllustration from "./BInventoryBulkPriceIllustration.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";

export default {
  name: "BInventoryBulkPrice",
  mixins: [],
  components: {
    USmartSuggestion,
    BInventoryBulkPriceIllustration,
    USmartSelect,
    BVendorInput,
    BInventoryPricePreview,
    USmartVerify,
    BInventoryBulkPreview,
    UTextValueDashed,
    BCategoryInput,
    UCurrencyInput,
    UPriceInput,
    UNumberInput,
  },
  emits: ["update:modelValue", "update"],
  props: {
    modern: { type: Boolean, default: false },
    modelValue: {},
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    mode: "percent",

    bulk_category: null,
    bulk_vendor: null,

    bulk_percent: 0,
    bulk_check: false,
    busy_bulk: false,
    bulk_constant: 0,
    bulk_currency: null,
    bulk_ending: 0,

    report: null,
    busy_report: false,

    preview: false,

    marketplace_listing_price_fix_strategy: null,
  }),
  computed: {
    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    need_currency_in_params() {
      return ["constant", "ending"].includes(this.mode);
    },
    list_url() {
      return window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_LIST(
        this.shop.id,
      );
    },
    params() {
      return {
        mode: this.mode, // Pricing strategy
        category: this.bulk_category,
        vendor: this.bulk_vendor,

        percent: this.bulk_percent,

        constant: this.bulk_constant,
        currency: this.bulk_currency,

        ending: this.bulk_ending,

        strategy: this.marketplace_listing_price_fix_strategy,
      };
    },
  },

  watch: {
    modelValue(value) {
      if (value) {
        this.resetToDefault(); // 🞇 Reset to default
        if (this.shop.currencies && this.shop.currencies.length)
          this.bulk_currency = this.shop.currencies[0];
        this.fetchReport();
      }
    },
    need_currency_in_params() {
      this.fetchReport();
    },
  },
  created() {
    // console.log("currencies", this.shop.currencies, this.bulk_currency);
  },
  methods: {
    showPreview() {
      if (!this.bulk_check || this.busy_bulk) return;
      this.preview = true;
    },
    setBulkPrice() {
      if (!this.bulk_check || this.busy_bulk) return;
      this.busy_bulk = true;
      axios
        .post(
          window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE(this.shop.id),
          this.params,
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

      if (
        this.mode === "marketplace" &&
        !this.marketplace_listing_price_fix_strategy
      )
        return;

      this.$nextTick(() => {
        // Make sure all params updated!
        if (this.need_currency_in_params && !this.bulk_currency) return;

        this.busy_report = true;

        axios
          .get(
            window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_REPORT(
              this.shop.id,
            ),
            {
              params: this.params,
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
