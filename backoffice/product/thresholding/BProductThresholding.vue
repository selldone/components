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
  <!-- ███████████████ Modern: the product editor's Urgency messages tab ███████████████ -->
  <section
    v-if="modern && product_thresholds_obj?.conditions"
    class="b-product-urgency text-start"
  >
    <div class="sd-modern-widget b-product-urgency__card">
      <header class="b-product-urgency__heading">
        <b-product-edit-info-icon name="Flame" />
        <h2>{{ $t("b_product_urgency.title") }}</h2>
        <v-btn-toggle
          :model-value="custom"
          mandatory
          density="compact"
          class="sd-modern-segmented b-product-urgency__source"
          :disabled="IS_VENDOR_PANEL"
          :aria-label="$t('b_product_urgency.source')"
          @update:model-value="setCustom"
        >
          <v-btn :value="false">{{ $t("b_product_urgency.source_default") }}</v-btn>
          <v-btn :value="true">{{ $t("b_product_urgency.source_custom") }}</v-btn>
        </v-btn-toggle>
      </header>
      <p class="b-product-urgency__intro">
        {{ $t("b_product_urgency.subtitle") }}
      </p>

      <!-- Preview: the storefront block for the simulated numbers, with the storefront's own rule matcher. -->
      <div class="b-product-urgency__try">
        <div class="min-width-0 b-product-urgency__preview-column">
          <!-- Inert storefront sketch (shared dashed preview frame), sized for its tallest state so the form below never moves. -->
          <div class="sd-modern-illustration sd-modern-sketch b-product-urgency__shop">
            <span class="sd-modern-sketch__badge">{{ $t("b_product_urgency.preview") }}</span>
            <div class="b-product-urgency__product">
              <v-avatar rounded="lg" size="48" color="transparent">
                <v-img
                  v-if="$product.icon"
                  :src="getShopImagePath($product.icon, 128)"
                />
              </v-avatar>
              <div class="min-width-0">
                <strong>{{ $product.title }}</strong>
              </div>
            </div>
            <template v-if="preview_visible">
              <div class="b-product-urgency__message" v-html="preview_message"></div>
              <!-- Same bar as the storefront (SProductSectionIncentivise): striped, red past 80% sold. -->
              <div v-if="preview_progress" class="b-product-urgency__progress">
                <v-progress-linear
                  :model-value="sim.d"
                  :max="sim.d + sim.s"
                  :color="preview_share > 0.8 ? '#D32F2F' : 'green'"
                  rounded-bar
                  rounded
                  height="10"
                  striped
                ></v-progress-linear>
                <small
                  ><span
                    >{{ $t("global.product_section_incentivise.total_sold") }}:
                    <b>{{ compact(sim.d) }}</b></span
                  ><span v-if="has_progress"
                    >{{ $t("global.product_section_incentivise.available_items") }}:
                    <b>{{ compact(sim.s) }}</b></span
                  ></small
                >
              </div>
            </template>
            <p v-else class="b-product-urgency__none">
              {{ $t(needs_stock && sim.s <= 0 ? "b_product_urgency.out_of_stock" : "b_product_urgency.no_message") }}
            </p>
            <div class="sd-modern-illustration__action sd-modern-sketch__action b-product-urgency__cart-button" aria-hidden="true">
              {{ $t("global.actions.add_to_cart") }}
            </div>
          </div>
          <!-- Why this message: always three lines tall, so the layout does not jump while trying numbers. -->
          <p class="b-product-urgency__why" :title="preview_why">{{ preview_why }}</p>
        </div>
        <div class="min-width-0">
          <p class="sd-modern-eyebrow">{{ $t("b_product_urgency.try") }}</p>
          <div class="b-product-urgency__presets">
            <button
              v-for="preset in presets"
              :key="preset.key"
              type="button"
              class="sd-modern-tag b-product-urgency__preset"
              :class="{ 'b-product-urgency__preset--on': activePreset === preset.key }"
              :aria-pressed="activePreset === preset.key"
              @click="sim = { ...preset.sim }"
            >
              {{ $t(`b_product_urgency.preset_${preset.key}`) }}
            </button>
          </div>
          <label v-if="needs_stock" class="b-product-urgency__sim">
            <span>{{ $t("b_product_urgency.stock") }}<b>{{ sim.s.toLocaleString() }}</b></span>
            <v-slider
              :model-value="toScale(sim.s, sim_max.s)"
              :min="0"
              :max="100"
              :step="1"
              hide-details
              color="primary"
              @update:model-value="(v) => (sim.s = fromScale(v, sim_max.s))"
            />
          </label>
          <label class="b-product-urgency__sim">
            <span>{{ $t("b_product_urgency.sold") }}<b>{{ sim.d.toLocaleString() }}</b></span>
            <v-slider
              :model-value="toScale(sim.d, sim_max.d)"
              :min="0"
              :max="100"
              :step="1"
              hide-details
              color="primary"
              @update:model-value="(v) => (sim.d = fromScale(v, sim_max.d))"
            />
          </label>
          <label v-if="has_in_cart_count" class="b-product-urgency__sim">
            <span>{{ $t("b_product_urgency.carts") }}<b>{{ sim.c.toLocaleString() }}</b></span>
            <v-slider
              :model-value="toScale(sim.c, sim_max.c)"
              :min="0"
              :max="100"
              :step="1"
              hide-details
              color="primary"
              @update:model-value="(v) => (sim.c = fromScale(v, sim_max.c))"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Map: which message every stock and sales combination gets (first matching rule, drawn on top). -->
    <div v-if="needs_stock" class="sd-modern-widget b-product-urgency__card">
      <div class="b-product-urgency__card-head">
        <h3>{{ $t("b_product_urgency.map_title") }}</h3>
        <span>{{ $t("b_product_urgency.map_hint") }}</span>
      </div>
      <div class="b-product-urgency__map">
        <span class="b-product-urgency__axis-y">{{ $t("b_product_urgency.sold") }} ↑</span>
        <div
          class="b-product-urgency__plot"
          role="img"
          :aria-label="$t('b_product_urgency.map_title')"
          @click="pickPoint"
        >
          <svg viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
            <rect class="b-product-urgency__none-fill" x="0" y="0" width="1000" height="220" />
            <rect
              v-for="region in map_regions"
              :key="region.key"
              :class="`b-product-urgency__fill--${region.key}`"
              :x="region.x"
              :y="region.y"
              :width="region.w"
              :height="region.h"
            />
            <line
              v-for="tick in map_ticks.x"
              :key="'x' + tick.value"
              :x1="tick.at * 10"
              :x2="tick.at * 10"
              y1="0"
              y2="220"
              class="b-product-urgency__grid"
            />
          </svg>
          <span
            class="b-product-urgency__point"
            :style="{
              insetInlineStart: `clamp(7px, ${map_point.x}%, calc(100% - 7px))`,
              top: `clamp(7px, ${100 - map_point.y}%, calc(100% - 7px))`,
            }"
            aria-hidden="true"
          ></span>
          <span class="b-product-urgency__y-max" aria-hidden="true">{{ map_scale.y }}+</span>
          <span
            v-for="tick in map_ticks.y"
            :key="'y' + tick.value"
            class="b-product-urgency__y-tick"
            :style="{ bottom: tick.at + '%' }"
            aria-hidden="true"
            >{{ tick.value }}</span
          >
        </div>
        <div class="b-product-urgency__ticks" aria-hidden="true">
          <span
            v-for="tick in map_ticks.x"
            :key="tick.value"
            :style="{ insetInlineStart: tick.at + '%' }"
            >{{ tick.value }}{{ tick.at === 100 ? "+" : "" }}</span
          >
        </div>
        <span class="b-product-urgency__axis-x">{{ $t("b_product_urgency.stock") }} →</span>
      </div>
      <div class="b-product-urgency__legend">
        <span v-for="level in levels" :key="level.key"
          ><i :class="`b-product-urgency__dot--${level.key}`"></i>{{ level.name }}</span
        >
        <span><i class="b-product-urgency__dot--none"></i>{{ $t("b_product_urgency.no_message") }}</span>
        <span><i class="b-product-urgency__dot--point"></i>{{ $t("b_product_urgency.legend_preview") }}</span>
      </div>
    </div>

    <!-- Rules in check order; the first one that matches picks the message. -->
    <div class="sd-modern-widget b-product-urgency__card">
      <div class="b-product-urgency__card-head">
        <h3>{{ $t("b_product_urgency.rules_title") }}</h3>
      </div>
      <p class="b-product-urgency__hint">
        {{ $t(needs_stock ? "b_product_urgency.rules_hint" : "b_product_urgency.rules_hint_sales") }}
      </p>
      <p v-if="!custom" class="b-product-urgency__hint">
        {{ $t("b_product_urgency.defaults_note") }}
      </p>
      <div
        v-for="(condition, index) in active_conditions"
        :key="condition.key"
        class="b-product-urgency__rule"
        :class="{ 'b-product-urgency__rule--hit': preview_condition?.key === condition.key }"
      >
        <span class="b-product-urgency__rule-index">{{ index + 1 }}</span>
        <div class="min-width-0">
          <div class="b-product-urgency__rule-head">
            <i :class="`b-product-urgency__dot--${condition.key}`"></i>
            <strong>{{ levelName(condition.key) }}</strong>
            <span v-if="preview_condition?.key === condition.key" class="b-product-urgency__showing">{{
              $t("b_product_urgency.showing")
            }}</span>
          </div>
          <p class="b-product-urgency__rule-message">{{ $t(condition.message) }}</p>
          <div class="b-product-urgency__rule-fields">
            <label
              >{{ $t("b_product_urgency.sold_more_than") }}
              <input
                type="number"
                min="0"
                :value="condition.minSales ?? ''"
                :placeholder="$t('b_product_urgency.any')"
                :disabled="!editable"
                @change="setVariable(condition.key, 'minSales', $event.target.value)"
            /></label>
            <template v-if="needs_stock">
              <label
                >{{ $t("b_product_urgency.stock_from") }}
                <input
                  type="number"
                  min="0"
                  :value="condition.minQuantity ?? ''"
                  :placeholder="$t('b_product_urgency.any')"
                  :disabled="!editable"
                  @change="setVariable(condition.key, 'minQuantity', $event.target.value)"
              /></label>
              <label
                >{{ $t("b_product_urgency.stock_to") }}
                <input
                  type="number"
                  min="0"
                  :value="condition.maxQuantity ?? ''"
                  :placeholder="$t('b_product_urgency.any')"
                  :disabled="!editable"
                  @change="setVariable(condition.key, 'maxQuantity', $event.target.value)"
              /></label>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Extra signals beside the message (physical and virtual products). -->
    <div v-if="has_progress || has_in_cart_count" class="b-product-urgency__signals">
      <div v-if="has_progress" class="sd-modern-widget b-product-urgency__card">
        <div class="b-product-urgency__signal-head">
          <v-icon size="18" aria-hidden="true">linear_scale</v-icon>
          <h3>{{ $t("b_product_urgency.progress_title") }}</h3>
          <b>{{ Math.round(active_progress * 100) }}%</b>
        </div>
        <p class="b-product-urgency__hint">{{ $t("b_product_urgency.progress_help") }}</p>
        <v-slider
          :model-value="Math.round(active_progress * 100)"
          :min="0"
          :max="100"
          :step="1"
          hide-details
          color="primary"
          :disabled="!editable"
          :aria-label="$t('b_product_urgency.progress_title')"
          @update:model-value="(v) => setSignal('progress', v)"
        />
      </div>
      <div v-if="has_in_cart_count" class="sd-modern-widget b-product-urgency__card">
        <div class="b-product-urgency__signal-head">
          <v-icon size="18" aria-hidden="true">shopping_cart</v-icon>
          <h3>{{ $t("b_product_urgency.carts_title") }}</h3>
          <b>{{ Math.round(active_carts * 100) }}%</b>
        </div>
        <p class="b-product-urgency__hint">{{ $t("b_product_urgency.carts_help") }}</p>
        <v-slider
          :model-value="Math.round(active_carts * 100)"
          :min="0"
          :max="100"
          :step="1"
          hide-details
          color="primary"
          :disabled="!editable"
          :aria-label="$t('b_product_urgency.carts_title')"
          @update:model-value="(v) => setSignal('carts', v)"
        />
      </div>
    </div>

    <div v-if="!IS_VENDOR_PANEL" class="b-product-urgency__save">
      <span>{{ $t(setting_changed ? "b_product_urgency.unsaved" : "b_product_urgency.saved") }}</span>
      <template v-if="setting_changed">
        <v-btn
          variant="text"
          class="sd-modern-button sd-modern-button--form"
          :disabled="busy_save"
          @click="discardChanges"
          >{{ $t("b_product_urgency.discard") }}</v-btn
        >
        <v-btn
          color="primary"
          variant="flat"
          class="sd-modern-button sd-modern-button--form sd-modern-button--primary"
          prepend-icon="save"
          :loading="busy_save"
          @click="saveThresholds"
          >{{ $t("global.actions.save") }}</v-btn
        >
      </template>
    </div>
  </section>

  <!-- Legacy editors keep the original thresholds widget. -->
  <div
    v-else-if="!modern && product_thresholds_obj?.conditions"
    :class="{
      'text-start': modern,
      'b-product-thresholds--modern': modern,
      'b-product-thresholds--expanded': modern && settings_open,
    }"
  >
    <div
      :class="
        modern
          ? 'sd-modern-widget b-product-thresholds__widget'
          : 'widget-box -large mb-5'
      "
    >
      <header
        v-if="modern"
        class="sd-modern-header b-product-thresholds__header"
      >
        <div class="sd-modern-title">
          <v-icon class="sd-modern-icon" aria-hidden="true">tune</v-icon>
          <div class="flex-grow-1 min-width-0">
            <h2>{{ $t("b_product_inventory.thresholds.title") }}</h2>
            <p class="sd-modern-subtitle">
              {{ $t("b_product_inventory.thresholds.subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          variant="text"
          color="primary"
          class="sd-modern-button sd-modern-button--small"
          :aria-expanded="settings_open"
          :aria-controls="'product-thresholds-' + $product.id"
          @click="settings_open = !settings_open"
        >
          <v-icon start aria-hidden="true">{{
            settings_open ? "expand_less" : "edit"
          }}</v-icon>
          {{
            $t(settings_open ? "global.actions.close" : "global.actions.edit")
          }}
        </v-btn>
      </header>
      <div
        v-if="modern"
        v-show="!settings_open"
        class="b-product-thresholds__summary"
      >
        <div
          v-if="has_progress || has_in_cart_count"
          class="b-product-thresholds__preview"
        >
          <span v-if="has_progress"
            >{{ $t("b_product_inventory.thresholds.progress") }}
            <b>{{ Math.round(progress * 100) }}%</b></span
          >
          <span
            v-if="has_progress"
            class="b-product-thresholds__track"
            aria-hidden="true"
            ><i :style="{ width: Math.round(progress * 100) + '%' }"></i
          ></span>
          <span v-if="has_in_cart_count"
            >{{ $t("b_product_inventory.thresholds.carts") }}
            <b>{{ Math.round(carts * 100) }}%</b></span
          >
        </div>
        <span class="sd-modern-status sd-modern-status--plain"
          ><i
            v-if="custom"
            class="sd-modern-status__dot bg-primary b-product-thresholds__custom-dot"
          ></i
          >{{
            $t(
              custom
                ? "b_product_inventory.thresholds.custom"
                : "b_product_inventory.thresholds.default",
            )
          }}</span
        >
      </div>
      <div
        v-show="!modern || settings_open"
        :id="modern ? 'product-thresholds-' + $product.id : undefined"
        class="b-product-thresholds__details"
      >
        <div
          v-if="modern && thresholds && !IS_VENDOR_PANEL"
          class="sd-modern-actions b-product-thresholds__toolbar"
        >
          <v-btn
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--small"
            prepend-icon="restart_alt"
            @click="resetToDefault"
            >{{ $t("b_product_inventory.thresholds.reset") }}</v-btn
          >
        </div>
        <u-widget-header
          v-if="!modern"
          :src="
            require('@selldone/components-vue/assets/icons/thresholding.svg')
          "
          title="Thresholds"
        >
          <template v-slot:actions>
            <u-smart-menu
              v-if="thresholds && !IS_VENDOR_PANEL"
              :items="[
                {
                  title: 'Reset to default',
                  subtitle: 'Reset all thresholds to default values',
                  icon: 'restart_alt',
                  click: resetToDefault,
                },
              ]"
              class="ms-2"
            >
            </u-smart-menu>
          </template>
        </u-widget-header>
        <v-list-subheader v-if="!modern">
          You can set thresholds for this product to display a progress bar on
          the product page, encouraging buyers to purchase the product faster.
        </v-list-subheader>

        <v-expansion-panels
          rounded="xl"
          flat
          :model-value="modern ? 0 : undefined"
        >
          <v-expansion-panel :eager="modern">
            <v-expansion-panel-title v-show="!modern">
              <b-product-thresholding-preview
                :variables="variables"
                :progress="progress"
                :carts="carts"
                :custom="custom"
                class="flex-grow-1"
              >
              </b-product-thresholding-preview>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <b-product-thresholding-preview
                v-if="modern"
                :variables="variables"
                :progress="progress"
                :carts="carts"
                :custom="custom"
                class="b-product-thresholds__rules-preview"
              />
              <u-smart-toggle
                v-model="custom"
                false-gray
                :true-description="
                  modern
                    ? $t('b_product_inventory.thresholds.custom_help')
                    : 'Has custom thresholds for this product.'
                "
                :true-title="
                  modern
                    ? $t('b_product_inventory.thresholds.custom')
                    : 'Custom Thresholds'
                "
                :false-title="
                  modern
                    ? $t('b_product_inventory.thresholds.default')
                    : 'Default Thresholds'
                "
                :false-description="
                  modern
                    ? $t('b_product_inventory.thresholds.default_help')
                    : 'Use default thresholds for this product.'
                "
                @change="
                  (val) => {
                    setting_changed = true;
                  }
                "
                :disabled="IS_VENDOR_PANEL"
              >
              </u-smart-toggle>

              <v-expand-transition>
                <div v-if="custom" :class="{ disabled: IS_VENDOR_PANEL }">
                  <div
                    v-if="has_progress"
                    :class="modern ? 'b-product-thresholds__slider' : undefined"
                  >
                    <div>
                      <b class="me-1">{{
                        modern
                          ? $t("b_product_inventory.thresholds.progress")
                          : "Progress |"
                      }}</b>
                      <span v-if="modern">{{
                        $t("b_product_inventory.thresholds.progress_help")
                      }}</span>
                      <template v-else
                        >Show a progress bar when the product's sold proportion
                        exceeds the defined threshold.</template
                      >
                      <code
                        >sold / (stock + sold) >
                        {{ numeralFormat(progress, "0.00") }}</code
                      >
                    </div>
                    <v-slider
                      v-model="progress"
                      :aria-label="
                        modern
                          ? $t('b_product_inventory.thresholds.progress')
                          : undefined
                      "
                      :disabled="modern && IS_VENDOR_PANEL"
                      :thumb-label="modern ? true : undefined"
                      hide-details
                      density="compact"
                      :min="0"
                      :max="1"
                      show-ticks
                      @update:model-value="setting_changed = true"
                      :step="0.01"
                    >
                      <template v-if="modern" #thumb-label="{ modelValue }"
                        >{{ Math.round(modelValue * 100) }}%</template
                      >
                    </v-slider>
                  </div>

                  <div
                    v-if="has_in_cart_count"
                    :class="modern ? 'b-product-thresholds__slider' : undefined"
                  >
                    <div>
                      <b class="me-1">{{
                        modern
                          ? $t("b_product_inventory.thresholds.carts")
                          : "In Cart |"
                      }}</b>
                      <span v-if="modern">{{
                        $t("b_product_inventory.thresholds.carts_help")
                      }}</span>
                      <template v-else
                        >Show an indicator if more than the defined percentage
                        of stock is added to carts.</template
                      >
                      <code
                        >in_carts >= stock *
                        {{ numeralFormat(carts, "0.00") }}</code
                      >
                    </div>
                    <v-slider
                      v-model="carts"
                      :aria-label="
                        modern
                          ? $t('b_product_inventory.thresholds.carts')
                          : undefined
                      "
                      :disabled="modern && IS_VENDOR_PANEL"
                      :thumb-label="modern ? true : undefined"
                      hide-details
                      density="compact"
                      :min="0"
                      :max="1"
                      show-ticks
                      @update:model-value="setting_changed = true"
                      :step="0.01"
                    >
                      <template v-if="modern" #thumb-label="{ modelValue }"
                        >{{ Math.round(modelValue * 100) }}%</template
                      >
                    </v-slider>
                  </div>

                  <!-- ⬬⬬⬬⬬ Custom Thresholds ⬬⬬⬬⬬ -->
                  <div class="mt-4">
                    <div
                      v-for="(item, key) in product_thresholds_obj.conditions"
                      :key="key"
                      :class="
                        modern ? 'b-product-thresholds__condition' : 'my-1'
                      "
                    >
                      <div
                        v-if="modern"
                        class="b-product-thresholds__condition-level"
                      >
                        <i
                          class="b-product-thresholds__level-dot"
                          :style="{
                            backgroundColor:
                              ProductThresholdLevel[item.key]?.color,
                          }"
                          aria-hidden="true"
                        ></i>
                        {{
                          $t(
                            "b_product_inventory.thresholds.levels." + item.key,
                          )
                        }}
                      </div>
                      <div
                        :class="
                          modern ? 'b-product-thresholds__message' : undefined
                        "
                      >
                        {{ $t(item.message) }}
                      </div>

                      <v-row class="my-0 position-relative">
                        <div
                          v-if="!modern"
                          class="vertical-text text-center pen"
                          style="
                            font-size: 10px;
                            position: absolute;
                            left: -8px;
                            top: 0;
                            bottom: 0;
                            border-right: solid 2px;
                          "
                          :style="{
                            borderColor: ProductThresholdLevel[item.key]?.color,
                          }"
                        >
                          {{ ProductThresholdLevel[item.key]?.name }}
                        </div>

                        <v-col cols="12" sm="4">
                          <v-number-input
                            v-model="variables[item.key].minSales"
                            :label="
                              modern
                                ? $t('b_product_inventory.thresholds.min_sales')
                                : 'Min Sales'
                            "
                            :disabled="modern && IS_VENDOR_PANEL"
                            :min="0"
                            variant="outlined"
                            density="compact"
                            clearable
                            hide-details
                            persistent-placeholder
                            placeholder="0"
                            @update:model-value="setting_changed = true"
                            prepend-icon="local_mall"
                          ></v-number-input>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-number-input
                            v-model="variables[item.key].minQuantity"
                            :label="
                              modern
                                ? $t(
                                    'b_product_inventory.thresholds.min_quantity',
                                  )
                                : 'Min Quantity'
                            "
                            :disabled="modern && IS_VENDOR_PANEL"
                            :min="0"
                            variant="outlined"
                            density="compact"
                            clearable
                            hide-details
                            persistent-placeholder
                            placeholder="0"
                            @update:model-value="setting_changed = true"
                            prepend-icon="shelves"
                          ></v-number-input>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-number-input
                            v-model="variables[item.key].maxQuantity"
                            :label="
                              modern
                                ? $t(
                                    'b_product_inventory.thresholds.max_quantity',
                                  )
                                : 'Max Quantity'
                            "
                            :disabled="modern && IS_VENDOR_PANEL"
                            :min="0"
                            variant="outlined"
                            density="compact"
                            clearable
                            hide-details
                            persistent-placeholder
                            :placeholder="modern ? '∞' : 'Infinit'"
                            @update:model-value="setting_changed = true"
                            prepend-icon="shelves"
                          ></v-number-input>
                        </v-col>
                      </v-row>
                    </div>
                  </div>

                  <ul class="small">
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_order")
                          : "Conditions are checked in order from top to bottom."
                      }}
                    </li>
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_zero")
                          : "To show progress initially, set 'Show Progress' to zero."
                      }}
                    </li>
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_sales")
                          : "The system compares Min Sells with the product's total sales (all variants included)."
                      }}
                    </li>
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_stock")
                          : "The system compares Min/Max Quantity with the selected variant's stock, or for marketplaces, the vendor's inventory."
                      }}
                    </li>
                  </ul>
                </div>
              </v-expand-transition>

              <v-expand-transition>
                <div v-if="setting_changed">
                  <div
                    :class="
                      modern ? 'sd-modern-form-actions' : 'widget-buttons'
                    "
                  >
                    <v-btn
                      :class="
                        modern
                          ? 'sd-modern-button sd-modern-button--form sd-modern-button--primary'
                          : undefined
                      "
                      :disabled="modern && IS_VENDOR_PANEL"
                      :loading="busy_save"
                      :color="modern ? 'primary' : '#000'"
                      :size="modern ? undefined : 'x-large'"
                      @click="saveThresholds"
                      prepend-icon="save"
                    >
                      {{ $t("global.actions.save_changes") }}
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import ProductThresholds, {
  FindProductThresholdCondition,
  ProductThresholdLevel,
} from "@selldone/core-js/enums/product/ProductThresholds.ts";
import BProductThresholdingPreview from "@selldone/components-vue/backoffice/product/thresholding/BProductThresholdingPreview.vue";
import BProductEditInfoIcon from "../edit/info/BProductEditInfoIcon.vue";

