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
  <div v-if="modern" class="b-product-extra-input sd-modern-form text-start">
    <section class="sd-modern-widget b-product-extra-input__package">
      <header class="b-product-extra-input__heading">
        <b-product-edit-info-icon name="PackageOpen" />
        <div>
          <h2>{{ $t("add_product.shipping_modern.package_title") }}</h2>
          <p>{{ $t("add_product.shipping_modern.package_intro") }}</p>
        </div>
        <v-btn
          class="sd-modern-icon-button sd-modern-info-button"
          icon
          variant="text"
          :aria-label="$t('add_product.shipping_modern.package_about')"
          ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
            activator="parent"
            location="top"
            open-on-click
            content-class="sd-modern-tooltip text-start"
            >{{ $t("add_product.shipping_modern.package_help") }}</v-tooltip
          ></v-btn
        >
      </header>
      <div class="b-product-extra-input__package-layout">
        <div>
          <u-number-input
            v-model="modernWeight"
            :decimal="3"
            :min="0"
            :max="10000"
            :disabled="busy"
            :readonly="readonly"
            :label="$t('product_extra_physical.weight')"
            :messages="$t('add_product.shipping_modern.weight_help')"
            :suffix="mass_unit"
            :text-center="false"
            class="sd-modern-underlined-field b-product-extra-input__measurement b-product-extra-input__weight"
            variant="underlined"
            @change="$emit('update:extra', extra)"
          />
          <div class="b-product-extra-input__dimensions">
            <u-number-input
              v-model="modernWidth"
              :decimal="3"
              :min="0"
              :step="10"
              :disabled="busy"
              :readonly="readonly"
              :label="$t('product_extra_physical.width')"
              :suffix="size_unit"
              :text-center="false"
              class="sd-modern-underlined-field b-product-extra-input__measurement"
              variant="underlined"
              @change="$emit('update:extra', extra)"
            />
            <u-number-input
              v-model="modernLength"
              :decimal="3"
              :min="0"
              :step="10"
              :disabled="busy"
              :readonly="readonly"
              :label="$t('product_extra_physical.length')"
              :suffix="size_unit"
              :text-center="false"
              class="sd-modern-underlined-field b-product-extra-input__measurement"
              variant="underlined"
              @change="$emit('update:extra', extra)"
            />
            <u-number-input
              v-model="modernHeight"
              :decimal="3"
              :min="0"
              :step="10"
              :disabled="busy"
              :readonly="readonly"
              :label="$t('product_extra_physical.height')"
              :suffix="size_unit"
              :text-center="false"
              class="sd-modern-underlined-field b-product-extra-input__measurement"
              variant="underlined"
              @change="$emit('update:extra', extra)"
            />
          </div>
          <p
            class="b-product-extra-input__help b-product-extra-input__dimension-help"
          >
            {{ $t("add_product.shipping_modern.dimension_help") }}
          </p>
        </div>
        <figure class="b-product-extra-input__preview">
          <figcaption>
            {{ $t("add_product.shipping_modern.preview_title") }}
          </figcaption>
          <u-cube
            :x="modernWidth"
            :y="modernLength"
            :z="modernHeight"
            :unit="size_unit"
            modern
            no-animation
          />
          <p v-if="validPreview">
            <bdi dir="ltr"
              >{{ formatNumber(modernWidth) }} ×
              {{ formatNumber(modernLength) }} ×
              {{ formatNumber(modernHeight) }} {{ size_unit }}</bdi
            >
          </p>
          <p v-else>{{ $t("add_product.shipping_modern.preview_empty") }}</p>
        </figure>
      </div>
      <div class="b-product-extra-input__units">
        <p>
          <b-product-edit-info-icon name="Ruler" :size="15" /><span>{{
            $t("add_product.shipping_modern.store_units", {
              mass: mass_unit,
              size: size_unit,
            })
          }}</span>
        </p>
        <v-btn
          v-if="!IS_VENDOR_PANEL"
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          color="primary"
          :to="{ name: 'BPageShopLogisticWarehouse' }"
          >{{ $t("add_product.shipping_modern.edit_units") }}</v-btn
        >
      </div>
      <p
        v-if="invalidMeasurements && !readonly"
        class="sd-modern-notice b-product-extra-input__message"
        role="alert"
      >
        <b-product-edit-info-icon name="CircleAlert" :size="16" class="sd-modern-notice__icon" /><span class="sd-modern-notice__content">{{
          $t("add_product.shipping_modern.invalid_measurements")
        }}</span>
      </p>
      <transportations-eligible-view
        ref="services"
        :shop="shop"
        :weight="modernWeight"
        :width="modernWidth"
        :length="modernLength"
        :height="modernHeight"
        :busy="busy"
        modern
        @dialog-change="onServiceDialogChange"
      />
    </section>
    <details
      v-if="!noLead"
      ref="preparationSection"
      class="sd-modern-widget sd-modern-disclosure b-product-extra-input__disclosure"
    >
      <summary class="sd-modern-disclosure__summary">
        <b-product-edit-info-icon name="Clock3" /><span
          class="b-product-extra-input__summary"
          ><span>{{ $t("add_product.shipping_modern.preparation_title") }}</span
          ><small>{{
            readonly
              ? $t("add_product.shipping_modern.inherited_digest")
              : leadDigest
          }}</small></span
        ><b-product-edit-info-icon name="ChevronDown" :size="16" />
      </summary>
      <div class="b-product-extra-input__body">
        <div class="b-product-extra-input__subtitle">
          <p>{{ $t("add_product.shipping_modern.preparation_intro") }}</p>
          <v-btn
            class="sd-modern-icon-button sd-modern-info-button"
            icon
            variant="text"
            :aria-label="$t('add_product.shipping_modern.preparation_about')"
            ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
              activator="parent"
              location="top"
              open-on-click
              content-class="sd-modern-tooltip text-start"
              >{{
                $t("add_product.shipping_modern.preparation_help")
              }}</v-tooltip
            ></v-btn
          >
        </div>
        <u-number-input
          v-model="modernLead"
          :min="-1"
          :step="1"
          :disabled="busy"
          :readonly="readonly"
          :label="$t('add_product.shipping_modern.preparation_title')"
          :messages="leadHelp"
          :suffix="$t('product_extra_physical.lead_time_dimension')"
          :text-center="false"
          class="sd-modern-underlined-field b-product-extra-input__lead"
          variant="underlined"
        />
        <div
          class="b-product-extra-input__presets"
          role="group"
          :aria-label="$t('add_product.shipping_modern.preparation_title')"
        >
          <v-btn
            v-for="preset in modernLeads"
            :key="preset.value"
            :aria-pressed="modernLead === preset.value"
            :disabled="busy || readonly"
            variant="text"
            @click="modernLead = preset.value"
            >{{ $t("add_product.shipping_modern." + preset.title) }}</v-btn
          >
        </div>
        <p
          v-if="invalidLead && !readonly"
          class="sd-modern-notice b-product-extra-input__message"
          role="alert"
        >
          <b-product-edit-info-icon name="CircleAlert" :size="16" class="sd-modern-notice__icon" /><span class="sd-modern-notice__content">{{
            $t("add_product.shipping_modern.invalid_lead")
          }}</span>
        </p>
      </div>
    </details>
    <slot name="order-limits" />
    <details
      v-if="hasBulkAction"
      class="sd-modern-widget sd-modern-disclosure b-product-extra-input__disclosure"
    >
      <summary class="sd-modern-disclosure__summary">
        <b-product-edit-info-icon name="Layers" /><span
          class="b-product-extra-input__summary"
          ><span>{{ $t("add_product.shipping_modern.variants_title") }}</span
          ><small>{{
            $t(
              readonly
                ? "add_product.shipping_modern.inherited_digest"
                : bulk
                  ? "add_product.shipping_modern.all_variants"
                  : "add_product.shipping_modern.main_only",
            )
          }}</small></span
        ><b-product-edit-info-icon name="ChevronDown" :size="16" />
      </summary>
      <div class="b-product-extra-input__body">
        <div class="b-product-extra-input__subtitle">
          <p>{{ $t("add_product.shipping_modern.variants_intro") }}</p>
          <v-btn
            class="sd-modern-icon-button sd-modern-info-button"
            icon
            variant="text"
            :aria-label="$t('add_product.shipping_modern.variants_about')"
            ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
              activator="parent"
              location="top"
              open-on-click
              content-class="sd-modern-tooltip text-start"
              >{{ $t("add_product.shipping_modern.variants_help") }}</v-tooltip
            ></v-btn
          >
        </div>
        <u-smart-toggle
          :model-value="bulk"
          :disabled="busy || readonly"
          :true-title="$t('add_product.shipping_modern.update_variants')"
          :false-title="$t('add_product.shipping_modern.update_variants')"
          :true-description="$t('add_product.shipping_modern.variant_scope')"
          :false-description="$t('add_product.shipping_modern.variant_scope')"
          accessible
          false-gray
          @update:model-value="updateBulk"
        />
        <p v-if="bulk && !readonly" class="b-product-extra-input__consequence">
          <b-product-edit-info-icon name="CopyCheck" :size="16" />{{
            $t("add_product.shipping_modern.variant_consequence")
          }}
        </p>
      </div>
    </details>
  </div>
  <div v-else>
    <!-- Weight -->

    <u-widget-header
      :title="$t('product_extra_physical.weight')"
      icon="fa:fas fa-weight-hanging"
    ></u-widget-header>

    <v-list-subheader>
      {{ $t("product_extra_physical.weight_subtitle") }}
    </v-list-subheader>
    <u-number-input
      v-model="weight"
      :decimal="3"
      :label="$t('product_extra_physical.weight')"
      :max="10000"
      :min="0"
      :suffix="mass_unit"
      class="my-3 max-width-field mx-auto sm-suffix"
      @change="$emit('update:extra', extra)"
    />
    <!-- Size -->
    <hr class="my-5" />
    <u-widget-header
      :title="$t('product_extra_physical.size')"
      icon="fa:fas fa-box"
    ></u-widget-header>

    <v-list-subheader>
      {{ $t("product_extra_physical.size_subtitle") }}
    </v-list-subheader>
    <u-number-input
      v-model="width"
      :label="$t('product_extra_physical.width')"
      :min="0"
      :step="10"
      :decimal="3"
      :suffix="size_unit"
      class="my-3 max-width-field mx-auto sm-suffix"
      @change="$emit('update:extra', extra)"
    />

    <u-number-input
      v-model="length"
      :label="$t('product_extra_physical.length')"
      :min="0"
      :step="10"
      :decimal="3"
      :suffix="size_unit"
      class="my-3 max-width-field mx-auto sm-suffix"
      @change="$emit('update:extra', extra)"
    />

    <u-number-input
      v-model="height"
      :label="$t('product_extra_physical.height')"
      :min="0"
      :step="10"
      :decimal="3"
      :suffix="size_unit"
      class="my-3 max-width-field mx-auto sm-suffix"
      @change="$emit('update:extra', extra)"
    />

    <u-cube
      :color="invalid_size ? '#eeeeee' : undefined"
      :x="invalid_size ? 50 : width"
      :y="invalid_size ? 50 : length"
      :z="invalid_size ? 50 : height"
    />
    <transportations-eligible-view
      :height="height"
      :length="length"
      :shop="shop"
      :weight="weight"
      :width="width"
    ></transportations-eligible-view>

    <!-- Lead Time -->
    <template v-if="!noLead">
      <hr class="my-5" />

      <u-widget-header
        :title="$t('product_extra_physical.lead_time_title')"
        icon="pending_actions"
      ></u-widget-header>
      <v-list-subheader>
        {{ $t("product_extra_physical.lead_time_subtitle") }}
      </v-list-subheader>
      <u-number-input
        v-model="lead"
        :label="$t('product_extra_physical.lead_time')"
        :messages="
          lead === -1
            ? $t('product_extra_physical.dynamic_lead_time')
            : lead === 0
              ? $t('product_extra_physical.instant_delivery')
              : ''
        "
        :min="-1"
        :step="1"
        :suffix="$t('product_extra_physical.lead_time_dimension')"
        class="my-3 max-width-field mx-auto sm-suffix"
      />

      <v-btn-toggle
        v-model="lead"
        class="widget-toggle"
        density="compact"
        rounded
        selected-class="blue-flat elevation-3 z1"
      >
        <v-btn
          v-for="it in leads"
          :key="it.value"
          :value="it.value"
          variant="flat"
        >
          {{ $t(it.title) }}
        </v-btn>
      </v-btn-toggle>
    </template>

    <!-- Bulk Action -->
    <div v-if="hasBulkAction" class="widget-box mt-5">
      <u-widget-header
        :title="$t('product_extra_physical.bulk_action')"
        icon="move_down"
      ></u-widget-header>
      <v-list-subheader>
        {{ $t("product_extra_physical.bulk_action_subtitle") }}
      </v-list-subheader>

      <u-smart-toggle
        :model-value="bulk"
        :true-description="$t('product_extra_physical.bulk_action_msg')"
        :true-title="$t('product_extra_physical.bulk_action_input')"
        color="success"
        false-gray
        false-icon="highlight_alt"
        true-icon="all_inclusive"
        @update:model-value="(val) => $emit('update:bulk', val)"
      >
      </u-smart-toggle>
    </div>
  </div>
