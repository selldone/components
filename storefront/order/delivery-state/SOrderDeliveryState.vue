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
  <div class="s--shop-delivery-state container px-1 px-sm-3">
    <div :class="{ rtl: $vuetify.locale.isRtl }" class="arrows mx-0 mx-sm-2">
      <ul>
        <!-- CheckQueue -->
        <li
          v-if="CheckQueue"
          :class="{
            gray: delivery_step < getStepIndex('CheckQueue'),
            active: delivery_step === getStepIndex('CheckQueue'),
          }"
          :style="item_style"
          :title="
            basket.reserved_at
              ? 'Checkout: ' + getFromNowString(basket.reserved_at)
              : undefined
          "
        >
          <div>
            <v-icon
              v-if="delivery_step > getStepIndex('CheckQueue')"
              :size="icon_size"
              class="mb-1"
              color="#016358"
              >check_circle
            </v-icon>
            <v-icon
              v-else-if="delivery_step === getStepIndex('CheckQueue')"
              :size="icon_size"
              class="mb-1"
              color="#fff"
              >panorama_fish_eye
            </v-icon>
            <span>
              {{ $t("global.basket_delivery_state.step_1") }}
            </span>

            <!-- start -->
            <small v-if="basket.reserved_at" class="d-block">
              <i class="fas fa-shopping-basket" />

              {{
                getLocalTimeString(
                  basket.reserved_at,
                  $vuetify.display.smAndDown,
                )
              }}
            </small>
          </div>
        </li>

        <!-- OrderConfirm -->
        <li
          v-if="OrderConfirm"
          :class="{
            gray: delivery_step < getStepIndex('OrderConfirm'),
            active: delivery_step === getStepIndex('OrderConfirm'),
          }"
          :style="item_style"
        >
          <div>
            <v-icon
              v-if="delivery_step > getStepIndex('OrderConfirm')"
              :size="icon_size"
              class="mb-1"
              color="#016358"
              >check_circle
            </v-icon>
            <v-icon
              v-else-if="delivery_step === getStepIndex('OrderConfirm')"
              :size="icon_size"
              class="mb-1"
              color="#fff"
              >panorama_fish_eye
            </v-icon>

            <span>
              {{ $t("global.basket_delivery_state.step_2") }}
            </span>
          </div>
        </li>

        <!-- PreparingOrder -->
        <li
          v-if="PreparingOrder"
          :class="{
            gray: delivery_step < getStepIndex('PreparingOrder'),
            active: delivery_step === getStepIndex('PreparingOrder'),
          }"
          :style="item_style"
        >
          <div>
            <v-icon
              v-if="delivery_step > getStepIndex('PreparingOrder')"
              :size="icon_size"
              class="mb-1"
              color="#016358"
              >check_circle
            </v-icon>
            <v-icon
              v-else-if="delivery_step === getStepIndex('PreparingOrder')"
              :size="icon_size"
              class="mb-1"
              color="#fff"
              >panorama_fish_eye
            </v-icon>
            <span>
              {{ $t("global.basket_delivery_state.step_3") }}
            </span>
          </div>
        </li>

        <!-- SentOrder -->
        <li
          v-if="SentOrder"
          :class="{
            gray: delivery_step < getStepIndex('SentOrder'),
            active: delivery_step === getStepIndex('SentOrder'),
          }"
          :style="item_style"
          class="item"
        >
          <div>
            <v-icon
              v-if="delivery_step > getStepIndex('SentOrder')"
              :size="icon_size"
              class="mb-1"
              color="#016358"
              >check_circle
            </v-icon>
            <v-icon
              v-else-if="delivery_step === getStepIndex('SentOrder')"
              :size="icon_size"
              class="mb-1"
              color="#fff"
              >panorama_fish_eye
            </v-icon>
            <span>
              {{ $t("global.basket_delivery_state.step_4") }}
            </span>
          </div>
        </li>

        <!-- ToCustomer -->
        <li
          v-if="ToCustomer"
          :class="{
            gray: delivery_step < getStepIndex('ToCustomer'),
            active: delivery_step === getStepIndex('ToCustomer'),
          }"
          :style="item_style"
          :title="
            basket.delivery_at
              ? 'Delivery: ' + getFromNowString(basket.delivery_at)
              : undefined
          "
          class="item"
        >
          <div>
            <v-icon
              v-if="delivery_step === getStepIndex('ToCustomer')"
              :size="icon_size"
              class="mb-1"
              color="#fff"
              >done_all
            </v-icon>
            <span>
              {{ $t("global.basket_delivery_state.step_5") }}
            </span>

            <!-- end -->
            <small v-if="basket.delivery_at" class="d-block">
              <v-icon class="mb-1" color="#fff" size="x-small"
                >where_to_vote
              </v-icon>
              {{
                getLocalTimeString(
                  basket.delivery_at,
                  $vuetify.display.smAndDown,
                )
              }}
            </small>
          </div>
        </li>
      </ul>
    </div>

    <!-- Rejected -->
    <div v-if="rejected" class="py-3">
      <h2 class="text-uppercase">
        <i class="fas fa-warning" />
        {{ $t("global.basket_delivery_state.rejected") }}
      </h2>

      <template v-if="basket.reject_at && !canceled">
        <small class="text-white"
          ><i class="fas fa-stopwatch"></i> Time to cancel:
        </small>
        <u-count-down :end="endOfRejectPeriod" class="me-2 p-0"></u-count-down>
      </template>

      <p>{{ reject_reason }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UCountDown from "../../../ui/count-down/UCountDown.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { Order } from "@selldone/core-js";

export default {
  name: "SOrderDeliveryState",
  components: { UCountDown },
  props: {
    basket: {
      required: true,
      type: Object,
    },
    offset: {
      required: false,
      type: Number,
      default: 0,
    },

    isFulfillment: {
      // Drop shipping mode
      default: false,
      type: Boolean,
    },

    isAvocado: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    CheckQueue() {
      return (
        this.isAvocado ||
        this.isFulfillment ||
        [
          ProductType.PHYSICAL.code,
          ProductType.VIRTUAL.code,
          ProductType.SERVICE.code,
          ProductType.SUBSCRIPTION.code,
        ].includes(this.basket.type)
      );
    },

    OrderConfirm() {
      return (
        this.isAvocado ||
        this.isFulfillment ||
        [
          ProductType.PHYSICAL.code,
          ProductType.VIRTUAL.code,
          ProductType.SERVICE.code,
          ProductType.SUBSCRIPTION.code,
        ].includes(this.basket.type)
      );
    },
    PreparingOrder() {
      return (
        this.isAvocado ||
        this.isFulfillment ||
        [
          ProductType.PHYSICAL.code,
          ProductType.VIRTUAL.code,
          ProductType.FILE.code,
          ProductType.SERVICE.code,
          ProductType.SUBSCRIPTION.code,
        ].includes(this.basket.type)
      );
    },
    SentOrder() {
      return (
        this.isAvocado ||
        this.isFulfillment ||
        [ProductType.PHYSICAL.code, ProductType.SUBSCRIPTION.code].includes(
          this.basket.type,
        )
      );
    },
    ToCustomer() {
      return (
        this.isAvocado ||
        this.isFulfillment ||
        [
          ProductType.PHYSICAL.code,
          ProductType.VIRTUAL.code,
          ProductType.FILE.code,
          ProductType.SERVICE.code,
          ProductType.SUBSCRIPTION.code,
        ].includes(this.basket.type)
      );
    },

    endOfRejectPeriod() {
      let date = DateConverter.convertToLocalTime(this.basket.reject_at);
      date.setHours(date.getHours() + 48);

      return date;
    },

    delivery_state() {
      if (!this.basket) return null;

      return this.basket.delivery_state;
    },
    list() {
      let list = [];
      if (this.CheckQueue) list.push("CheckQueue");
      if (this.OrderConfirm) list.push("OrderConfirm");
      if (this.PreparingOrder) list.push("PreparingOrder");
      if (this.SentOrder) list.push("SentOrder");
      if (this.ToCustomer) list.push("ToCustomer");

      return list;
    },

    delivery_step() {
      return this.list.indexOf(this.delivery_state) + this.offset;
    },

    rejected() {
      return this.basket && this.basket.reject;
    },
    canceled(){
      return this.basket.status === 'Canceled'
    },

    reject_reason() {
      if (!this.rejected) return null;
      let obj = Order.RejectReasons[this.basket.reject];
      return obj
        ? this.$t(obj.title)
        : this.$t("global.basket_delivery_state.reason_not_found");
    },

    item_style() {
      const per = Math.round(100 / this.list.length);
      return (
        `max-width: ${per}%;` +
        (this.$vuetify.display.smAndDown ? `font-size:9px;` : "font-size:12px")
      );
    },

    icon_size() {
      return this.$vuetify.display.smAndUp ? 16 : 12;
    },
  },
  watch: {},
  methods: {
    getStepIndex(state) {
      return this.list.indexOf(state) + this.offset;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-delivery-state {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-delivery-state {
  text-align: center;
  position: relative;

  .arrows {
    span {
      font-weight: 800;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    div {
      position: relative;

      small {
        position: absolute;
        bottom: 6px;
        left: 4px;
        right: 4px;
      }
    }

    ul {
      display: flex;
      padding: 0;
      list-style-type: none;
      border: 2px solid #0f1919;
      border-radius: 28px;
      overflow: hidden;

      small {
        color: #000;
        font-weight: 500;
      }
    }

    ul:before,
    ul:after {
      content: "";
      display: table;
    }

    ul:after {
      clear: both;
    }

    ul li {
      width: 25%;
      float: left;
      text-align: center;
      //text-transform: uppercase;
      font-size: 10px;

      &.gray {
        color: #aaa;

        span {
          font-weight: 400;
        }
      }
    }

    ul li.active {
      background-image: linear-gradient(90deg, #222, #0c1818);
      color: #fff;

      small {
        color: #fff;
      }
    }

    ul li div {
      padding: 8px;
      height: 80px;
      position: relative;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    ul li.active div:before,
    ul li.active div:after {
      content: "";
      position: absolute;
      border-style: solid;
      border-color: transparent transparent transparent white;
      border-width: 40px;
      left: 0px;
    }

    ul li.active div:after {
      content: "";
      right: -80px;
      left: auto;
      border-color: transparent transparent transparent #0c1818;
    }

    ul li.active a {
      padding-left: 30px;
    }

    &.rtl {
      ul li.active {
        background-image: linear-gradient(-90deg, #222, #0c1818);
      }

      ul li.active div:before,
      ul li.active div:after {
        border-color: transparent white transparent transparent;
        left: unset;
        right: 0;
      }

      ul li.active div:after {
        right: unset;
        left: -80px;
        border-color: transparent #0c1818 transparent transparent;
      }
    }

    @media screen and (max-width: 1360px) {
      ul li.active div:before,
      ul li.active div:after {
        display: none;
      }
    }

    // Fix start item arrow
    ul {
      li:first-child {
        div {
          &:before {
            content: none !important;
          }
        }
      }
    }

    @media only screen and (max-width: 600px) {
      ul {
        border-radius: 12px;
      }
    }
  }
}
</style>