// Storefront fallbacks when a product has no custom rules (SProductSectionIncentivise).
const DEFAULT_SHARE = 0.1;

export default {
  name: "BProductThresholding",
  mixins: [],
  inject: ["$shop", "$product", "$vendor"],
  components: {
    BProductEditInfoIcon,
    BProductThresholdingPreview,
    UWidgetHeader,
    USmartMenu,
    USmartToggle,
  },
  props: {
    modern: { type: Boolean, default: false },
  },
  data: () => ({
    settings_open: false,
    ProductThresholdLevel: ProductThresholdLevel,
    ProductType: ProductType,

    busy_save: false,
    setting_changed: false,

    custom: false,
    variables: null,
    progress: 0.1, // proportion  to show progress: this.sells / (this.quantity + this.sells) > 0.1; (only physical and virtual)
    carts: 0.1, // if added to cart more than 10% of stock this.in_carts >= this.quantity * 0.1 (only physical and virtual)

    sim: { s: 0, d: 0, c: 0 }, // Modern preview: simulated stock, units sold and units in carts (never saved).
  }),
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    has_progress() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },
    has_in_cart_count() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },

    product_thresholds_obj() {
      return ProductThresholds[this.$product.type];
    },

    thresholds() {
      return this.$product.thresholds;
    },

    isVirtual() {
      return this.$product.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.$product.type === ProductType.PHYSICAL.code;
    },
    isFile() {
      return this.$product.type === ProductType.FILE.code;
    },

    //―――――――――――――――――――― Modern: Urgency messages ――――――――――――――――――――
    editable() {
      return this.custom && !this.IS_VENDOR_PANEL;
    },
    // Physical and virtual messages also depend on stock; files only on sales.
    needs_stock() {
      return this.has_progress;
    },
    // The rules the storefront applies: store defaults, or this product's values over them.
    active_conditions() {
      return this.product_thresholds_obj.conditions.map((condition) => {
        const values = this.custom ? this.variables?.[condition.key] : null;
        return values
          ? {
              ...condition,
              minSales: values.minSales ?? null,
              minQuantity: values.minQuantity ?? null,
              maxQuantity: values.maxQuantity ?? null,
            }
          : { ...condition };
      });
    },
    active_progress() {
      return this.custom ? this.progress : DEFAULT_SHARE;
    },
    active_carts() {
      return this.custom ? this.carts : DEFAULT_SHARE;
    },
    levels() {
      return this.product_thresholds_obj.conditions.map((condition) => ({
        key: condition.key,
        name: this.levelName(condition.key),
      }));
    },

    // Preview, mirroring SProductSectionIncentivise for the simulated numbers.
    preview_condition() {
      if (this.needs_stock && this.sim.s <= 0) return null;
      return FindProductThresholdCondition(this.active_conditions, this.sim.s, this.sim.d);
    },
    preview_share() {
      const total = this.sim.s + this.sim.d;
      return total > 0 ? this.sim.d / total : 0;
    },
    preview_cart_message() {
      if (!this.has_in_cart_count || this.sim.c < this.sim.s * this.active_carts) return "";
      return this.$t("global.product_section_incentivise.have_in_their_bag", {
        in_carts: this.compact(this.sim.c),
      });
    },
    preview_message() {
      if (this.needs_stock && this.sim.s <= 0) return "";
      return [this.preview_condition ? this.$t(this.preview_condition.message) : "", this.preview_cart_message]
        .filter(Boolean)
        .join(" ");
    },
    preview_visible() {
      return !!this.preview_message;
    },
    preview_progress() {
      return this.has_progress && this.preview_share >= this.active_progress;
    },
    preview_why() {
      const condition = this.preview_condition;
      const parts = [
        this.needs_stock && this.sim.s <= 0
          ? this.$t("b_product_urgency.why_out")
          : condition
            ? this.$t("b_product_urgency.why_match", {
                level: this.levelName(condition.key),
                condition: this.describe(condition),
              })
            : this.$t("b_product_urgency.why_none"),
      ];
      if (this.has_progress && this.preview_visible) {
        const share = Math.round(this.preview_share * 100);
        parts.push(
          this.preview_progress
            ? this.$t("b_product_urgency.why_progress_shown", { share })
            : this.$t("b_product_urgency.why_progress_hidden", {
                share,
                need: Math.round(this.active_progress * 100),
              }),
        );
      }
      return parts.join(" ");
    },
    presets() {
      const real = {
        s: Math.max(0, Math.round(this.$product.quantity || 0)),
        d: Math.max(0, Math.round(this.$product.sells || 0)),
        c: Math.max(0, Math.round(this.$product.in_carts || 0)),
      };
      return [
        { key: "this_product", sim: real },
        { key: "selling_fast", sim: { s: 60, d: 140, c: 12 } },
        { key: "almost_gone", sim: { s: 9, d: 30, c: 3 } },
        { key: "just_launched", sim: { s: 150, d: 0, c: 0 } },
      ];
    },
    activePreset() {
      const { s, d, c } = this.sim;
      return this.presets.find(({ sim }) => sim.s === s && sim.d === d && sim.c === c)?.key ?? null;
    },
    // Slider ranges: room above the product's real numbers.
    sim_max() {
      const p = this.presets[0].sim;
      return {
        s: Math.max(1000, Math.ceil(p.s * 1.5)),
        d: Math.max(500, Math.ceil(p.d * 1.5)),
        c: Math.max(200, Math.ceil(p.c * 1.5)),
      };
    },

    // Map scales: a little beyond the largest limit, so every rule stays visible.
    map_scale() {
      const finite = (values) => values.filter((v) => v != null && Number.isFinite(+v)).map(Number);
      const stock = finite(this.active_conditions.flatMap((c) => [c.minQuantity, c.maxQuantity]));
      const sales = finite(this.active_conditions.map((c) => c.minSales));
      return {
        x: this.niceCeil(Math.max(50, ...stock.map((v) => v * 1.25))),
        y: this.niceCeil(Math.max(10, ...sales.map((v) => v * 2))),
      };
    },
    // Lowest priority first, so the rule that wins each point is drawn on top (viewBox 1000 × 220).
    map_regions() {
      const { x: X, y: Y } = this.map_scale;
      return [...this.active_conditions]
        .reverse()
        .map((c) => {
          const x0 = Math.max(c.minQuantity ?? 1, 1);
          const x1 = c.maxQuantity == null ? X : Math.min(c.maxQuantity + 1, X);
          const y0 = c.minSales == null ? 0 : c.minSales + 1;
          if (x1 <= x0 || y0 >= Y) return null;
          return {
            key: c.key,
            x: (x0 / X) * 1000,
            w: ((x1 - x0) / X) * 1000,
            y: 0,
            h: (1 - this.salesAt(y0)) * 220,
          };
        })
        .filter(Boolean);
    },
    map_ticks() {
      const { x: X, y: Y } = this.map_scale;
      const step = this.niceCeil(X / 5);
      const x = [];
      for (let value = 0; value < X; value += step) x.push({ value, at: (value / X) * 100 });
      x.push({ value: X, at: 100 });
      const y = [...new Set([Math.round(Y / 25), Math.round(Y / 4)])]
        .filter((value) => value > 0 && value < Y)
        .map((value) => ({ value, at: this.salesAt(value) * 100 }));
      return { x, y };
    },
    map_point() {
      return {
        x: (Math.min(this.sim.s, this.map_scale.x) / this.map_scale.x) * 100,
        y: this.salesAt(Math.min(this.sim.d, this.map_scale.y)) * 100,
      };
    },
  },

  watch: {
    $product() {
      this.init();
    },
  },

  created() {
    this.init();
    // Start on "Selling fast": it shows the message, the progress bar and the cart notice together.
    this.sim = { ...this.presets.find((preset) => preset.key === "selling_fast").sim };
  },
  methods: {
    init() {
      if (!this.product_thresholds_obj?.conditions) return;

      this.custom = !!this.thresholds?.custom;
      this.variables = this.thresholds?.variables
        ? JSON.parse(JSON.stringify(this.thresholds.variables))
        : {};

      this.progress =
        this.thresholds?.progress != null ? this.thresholds?.progress : 0.1;
      this.carts =
        this.thresholds?.carts != null ? this.thresholds?.carts : 0.1;

      if (this.variables) {
        // Add tiers to variables
        this.product_thresholds_obj.conditions.forEach((item, key) => {
          if (!this.variables[item.key]) {
            this.variables[item.key] = {
              minSales: item.minSales,
              minQuantity: item.minQuantity,
              maxQuantity: item.maxQuantity,
            };
          }
        });
      }
    },

    //―――――――――――――――――――― Modern: Urgency messages ――――――――――――――――――――
    discardChanges() {
      this.init();
      this.setting_changed = false;
    },
    setCustom(value) {
      if (this.IS_VENDOR_PANEL || value == null || value === this.custom) return;
      this.custom = value;
      this.setting_changed = true;
    },
    setVariable(key, field, raw) {
      if (!this.editable) return;
      const value = raw === "" || raw == null ? null : Math.max(0, Math.round(Number(raw)));
      this.variables[key] = { ...this.variables[key], [field]: Number.isFinite(value) ? value : null };
      this.setting_changed = true;
    },
    setSignal(field, percent) {
      if (!this.editable) return;
      this[field] = Math.round(percent) / 100;
      this.setting_changed = true;
    },
    // Logarithmic sliders keep small stock numbers reachable next to large ones.
    toScale(value, max) {
      return Math.round((Math.log1p(Math.max(0, value)) / Math.log1p(max)) * 100);
    },
    fromScale(position, max) {
      return Math.round(Math.expm1((position / 100) * Math.log1p(max)));
    },
    compact(value) {
      return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
    },
    levelName(key) {
      return this.$t(`b_product_inventory.thresholds.levels.${key}`);
    },
    describe(condition) {
      const parts = [];
      if (condition.minSales != null) parts.push(this.$t("b_product_urgency.cond_sold", { n: condition.minSales }));
      const a = condition.minQuantity, b = condition.maxQuantity;
      if (a != null && b != null) parts.push(this.$t("b_product_urgency.cond_stock_range", { a, b }));
      else if (a != null) parts.push(this.$t("b_product_urgency.cond_stock_min", { a }));
      else if (b != null) parts.push(this.$t("b_product_urgency.cond_stock_max", { b }));
      return parts.length ? parts.join(this.$t("b_product_urgency.cond_and")) : this.$t("b_product_urgency.cond_always");
    },
    // Square-root sales axis (0…1): low-sales rules stay readable next to large thresholds.
    salesAt(sales) {
      return Math.sqrt(Math.max(0, sales) / this.map_scale.y);
    },
    niceCeil(value) {
      const step = 10 ** Math.floor(Math.log10(value));
      return Math.ceil(value / (step / 2)) * (step / 2);
    },
    // Clicking the map moves the preview to that stock and sales point.
    pickPoint(event) {
      const box = event.currentTarget.getBoundingClientRect();
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const fx = (rtl ? box.right - event.clientX : event.clientX - box.left) / box.width;
      const fy = Math.min(1, Math.max(0, (box.bottom - event.clientY) / box.height));
      this.sim = {
        ...this.sim,
        s: Math.max(0, Math.round(fx * this.map_scale.x)),
        d: Math.round(fy * fy * this.map_scale.y),
      };
    },

    resetToDefault() {
      this.$product.thresholds = null;
      this.init();
      this.setting_changed = true;
    },

    saveThresholds() {
      this.busy_save = true;

      axios
        .put(
          window.API.PUT_SET_PRODUCT_THRESHOLDS(
            this.$shop.id,
            this.$product.id,
          ),
          {
            custom: this.custom,
            variables: this.variables,
            progress: Math.ceil(this.progress * 100) / 100,
            carts: Math.ceil(this.carts * 100) / 100,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$product.thresholds = data.product.thresholds;
            this.setting_changed = false;
            NotificationService.showSuccessAlert(
              null,
              "Thresholds saved successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
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

<style scoped lang="scss">
// Urgency messages (modern): card and heading geometry follow the editor's Specifications tab.
.b-product-urgency {
  --urgency-error: rgb(var(--v-theme-error));
  --urgency-warning: rgb(var(--v-theme-warning));
  --urgency-primary: rgb(var(--v-theme-primary)); // Moderate is the blue level (ProductThresholdLevel).
  --urgency-success: rgb(var(--v-theme-success));
  display: grid;
  gap: 14px;
  min-width: 0;
  font-size: 13px;
  line-height: 20px;

  .min-width-0 {
    min-width: 0;
  }
  h2,
  h3 {
    margin: 0;
    font-weight: 500;
  }
  h2 {
    font-size: 16px;
    line-height: 24px;
    letter-spacing: -0.15px;
  }
  h3 {
    font-size: 14px;
    line-height: 22px;
  }
  .sd-modern-eyebrow {
    margin: 0 0 10px;
  }

  &__card.sd-modern-widget {
    min-width: 0;
    margin: 0;
    padding: 23px;
    border-radius: 16px;
  }
  &__heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    > svg {
      flex: 0 0 auto;
      color: var(--sd-modern-muted);
    }
  }
  &__source {
    margin-inline-start: auto;
  }
  &__intro,
  &__hint {
    margin: 9px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__hint {
    margin: 2px 0 6px;
  }

  // Preview and simulator, side by side when there is room.
  &__try {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 22px;
    margin-block-start: 20px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  // Room for the Preview badge that sits on the sketch's top border.
  &__preview-column {
    padding-block-start: 10px;
  }
  // The tallest state (3-line message, progress bar, action) fits, so trying numbers never resizes it.
  &__shop.sd-modern-sketch {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    min-height: 236px;
    padding: 18px 16px 16px;
    border-radius: 16px;
    font-size: 13px;
    line-height: 20px;
    user-select: none;
  }
  &__product {
    display: flex;
    align-items: center;
    gap: 12px;
    strong {
      display: block;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &__message {
    display: -webkit-box;
    overflow: hidden;
    font-size: 13px;
    line-height: 20px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  &__none {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__progress {
    @media (prefers-reduced-motion: reduce) {
      :deep(.v-progress-linear__determinate) {
        animation: none;
      }
    }
    small {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-block-start: 4px;
      color: var(--sd-modern-muted);
      font-size: 11px;
    }
  }
  // Pinned to the sketch's bottom; the shared hatched action reads as a simulated storefront button.
  &__cart-button {
    margin-block-start: auto;
    font-size: 13px;
    font-weight: 500;
  }
  &__presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-end: 8px;
  }
  &__preset {
    border: 0;
    cursor: pointer;
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__preset--on {
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
  }
  &__sim {
    display: block;
    margin-block-start: 6px;
    > span {
      display: flex;
      justify-content: space-between;
      color: var(--sd-modern-muted);
      font-size: 12px;
    }
    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    :deep(.v-slider.v-input--horizontal) {
      margin-inline: 0;
    }
  }
  // Always three lines tall (longer text is clipped and kept whole in the title).
  &__why {
    display: -webkit-box;
    min-height: 54px;
    margin: 10px 0 0;
    overflow: hidden;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  // Decision map.
  &__card-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 4px 12px;
    > span {
      color: var(--sd-modern-muted);
      font-size: 12px;
    }
  }
  &__map {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 4px 8px;
    margin-block-start: 12px;
  }
  &__axis-y {
    grid-row: 1;
    align-self: start;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  &__plot {
    position: relative;
    height: 220px;
    overflow: hidden;
    border-radius: 10px;
    cursor: crosshair;
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  &__none-fill {
    fill: rgba(var(--v-theme-on-surface), 0.05);
  }
  @each $level, $tone in (critical: error, high: warning, moderate: primary, low: success) {
    &__fill--#{$level} {
      fill: color-mix(in srgb, var(--urgency-#{$tone}) 26%, rgb(var(--v-theme-surface)));
    }
    &__dot--#{$level} {
      background: var(--urgency-#{$tone});
    }
  }
  &__grid {
    stroke: rgba(var(--v-theme-on-surface), 0.16);
    stroke-dasharray: 3 4;
    vector-effect: non-scaling-stroke;
  }
  &__point {
    position: absolute;
    width: 14px;
    height: 14px;
    border: 3px solid rgb(var(--v-theme-on-surface));
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition: inset-inline-start 0.15s ease, top 0.15s ease;
  }
  &__y-max,
  &__y-tick {
    position: absolute;
    inset-inline-start: 8px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 14px;
    font-variant-numeric: tabular-nums;
    pointer-events: none;
  }
  &__y-max {
    top: 6px;
  }
  &__y-tick {
    transform: translateY(50%);
  }
  &__ticks {
    position: relative;
    grid-column: 2;
    height: 16px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    > span {
      position: absolute;
      transform: translateX(-50%);
      &:first-child {
        transform: none;
      }
      &:last-child {
        transform: translateX(-100%);
      }
    }
  }
  &__axis-x {
    grid-column: 2;
    justify-self: center;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  &__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    margin-block-start: 10px;
    font-size: 12px;
    > span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }
  [class*="__dot--"] {
    display: inline-block;
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  &__dot--none {
    background: rgba(var(--v-theme-on-surface), 0.2);
  }
  &__dot--point {
    width: 10px !important;
    height: 10px !important;
    border: 2px solid rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
  }

  // Rules in check order.
  &__rule {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 10px;
    padding: 12px 10px;
    margin-inline: -10px;
    border-block-start: 1px solid var(--sd-modern-border);
    border-radius: 0;
  }
  &__rule--hit {
    border-block-start-color: transparent;
    border-radius: 10px;
    background: var(--sd-modern-inset);
  }
  &__rule--hit + &__rule {
    border-block-start-color: transparent;
  }
  &__rule-index {
    padding-block-start: 1px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  &__rule-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    strong {
      font-weight: 500;
    }
  }
  &__showing {
    padding: 0 8px;
    border-radius: 99px;
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
    font-size: 11px;
    line-height: 18px;
  }
  &__rule-message {
    margin: 4px 0 0;
  }
  &__rule-fields {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
    margin-block-start: 8px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    input {
      width: 76px;
      height: 32px;
      padding: 0 8px;
      border: 1px solid var(--sd-modern-border);
      border-radius: 8px;
      background: rgb(var(--v-theme-surface));
      color: rgb(var(--v-theme-on-surface));
      font: inherit;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      &:focus-visible {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 1px;
      }
      &:disabled {
        background: transparent;
        color: var(--sd-modern-muted);
      }
    }
  }

  // Extra signals.
  &__signals {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 14px;
  }
  &__signal-head {
    display: flex;
    align-items: center;
    gap: 8px;
    > .v-icon {
      color: var(--sd-modern-muted);
    }
    b {
      margin-inline-start: auto;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
  }

  &__save {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    > span {
      margin-inline-end: auto;
      color: var(--sd-modern-muted);
      font-size: 12px;
    }
  }

  @media (max-width: 599px) {
    &__card.sd-modern-widget {
      padding: 18px;
    }
    &__source {
      margin-inline-start: 0;
    }
  }
}

// RTL: stock grows from the right, like the mirrored ticks and preview dot.
.v-locale--is-rtl .b-product-urgency {
  .b-product-urgency__plot svg {
    transform: scaleX(-1);
  }
  .b-product-urgency__ticks > span {
    transform: translateX(50%);
    &:first-child {
      transform: none;
    }
    &:last-child {
      transform: translateX(100%);
    }
  }
  .b-product-urgency__point {
    transform: translate(50%, -50%);
  }
}

// Inside the inverted dashboard window: keep tones and the map's hues (invert + hue-rotate keeps hue).
.smart-invert .s--card-window-content .b-product-urgency {
  [class*="__dot--"]:not(.b-product-urgency__dot--none):not(.b-product-urgency__dot--point),
  .b-product-urgency__progress .v-progress-linear {
    filter: invert(1);
  }
  // Hue back, lightness stays dark: map regions, message emoji and the primary pill.
  .b-product-urgency__plot svg,
  .b-product-urgency__message,
  .b-product-urgency__rule-message,
  .b-product-urgency__showing {
    filter: hue-rotate(180deg);
  }
}
</style>