</template>

<script lang="ts">
import UCube from "../../../../ui/cube/UCube.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import TransportationsEligibleView from "../../../transportation/transportation/TransportationsEligibleView.vue";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default {
  name: "BProductExtraInput",
  emits: ["update:extra", "update:bulk", "onLeadChange", "dialog-change"],
  components: {
    BProductEditInfoIcon,
    TransportationsEligibleView,
    USmartToggle,
    UNumberInput,
    UCube,
  },
  props: {
    modern: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    invalidMeasurements: { type: Boolean, default: false },
    invalidLead: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    extra: {
      required: true,
      type: Object,
    },

    defaultLeadTime: {
      required: false,
      type: Number,
      default: 48,
    },
    noLead: {
      default: false,
      type: Boolean,
    },

    hasBulkAction: {
      default: false,
      type: Boolean,
    },
    bulk: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    serviceDialogOpen: false,
    lead: 0,

    weight: 0,

    width: 0,
    length: 0,
    height: 0,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
    modernWeight: {
      get() {
        return this.extra.weight ?? 0;
      },
      set(value) {
        if (!this.busy && !this.readonly && value !== this.modernWeight)
          this.extra.weight = value;
      },
    },
    modernWidth: {
      get() {
        return this.extra.width ?? 0;
      },
      set(value) {
        if (!this.busy && !this.readonly && value !== this.modernWidth)
          this.extra.width = value;
      },
    },
    modernLength: {
      get() {
        return this.extra.length ?? 0;
      },
      set(value) {
        if (!this.busy && !this.readonly && value !== this.modernLength)
          this.extra.length = value;
      },
    },
    modernHeight: {
      get() {
        return this.extra.height ?? 0;
      },
      set(value) {
        if (!this.busy && !this.readonly && value !== this.modernHeight)
          this.extra.height = value;
      },
    },
    modernLead: {
      get() {
        return this.defaultLeadTime ?? 0;
      },
      set(value) {
        if (!this.busy && !this.readonly && value !== this.modernLead)
          this.$emit("onLeadChange", value);
      },
    },
    modalOpen() {
      return this.serviceDialogOpen;
    },
    modernLeads() {
      return [
        { value: -1, title: "dynamic" },
        { value: 0, title: "ready" },
        { value: 8, title: "eight_hours" },
        { value: 24, title: "one_day" },
        { value: 72, title: "three_days" },
        { value: 168, title: "one_week" },
      ];
    },
    validPreview() {
      return (
        this.modernWidth > 0 && this.modernLength > 0 && this.modernHeight > 0
      );
    },
    leadDigest() {
      if (this.invalidLead)
        return this.$t("add_product.shipping_modern.invalid_lead");
      const value = this.modernLead;
      if (value === -1)
        return this.$t("add_product.shipping_modern.dynamic_digest");
      if (value === 0)
        return this.$t("add_product.shipping_modern.ready_digest");
      return value % 24 === 0
        ? this.$t("add_product.shipping_modern.days_digest", {
            days: this.formatNumber(value / 24),
          })
        : this.$t("add_product.shipping_modern.hours_digest", {
            hours: this.formatNumber(value),
          });
    },
    leadHelp() {
      return this.$t(
        "add_product.shipping_modern." +
          (this.modernLead === -1
            ? "lead_dynamic_help"
            : this.modernLead === 0
              ? "lead_ready_help"
              : "lead_custom_help"),
      );
    },
    leads() {
      return [
        { value: -1, title: this.$t("global.commons.unknown") },
        { value: 0, title: this.$t("global.timespan.Instant") },
        { value: 8, title: `8 ${this.$t("global.commons.hours")}` },
        { value: 24, title: `1 ${this.$t("global.commons.day")}` },
        { value: 3 * 24, title: `3 ${this.$t("global.commons.days")}` },
        { value: 7 * 24, title: `1 ${this.$t("global.commons.week")}` },
      ];
    },
    invalid_size() {
      return (
        (this.width <= 0 && this.length <= 0) ||
        this.width + this.length + this.height <= 0
      );
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },
  },

  watch: {
    extra() {
      if (!this.modern) this.assignValues();
    },

    lead(value) {
      this.$emit("onLeadChange", value);
    },

    weight(value) {
      this.extra.weight = value;
    },

    width(value) {
      this.extra.width = value;
    },
    length(value) {
      this.extra.length = value;
    },
    height(value) {
      this.extra.height = value;
    },
  },

  created() {
    if (!this.modern) this.assignValues();
  },

  methods: {
    onServiceDialogChange(value) {
      this.serviceDialogOpen = value;
      this.$emit("dialog-change", value);
    },
    closeDialogs() {
      this.$refs.services?.closeDetails();
    },
    revealPreparation() {
      if (this.$refs.preparationSection)
        this.$refs.preparationSection.open = true;
    },
    formatNumber(value) {
      return Number(value).toLocaleString(
        this.$vuetify?.locale?.isRtl ? "fa-IR" : "en-US",
        { maximumFractionDigits: 3 },
      );
    },
    updateBulk(value) {
      if (!this.busy && !this.readonly) this.$emit("update:bulk", value);
    },
    prepareSave() {
      return (
        !this.modern ||
        (!this.busy && !this.serviceDialogOpen && !this.$refs.services?.menu)
      );
    },
    assignValues() {
      this.lead = this.extra.lead ? this.extra.lead : this.defaultLeadTime;

      this.weight = this.extra.weight ? this.extra.weight : 0;

      this.width = this.extra.width ? this.extra.width : 0;
      this.length = this.extra.length ? this.extra.length : 0;
      this.height = this.extra.height ? this.extra.height : 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-extra-input {
  box-sizing: border-box;
  min-width: 0;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));
  .sd-modern-widget {
    padding: 23px;
    border-radius: 16px;
    margin-block-end: 16px;
  }
  &__heading {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-end: 23px;
    > svg {
      color: var(--sd-modern-muted);
      margin-block-start: 3px;
    }
    > div {
      flex: 1;
      min-width: 0;
    }
    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
    p {
      margin: 5px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }
  &__package-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 190px;
    gap: 27px;
    align-items: center;
    > div {
      min-width: 0;
    }
  }
  &__weight {
    max-width: 235px;
    margin-block-end: 26px;
  }
  &__dimensions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  &__help {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__dimension-help {
    margin: 10px 0 0;
  }
  &__preview {
    margin: 0;
    min-width: 0;
    text-align: center;
    figcaption,
    p {
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 18px;
    }
    p {
      margin: 0;
      overflow-wrap: anywhere;
    }
  }
  &__units {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-block-start: 24px;
    > p {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
    .v-btn {
      flex-shrink: 0;
    }
  }
  .b-product-extra-input__disclosure {
    padding: 0;
  }
  .sd-modern-disclosure__summary {
    box-sizing: border-box;
    min-height: 84px;
    gap: 12px;
    padding: 19px 23px;
    > svg {
      color: var(--sd-modern-muted);
    }
    > svg:last-child {
      margin-inline-start: 0;
    }
  }
  &__summary {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 4px;
    > span {
      font-size: 14px;
      font-weight: 500;
      line-height: 21px;
    }
    > small {
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 18px;
      overflow-wrap: anywhere;
    }
  }
  details[open] > summary {
    min-height: 69px;
    padding-block-end: 12px;
    .b-product-extra-input__summary > span {
      font-size: 16px;
      line-height: 24px;
    }
    .b-product-extra-input__summary > small {
      display: none;
    }
    > svg:last-child {
      transform: rotate(180deg);
    }
  }
  &__body {
    box-sizing: border-box;
    padding: 0 23px 23px;
  }
  &__subtitle {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-block-end: 20px;
    > p {
      flex: 1;
      min-width: 0;
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }
  &__lead {
    max-width: 280px;
  }
  &__presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: fit-content;
    margin-block-start: 18px;
    padding: 4px;
    background: var(--sd-modern-inset);
    border-radius: 11px;
    .v-btn {
      min-height: 34px;
      height: auto;
      min-width: 0;
      padding: 7px 10px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: 0;
      text-transform: none;
    }
    .v-btn[aria-pressed="true"] {
      background: rgb(var(--v-theme-surface));
      box-shadow: var(--sd-modern-selected-shadow);
      font-weight: 500;
    }
    :deep(.v-btn__overlay) {
      display: none;
    }
  }
  &__consequence {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 17px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    > svg {
      flex-shrink: 0;
      margin-block-start: 1px;
    }
  }
  &__message {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 17px 0 0;
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
    line-height: 19px;
    > svg {
      flex-shrink: 0;
      margin-block-start: 1px;
      color: rgb(var(--v-theme-warning));
    }
  }
  :deep(.s--smart-toggle .mnh > .flex-grow-1 > b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  :deep(.s--smart-toggle .mnh > .flex-grow-1 > .small) {
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  // D3 is a native implementation hint, not a separate operation on these modern fields.
  :deep(.b-product-extra-input__measurement .v-field__append-inner > .v-chip) {
    display: none;
  }
  :deep(
    .sd-modern-underlined-field
      .v-field.v-field--variant-underlined
      .v-field__input
  ) {
    font-family: inherit;
    font-size: 14px !important;
    line-height: 22px;
  }
  :deep(.sd-modern-underlined-field .v-messages),
  :deep(.sd-modern-underlined-field .v-messages__message) {
    font-family: inherit;
    font-size: 12px;
    line-height: 19px;
  }
  :deep(.sd-modern-button .v-btn__content) {
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  @media (max-width: 880px) and (min-width: 721px) {
    &__package-layout {
      grid-template-columns: minmax(0, 1fr) 150px;
      gap: 18px;
    }
    &__dimensions {
      gap: 12px;
    }
  }
  @media (max-width: 720px) {
    .sd-modern-widget {
      padding-inline: 19px;
    }
    .b-product-extra-input__disclosure {
      padding: 0;
    }
    .sd-modern-disclosure__summary,
    .b-product-extra-input__body {
      padding-inline: 19px;
    }
  }
  @media (max-width: 600px) {
    &__package-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 25px;
    }
    &__preview {
      width: min(100%, 240px);
      margin-inline: auto;
    }
    &__weight {
      max-width: none;
    }
    &__units {
      flex-wrap: wrap;
      margin-block-start: 16px;
      .v-btn {
        margin-inline-start: auto;
      }
    }
    &__lead {
      max-width: none;
    }
    &__presets {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      .v-btn {
        padding-inline: 6px;
      }
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    :deep(
      .sd-modern-underlined-field
        .v-field.v-field--variant-underlined
        .v-field__input
    ) {
      font-size: 16px !important;
    }
    &__presets .v-btn {
      min-height: 44px;
    }
  }
  @media (max-width: 420px) {
    &__dimensions {
      grid-template-columns: minmax(0, 1fr);
      gap: 22px;
    }
    &__preview {
      width: min(100%, 210px);
    }
  }
  @media (max-width: 360px) {
    .sd-modern-widget {
      padding-inline: 15px;
    }
    .b-product-extra-input__disclosure {
      padding: 0;
    }
    .sd-modern-disclosure__summary {
      padding-inline: 15px;
      gap: 9px;
    }
    &__body {
      padding-inline: 15px;
    }
  }
}
</style>
