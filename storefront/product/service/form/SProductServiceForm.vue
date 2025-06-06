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
  <div v-if="show" class="text-start position-relative pt-2">
    <u-loading-progress v-if="busy"></u-loading-progress>
    <!-- ----------------------- Tasks ----------------------- -->

    <div v-if="has_tasks" class="tasks mb-2">
      <p class="font-weight-bold mb-0">
        <v-icon color="black">playlist_add_check</v-icon>
        {{ $t("global.service.task.title") }}
      </p>
      <p class="text-subtitle-2 mb-1">
        {{ $t("global.service.task.message") }}
      </p>
      <p v-for="(task, i) in outputs.tasks" :key="i" class="-item">
        {{ task.title }}
      </p>
    </div>

    <!-- ----------------------- Appointment ----------------------- -->
    <div v-if="has_reserve" class="mb-2">
      <p class="font-weight-bold mb-0">
        <v-icon color="black">date_range</v-icon>
        {{ $t("global.service.appointment.title") }}
      </p>
      <p class="text-subtitle-2 mb-1">
        {{ $t("global.service.appointment.message") }}
      </p>

      <u-time-week-picker
        v-model="preferences.days"
        :restrictions="outputs.days"
        class="my-2 max-width-field-large mx-auto"
        editable
        @change="onChange"
      ></u-time-week-picker>
    </div>

    <!-- ----------------------- Booking ----------------------- -->
    <div v-if="has_booking" class="mb-2">
      <p class="font-weight-bold mb-0">
        <v-icon color="black">book_online</v-icon>

        {{ $t("global.service.booking.title") }}
      </p>
      <p class="text-subtitle-2 mb-1">
        {{ $t("global.service.booking.message") }}
      </p>

      <div class="d-flex border-between text-center align-items-center my-2">
        <div class="p-2">
          <v-btn icon variant="text" @click="en_cal = !en_cal">
            <flag
              :iso="en_cal ? 'gb' : getCurrentLanguage().flag"
              :squared="false"
            />
          </v-btn>
        </div>
        <div v-if="hasTime(outputs.checkin)" class="flex-grow-1 p-2">
          <span class="text-muted text-uppercase text-subtitle-2">Check-in</span
          ><br />
          <b dir="ltr"
            >{{ outputs.checkin["HH"] }} : {{ outputs.checkin["mm"] }}</b
          >
        </div>
        <div v-if="hasTime(outputs.checkout)" class="flex-grow-1 p-2">
          <span class="text-muted text-uppercase text-subtitle-2"
            >Check-out</span
          ><br />
          <b dir="ltr"
            >{{ outputs.checkout["HH"] }} : {{ outputs.checkout["mm"] }}</b
          >
        </div>
      </div>
      <u-date-range-picker
        v-if="Array.isArray(preferences.dates)"
        v-model:end="preferences.dates[1]"
        v-model:start="preferences.dates[0]"
        :allowed-dates="isAllowed"
        :events="isDisabled"
        :first-day-of-week="
          !en_cal ? getCurrentLanguage().calendar.first_day_of_week : undefined
        "
        :locale="!en_cal ? getCurrentLanguage().full_locale : undefined"
        :min="new Date().toISOString()"
        end-icon="logout"
        end-label="Check-out"
        start-icon="login"
        start-label="Check-in"
        @change="onChange"
      ></u-date-range-picker>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { ServiceTypes } from "@selldone/core-js/enums/product/ServiceTypes";
import UTimeWeekPicker from "../../../../ui/time/week-picker/UTimeWeekPicker.vue";
import { throttle } from "lodash-es";
import UDateRangePicker from "../../../../ui/date/range-picker/UDateRangePicker.vue";

