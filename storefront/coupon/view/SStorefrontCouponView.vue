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
  <div
    :class="{ 'pointer-pointer': selectable && !disabled, selected: selected }"
    :style="{ borderColor: disabled ? '#000' : coupon.color, width: width }"
    class="s--coupon-card"
  >
    <div
      :class="{ 'img-grayscale op-0-7': disabled }"
      class="d-flex flex-column"
      @click="disabled ? undefined : $emit('select')"
    >
      <p class="coupon-title">
        {{ coupon.title }}
        <small v-if="coupon.code" class="mx-2">({{ coupon.code }})</small>
        <img
          class="float-end"
          height="20"
          src="../../../assets/icons/coupon.svg"
        />
      </p>
      <p class="coupon-description">{{ coupon.description }}</p>

      <v-spacer></v-spacer>
      <u-time-progress-bar
        :end-time="coupon.end"
        :start-time="coupon.start"
        small
      ></u-time-progress-bar>

      <p v-if="coupon.charge" class="m-0 mt-1">
        <v-icon class="me-1" size="small">card_giftcard add </v-icon>
        <b>
          <u-price
            :amount="coupon.charge"
            :currency="coupon.currency"
          ></u-price>
        </b>
      </p>

      <div v-if="coupon.percent" class="d-flex text-center mt-1">
        <p class="w-50 my-0">
          <small>{{ $t("global.commons.discount") }} </small><br />
          <b>{{ coupon.percent }} %</b>
        </p>

        <p class="w-50 my-0">
          <small>{{ $t("global.commons.limit") }} </small><br />
          <b>
            <u-price
              :amount="coupon.limit"
              :currency="coupon.currency"
            ></u-price>
          </b>
        </p>
      </div>

      <div :style="{ background: coupon.color }" class="hover-detail">
        <p class="my-1">
          <small>{{ $t("global.commons.min_purchase") }}: </small>
          <b>
            <u-price
              :amount="coupon.min_purchase"
              :currency="coupon.currency"
            ></u-price>
          </b>
        </p>

        <p class="my-1">
          <small>{{ $t("global.commons.eligible_for") }}: </small>
          <b>{{ eligible_description }}</b>
        </p>
        <div v-if="coupon.qualify" class="d-flex text-center">
          <p v-if="coupon.qualify_daily" class="my-1 w-50">
            <small>{{ $t("global.commons.daily") }}</small
            ><br />
            <b>{{ coupon.qualify_daily }}x</b>
          </p>
          <p v-if="coupon.qualify_monthly" class="my-1 w-50">
            <small>{{ $t("global.commons.monthly") }}</small
            ><br />
            <b>{{ coupon.qualify_monthly }}x</b>
          </p>
          <p v-if="coupon.qualify_yearly" class="my-1 w-50">
            <small>{{ $t("global.commons.yearly") }}</small
            ><br />
            <b>{{ coupon.qualify_yearly }}x</b>
          </p>
        </div>

        <v-btn
          v-if="coupon.code"
          class="absolute-top-end"
          icon
          variant="text"
          title="Delete coupon"
          @click="$emit('delete', coupon.code)"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";

export default {
  name: "SStorefrontCouponView",
  components: { UTimeProgressBar },
  emits: ["select", "delete"],
  props: {
    coupon: {
      require: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "200px",
    },

    selectable: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({}),

  computed: {
    eligible_description() {
      return this.coupon.only_first_buy
        ? this.$t("global.commons.only_for_first_buy")
        : this.coupon.qualify_single
          ? this.$t("global.commons.one_time_use")
          : this.coupon.qualify
            ? this.$t("global.commons.period_of_qualify")
            : this.$t("global.commons.no_constraint");
    },
  },

  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.s--coupon-card {
  user-select: none;
  position: relative;
  border: white dashed 1.5px;
  border-radius: 8px;
  width: 200px;
  padding: 8px;
  white-space: normal;

  &.selected {
    background-color: var(--theme-light) !important;
    color: #fff;
    border: unset;

    small {
      color: #fff !important;
    }

    .theme--light.v-icon {
      color: #fff !important;
    }
  }

  .coupon-title {
    font-weight: 600;
    font-size: 0.8rem;
    margin: 0;
    min-height: 20px;
  }

  .coupon-description {
    font-size: 0.8rem;
    margin: 0;
  }

  &:hover {
    .hover-detail {
      display: block;
      opacity: 0.9;
    }
  }

  .hover-detail {
    transition: all 0.3s ease-in-out;
    display: none;
    opacity: 0;
    position: absolute;
    width: calc(100% - 12px);
    height: calc(100% - 12px);

    top: 6px;
    left: 6px;
    background-color: rgba(42, 51, 60, 0.85);
    color: #fff;
    border-radius: 8px;
    padding: 8px;

    small {
      color: #fff !important;
      font-size: 11px;
    }
  }
}
</style>
