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
    <s-progress-loading v-if="busy"></s-progress-loading>
    <!-- ----------------------- Tasks ----------------------- -->

    <div v-if="has_tasks" class="tasks mb-2">
      <p class="font-weight-bold mb-0">
        <v-icon color="black">playlist_add_check</v-icon>
        {{ $t("global.service.task.title") }}
      </p>
      <p class="subtitle-2 mb-1">{{ $t("global.service.task.message") }}</p>
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
      <p class="subtitle-2 mb-1">
        {{ $t("global.service.appointment.message") }}
      </p>

      <week-day-time-table
        editable
        v-model="preferences.days"
        :restrictions="outputs.days"
        class="my-2 max-width-field-large mx-auto"
        @change="onChange"
      ></week-day-time-table>
    </div>

    <!-- ----------------------- Booking ----------------------- -->
    <div v-if="has_booking" class="mb-2">
      <p class="font-weight-bold mb-0">
        <v-icon color="black">book_online</v-icon>

        {{ $t("global.service.booking.title") }}
      </p>
      <p class="subtitle-2 mb-1">{{ $t("global.service.booking.message") }}</p>

      <div class="d-flex border-between text-center align-items-center my-2">
        <div class="p-2">
          <v-btn @click="en_cal = !en_cal" icon>
            <flag
              :iso="en_cal ? 'gb' : getCurrentLanguage().flag"
              :squared="false"
          /></v-btn>
        </div>
        <div v-if="hasTime(outputs.checkin)" class="flex-grow-1 p-2">
          <span class="text-muted text-uppercase subtitle-2">Check-in</span
          ><br />
          <b dir="ltr"
            >{{ outputs.checkin["HH"] }} : {{ outputs.checkin["mm"] }}</b
          >
        </div>
        <div
          v-if="hasTime(outputs.checkout)"
          class="flex-grow-1 p-2"
        >
          <span class="text-muted text-uppercase subtitle-2">Check-out</span><br />
          <b dir="ltr"
            >{{ outputs.checkout["HH"] }} : {{ outputs.checkout["mm"] }}</b
          >
        </div>
      </div>

      <v-date-picker
        v-model="preferences.dates"
        range
        show-current
        :min="new Date().toISOString()"
        :locale="!en_cal ? getCurrentLanguage().full_local : undefined"
        :first-day-of-week="
          !en_cal ? getCurrentLanguage().calendar.first_day_of_week : undefined
        "
        color="blue"
        header-color="primary"
        no-title
        show-adjacent-months
        :allowed-dates="isAllowed"
        :events="isDisabled"
        event-color="red"
        full-width
        @change="onChange"
      >
      </v-date-picker>
    </div>
  </div>
</template>

<script>
import { ServiceTypes } from "@core/enums/product/ServiceTypes";
import WeekDayTimeTable from "@components/ui/calendar/WeekDayTimeTable.vue";
import _ from "lodash-es";

export default {
  name: "ServiceOrderView",
  components: { WeekDayTimeTable },
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
        (this.has_tasks ||
          this.has_reserve ||
          this.has_booking /* ||
         this.has_subscription ||
          this.has_charge*/)
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
      this.$emit("update:preferences", this.preferences);
    },
    /**
     * Use by external components.
     */
    getPreferences() {
      return this.preferences;
    },

    onChange: _.throttle(function () {
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
            this.product.id
          ),
          {
            basket_id: this.basket.id,
            variant_id: null,
            preferences: this.preferences,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            let basket_item = this.basket.items.find(
              (item) => item.id === data.item.id
            );
            //  basket_item.preferences = data.item.preferences;
            Object.assign(basket_item, data.item);

            if (data.price_multiplier) {
              // In service > booking (Rental & booking) price change by preferences, so we need fore re calculate bill!
              this.setBasketBill(this.basket, data.bill);
            }

            this.showSuccessAlert(
              null,
              this.$t("global.basket_item_message.notifications.success")
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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

<style scoped lang="scss">
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
.v-application--is-rtl {
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
