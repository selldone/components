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
  <div v-if="show" class="text-start position-relative pt-2" :class="{ 's-product-service-form--modern': modern }">
    <u-loading-progress v-if="busy"></u-loading-progress>
    <!-- ----------------------- Tasks ----------------------- -->

    <div v-if="has_tasks" class="tasks mb-2">
      <p class="font-weight-bold mb-0">
        <v-icon :color="modern ? undefined : 'black'">playlist_add_check</v-icon>
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
        <v-icon :color="modern ? undefined : 'black'">date_range</v-icon>
        {{ $t("global.service.appointment.title") }}
      </p>
      <p class="text-subtitle-2 mb-1">
        {{ $t("global.service.appointment.message") }}
      </p>

      <div v-if="appointmentTimezone" class="s-product-service-form__appointment">
        <div class="s-product-service-form__date-row">
          <v-menu v-model="appointmentCalendar" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                :disabled="busy"
                :aria-label="$t('service_design.refined.request_date')"
              >
                <v-icon start size="18" aria-hidden="true">calendar_today</v-icon>
                {{ appointmentDateLabel }}
              </v-btn>
            </template>
            <v-card class="s-product-service-form__calendar text-start" :dir="getCurrentLanguage().dir">
              <u-service-date-availability
              :model-value="outputs.disabled || []"
              :selection="appointmentDate ? [appointmentDate] : []"
              :min="appointmentToday"
              :allowed-dates="isAppointmentDateAllowed"
              :editable="false"
              :disabled="busy"
              selection-mode="single"
              @update:selection="(dates) => selectAppointmentDate(dates[0])"
              />
            </v-card>
          </v-menu>
          <span class="s-product-service-form__timezone">{{
            $t('service_design.refined.request_timezone', { timezone: appointmentTimezone })
          }}</span>
        </div>
        <div class="s-product-service-form__hours" role="group" :aria-label="$t('service_design.refined.request_time')">
          <v-btn
            v-for="hour in appointmentHours"
            :key="hour"
            variant="outlined"
            :color="isAppointmentHourSelected(hour) ? 'primary' : undefined"
            :aria-pressed="isAppointmentHourSelected(hour)"
            :disabled="busy"
            @click="selectAppointmentHour(hour)"
          ><bdi>{{ String(hour % 24).padStart(2, '0') }}:00</bdi></v-btn>
        </div>
        <p v-if="!appointmentHours.length" class="s-product-service-form__help" role="status">{{ $t('service_design.refined.request_no_times') }}</p>
        <p class="s-product-service-form__help">{{ $t('service_design.refined.request_help') }}</p>
        <div v-if="appointmentRequestLabel" class="s-product-service-form__request">
          <span>{{ $t('service_design.refined.request_summary') }}: <bdi>{{ appointmentRequestLabel }} · {{ appointmentRequestTimezone }}</bdi></span>
          <v-btn variant="text" :disabled="busy" @click="clearAppointmentRequest">{{ $t('service_design.refined.request_clear') }}</v-btn>
        </div>
      </div>
      <u-time-week-picker
        v-else
        v-model="preferences.days"
        :restrictions="outputs.days"
        :modern="modern"
        class="my-2 max-width-field-large mx-auto"
        editable
        @change="onChange"
      ></u-time-week-picker>
    </div>

    <!-- ----------------------- Booking ----------------------- -->
    <div v-if="has_booking" class="mb-2">
      <p class="font-weight-bold mb-0">
        <v-icon :color="modern ? undefined : 'black'">book_online</v-icon>

        {{ $t("global.service.booking.title") }}
      </p>
      <p class="text-subtitle-2 mb-1">
        {{ $t("global.service.booking.message") }}
      </p>

      <div class="d-flex border-between text-center align-items-center my-2">
        <div v-if="!modern" class="p-2">
          <v-btn icon variant="text" @click="en_cal = !en_cal">
            <flag
              :iso="en_cal ? 'gb' : getCurrentLanguage().flag"
              :squared="false"
            />
          </v-btn>
        </div>
        <div v-if="hasTime(outputs.checkin)" class="flex-grow-1 p-2">
          <span class="text-muted text-uppercase text-subtitle-2">{{ bookingStartLabel }}</span
          ><br />
          <b dir="ltr"
            >{{ bookingTimeLabel(outputs.checkin) }}</b
          >
        </div>
        <div v-if="hasTime(outputs.checkout)" class="flex-grow-1 p-2">
          <span class="text-muted text-uppercase text-subtitle-2"
            >{{ bookingEndLabel }}</span
          ><br />
          <b dir="ltr"
            >{{ bookingTimeLabel(outputs.checkout) }}</b
          >
        </div>
      </div>
      <u-service-date-availability
        v-if="modern"
        :model-value="outputs.disabled || []"
        :selection="bookingSelection"
        :min="appointmentToday"
        :editable="false"
        :disabled="busy"
        selection-mode="range"
        @update:selection="selectBookingDates"
      />
      <u-date-range-picker
        v-else-if="Array.isArray(preferences.dates)"
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
        :end-label="bookingEndLabel"
        start-icon="login"
        :start-label="bookingStartLabel"
        @change="onChange"
      ></u-date-range-picker>
    </div>
    <p v-if="modern && has_subscription" class="s-product-service-form__help">
      {{ $t('global.service.subscription.title') }}: {{ outputs.subscription ?? outputs.days }} {{ $t('global.commons.days') }}
    </p>
    <p v-if="modern && has_charge" class="s-product-service-form__help">
      {{ $t('global.service.charge.title') }}: {{ outputs.charge }} {{ $t('service_design.refined.units') }}
    </p>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { ServiceTypes } from "@selldone/core-js/enums/product/ServiceTypes";
