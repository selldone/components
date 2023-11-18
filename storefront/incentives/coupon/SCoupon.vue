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
  <v-hover
    v-slot:default="{ hover }"
    class="coupon"
    :class="{ 'pointer-pointer': selectable && !disabled, selected: selected }"
    :style="{ borderColor: disabled ? '#000' : coupon.color, width: width }"
  >
    <div
      @click="disabled ? undefined : $emit('click')"
      :class="{ 'img-grayscale op-0-7': disabled }"
      class="d-flex flex-column"
    >
      <p class="coupon-title">
        {{ coupon.title }}
        <small class="mx-2" v-if="coupon.code">({{ coupon.code }})</small>
        <img
          src="../../../assets/icons/coupon.svg"
          height="20"
          class="float-end"
        />
      </p>
      <p class="coupon-description">{{ coupon.description }}</p>

      <v-spacer></v-spacer>
      <time-progress-bar
        :start-time="coupon.start"
        :end-time="coupon.end"
        small
      ></time-progress-bar>

      <p class="m-0 mt-1" v-if="coupon.charge">
        <v-icon small class="me-1" color="#333">card_giftcard add</v-icon>
        <b>
          <price-view
            :amount="coupon.charge"
            :currency="coupon.currency"
          ></price-view>
        </b>
      </p>

      <div class="d-flex text-center mt-1" v-if="coupon.percent">
        <p class="w-50 my-0">
          <small>{{ $t("global.commons.discount") }} </small><br />
          <b>{{ coupon.percent }} %</b>
        </p>

        <p class="w-50 my-0">
          <small>{{ $t("global.commons.limit") }} </small><br />
          <b
            ><price-view
              :amount="coupon.limit"
              :currency="coupon.currency"
            ></price-view
          ></b>
        </p>
      </div>

      <v-fade-transition>
        <div
          v-if="hover"
          class="hover-detail op-0-9"
          :style="{ background: coupon.color }"
        >
          <p class="my-1">
            <small>{{ $t("global.commons.min_purchase") }}: </small>
            <b>
              <price-view
                :amount="coupon.min_purchase"
                :currency="coupon.currency"
              ></price-view
            ></b>
          </p>

          <p class="my-1">
            <small>{{ $t("global.commons.eligible_for") }}: </small>
            <b>{{ eligible_description }}</b>
          </p>
          <div class="d-flex text-center" v-if="coupon.qualify">
            <p class="my-1 w-50" v-if="coupon.qualify_daily">
              <small>{{ $t("global.commons.daily") }}</small
              ><br />
              <b>{{ coupon.qualify_daily }}x</b>
            </p>
            <p class="my-1 w-50" v-if="coupon.qualify_monthly">
              <small>{{ $t("global.commons.monthly") }}</small
              ><br />
              <b>{{ coupon.qualify_monthly }}x</b>
            </p>
            <p class="my-1 w-50" v-if="coupon.qualify_yearly">
              <small>{{ $t("global.commons.yearly") }}</small
              ><br />
              <b>{{ coupon.qualify_yearly }}x</b>
            </p>
          </div>

          <v-btn
            v-if="coupon.code"
            dark
            icon
            title="Delete coupon"
            @click="$emit('delete', coupon.code)"
            class="absolute-top-end"
            ><v-icon>close</v-icon></v-btn
          >
        </div>
      </v-fade-transition>
    </div>
  </v-hover>
</template>

<script>
import TimeProgressBar from "@components/ui/calendar/TimeProgressBar.vue";
export default {
  name: "SCoupon",
  components: { TimeProgressBar },
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

<style scoped lang="scss">
.coupon {
  user-select: none;
  position: relative;
  border: white dashed 1.5px;
  border-radius: 8px;
  width: 200px;
  padding: 8px;

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
  .hover-detail {
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
