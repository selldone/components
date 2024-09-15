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
  <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Calculator ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

  <div class="shadow-paper cal-card mx-2 my-9">
    <v-icon size="large">calculate</v-icon>

    <v-divider class="mx-2" vertical></v-divider>
    <flag v-if="country" :iso="country" :squared="false" class="me-2"></flag>
    <template v-if="country && state">
      <small class="me-2">/</small>
      <s-state-flag
        :country="country"
        :region="state"
        class="me-1"
        height="14"
      ></s-state-flag>
      <b class="me-2">{{ state }}</b>
    </template>
    <v-spacer></v-spacer>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ const ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <u-price
      :amount="(selected_profile ? selected_profile : transportation).const"
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).const > 0,
      }"
      :currency="transportation.currency"
      :medium="(selected_profile ? selected_profile : transportation).const > 0"
      caption="Const"
      class="sub-caption b-12px min-width-50 text-center"
    ></u-price>
    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ distance_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).distance_cof >
          0,
      }"
      class="d-flex align-center"
    >
      <u-number-input
        v-model="cal_dis"
        :label="$t('global.commons.distance')"
        :suffix="getDistanceDimension(shop)"
        class="inline-block cal-in"
        dense
        flat
        hide-details
        prepend-inner-icon="place"
        solo
        title="Destination to warehouse distance."
      ></u-number-input>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation).distance_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation).distance_cof >
          0
        "
        caption="Distance"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ weight_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).weight_cof >
          0,
      }"
      class="d-flex align-center"
    >
      <u-number-input
        v-model="cal_w"
        :label="$t('global.commons.weight')"
        :suffix="getWeightDimension(shop)"
        class="inline-block cal-in"
        dense
        flat
        hide-details
        prepend-inner-icon="scale"
        solo
        title="Package weight."
      ></u-number-input>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation).weight_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation).weight_cof > 0
        "
        caption="Wight"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ distance_weight_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation)
            .distance_weight_cof > 0,
      }"
      class="d-flex align-center"
    >
      <span>{{ cal_dis }} {{ getDistanceDimension(shop) }}</span>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <span>{{ cal_w }} {{ getWeightDimension(shop) }}</span>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation)
            .distance_weight_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation)
            .distance_weight_cof > 0
        "
        caption="D🞬W"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <v-icon color="primary">fa:fas fa-plus</v-icon>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ price_cof ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      :class="{
        'op-0-5 scale-0-5':
          !(selected_profile ? selected_profile : transportation).price_cof > 0,
      }"
      class="d-flex align-center"
    >
      <u-price-input
        v-model="cal_p"
        :currency="currency"
        :decimal="6"
        :label="$t('global.commons.price')"
        class="inline-block cal-in"
        dense
        flat
        hide-details
        prepend-inner-icon="shopping_bag"
        solo
        title="Order price."
      ></u-price-input>
      <v-icon color="primary">fa:fas fa-times</v-icon>
      <u-price
        :amount="
          (selected_profile ? selected_profile : transportation).price_cof
        "
        :currency="transportation.currency"
        :medium="
          (selected_profile ? selected_profile : transportation).price_cof > 0
        "
        caption="Price"
        class="sub-caption b-12px min-width-50 text-center"
      ></u-price>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Result ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-icon color="primary">fa:fas fa-equals</v-icon>

    <v-chip
      v-if="calculated_cost"
      class="mx-1"
      color="#222"
      label
      size="large"
      variant="flat"
    >
      <u-price
        :amount="calculated_cost"
        :currency="transportation.currency"
        dark
        large
      ></u-price>
    </v-chip>

    <v-chip
      v-else
      class="mx-1 font-weight-black"
      color="success"
      label
      size="large"
    >
      {{ $t("global.commons.free") }}
    </v-chip>

    <v-spacer></v-spacer>
  </div>
</template>

<script>
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";

import UPriceInput from "../../../ui/price/input/UPriceInput.vue";

export default {
  name: "BTransportationCalculator",
  components: {
    UPriceInput,
    UNumberInput,
  },
  props: {
    shop: {},
    transportation: { required: true, type: Object },
    country: {},
    state: {},
  },

  data: () => ({
    cal_dis: 0,
    cal_w: 0,
    cal_p: 0,
  }),
  computed: {
    currency() {
      return this.transportation.currency;
    },

    calculated_cost() {
      if (
        this.transportation.free_shipping &&
        this.cal_p >= this.transportation.free_shipping_limit
      ) {
        return 0;
      }

      const obj = this.selected_profile
        ? this.selected_profile
        : this.transportation;
      return (
        obj.const +
        (obj.distance_cof ? obj.distance_cof : 0) * this.cal_dis +
        (obj.weight_cof ? obj.weight_cof : 0) * this.cal_w +
        (obj.price_cof ? obj.price_cof : 0) * this.cal_p +
        (obj.distance_weight_cof ? obj.distance_weight_cof : 0) *
          this.cal_w *
          this.cal_p
      );
    },

    profiles() {
      return this.transportation?.profiles ? this.transportation.profiles : {};
    },
    profile_countries() {
      return Object.keys(this.profiles);
    },
    selected_profile() {
      const profile =
        this.country && this.profiles && this.profiles[this.country];
      if (profile && profile.states && this.state && profile.states[this.state])
        return profile.states[this.state];

      return profile;
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.cal-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;

  .cal-in {
    max-width: 140px;
    border: solid #aaa thin;
    margin: 0 6px;
  }

  i:not(.large) {
    margin: 0 6px;
    font-size: 100%;
  }
}
</style>