import UTimeWeekPicker from "../../../../ui/time/week-picker/UTimeWeekPicker.vue";
import { throttle } from "lodash-es";
import UDateRangePicker from "../../../../ui/date/range-picker/UDateRangePicker.vue";
import UServiceDateAvailability from "../../../../ui/date/service-availability/UServiceDateAvailability.vue";
import {
  formatAppointmentRequest, getAppointmentDate, getAppointmentHours,
  getServiceClock, getServiceTimezone,
} from "../service-appointment";

export default {
  name: "SProductServiceForm",
  components: { UServiceDateAvailability, UDateRangePicker, UTimeWeekPicker },
  emits: ["update:preferences"],
  props: {
    modern: { type: Boolean, default: false },
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
      appointmentDate: null,
      appointmentCalendar: false,
      appointmentNow: Date.now(),
      appointmentTimer: null,
      bookingSelection: [],
    };
  },

  computed: {
    bookingStartLabel() {
      return this.$t('service_design.refined.' + (this.outputs.type === 'RENTAL' ? 'pickup' : 'checkin'));
    },
    bookingEndLabel() {
      return this.$t('service_design.refined.' + (this.outputs.type === 'RENTAL' ? 'return' : 'checkout'));
    },
    appointmentTimezone() {
      return this.has_reserve ? getServiceTimezone(this.outputs) : null;
    },
    appointmentToday() {
      const timezone = getServiceTimezone(this.outputs) || (this.has_booking ? 'UTC' : null);
      return timezone
        ? getServiceClock(timezone, this.appointmentNow).date
        : null;
    },
    appointmentHours() {
      return getAppointmentHours(this.outputs, this.appointmentDate, this.appointmentNow);
    },
    appointmentDateLabel() {
      return this.appointmentDate
        ? new Intl.DateTimeFormat(this.getCurrentLanguage().full_locale, {
            timeZone: "UTC", year: "numeric", month: "short", day: "numeric",
          }).format(new Date(`${this.appointmentDate}T12:00:00Z`))
        : this.$t("service_design.refined.request_date");
    },
    appointmentRequestLabel() {
      return formatAppointmentRequest(this.preferences.appointment, this.getCurrentLanguage().full_locale);
    },
    appointmentRequestTimezone() {
      return getServiceTimezone(this.preferences.appointment) || this.appointmentTimezone;
    },
    show() {
      return (
        this.preferences &&
        (this.has_tasks || this.has_reserve || this.has_booking ||
          (this.modern && (this.has_subscription || this.has_charge)))
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
    appointmentTimezone() {
      this.appointmentNow = Date.now();
      this.appointmentDate = this.appointmentToday;
      this.appointmentCalendar = false;
      // Preview choices belong to the selected timezone; saved cart requests retain their snapshot.
      if (!this.basket_item && this.preferences.appointment) {
        this.preferences.appointment = null;
        this.$emit("update:preferences", this.preferences);
      }
      this.refreshAppointmentTimer();
    },
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
    this.appointmentDate = getAppointmentDate(this.preferences.appointment?.date) || this.appointmentToday;
    this.bookingSelection = (this.preferences.dates || [])
      .map((date) => getAppointmentDate(typeof date === "string" ? date.slice(0, 10) : date)).filter(Boolean);
  },
  mounted() {
    this.refreshAppointmentTimer();
  },
  beforeUnmount() {
    clearInterval(this.appointmentTimer);
  },

  methods: {
    refreshAppointmentTimer() {
      clearInterval(this.appointmentTimer);
      this.appointmentTimer = this.appointmentTimezone
        ? setInterval(() => { this.appointmentNow = Date.now(); }, 60000)
        : null;
    },
    isAppointmentHourSelected(hour) {
      return this.appointmentRequestTimezone === this.appointmentTimezone &&
        this.preferences.appointment?.date === this.appointmentDate &&
        this.preferences.appointment?.hour === hour;
    },
    bookingTimeLabel(value) {
      return `${String(value.HH).padStart(2, '0')}:${String(value.mm).padStart(2, '0')}`;
    },
    selectBookingDates(dates) {
      if (this.busy || !this.has_booking) return;
      this.bookingSelection = dates;
      this.preferences.dates = dates.length >= 2 ? [dates[0], dates[dates.length - 1]] : [];
      this.$emit("update:preferences", this.preferences);
      if (dates.length >= 2) this.onChange();
    },
    isAppointmentDateAllowed(value) {
      return getAppointmentHours(this.outputs, getAppointmentDate(value), Date.now()).length > 0;
    },
    selectAppointmentDate(value) {
      const date = getAppointmentDate(value);
      if (this.busy || !date || !this.isAppointmentDateAllowed(value)) return;
      this.appointmentCalendar = false;
      if (date === this.appointmentDate) return;
      this.appointmentDate = date;
      this.appointmentNow = Date.now();
      this.clearAppointmentRequest();
    },
    selectAppointmentHour(hour) {
      if (this.busy || !this.appointmentTimezone ||
          !getAppointmentHours(this.outputs, this.appointmentDate, Date.now()).includes(hour)) return;
      this.preferences.appointment = { date: this.appointmentDate, hour };
      this.$emit("update:preferences", this.preferences);
      this.onChange();
    },
    clearAppointmentRequest() {
      if (this.busy || !this.preferences.appointment) return;
      this.preferences.appointment = null;
      this.$emit("update:preferences", this.preferences);
      this.onChange();
    },
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
.s-product-service-form {
  &--modern { font-family: inherit; font-size: 13px; line-height: 20px; }
  &--modern > div > .font-weight-bold { font-size: 14px; line-height: 22px; font-weight: 500 !important; }
  &--modern .text-subtitle-2 { font-family: inherit !important; font-size: 13px !important; line-height: 20px; font-weight: 400; color: rgba(var(--v-theme-on-surface), 0.7); }
  &--modern .tasks .-item:before { color: rgb(var(--v-theme-primary)); }
  &__appointment { padding-block: 8px; }
  &__calendar { width: min(360px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow: auto; padding: 16px; }
  &__date-row, &__request { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; }
  &__date-row > .v-btn { min-height: 44px; font-family: inherit; text-transform: none; letter-spacing: normal; }
  &__timezone, &__help { color: rgba(var(--v-theme-on-surface), 0.7); font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  &__hours { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  &__hours > .v-btn { min-height: 44px; min-width: 68px; font-family: inherit; font-size: 13px; letter-spacing: normal; }
  &__hours > .v-btn[aria-pressed="true"] { border-width: 2px; }
  &__help { margin: 6px 0 0; }
  &__request { margin-block-start: 10px; font-size: 13px; line-height: 20px; }
  &__request > .v-btn { min-height: 44px; padding-inline: 10px; text-transform: none; letter-spacing: normal; }
}
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
