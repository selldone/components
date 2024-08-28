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
    <!-- Weight -->

      <s-widget-header
        :title="$t('product_extra_physical.weight')"
        icon="fa:fas fa-weight-hanging"
      ></s-widget-header>

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
    <hr class="my-5">
      <s-widget-header
        :title="$t('product_extra_physical.size')"
        icon="fa:fas fa-box"
      ></s-widget-header>

      <v-list-subheader>
        {{ $t("product_extra_physical.size_subtitle") }}
      </v-list-subheader>
      <u-number-input
        v-model="width"
        :label="$t('product_extra_physical.width')"
        :min="0"
        :step="10"
        :suffix="size_unit"
        class="my-3 max-width-field mx-auto sm-suffix"
        @change="$emit('update:extra', extra)"
      />

      <u-number-input
        v-model="length"
        :label="$t('product_extra_physical.length')"
        :min="0"
        :step="10"
        :suffix="size_unit"
        class="my-3 max-width-field mx-auto sm-suffix"
        @change="$emit('update:extra', extra)"
      />

      <u-number-input
        v-model="height"
        :label="$t('product_extra_physical.height')"
        :min="0"
        :step="10"
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

      <hr class="my-5">


      <s-widget-header
        :title="$t('product_extra_physical.lead_time_title')"
        icon="pending_actions"
      ></s-widget-header>
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
      <s-widget-header
        :title="$t('product_extra_physical.bulk_action')"
        icon="move_down"
      ></s-widget-header>
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

<script>
import UCube from "../../../../ui/cube/UCube.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import TransportationsEligibleView from "../../../transportation/transportation/TransportationsEligibleView.vue";

export default {
  name: "BProductExtraInput",
  components: {
    TransportationsEligibleView,
    USmartToggle,
    UNumberInput,
    UCube,
  },
  props: {
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
    lead: 0,

    weight: 0,

    width: 0,
    length: 0,
    height: 0,
  }),

  computed: {
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
      this.assignValues();
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
    this.assignValues();
  },

  methods: {
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

<style lang="scss" scoped></style>