export default {
  name: "SProductServiceForm",
  components: { UDateRangePicker, UTimeWeekPicker },
  emits: ["update:preferences"],
  props: {
    product: {
      require: true,
      type: Object,
    },
    basket: {
      //require: true,
    },
  },
  data: function () {
    return {
      ServiceTypes: ServiceTypes,

      en_cal: false,

      // ---------------------
      preferences: {},

      busy: false,
    };
  },

  computed: {
    show() {
      return (
        this.preferences &&
        (this.has_tasks || this.has_reserve || this.has_booking) /* ||
         this.has_subscription ||
          this.has_charge*/
      );
    },

    outputs() {
      return this.product.outputs;
    },

    type() {
      return (
        this.outputs &&
        this.outputs.type &&
        this.ServiceTypes[this.outputs.type]
      );
    },

    has_tasks() {
      return (
        this.type &&
        this.type.form.includes("tasks") &&
        this.outputs.tasks &&
        this.outputs.tasks.length
      );
    },
    has_reserve() {
      return this.type && this.type.form.includes("reserve");
    },
    has_booking() {
      return this.type && this.type.form.includes("booking");
    },
    has_subscription() {
      return this.type && this.type.form.includes("subscription");
    },
    has_charge() {
      return this.type && this.type.form.includes("charge");
    },

    basket_item() {
      return (
        this.basket &&
        this.basket.items.find((item) => item.product_id === this.product.id)
      );
    },
  },

  watch: {
    preferences() {
      // Emit update preferences used in pre add to basket set preferences in the ProductInfo page.
      this.$emit("update:preferences", this.preferences);
      if (this.has_booking && !Array.isArray(this.preferences.dates)) {
        this.preferences.dates = [];
      }
    },
  },

  created() {
    this.refreshPreferences();
  },

  methods: {
    refreshPreferences() {
      if (this.basket_item) {
        // A. If add to basket!
        if (
          !this.basket_item.preferences ||
          Array.isArray(this.basket_item.preferences)
        ) {
          this.basket_item.preferences = {}; // initial preferences
        }
        this.preferences = this.basket_item.preferences;
      } else {
        // B. Not in basket!
      }

      if (this.has_booking) {
        if (!this.preferences) this.preferences = {};
        if (!this.preferences.dates || !Array.isArray(this.preferences.dates))
          this.preferences.dates = [];
      }
      this.$emit("update:preferences", this.preferences);
    },
    /**
     * Use by external components.
     */
    getPreferences() {
      return this.preferences;
    },

    onChange: throttle(function () {
      if (this.basket_item) {
        // Only save if item added to basket! User flow for service allows to set preferences before add item to basket.
        console.log("=== SEND PREFERENCES 👍 ===");
        this.saveBasketItemPreferences();
      }
    }, 5000),

    saveBasketItemPreferences() {
      this.busy = true;

      axios
        .put(
          window.XAPI.PUT_BASKET_ITEM_PREFERENCES(
            this.getShop().name,
            this.product.id,
          ),
          {
            basket_id: this.basket.id,
            variant_id: null,
            preferences: this.preferences,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            let basket_item = this.basket.items.find(
              (item) => item.id === data.item.id,
            );
            //  basket_item.preferences = data.item.preferences;
            Object.assign(basket_item, data.item);

            if (data.price_multiplier) {
              // In service > booking (Rental & booking) price change by preferences, so we need fore re calculate bill!
              this.setBasketBill(this.basket, data.bill);
            }

            NotificationService.showSuccessAlert(
              null,
              this.$t("global.basket_item_message.notifications.success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          //     this.show = this.fill_percent < 95 || this.forceShow;
        });
    },

    //------------------------------- Booking ------------------------------------
    isDisabled(date) {
      // console.log("isDisabled", date);
      return this.outputs.disabled && this.outputs.disabled.includes(date);
    },

    isAllowed(date) {
      //console.log("isAllowed", date);
      const disabled =
        this.outputs.disabled && this.outputs.disabled.includes(date);

      return !disabled;
    },
    hasTime(check_time) {
      if (!check_time) return false;
      const { HH, mm } = check_time;
      return HH !== null && mm !== null;
    },
    //-------------------------------  ------------------------------------
  },
};
</script>

<style lang="scss" scoped>
.tasks {
  p {
    margin: 2px 0;
  }

  .-item {
    &:before {
      content: "⬤ ";
      color: #0288d1;
      font-family: initial;
      font-size: 12px;
      vertical-align: baseline;
      margin-right: 5px;
    }
  }
}

.v-locale--is-rtl {
  .tasks {
    .-item {
      &:before {
        margin-right: unset;
        margin-left: 5px;
      }
    }
  }
}
</style>
